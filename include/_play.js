const { MessageEmbed } = require("discord.js");
const newPlayingEmbed = require("./newPlayingEmbed");
const ytdl = require("ytdl-core-discord");
const scdl = require("soundcloud-downloader").default;
const { SOUNDCLOUD_CLIENT_ID } = require("../config.json");

module.exports = {
  async _play(client, queue, song) {
    if (!song) {
      setTimeout(function() {
        if (queue.connection.dispatcher && queue.voiceChannel) return;
        queue.voiceChannel.leave();
        queue.textChannel.send(new MessageEmbed().setColor("ORANGE").setDescription("Left the voice channel due to inactivity.")).catch(console.error);
      }, 60000);
      return client.queue.delete(queue.guildId);
    }

    let stream = null;
    let streamType = song.url.includes("youtube.com") ? "opus" : "ogg/opus";

    try {
      if (song.url.includes("youtube.com")) {
        stream = await ytdl(song.url, { highWaterMark: 1 << 25 });
      } else if (song.url.includes("soundcloud.com")) {
        try {
          stream = await scdl.downloadFormat(song.url, scdl.FORMATS.OPUS, SOUNDCLOUD_CLIENT_ID);
        } catch (error) {
          stream = await scdl.downloadFormat(song.url, scdl.FORMATS.MP3, SOUNDCLOUD_CLIENT_ID);
          streamType = "unknown";
        }
      }
    } catch (error) {
      if (queue) {
        queue.songs.shift();
        module.exports._play(client, queue, queue.songs[0]);
      }
      console.error(error);
      return queue.textChannel.send(new MessageEmbed().setColor("RED").setDescription(`${error.message || error}`));
    }

    queue.connection.on("disconnect", () => message.client.queue.delete(message.guild.id));

    const dispatcher = queue.connection
      .play(stream, { type: streamType })
      .on("finish", () => {
        if (collector && !collector.ended) collector.stop();

        if (queue.loop) {
          let lastSong = queue.songs.shift();
          queue.songs.push(lastSong);
          module.exports._play(client, queue, queue.songs[0]);
        } else {
          queue.songs.shift();
          module.exports._play(client, queue, queue.songs[0]);
        }
      })
      .on("error", (err) => {
        console.error(err);
        queue.songs.shift();
        module.exports._play(client, queue, queue.songs[0]);
      });

    dispatcher.setVolumeLogarithmic(queue.volume / 100);

    const embed = new MessageEmbed()
      .setAuthor(`Now ${queue.playing ? "Playing" : "Paused"} | ${queue.songs.length} songs in queue`, "https://i.giphy.com/media/1fkD7WKKpubBTnqAm8/giphy.gif")
      .setDescription(`[${song.title}](${song.url}) ~ [${song.requester.toString()}]`)
      .setFooter(`Duration ${client.util.formatDuration(song.duration)} | Looping: ${queue.loop ? "Enabled" : "Disabled"} | Volume : ${queue.volume}%`)
      .setImage(`${song.thumbnail}`)
      .setColor("BLUE");

    try {
      var playingMessage = await queue.textChannel.send(embed);
      await playingMessage.react("⏭");
      await playingMessage.react("⏯");
      await playingMessage.react("🔽");
      await playingMessage.react("🔼");
      await playingMessage.react("🔁");
      await playingMessage.react("⏹");
    } catch (error) {
      console.error(error);
    }

    const filter = (reaction, user) => user.id !== client.user.id;
    var collector = playingMessage.createReactionCollector(filter, {
      time: song.duration > 0 ? song.duration : 600000
    });

    collector.on("collect", (reaction, user) => {
      if (!queue) return;
      const member = client.guilds.cache.get(queue.guildId).member(user);

      switch (reaction.emoji.name) {
        case "⏭":
          queue.playing = true;
          reaction.users.remove(user).catch(console.error);
          if (!client.util.modifyQueue(member)) return;
          if (queue.songs.length <= 1)
            return queue.textChannel.send(new MessageEmbed().setColor("ORANGE").setDescription("There is currently no song in the queue to skip."));
          queue.connection.dispatcher.end();
          collector.stop();
          break;

        case "⏯":
          reaction.users.remove(user).catch(console.error);
          if (!client.util.modifyQueue(member)) return;
          if (queue.playing) {
            queue.playing = !queue.playing;
            queue.connection.dispatcher.pause(true);
            playingMessage.edit(newPlayingEmbed(queue));
          } else {
            queue.playing = !queue.playing;
            queue.connection.dispatcher.resume();
            queue.connection.dispatcher.pause(true);
            queue.connection.dispatcher.resume();
            playingMessage.edit(newPlayingEmbed(queue));
          }
          break;

        case "🔽":
          reaction.users.remove(user).catch(console.error);
          if (queue.volume == 0) return;
          if (!client.util.modifyQueue(member)) return;
          if (queue.volume - 10 <= 0) queue.volume = 0;
          else queue.volume = queue.volume - 10;
          queue.connection.dispatcher.setVolumeLogarithmic(queue.volume / 100);
          playingMessage.edit(newPlayingEmbed(queue));
          break;

        case "🔼":
          reaction.users.remove(user).catch(console.error);
          if (queue.volume == 100) return;
          if (!client.util.modifyQueue(member)) return;
          if (queue.volume + 10 >= 150) queue.volume = 150;
          else queue.volume = queue.volume + 10;
          queue.connection.dispatcher.setVolumeLogarithmic(queue.volume / 100);
          playingMessage.edit(newPlayingEmbed(queue));
          break;

        case "🔁":
          reaction.users.remove(user).catch(console.error);
          if (!client.util.modifyQueue(member)) return;
          queue.loop = !queue.loop;
          playingMessage.edit(newPlayingEmbed(queue));
          break;

        case "⏹":
          reaction.users.remove(user).catch(console.error);
          if (!client.util.modifyQueue(member)) return;
          queue.songs = [];
          const stopEmbed = new MessageEmbed()
            .setColor("BLUE")
            .setDescription("Stopped the music.")
            .setFooter(member.user.tag, member.user.displayAvatarURL())
            .setTimestamp();
          queue.textChannel.send(stopEmbed).catch(console.error);
          try {
            queue.connection.dispatcher.end();
          } catch (error) {
            console.error(error);
            queue.connection.disconnect();
          }
          collector.stop();
          break;

        default:
          reaction.users.remove(user).catch(console.error);
          break;
      }
    });

    collector.on("end", () => {
      playingMessage.reactions.removeAll().catch(console.error);
      if (playingMessage && !playingMessage.deleted) {
        playingMessage.delete({ timeout: 3000 }).catch(console.error);
      }
    });
  }
};