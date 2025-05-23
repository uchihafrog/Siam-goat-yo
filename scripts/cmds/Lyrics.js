const axios = require("axios");

module.exports = {
  config: {
    name: "lyrics",
    version: "1.0",
    role: 0,
    author: "SiamTheFrog",
    countDown: 5,
    shortDescription: "Get lyrics for a song",
    longDescription: "Search and display lyrics for the specified song.",
    category: "music",
    guide: "{prefix}lyrics <song name>",
  },
  
  onStart: async function ({ api, event, args }) {
    const songName = args.join(" ").trim();
    if (!songName) {
      return api.sendMessage("Please provide a song name!\nUsage: /lyrics <song name>", event.threadID, event.messageID);
    }

    try {
      const masterMind = await axios.get("https://TeamTitans3315.github.io/TeamTitans-github.io/MasterMind.json?Mastermind-bruhh");
      const { accessKey, masterKey } = masterMind.data;

      const Api = await axios.get("https://api.jsonbin.io/v3/b/6751a6aae41b4d34e4605284?api=lyrics-v1.herokuapp.com", {
        headers: {
          "X-Master-Key": masterKey,
          "X-Access-Key": accessKey
        }
      });
      const Frog = Api.data.record.api;

      const SiamTheFrog = `${Frog}/${encodeURIComponent(songName)}`;
      const response = await axios.get(SiamTheFrog);
      const lyrics = response.data.lyrics;
  
      if (!lyrics) {
        return api.sendMessage(`Lyrics for "${songName}" not found. Please try another song.`, event.threadID, event.messageID);
      }

      return api.sendMessage(`🎵 Lyrics for "${songName}":\n\n${lyrics}`, event.threadID, event.messageID);
    } catch (error) {
      console.error(error);
      return api.sendMessage("An error occurred while fetching the lyrics. Contact SiamTheFrog.", event.threadID, event.messageID);
    }
  },
};
