const fetch = require("node-fetch");

module.exports = {
  config: {
    name: "animechan",
    aliases: ["chan"],  
    version: "1.0.0",
    category: "intertwinement",
    author: "TeamTitans>SiamTheFrogðŸ¸",
    countDown: 0,
    role: 0,
    description: "Fetches a random anime quote from Animechan API.",
    shortDescription: "Get a random anime quote.",
  },

  onStart: async function ({ api, message }) {
    try {
      const response = await fetch("https://animechan.io/api/v1/quotes/random");
      const data = await response.json();

      if (data.status === "success" && data.data) {
        const quote = data.data.content;
        const anime = data.data.anime.name;
        const character = data.data.character.name;

        const replyMessage = `
â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
â•‘ ð—”ð—»ð—¶ð—ºð—²: ${anime}
â•‘ ð—–ð—µð—®ð—¿ð—®ð—°ð˜ð—²ð—¿: ${character}
â•‘ ð—¤ð˜‚ð—¼ð˜ð—²: "${quote}"
â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        `;
        return message.reply(replyMessage);
      } else {
        return message.reply("Error fetching anime quote.");
      }
    } catch (error) {
      return message.reply("Error while fetching data: " + error.message);
    }
  },
};
