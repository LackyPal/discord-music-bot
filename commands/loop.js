module.exports = {
  name: "loop",
  description: "Toogle loop mode",
  execute(client, message) {
    const queue = client.queue.get(message.guild.id);

    if (!queue)
      return client.util.sendEmbedMessage(message, "There is nothing playing.", "RED").catch(console.error);

    if (!client.util.canModifyQueue(message)) return;

    queue.loop = !queue.loop;

    return client.util.sendEmbedMessage(message, `🔁 ${queue.loop ? "Enabled" : "Disabled"} loop mode.`);
  }
};