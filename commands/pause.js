module.exports = {
  name: "pause",
  description: "Pause the currently playing music",
  execute(client, message) {
    const queue = client.queue.get(message.guild.id);

    if (!queue)
      return client.util.sendEmbedMessage(message, "There is nothing playing.", "RED").catch(console.error);

    if (!client.util.canModifyQueue(message)) return;

    if (!queue.playing)
      return client.util.sendEmbedMessage(message, "The music is already paused");

    queue.playing = false;
    queue.connection.dispatcher.pause(true);

    return client.util.sendEmbedMessage(message, "⏸️ Paused the music.");
  }
};