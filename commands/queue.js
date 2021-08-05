const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "queue",
  aliases: ["q"],
  description: "Shows the queue.",
  cooldown: "4",
  execute(client, message, args) {
    const queue = client.queue.get(message.guild.id);

    if (!queue)
      return client.util.sendEmbedMessage(message, "There is nothing playing.", "RED").catch(console.error);

    if (queue.songs.length <= 1)
      return client.util.sendEmbedMessage(message, "There is currently no song in the queue.", "ORANGE");

    const multiple = 10;
    let page = Number(args[0]) || 1;

    const maxPages = Math.ceil(queue.songs.length / multiple);

    if (page < 1 || page > maxPages) page = 1;

    const end = page * multiple + 1;
    const start = end - multiple;

    const tracks = queue.songs.slice(start, end);

    const embed = new MessageEmbed()
      .setTitle(`${message.guild.name} Queue`)
      .setColor("BLUE")
      .setDescription(`${tracks.map((song, i) => `${start + i}\) [${song.title}](${song.url}) ~ ${client.util.formatDuration(song.duration)}`).join("\n")}`)
      .setFooter(`Page ${page} of ${maxPages} | song ${start} to ${end > queue.songs.length ? `${queue.songs.length}` : `${end}`} of ${queue.songs.length}`);

    return message.channel.send(embed).catch(console.error);
  }
};