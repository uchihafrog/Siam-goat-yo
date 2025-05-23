const fetch = require("node-fetch");

let blockedUsers = [];
const adminUID = "100004194914980"; // Admin UID add your uid

module.exports = {
  config: {
    name: "song",
    version: "2.0.0",
    author: "SiamTheFrog",
    countDown: 0,
    role: 0,
    shortDescription: "Search and get song from YouTube",
    longDescription: "Search for a song on YouTube and get MP3 audio song directly.",
    category: "music",
    guide: "{pn} <query>\n{pn} block @mention or UID\n{pn} unblock @mention or UID\n{pn} list",
  },

  onStart: async function ({ message, args, event }) {
  
    const query = args.join(" ");
    
    const ApiUrl = "https://sing-api-v2.vercel.app/SiamTheFrog"; 
    const authorCheckUrl = "https://siamthefrog-check.vercel.app/SiamTheFrog"; 
    const apiKey = "SiamTheFrog"; 

    if (blockedUsers.some(user => user.id === event.senderID)) {
      return message.reply("You are blocked. Contact the admin.");
    }

    if (args[0] === "block") {
      if (event.senderID !== adminUID) {
        return message.reply("You do not have permission to use this command.");
      }

      const mention = Object.keys(event.mentions)[0];
      const uidToBlock = mention || args[1];

      if (!uidToBlock) {
        return message.reply("Please mention a user or provide their UID to block.");
      }

      const name = event.mentions[uidToBlock] ? event.mentions[uidToBlock].replace("@", "") : uidToBlock;

      if (blockedUsers.some(user => user.id === uidToBlock)) {
        return message.reply("This user is already blocked.");
      }

      blockedUsers.push({ id: uidToBlock, name });
      
      return message.reply(`@${name} has been blocked.`, event.threadID, {
      
        mentions: [{ id: uidToBlock, tag: name }],
      });
    }

    if (args[0] === "unblock") {
    
      if (event.senderID !== adminUID) {
        return message.reply("You do not have permission to use this command.");
      }

      const mention = Object.keys(event.mentions)[0];
      
      const uidToUnblock = mention || args[1];


      if (!uidToUnblock) {
      
        return message.reply("Please mention a user or provide their UID to unblock.");
      }


      const name = event.mentions[uidToUnblock] ? event.mentions[uidToUnblock].replace("@", "") : uidToUnblock;
      blockedUsers = blockedUsers.filter(user => user.id !== uidToUnblock);
      return message.reply(`@${name} has been unblocked.`, event.threadID, {
        mentions: [{ id: uidToUnblock, tag: name }],
      });
      
    }
    

    if (args[0] === "list") {
    
      if (blockedUsers.length === 0) {
      
        return message.reply("No users in the block list.");
      }

      let listMessage = "Block List:\n";
      
      blockedUsers.forEach((user, index) => {
      
        listMessage += `${index + 1}. UID: ${user.id}, Name: ${user.name}\n`;
      });

      return message.reply(listMessage);
    }

    try {
      const authorResponse = await fetch(authorCheckUrl);
      
      const authorData = await authorResponse.json();


      if (this.config.author !== authorData.author) {
      
        return message.reply("Don't change credit, this code belongs to SiamTheFrog.");
      }
      
    } catch (error) {
    
      console.error("Error validating author:", error);
      
      return message.reply("Unable to validate author. Please try again later.");
    }


    if (!query) {
      return message.reply("Please provide a search query. Example: /song metamorphosis");
    }

    try {

      const configResponse = await fetch(`${ApiUrl}?key=${apiKey}`);
      const configData = await configResponse.json();

      const { youtubeApi, mp3Api } = configData.apis;


      const searchApiUrl = `${youtubeApi.url}?part=snippet&type=video&maxResults=1&q=${encodeURIComponent(query)}&key=${youtubeApi.apiKey}`;
      
      const searchResponse = await fetch(searchApiUrl);
      
      const searchResult = await searchResponse.json();

      if (!searchResult.items || searchResult.items.length === 0) {
      
        return message.reply(`No results found for "${query}". Please try again.`);
      }

      const videoId = searchResult.items[0].id.videoId;
      const videoTitle = searchResult.items[0].snippet.title;
      const videoLink = `https://www.youtube.com/watch?v=${videoId}`;


      const mp3ApiUrl = `${mp3Api.url}?url=${encodeURIComponent(videoLink)}`;
      const mp3Response = await fetch(mp3ApiUrl, {
      
        method: "GET",
        headers: {
          "x-rapidapi-host": mp3Api.host,
          "x-rapidapi-key": mp3Api.apiKey,
        },
      });

      const mp3Result = await mp3Response.json();

      if (mp3Result && mp3Result.download) {
      
        const audioStream = await fetch(mp3Result.download);
        
        if (!audioStream.ok) throw new Error("Failed to fetch 🐸.");

        return message.reply({
        
          body: `🎵 Title: ${videoTitle}\n📺 Channel: ${searchResult.items[0].snippet.channelTitle}\n📅 Published: ${new Date(
            searchResult.items[0].snippet.publishedAt
          ).toLocaleDateString()}`,
          attachment: await global.utils.getStreamFromURL(mp3Result.download),
        });
      } else {
        return message.reply("error");
      }
    } catch (error) {
    
      console.error(error);
      
      return message.reply("error contact SiamTheFrog🐸.");
    }
  },
};
