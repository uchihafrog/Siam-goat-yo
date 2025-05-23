const axios = require('axios');
const encodedAuthor = 'U2lhbVRoZUZyb2c='; 
if (Buffer.from(encodedAuthor, 'base64').toString('utf-8') !== 'SiamTheFrog') {
    throw new Error("Don't change author randi.");
}
module.exports = {
  config: {
    name: 'frog',
    version: '1.0.0',
    author: 'SiamTheFrog',
    countDown: 0,
    role: 0,
    category: 'chatgpt-Ai',
    shortDescription: 'neuronspike chat gpt ai',
    longDescription: 'Fun and various facts can be learned through this frog ai',
    guide: {
      en: '{pn} ',
    },
  },

  onStart: async function ({ api, event, args, message }) {
    const authorName = module.exports.config.author;
    if (authorName !== 'SiamTheFrog') {
      message.reply("Don't change author randi!");
      return;
    }

    async function fetchFromAI(url, params) {
      try {
        const response = await axios.get(url, { params });
        return response.data;
      } catch (error) {
        console.error(error);
        return null;
      }
    }

    async function getAIResponse(input, userId, messageID) {
      const services = [
        { url: 'https://ai-tools.replit.app/gpt', params: { prompt: input, uid: userId } },
        { url: 'https://ai-chat-gpt-4-lite.onrender.com/api/hercai', params: { question: input } },
      ];

      let response = "Tera dimag thik hey keya laude";
      let currentIndex = 0;

      for (let i = 0; i < services.length; i++) {
        const service = services[currentIndex];
        const data = await fetchFromAI(service.url, service.params);
        if (data && (data.gpt4 || data.reply || data.response)) {
          response = data.gpt4 || data.reply || data.response;
          break;
        }
        currentIndex = (currentIndex + 1) % services.length;
      }

      return { response, messageID };
    }

    const input = args.join(' ').trim();
    if (!input) {
      api.sendMessage(`kuch to bol machikney`, event.threadID, event.messageID);
      return;
    }

    const { response, messageID } = await getAIResponse(input, event.senderID, event.messageID);
    api.sendMessage(`${response}•`, event.threadID, messageID);
  },

  onChat: async function ({ event, message }) {
    const messageContent = event.body.trim().toLowerCase();
    if (messageContent.startsWith("ai")) {
      const input = messageContent.replace(/^ai\s*/, "").trim();
      const { response, messageID } = await getAIResponse(input, event.senderID, message.messageID);
      message.reply(`${response}`, messageID);
    }
  }
};
