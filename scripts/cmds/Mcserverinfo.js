const axios = require("axios");

module.exports = {
  config: {
    name: "mcserverinfo",
    aliases: ["mc"],
    version: "1.2",
    author: "SiamTheFrog",
    category: "tools",
    description: "Retrieve detailed Minecraft server status and information",
    shortDescription: "Check Minecraft server info",
  },

  onStart: async function ({ api, event, args }) {
    const serverAddress = args[0];
    if (!serverAddress) {
      return api.sendMessage("Please provide the Minecraft server address.", event.threadID, event.messageID);
    }

    try {
      const mastermindURL = "https://TeamTitans3315.github.io/TeamTitans-github.io/MasterMind.json";
      const keyResponse = await axios.get(mastermindURL); 
      const accessKey = keyResponse.data.accessKey;
      const masterKey = keyResponse.data.masterKey;

      const configResponse = await axios.get("https://api.jsonbin.io/v3/b/672db79bad19ca34f8c66092?api=minecraft-Server-Info.heroku.com", {
        headers: {
          'X-Master-Key': masterKey,
          'X-Access-Key': accessKey
        }
      });

      const minecraftApiUrl = configResponse.data.record.minecraftFrog.url;

      const response = await axios.get(`${minecraftApiUrl}${serverAddress}`);
      const serverData = response.data;

      if (!serverData.online) {
        return api.sendMessage("âŒ The server is offline or not reachable.", event.threadID, event.messageID);
      }

      const motd = serverData.motd && serverData.motd.clean ? serverData.motd.clean.join("\n") : "Not available";
      const players = serverData.players
        ? `Online: ${serverData.players.online} / Max: ${serverData.players.max}`
        : "Unknown";

      const plugins = serverData.plugins
        ? serverData.plugins.map((plugin) => `${plugin.name} (v${plugin.version})`).join(", ")
        : "No plugins detected";

      const mods = serverData.mods
        ? serverData.mods.map((mod) => `${mod.name} (v${mod.version})`).join(", ")
        : "No mods detected";

      const message = `
ðŸŒ Minecraft Server Information ðŸŒ
===============================
ðŸ“ Server Address: ${serverAddress}
ðŸŸ¢ Status: Online
ðŸŽ® Version: ${serverData.version || "Unknown"} (${serverData.protocol?.name || "Unknown"})
ðŸ‘¥ Players: ${players}
ðŸ“œ MOTD: ${motd}
ðŸ—ºï¸ Map: ${serverData.map ? serverData.map.clean : "Not available"}
ðŸ“‹ Plugins: ${plugins}
ðŸ› ï¸ Mods: ${mods}
ðŸ… Game Mode: ${serverData.gamemode || "Not specified"}
===============================

ðŸŒ Additional Info:
- Server Software: ${serverData.software || "Unknown"}
- Server ID: ${serverData.serverid || "Not available"}
      `;

      api.sendMessage(message, event.threadID, event.messageID);
    } catch (error) {
      console.error("Error retrieving server data:", error.message);
      api.sendMessage("âŒ Error: Could not retrieve server data. Please check the server address or Contact SiamTheFrog.", event.threadID, event.messageID);
    }
  }
};
