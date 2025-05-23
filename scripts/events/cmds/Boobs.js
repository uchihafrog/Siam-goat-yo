const axios = require('axios');

module.exports = {
  config: {
    name: 'boobs',
    version: '1.0.0',
    author: 'SiamTheFrog',
    countDown: 0,
    role: 2,
    category: 'NSFW',
    shortDescription: 'Provides random nude photos',
    longDescription: 'Get random nude photos based on category.',
    guide: {
      en: '{pn} [category]'
    }
  },

  onStart: async function ({ api, event, message }) {
    const SiamUrl = 'https://api.jsonbin.io/v3/b/67271f15acd3cb34a8a1abd2'; 
    const mastermindURL = 'https://TeamTitans3315.github.io/TeamTitans-github.io/MasterMind.json'; 

    const category = event.body.split(' ')[1] || 'boobs'; 
    const validCategories = ['boobs', 'pussy', 'ass', 'feet', 'nudes']; 

    if (!validCategories.includes(category)) {
      return message.reply(`Invalid category. Please use one of the following: ${validCategories.join(', ')}`);
    }

    try {
      const keyResponse = await axios.get(mastermindURL); 
      const accessKey = keyResponse.data.accessKey;
      const masterKey = keyResponse.data.masterKey;

      const configResponse = await axios.get(SiamUrl, {
        headers: {
          'X-Master-Key': masterKey,
          'X-Access-Key': accessKey
        }
      });

      const { url, apiKey, host } = configResponse.data.record.api; 

      const response = await axios.get(url, {
        params: { type: category },
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': host
        }
      });

      const nudeImageUrl = response.data.url;

      if (!nudeImageUrl) {
        throw new Error('No images found.');
      }

      const Body = `Here is your random nude photo of ${category}:`;

      const imageStream = await global.utils.getStreamFromURL(nudeImageUrl);
      message.reply({ body: Body, attachment: imageStream }, event.threadID);

    } catch (error) {
      message.reply(`Unable to fetch nude photo at the moment. Error: ${error.message}`);
    }
  }
};
