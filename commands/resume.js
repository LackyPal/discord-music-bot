module.exports = {
  name: "resume",
  description: "Resumes the paused music",
  execute(client, message) {
    const queue = client.queue.get(message.guild.id);

    if (!queue)
      return client.util.sendEmbedMessage(message, "There is nothing playing.", "RED").catch(console.error);

    if (!client.util.canModifyQueue(message)) return;

    if (queue.playing)
      return client.util.sendEmbedMessage(message, "The music is already playing.", "ORANGE");

    queue.playing = true;
    queue.connection.dispatcher.resume();
    queue.connection.dispatcher.pause(true);
    queue.connection.dispatcher.resume();

    return client.util.sendEmbedMessage(message, "▶️ Resumed the music.");
  }
};