const axios = require("axios");

module.exports = {
  config: {
    name: "imgflip",
    version: "1.0",
    author: "SiamTheFrog",
    description: "Get a random meme",
    shortDescription: "Random meme generator",
  },

  onStart: async function({ api, event }) {
    try {
      const response = await axios.get("https://api.imgflip.com/get_memes?api=SiamTheFrog.heroku.com");
      const memes = response.data.data.memes;
      const randomMeme = memes[Math.floor(Math.random() * memes.length)];
      const memeUrl = randomMeme.url;

      api.sendMessage({
        body: "ðŸ˜‚ Here is a random meme for you!",
        attachment: await global.utils.getStreamFromURL(memeUrl)
      }, event.threadID, event.messageID);

    } catch (error) {
      console.error("Error fetching meme:", error);
      api.sendMessage("âŒ Error: Could not retrieve a meme. Please try again.", event.threadID, event.messageID);
    }
  }
};
