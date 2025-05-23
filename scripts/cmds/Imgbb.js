const fetch = require('node-fetch');

module.exports = {
  config: {
    name: "imgbb",
    version: "1.0",
    author: "SiamTheFrog",
    countDown: 0,
    role: 0,
    shortDescription: "Upload an image to imgbb",
    longDescription: "Upload an image to imgbb",
    category: "tools",
    guide: "{pn} <reply an image>"
  },

  onStart: async function ({ message, event }) {
    try {
      const attachments = event.messageReply.attachments;
      if (!attachments || attachments.length === 0) {
        return message.reply("Please reply to a message with an attached image to upload.");
      }

      const imageUrl = attachments[0].url;
      const configData = await fetch("https://Siamfroggy.github.io/Imgbb-github.io/imgbbbaseApiUrl.json").then(res => res.json());
      const uploadUrl = configData.imgbb.api + "&key=" + configData.imgbb.apikey;

      const data = new URLSearchParams();
      data.append('image', imageUrl);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: data
      });

      const result = await response.json();

      if (result && result.success) {
        const cleanImageUrl = result.data.url;
        return message.reply(`Here is your img link: ${cleanImageUrl}`);
      } else {
        return message.reply("Failed to upload the image to imgbb. Please try again.");
      }
    } catch (error) {
      console.error('Error:', error);
      return message.reply(`Error: ${error.message}`);
    }
  }
};
