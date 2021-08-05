const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "help",
  aliases: ["h"],
  description: "Get all available commands",
  execute(client, message) {
    const commands = client.commands.array();

    const embed = new MessageEmbed()
      .setTitle(`${client.user.username} Help Commands`)
      .setColor("BLUE")
      .setFooter(`${message.author.tag}`)
      .setTimestamp();

    commands.forEach((cmd) => {
      embed.addField(
        cmd.aliases ? `**${client.prefix}${cmd.name}**\nAliases: ${cmd.aliases}` : `**${client.prefix}${cmd.name}**`,
        `${cmd.description}`,
        true
      );
    });

    return message.channel.send(embed).catch(console.error);
  }
};