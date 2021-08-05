const { _play } = require("../include/_play");
const scdl = require("soundcloud-downloader").default;
const ytsr = require("youtube-sr").default;
const spotify = require("spotify-url-info");
const spotifySongRegex = /https?:\/\/(?:embed\.|open\.)(?:spotify\.com\/)(?:track\/|\?uri=spotify:track:)((\w|-){22})/;
const scRegex = /^https?:\/\/(?:(?:www|m)\.)?(soundcloud\.com|soundcloud\.app\.goo\.gl|snd\.sc)\/(.*)$/gm;
const { SOUNDCLOUD_CLIENT_ID } = require("../config.json");

module.exports = {
  name: "play",
  cooldown: 4,
  aliases: ["p"],
  description: "Plays audio from YouTube, Soundcloud or Spotify",
  async execute(client, message, args) {
    if (!args.length)
      return client.util.sendEmbedMessage(message, "Please provide the song name/url to play.", "ORANGE").catch(console.error);

    const channel = message.member.voice.channel;
    const serverQueue = client.queue.get(message.guild.id);

    if (!channel)
      return client.util.sendEmbedMessage(message, "You need to join a voice channel first.", "ORANGE").catch(console.error);

    if (!channel.viewable)
      return client.util.sendEmbedMessage(message, "I need **\`VIEW_CHANNEL\`** permission.", "ORANGE").catch(console.error);
    if (!channel.joinable)
      return client.util.sendEmbedMessage(message, "I need **\`CONNECT_CHANNEL\`** permission.", "ORANGE").catch(console.error);
    if (!channel.speakable)
      return client.util.sendEmbedMessage(message, "I need **\`SPEAK\`** permission.", "ORANGE").catch(console.error);
    if (channel.full)
      return client.util.sendEmbedMessage(message, "Can't join, the voice channel is full.", "ORANGE").catch(console.error);

    if (serverQueue && channel !== serverQueue.voiceChannel)
      return client.util.sendEmbedMessage(message, "You must be in the same voice channel as me.", "ORANGE").catch(console.error);

    try {
      const queueConstruct = {
        textChannel: message.channel,
        voiceChannel: channel,
        guildId: message.guild.id,
        connection: null,
        songs: [],
        loop: false,
        volume: 100,
        playing: true
      };

      let query = args.join(" ");
      if (spotifySongRegex.test(query)) {
        const spotifyData = await spotify.getData(query).catch(() => {});
        if (!spotifyData) return client.util.sendEmbedMessage(message, `No result was found for ${query}.`).catch(console.error);
        query = `${spotifyData.name} ${spotifyData.artists.map(a => a.name).join(" ")}`;
      }

      let playlist = null;
      let plSongs = [];
      let song = null;
      let type = "song";

      if (scRegex.test(query) && args[0].includes("/sets/")) {
        type = "playlist";
        playlist = await scdl.getSetInfo(query, SOUNDCLOUD_CLIENT_ID).catch(() => {});
        if (!playlist) return client.util.sendEmbedMessage(message, `No result was found for ${query}.`, "RED").catch(console.error);
        plSongs = playlist.tracks.map((track) => ({
          title: track.title,
          url: track.permalink_url,
          thumbnail: track.artwork_url || client.user.displayAvatarURL({ size: 4096 }),
          duration: track.duration,
          requester: message.author
        }));
      } else if (ytsr.validate(query, "PLAYLIST")) {
        type = "playlist";
        playlist = await ytsr.getPlaylist(query).catch(() => {});
        if (!playlist) return client.util.sendEmbedMessage(message, `No result was found for ${query}.`, "RED").catch(console.error);
        plSongs = playlist.videos.map((track) => ({
          title: track.title,
          url: track.url,
          thumbnail: track.thumbnail.displayThumbnailURL() || client.user.displayAvatarURL({ size: 4096 }),
          duration: track.duration,
          requester: message.author
        }));
      } else if (scRegex.test(query)) {
        data = await scdl.getInfo(query, SOUNDCLOUD_CLIENT_ID).catch(() => {});
        if (!data) return client.util.sendEmbedMessage(message, `No result was found for ${query}.`, "RED").catch(console.error);
        song = {
          title: data.title,
          url: data.permalink_url || query,
          thumbnail: data.artwork_url || client.user.displayAvatarURL({ size: 4096 }),
          duration: data.duration,
          requester: message.author
        };
      } else {
        const srData = await ytsr.search(query, { type: "video" }).catch(() => {});
        if (!srData || !srData[0].title) return client.util.sendEmbedMessage(message, `No result was found for ${query}.`, "RED").catch(console.error);
        data = srData[0];
        song = {
          title: data.title,
          url: data.url || `https://www.youtube.com/watch?v=${data.id}` || query,
          thumbnail: data.thumbnail.url || client.user.displayAvatarURL({ size: 4096 }),
          duration: data.duration,
          requester: message.author
        };
      }

      if (serverQueue) {
        if (type === "playlist") {
          serverQueue.songs.push(...plSongs);
          return client.util.sendEmbedMessage(message, `Playlist added **${playlist.title}**`).catch(console.error);
        } else {
          serverQueue.songs.push(song);
          return client.util.sendEmbedMessage(message, `Song added **${song.title}**`).catch(console.error);
        }
      }

      if (type === "playlist") {
        queueConstruct.songs.push(...plSongs);
        client.util.sendEmbedMessage(message, `Playlist added **${playlist.title}**`).catch(console.error);
      } else {
        queueConstruct.songs.push(song);
      }

      client.queue.set(message.guild.id, queueConstruct);

      try {
        queueConstruct.connection = await channel.join();
        await queueConstruct.connection.voice.setSelfDeaf(true);
        _play(client, queueConstruct, queueConstruct.songs[0]);
      } catch (error) {
        console.error(error);
        client.queue.delete(message.guild.id);
        await channel.leave();
        return message.channel.send(error.message || error);
      }
    } catch (error) {
      console.error(error);
      return message.channel.send(error.message || error);
    }
  }
};