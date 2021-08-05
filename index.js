const { Client, Collection } = require("discord.js");
const { readdirSync } = require("fs");
const { join } = require("path");
const { TOKEN, PREFIX } = require("./config.json");
const Util = require("./include/Util");

const client = new Client({
  disableMentions: "everyone",
  restTimeOffset: 0
});

client.commands = new Collection();
client.prefix = PREFIX;
client.queue = new Map();
client.util = Util;

// Import all events
const eventFiles = readdirSync(join(__dirname, "events")).filter((file) => file.endsWith(".js"));
for (const file of eventFiles) {
  const event = require(join(__dirname, "events", `${file}`));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(client, ...args));
  } else {
    client.on(event.name, (...args) => event.execute(client, ...args));
  }
}

// Import all commands
const commandFiles = readdirSync(join(__dirname, "commands")).filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(join(__dirname, "commands", `${file}`));
  client.commands.set(command.name, command);
}

client.login(TOKEN);

//client.setMaxListeners(0)

// Unhandled errors
process.on("unhandledRejection", (error) => console.error(error));

process.on("uncaughtExceptionMonitor", (error) => console.error(error));

process.on("warning", (warn) => {
  console.warn(warn);
});