const { PREFIX } = require("../config.json");

module.exports = {
  name: "ready",
  once: true,
  execute(client) {
    console.log(`${client.user.tag} ready!`);
    client.user.setActivity(`${PREFIX}help | ${PREFIX}play`, { type: "LISTENING" });
  }
};
