module.exports = {
  name: "stop",
  description: "Stops the music",
  execute(client, message) {
    const queue = client.queue.get(message.guild.id);

    if (!queue)
      return client.util.sendEmbedMessage(message, "There is nothing playing.", "RED").catch(console.error);

    if (!client.util.canModifyQueue(message)) return;

    queue.songs = [];
    queue.connection.dispatcher.end();

    return client.util.sendEmbedMessage(message, "⏹️ Stopped the music.");
  }
};