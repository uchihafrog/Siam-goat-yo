const axios = require("axios");

module.exports = {
  config: {
    name: "quotes",
    aliases: ["q"],
    version: "1.0",
    author: "SiamTheFrog",
    countDown: 0,
    role: 0,
    category: "fun",
    shortDescription: "Get a random inspirational quote",
    longDescription: "Fetches a random quote from an extensive collection of quotes using the Quotes API.",
    guide: {
      en: "{pn} - Retrieves a random quote with author information."
    }
  },

  onStart: async function ({ api, event, message }) {
    const MasterMindUrl = "https://TeamTitans3315.github.io/TeamTitans-github.io/MasterMind.json";

    try {
      const masterConfigResponse = await axios.get(MasterMindUrl);
      const { masterKey, accessKey } = masterConfigResponse.data;

      const ApiUrl = "https://api.jsonbin.io/v3/b/672ed9abe41b4d34e4512117?host=Quotes-SiamTheFrog.heroku.com";

      const configResponse = await axios.get(ApiUrl, {
        headers: {
          "X-Master-Key": masterKey,
          "X-Access-Key": accessKey
        }
      });

      const { url, headers } = configResponse.data.record.quotesAPI;

      const response = await axios.get(url, { headers });

      const quoteData = response.data;
      if (!quoteData || !quoteData.content) {
        return message.reply("Sorry, no quote was available. Please try again later.");
      }

      const quoteText = quoteData.content;
      const authorName = quoteData.originator ? quoteData.originator.name : "Unknown";

      message.reply(
        `ðŸ’¬ Quote: "${quoteText}"\n` +
        `ðŸ‘¤ Author: ${authorName}`
      );
    } catch (error) {
      console.error("Error fetching quote:", error);
      message.reply("Sorry, there was an issue fetching the quote. Contact SiamTheFrog.");
    }
  }
};
