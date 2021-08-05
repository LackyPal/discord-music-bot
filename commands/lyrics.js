const { MessageEmbed } = require("discord.js");
const lyricsFinder = require("lyrics-finder");

module.exports = {
  name: "lyrics",
  aliases: ["ly", "lyric"],
  description: "Get lyrics for a song name",
  async execute(client, message, args) {
    if (!args.length)
      return client.util.sendEmbedMessage(message, "Provide the song name to get lyrics.", "ORANGE").catch(console.error);

    const query = args.join(" ");

    const queryFormated = query
      .toLowerCase()
      .replace(/\(lyrics|lyric|lyrics video|official music video|audio|official|official video|official video hd|clip officiel|full video song|clip|reprise|unwind|extended|hq\)/g, "")
      .split(" ").join(" ");

    const lyrics = await lyricsFinder(`${queryFormated}`)
      .catch(err => {
        console.log(err);
      });

    if (!lyrics)
      return client.util.sendEmbedMessage(message, "Sorry, No lyrics found for this song", "RED").catch(console.error);

    const embed = new MessageEmbed()
      .setTitle(`${query}`)
      .setDescription(lyrics.substr(0, 4090))
      .setColor("BLUE")
      .setFooter(`Requested by: ${message.author.tag}`)
      .setTimestamp();

    return message.channel.send(embed).catch(console.error);
  }
};