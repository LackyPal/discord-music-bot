const { MessageEmbed } = require("discord.js");

function canModifyQueue(message) {
  if (message.member.voice.channelID !== message.guild.voice.channelID) {
    sendEmbedMessage(message, "You need to be in the same voice channel as me!", "ORANGE");
    return;
  }
  return true;
}

function modifyQueue(member) {
  const embed = new MessageEmbed()
    .setDescription("You need to be in the same voice channel as me!")
    .setColor("ORANGE")
    .setTimestamp();

  if (member.voice.channelID !== member.guild.voice.channelID) {
    member.send(embed).then(msg => msg.delete({ timeout: 7000 }).catch(console.error));
    return;
  }
  return true;
}

function formatDuration(duration) {
  return new Date(duration).toISOString().substr(11, 8);
}

function sendEmbedMessage(message, text, colour) {
  let color = "BLUE";
  if (colour) color = colour;

  const embed = new MessageEmbed()
    .setDescription(text)
    .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
    .setColor(color)
    .setTimestamp();

  return message.channel.send(embed).catch(console.error);
}

module.exports = {
  canModifyQueue,
  modifyQueue,
  formatDuration,
  sendEmbedMessage
};