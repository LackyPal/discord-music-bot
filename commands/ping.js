module.exports = {
  name: "ping",
  description: "Display the bot response speed",
  async execute(client, message) {
    const msg = await message.channel.send("Pinging...");

    return msg.edit(`Pong\n ${Math.round(client.ws.ping)}ms`);
  }
};