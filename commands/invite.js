module.exports = {
  name: "invite",
  description: "Get the bot invite link",
  execute(client, message) {
    return message.channel.send(
      `https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=70282305&scope=bot`
    ).catch(console.error);
  }
};