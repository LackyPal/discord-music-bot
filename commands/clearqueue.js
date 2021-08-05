module.exports = {
  name: "clearqueue",
  aliases: ["cq", "empty"],
  description: "Clears the queue.",
  execute(client, message) {
    const queue = client.queue.get(message.guild.id);

    if (!queue)
      return client.util.sendEmbedMessage(message, "There is nothing playing.", "RED").catch(console.error);

    if (!client.util.canModifyQueue(message)) return;

    if (queue.songs.length <= 1)
      return client.util.sendEmbedMessage(message, "No more songs in the queue to clear.", "ORANGE").catch(console.error);

    queue.songs = [queue.songs[0]];

    return client.util.sendEmbedMessage(message, "🗑️ Cleared the queue.").catch(console.error);
  }
};