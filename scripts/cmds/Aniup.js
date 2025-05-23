const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "aniup",
    version: "1.0",
    author: "SiamTheFrog",
    countDown: 0,
    role: 0,
    shortDescription: "Bot uptime with random anime image",
    longDescription: "Check how long the bot has been online with random anime image.",
    category: "info",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const uptimeString = `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds.`;

    try {
      const MastermindUrl = await axios.get('https://TeamTitans3315.github.io/TeamTitans-github.io/MasterMind.json');
      const { masterKey, accessKey } = MastermindUrl.data;

      if (!masterKey || !accessKey) {
        return api.sendMessage("Error contact SiamTheFrog.", event.threadID, event.messageID);
      }

      const ApiUrl = await axios.get('https://api.jsonbin.io/v3/b/67375786acd3cb34a8a91224?siam=api-animeuptime.heroku.com', {
        headers: {
          'X-Master-Key': masterKey,
          'X-Access-Key': accessKey
        }
      });

      const pastebinConfig = ApiUrl.data.record;
      const { apiurl, imagePath } = pastebinConfig;

      if (!apiurl || !imagePath) {
        return api.sendMessage("Error contact SiamTheFrog.", event.threadID, event.messageID);
      }

      const response = await axios.get(apiurl);
      const imageUrl = response.data.url;

      const imageFullPath = path.join(__dirname, imagePath);
      const imageResponse = await axios({ url: imageUrl, responseType: 'stream' });
      imageResponse.data.pipe(fs.createWriteStream(imageFullPath));

      imageResponse.data.on('end', () => {
        api.sendMessage(
          {
            body: `â± Bot Uptime:\nThe bot has been online for ${uptimeString}`,
            attachment: fs.createReadStream(imageFullPath)
          },
          event.threadID,
          event.messageID
        );
      });
    } catch (error) {
      console.error('Error fetching data:', error.message);
      return api.sendMessage(
        `â± Bot Uptime:\nThe bot has been online for ${uptimeString}`,
        event.threadID,
        event.messageID
      );
    }
  }
};
