module.exports = {
  name: "skipto",
  aliases: ["st"],
  description: "Skip to a specific song in the queue",
  execute(client, message, args) {
    const queue = client.queue.get(message.guild.id);

    if (!queue)
      return client.util.sendEmbedMessage(message, "There is nothing playing.", "RED").catch(console.error);

    if (!client.util.canModifyQueue(message)) return;

    if (!args.length || isNaN(args[0]))
      return client.util.sendEmbedMessage(message, "Provide a valid track position.", "ORANGE");

    if (queue.songs.length <= 1)
      return client.util.sendEmbedMessage(message, "There is currently no song in the queue to skip.", "ORANGE");

    let index = Number(args[0]);

    if (!index || index > queue.songs.length || index <= 0)
      return client.util.sendEmbedMessage(message, "Provide a valid track position.", "ORANGE");

    queue.playing = true;
    queue.songs = queue.songs.splice(index - 1);
    queue.connection.dispatcher.end();

    return client.util.sendEmbedMessage(message, `⏭️ Skipped to ${index} song.`);
  }
};