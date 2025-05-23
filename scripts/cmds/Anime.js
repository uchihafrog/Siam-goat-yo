module.exports = {

  config: {
    name: 'anime',
    version: '1.0.0',
    author: 'Siam the frog>ðŸ¸',
    countDown: 0,
    role: 0,
    category: 'image',
    shortDescription: '',
    longDescription: '',
    guide: {
      en: '{pn}'
    }
  },

  onStart: async function ({ api, event, message }) {
    const axios = require('axios');
    const senderID = event.senderID;

    try {
      
      const response = await axios.get('https://api.waifu.pics/sfw/waifu');
      const animeImageUrl = response.data.url;

         
      const Body = `Here is your random anime image:`;

      const imageStream = await global.utils.getStreamFromURL(animeImageUrl);
      message.reply({ body: Body, attachment: imageStream }, event.threadID);

    } catch (error) {
      message.reply(`Unable to fetch anime image at the moment.`);
    }
  }

};
