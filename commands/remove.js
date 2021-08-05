const pattern = /^[0-9]{1,2}(\s*,\s*[0-9]{1,2})*$/;

module.exports = {
  name: "remove",
  aliases: ["rm"],
  description: "Remove song from the queue",
  execute(client, message, args) {
    const queue = client.queue.get(message.guild.id);

    if (!queue)
      return client.util.sendEmbedMessage(message, "There is nothing playing.", "RED").catch(console.error);

    if (!client.util.canModifyQueue(message)) return;

    if (!args.length)
      return client.util.sendEmbedMessage(message, "Provide the track index to remove.", "ORANGE");

    if (queue.songs.length <= 1)
      return client.util.sendEmbedMessage(message, "There is currently no song in the queue.", "ORANGE");

    const arguments = args.join("");

    if (!pattern.test(arguments))
      return client.util.sendEmbedMessage(message, `Correct usage be: ${client.prefix}remove 1,7,3,2`, "ORANGE");

    const songs = arguments.split(",").map((arg) => parseInt(arg));
    let removed = [];
    queue.songs = queue.songs.filter((item, index) => {
      if (songs.find((songIndex) => songIndex - 1 === index)) removed.push(item);
      else return true;
    });

    return client.util.sendEmbedMessage(message, `Removed ${removed.length} songs.`);
  }
};