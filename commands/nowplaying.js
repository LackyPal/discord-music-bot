const { splitBar } = require("string-progressbar");
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "nowplaying",
  aliases: ["np"],
  description: "Show the currently playing song",
  execute(client, message) {
    const queue = client.queue.get(message.guild.id);

    if (!queue)
      return client.util.sendEmbedMessage(message, "There is nothing playing.", "RED").catch(console.error);

    const song = queue.songs[0];
    const seek = queue.connection.dispatcher.streamTime - queue.connection.dispatcher.pausedTime;
    const left = song.duration - seek;

    const embed = new MessageEmbed()
      .setTitle(`${song.title}`)
      .setURL(`${song.url}`)
      .setThumbnail(`${song.thumbnail}`)
      .setDescription(`Played by: ${song.requester}`)
      .addField(`${client.util.formatDuration(seek)}\/${client.util.formatDuration(song.duration)}`, splitBar((song.duration == 0 ? seek : song.duration), seek, 20)[0], false)
      .setColor("BLUE");

    return message.channel.send(embed);
  }
};