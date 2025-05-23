const axios = require('axios');

module.exports = {
  config: {
    name: "ibhost",
    aliases: ["i"],
    version: "1.0",
    author: "SiamTheFrog",
    countDown: 0,
    role: 0,
    shortDescription: "Upload an image to ibhost",
    longDescription: "Upload an image to ibhost",
    category: "tools",
    guide: "{pn} <reply an image> [optional: png/html]"
  },

  onStart: async function ({ message, event, args }) {
    try {
      const attachments = event.messageReply?.attachments;
      if (!attachments || attachments.length === 0) {
        return message.reply("Please reply to a message with an attached image to upload.");
      }

      const imageUrl = attachments[0].url;

      const masterMind = await axios.get("https://TeamTitans3315.github.io/TeamTitans-github.io/MasterMind.json?Mastermind-bruhh");
      const { accessKey, masterKey } = masterMind.data;

      const Api = await axios.get("https://api.jsonbin.io/v3/b/675ab072ad19ca34f8d9de62?api=V1-froggy.ibhost.herokuapp.com", {
        headers: {
          "X-Master-Key": masterKey,
          "X-Access-Key": accessKey
        }
      });

      const { api, SiamTheFrog, baseLink } = Api.data.record;

      const data = new URLSearchParams();
      data.append('image', imageUrl);

      const response = await axios.post(`${api}?key=${SiamTheFrog}`, data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const result = response.data;

      if (result && result.success) {
        const imageId = result.data.id;
        const finalBaseLink = `${baseLink}/${imageId}/Froggy`;

        if (args[0]?.toLowerCase() === "png") {
        
          const pngLink = `${finalBaseLink}.png`;
          return message.reply(`${pngLink}`);
          
        } else if (args[0]?.toLowerCase() === "html") {
          const htmlEmbedCode = `<a href="${finalBaseLink}.jpg" target="_blank"><img src="${finalBaseLink}.jpg" alt="Froggy" /></a>`;
          return message.reply(`${htmlEmbedCode}`);
          
        } else {
          const jpgLink = `${finalBaseLink}.jpg`;
          return message.reply(`${jpgLink}`);
          
        }
      } else {
      
        return message.reply("Failed to upload the image to ibhost Contact SiamTheFrog.");
      }
      
    } catch (error) {
      console.error('Error:', error);
      return message.reply(`Error: ${error.message}`);
    }
  }
};
