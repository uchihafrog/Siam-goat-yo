const axios = require("axios");

module.exports = {
  config: {
    name: "tfyp",
    aliases: ["fyp", "fy"],
    version: "1.0.2",
    author: "SiamTheFrog",
    countDown: 5,
    role: 0,
    shortDescription: "Send fyp video by query.",
    longDescription: "Search fyp videos based on a query and send one randomly.",
    category: "entertainment",
    guide: "{pn} <query>"
  },

  onStart: function () {
    console.log("TFYP command is ready to use!");
  },

  onChat: async function ({ api, event, args }) {
    const { threadID, messageID, body } = event;

    if (!body.startsWith("/tfyp ")) {
      return;
    }

    const query = args.join(" ").trim().toLowerCase();

    if (!query) {
      return api.sendMessage(
        "Please provide a search keyword. Example: /tfyp cat",
        threadID,
        messageID
      );
    }

    const API_URL = `https://fyp-api-siamthefrog.onrender.com/search?query=${encodeURIComponent(query)}`;

    try {
      const response = await axios.get(API_URL);
      const data = response.data;

      if (!data || !data.videoUrl) {
        return api.sendMessage(
          `No video found for the keyword "${query}".`,
          threadID,
          messageID
        );
      }

      const videoUrl = data.videoUrl;
      const title = data.title || "TikTok Video";

      await api.sendMessage(
        {
          body: `🎥 ${title}`,
          attachment: await global.utils.getStreamFromURL(videoUrl),
        },
        threadID,
        messageID
      );

    } catch (error) {
      console.error(error);
      api.sendMessage("An error occurred, please try again later.", threadID, messageID);
    }
  },
};
