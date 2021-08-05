module.exports = {
  name: "shuffle",
  description: "Shuffle the queue",
  execute(client, message) {
    const queue = client.queue.get(message.guild.id);

    if (!queue)
      return client.util.sendEmbedMessage(message, "There is nothing playing.", "RED").catch(console.error);

    if (!client.util.canModifyQueue(message)) return;

    let songs = queue.songs;
    for (let i = songs.length - 1; i > 1; i--) {
      let j = 1 + Math.floor(Math.random() * i);
      [songs[i], songs[j]] = [songs[j], songs[i]];
    }

    queue.songs = songs;
    client.queue.set(message.guild.id, queue);

    return client.util.sendEmbedMessage(message, "🔀 Shuffled the queue.");
  }
};