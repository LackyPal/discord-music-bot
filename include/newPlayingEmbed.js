const { MessageEmbed } = require("discord.js");
const { formatDuration } = require("./Util");

function newPlayingEmbed(queue) {
  const song = queue.songs[0];

  return new MessageEmbed()
    .setAuthor(`Now ${queue.playing ? "Playing" : "Paused"} | ${queue.songs.length} songs in queue`, "https://i.giphy.com/media/1fkD7WKKpubBTnqAm8/giphy.gif")
    .setDescription(`[${song.title}](${song.url}) ~ [${song.requester.toString()}]`)
    .setFooter(`Duration ${formatDuration(song.duration)} | Looping: ${queue.loop ? "Enabled" : "Disabled"} | Volume : ${queue.volume}%`)
    .setImage(`${song.thumbnail}`)
    .setColor("BLUE");
}

module.exports = newPlayingEmbed;