module.exports = {
  name: "volume",
  aliases: ["v", "vol"],
  description: "Change the music output volume",
  execute(client, message, args) {
    const queue = client.queue.get(message.guild.id);

    if (!queue)
      return client.util.sendEmbedMessage(message, "There is nothing playing.", "RED").catch(console.error);

    if (!client.util.canModifyQueue(message)) return;

    if (!args.length)
      return client.util.sendEmbedMessage(message, `Volume is set at ${queue.volume}%.`);

    const vol = Number(args[0]);

    if (!vol || vol > 150 || vol < 0)
      return client.util.sendEmbedMessage(message, "New volume must be between 0-150.", "ORANGE");

    queue.volume = vol;
    queue.connection.dispatcher.setVolumeLogarithmic(vol / 100);

    return client.util.sendEmbedMessage(message, `Volume set to **${vol}%**.`);
  }
};