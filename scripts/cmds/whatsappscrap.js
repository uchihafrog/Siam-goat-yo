const axios = require('axios');

module.exports = {
  config: {
    name: 'whatsappscrap',
    aliases: ['ws'],
    version: '1.0.0',
    author: 'SiamTheFrog',
    countDown: 5,
    role: 0,
    shortDescription: 'Get WhatsApp profile photo by phone number.',
    longDescription: 'Fetch WhatsApp profile photo using phone number via API.',
    category: 'entertainment',
    guide: '+whatsappscrap <phone_number>',
  },

  onStart() {
    console.log('whatsappscrap command is ready.');
  },

  onChat: async function({ api, event }) {
    const { threadID, messageID, body } = event;

    if (!body) return;

    // Check if message starts with +whatsappscrap or +ws
    if (!body.startsWith('+whatsappscrap') && !body.startsWith('+ws')) return;

    // Extract phone number argument
    const args = body.replace(/^(\+whatsappscrap|\+ws)\s+/i, '').trim();

    if (!args) {
      return api.sendMessage(
        'Please provide a phone number. Example: +whatsappscrap +8801843775908',
        threadID,
        messageID
      );
    }

    // Clean phone number, just in case (optional)
    let phone = args;
    // You can add more cleaning if needed

    const apiUrl = `https://whatsapp-scrap-froggy-api.vercel.app/?phone=${encodeURIComponent(phone)}`;

    try {
      const response = await axios.get(apiUrl);
      const data = response.data;

      if (!data || !data.image) {
        return api.sendMessage(
          `No image found for phone number: ${phone}`,
          threadID,
          messageID
        );
      }

      await api.sendMessage(
        {
          body: `WhatsApp profile photo for: ${data.phone}`,
          attachment: await global.utils.getStreamFromURL(data.image),
        },
        threadID,
        messageID
      );
    } catch (error) {
      console.error(error);
      return api.sendMessage(
        'Error fetching data. Please try again later.',
        threadID,
        messageID
      );
    }
  },
};
