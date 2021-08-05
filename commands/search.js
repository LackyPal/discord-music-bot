const { MessageEmbed } = require("discord.js");
const ytsr = require("youtube-sr").default;
const pattern = /^[0-9]{1,2}(\s*,\s*[0-9]{1,2})*$/;

module.exports = {
  name: "search",
  cooldown: 4,
  aliases: ["sr"],
  description: "Search on youtube and choose to play",
  async execute(client, message, args) {
    if (!args.length)
      return client.util.sendEmbedMessage(message, "Please provide the song name to search.", "ORANGE").catch(console.error);

    try {
      const query = args.join(" ");

      const results = await ytsr.search(query, { limit: 10 }).catch(() => {});

      if (!results)
        return client.util.sendEmbedMessage(message, `No result was found for ${query}.`).catch(console.error);

      const embed = new MessageEmbed()
        .setTitle(`Search result for ${query}`)
        .setDescription(results.map((video, i) => `${i + 1}. ${video.title} ~ ${video.durationFormatted}`))
        .setColor("BLUE")
        .setFooter("Reply within 60 seconds with the index to play.\nExample: 6,7,8");

      let resultsMessage = await message.channel.send(embed);

      function filter(msg) {
        return msg.author.id === message.author.id;
      }

      const response = await message.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ["time"] });

      if (!response)
        return client.util.sendEmbedMessage(message, "Timeout, searching cancelled").catch(console.error);

      const reply = response.first().content;

      if (pattern.test(reply)) {
        let songs = reply.split(",").map((str) => str.trim());

        for (let song of songs) {
          await client.commands
            .get("play")
            .execute(client, message, [results[(song) - 1].url]);
        }
      } else {
        resultsMessage.delete().catch(console.error);
        return mssage.channel.send("Wrong input, searching cancelled");
      }
    } catch (error) {
      console.error(error);
      return client.util.sendEmbedMessage(message, error.message, "RED").catch(console.error);
    }
  }
};