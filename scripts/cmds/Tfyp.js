const axios = require("axios");

module.exports = {
  config: {
    name: "tfyp",
    aliases: ["fyp", "fy"],
    version: "2.0.0",
    author: "SiamTheFrog",
    countDown: 5,
    role: 0,
    shortDescription: "Send TikTok FYP video by query.",
    longDescription: "Search and send a TikTok FYP video based on query.",
    category: "entertainment",
    guide: "+tfyp <query>"
  },

  onStart() {
    console.log("TFYP command is ready.");
  },

  onChat: async function ({ api, event }) {
    const { threadID, messageID, body } = event;

    if (!body || (!body.startsWith("+tfyp ") && !body.startsWith("+fyp "))) return;

    const query = body.replace(/^(\+tfyp|\+fyp)\s+/i, "").trim();
    if (!query) {
      return api.sendMessage("Please provide a search keyword. Example: +tfyp cat", threadID, messageID);
    }

    const startTime = Date.now();
    const API_URL = `https://fyp-api-siamthefrog.onrender.com/search?query=${encodeURIComponent(query)}`;

    try {
      const response = await axios.get(API_URL);
      const data = response.data;

      if (!data || !data.videoUrl) {
        return api.sendMessage(`No video found for "${query}".`, threadID, messageID);
      }

      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      const videoUrl = data.videoUrl;
      const title = data.title || "TikTok Video";

      await api.sendMessage({
        body: `Took ${duration}s to fetch.\n\n🎬 ${title}`,
        attachment: await global.utils.getStreamFromURL(videoUrl)
      }, threadID, messageID);

    } catch (error) {
      console.error(error);
      api.sendMessage("Error fetching video. Please try again later.", threadID, messageID);
    }
  }
};
