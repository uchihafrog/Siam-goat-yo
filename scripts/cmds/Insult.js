const fetch = require('node-fetch');
const axios = require('axios');

module.exports = {
  config: {
    name: 'insult',
    version: '1.0.0.0',
    author: 'SiamTheFrog',
    category: 'fun',
    shortDescription: 'Send insults to mentioned users.',
    longDescription: 'Sends a random insult to each mentioned user.',
  },

  onStart: async function ({ message, event }) {
    try {
      
      const MastermindUrl = await axios.get('https://TeamTitans3315.github.io/TeamTitans-github.io/MasterMind.json');
      const { accessKey, masterKey } = MastermindUrl.data;

      const ApiUrl = await axios.get('https://api.jsonbin.io/v3/b/6737868fad19ca34f8caabc4?siam=Insult-api-heroku.com', {
        headers: { 
          'X-Master-Key': masterKey, 
          'X-Access-Key': accessKey 
        }
      });

      const { apiUrl, adminIds } = ApiUrl.data.record.insult;

      const mentions = event.mentions;

      if (Object.keys(mentions).length === 0) {
        return message.reply('Please mention users to insult!');
      }

      const insultResponse = await fetch(apiUrl);
      const insultData = await insultResponse.json();
      const insultMessage = insultData.insult;

      for (const userId in mentions) {
        const userName = mentions[userId].replace(/@/g, '');

        if (adminIds.includes(userId)) {
          await message.reply({
            body: `@${userName}, is my boss don't mentione him nigga`,
            mentions: [{ id: userId, tag: userName }],
          });
        } else {
          await message.reply({
            body: `@${userName}, ${insultMessage}`,
            mentions: [{ id: userId, tag: userName }],
          });
        }
      }
    } catch (error) {
      console.error('Error fetching insult contact SiamTheFrog:', error);
      return message.reply('An error occurred while fetching insults. Contact SiamTheFrog.');
    }
  },
};
