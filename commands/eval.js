const { OWNER_ID } = require("../config.json");
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "eval",
  description: "Eval some javascript code",
  aliases: ["e"],
  async execute(client, message, args) {
    if (message.author.id !== OWNER_ID)
      return client.util.sendEmbedMessage(message, "Only the bot owner can run this command", "RED");

    if (!args.length)
      return client.util.sendEmbedMessage(message, "Provide the code to eval.", "ORANGE");

    const toEval = args.join(" ");

    if (toEval.toLowerCase().includes("token"))
      return client.util.sendEmbedMessage(message, "Snatching token is not allowed.", "RED");

    try {
      let evaled = await eval(toEval);

      const type = typeof evaled;
      evaled = require("util").inspect(evaled, {
        depth: 0,
        maxArrayLength: null,
      });

      if (type === "object") evaled = JSON.stringify(evaled);

      const embed = new MessageEmbed()
        .setTitle("Eval Command")
        .setDescription(`\`Eval Type:\` ${type}
\`Eval Input:\` \`\`\`js\n${toEval} \`\`\`
\`Eval Output:\` \`\`\`js\n${evaled}\`\`\``)
        .setColor("BLUE");

      message.channel.send(embed);
    } catch (error) {
      const wrEmbed = new MessageEmbed()
        .setTitle("Something went wrong")
        .setDescription(`\`\`\`${error}\`\`\``)
        .setColor("RED");

      message.channel.send(wrEmbed);
    }
  }
};