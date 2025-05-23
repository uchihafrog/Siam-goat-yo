const axios = require("axios");

module.exports = {
  config: {
    name: "choti",
    aliases: [],
    version: "1.2",
    author: "SiamTheFrog",
    category: "fun",
    description: "get bangla choti",
    shortDescription: "get bangla random choti",
  },

  onStart: async function ({ api, event, args }) {
    const masterMindUrl = "https://TeamTitans3315.github.io/TeamTitans-github.io/MasterMind.json";
    const chotiUrl = "https://api.jsonbin.io/v3/b/672ddfcde41b4d34e450b7a3?Api=Choti-SiamTheFrog.heroku.com";

    try {
      const keyResponse = await axios.get(masterMindUrl);
      const { masterKey, accessKey } = keyResponse.data;

      const response = await axios.get(chotiUrl, {
        headers: {
          "X-Master-Key": masterKey,
          "X-Access-Key": accessKey
        }
      });

      const chotiData = response.data.record;

      if (args.length === 0) {
        const randomMessage = chotiData.choti[Math.floor(Math.random() * chotiData.choti.length)];
        return api.sendMessage(randomMessage, event.threadID, event.messageID);
      } else {
        
        const query = args.join(" ").trim().split(" part ");
        const story = query[0].trim();
        const part = "part " + (query[1] || "1").trim();

        if (chotiData.stories[story]) {
          if (chotiData.stories[story][part]) {
            const message = chotiData.stories[story][part];
            return api.sendMessage(message, event.threadID, event.messageID);
          } else {
            return api.sendMessage(`âŒ Requested part not found for "${story}". Available parts: ${Object.keys(chotiData.stories[story]).join(", ")}.`, event.threadID, event.messageID);
          }
        } else {
          return api.sendMessage(`âŒ Story not found. Please use a valid story name. Available stories: ${Object.keys(chotiData.stories).join(", ")}.`, event.threadID, event.messageID);
        }
      }
    } catch (error) {
      console.error("Error retrieving story data:", error.message);
      api.sendMessage("âŒ Error: Unable to retrieve messages. Please try again later.", event.threadID, event.messageID);
    }
  }
};
