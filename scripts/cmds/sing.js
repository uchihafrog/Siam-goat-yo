const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "sing",
    aliases: [],
    version: "1.0.5",
    author: "Siam",
    shortDescription: "Search and get audio from Instagram music",
    longDescription: "Search for a keyword and get the Instagram music audio file.",
    category: "music",
    guide: "{pn} [keyword]"
  },

  onStart: async function ({ api, event, args }) {
    const query = args.join(" ");
    const { threadID, messageID } = event;

    if (!query) {
      return api.sendMessage("❗ Please provide a keyword.\nExample: /sing Phonk", threadID, messageID);
    }

    try {
      const res = await axios.get(`https://sing-api-v2-siam-the-frog.vercel.app/sing/${encodeURIComponent(query)}`);
      const { artist, duration, url: downloadUrl } = res.data;

      if (!downloadUrl) {
        return api.sendMessage("❌ No valid audio found for your search.", threadID, messageID);
      }

      await api.sendMessage(
        `🎧 𝗔𝘂𝗱𝗶𝗼 𝗥𝗲𝘀𝘂𝗹𝘁\n\n🎙 Artist: ${artist}\n⏱ Duration: ${duration}s\n\n🔗 Link: ${downloadUrl}`,
        threadID
      );

      const audioPath = path.join(__dirname, `${Date.now()}.mp3`);
      const writer = fs.createWriteStream(audioPath);

      const audioStream = await axios({
        url: downloadUrl,
        method: 'GET',
        responseType: 'stream'
      });

      audioStream.data.pipe(writer);

      writer.on('finish', () => {
        api.sendMessage({
          body: "⬇️ 𝗛𝗲𝗿𝗲 𝗶𝘀 𝘆𝗼𝘂𝗿 𝗮𝘂𝗱𝗶𝗼:",
          attachment: fs.createReadStream(audioPath)
        }, threadID, () => {
          fs.unlinkSync(audioPath);
        }, messageID);
      });

      writer.on('error', (err) => {
        console.error("Write error:", err);
        api.sendMessage("❌ Failed to save audio.", threadID, messageID);
      });

    } catch (err) {
      console.error("Fetch error:", err);
      api.sendMessage("❌ Failed to fetch audio. Try again later.", threadID, messageID);
    }
  }
};
