module.exports = {
  name: "skip",
  aliases: ["s"],
  description: "Skip and play the next song",
  execute(client, message) {
    const queue = client.queue.get(message.guild.id);

    if (!queue)
      return client.util.sendEmbedMessage(message, "There is nothing playing.", "RED").catch(console.error);

    if (!client.util.canModifyQueue(message)) return;

    if (queue.songs.length <= 1)
      return client.util.sendEmbedMessage(message, "There is currently no song in the queue to skip.", "ORANGE");

    queue.playing = true;
    queue.connection.dispatcher.end();

    return client.util.sendEmbedMessage(message, "⏭️ Skipped to the next song.");
  }
};