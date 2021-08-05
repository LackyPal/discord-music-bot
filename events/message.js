const { PREFIX } = require("../config.json");
const { Collection } = require("discord.js");
const cooldowns = new Collection();

module.exports = {
  name: "message",
  async execute(client, message) {
    if (!message.guild || !message.guild.available) return;
    if (message.channel.type === "dm") return;
    if (!message.channel.permissionsFor(message.guild.me).has("SEND_MESSAGES")) return;
    if (message.author.bot) return;

    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(PREFIX)})\\s*`);
    if (!prefixRegex.test(message.content)) return;

    const [, matchedPrefix] = message.content.match(prefixRegex);

    const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command =
      client.commands.get(commandName) ||
      client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    if (!cooldowns.has(command.name)) {
      cooldowns.set(command.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (timestamps.has(message.author.id)) {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        return client.util.sendEmbedMessage(message, `Please wait ${timeLeft.toFixed(1)} more second before reusing the \`${command.name}\` command.`);
      }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try {
      await command.execute(client, message, args);
    } catch (error) {
      console.error(error);
      return client.util.sendEmbedMessage(message, "There was an error while executing that command!");
    }
  }
};