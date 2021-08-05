module.exports = {
  name: "uptime",
  aliases: ["up"],
  description: "Get the bot uptime",
  execute(client, message) {
    let seconds = Math.floor(client.uptime / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    let days = Math.floor(hours / 24);

    seconds %= 60;
    minutes %= 60;
    hours %= 24;

    return client.util.sendEmbedMessage(message, `${days} Days ${hours} Hours ${minutes} Minutes ${seconds} Seconds.`).catch(console.error);
  }
};