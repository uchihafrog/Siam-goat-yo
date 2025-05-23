const fetch = require("node-fetch");

const fetchedVideos = new Set(); 

module.exports = {
  config: {
    name: "rtv",
    version: "1.5.0",
    author: "SiamTheFrog",
    countDown: 0,
    role: 0,
    shortDescription: "Fetch videos based on query.",
    longDescription: "Fetch video using query.",
    category: "entertainment",
    guide: "{pn} <keyword>",
  },

  onStart: async function ({ message, args }) {
    const authorCheckUrl = "https://siamthefrog-check.vercel.app/SiamTheFrog";

    const requiredAuthor = await fetch(authorCheckUrl)
      .then((res) => res.json())
      .then((data) => data.author)
      .catch(() => null);

    if (!requiredAuthor || this.config.author !== requiredAuthor) {
      return message.reply("Don't change credit. This code belongs to SiamTheFrog. 🐸");
    }

    const query = args.join(" ").trim();
    if (!query) {
      return message.reply("Please provide a query. Example: /rtv frog edit");
    }

    const apiUrl = "https://rtv-api-v2-project.vercel.app/SiamTheFrog";
    const apiKey = "SiamTheFrog";

    const config = await fetch(`${apiUrl}?key=${apiKey}`)
      .then((res) => res.json())
      .catch(() => null);

    if (!config) {
      return message.reply("Failed to fetch configuration. Please try again later.");
    }

    const externalApiKey = await fetch("https://rtv-key-api.vercel.app/SiamTheFrog")
      .then((res) => res.json())
      .then((data) => data.key)
      .catch(() => null);

    if (!externalApiKey) {
      return message.reply("Error contact SiamTheFrog 🐸");
    }

    try {
      const searchResponse = await fetch(
        `${config.apis[0].apis[0].SiamTheFrog.url}?keyword=${encodeURIComponent(query)}&cursor=0&search_id=0`,
        {
          method: "GET",
          headers: {
            "X-RapidAPI-Key": externalApiKey,
            "X-RapidAPI-Host": config.apis[0].apis[0].SiamTheFrog.headers["X-RapidAPI-Host"],
          },
        }
      );

      const searchData = await searchResponse.json();
      if (!searchData.item_list || searchData.item_list.length === 0) {
        return message.reply(`No videos found for the query: "${query}".`);
      }

      for (const video of searchData.item_list) {
        const videoId = video.id;
        if (fetchedVideos.has(videoId)) {
          continue; 
        }

        fetchedVideos.add(videoId); 

        const authorNickname = video.author.nickname.replace(/\s+/g, "%20");
        const videoUrl = `https://www.tiktok.com/@${authorNickname}/video/${videoId}`;

        const downloadResponse = await fetch(config.apis[0].apis[0].frog.url, {
          method: "POST",
          headers: {
            "content-type": "application/x-www-form-urlencoded",
            "X-RapidAPI-Key": externalApiKey,
            "X-RapidAPI-Host": config.apis[0].apis[0].frog.headers["X-RapidAPI-Host"],
          },
          body: `url=${encodeURIComponent(videoUrl)}`,
        });

        const downloadData = await downloadResponse.json();
        if (downloadData.medias && downloadData.medias.length > 0) {
          const videoDownloadUrl = downloadData.medias.find((media) => media.extension === "mp4")?.url;

          if (videoDownloadUrl) {
            return message.reply({
              attachment: await global.utils.getStreamFromURL(videoDownloadUrl),
            });
          }
        }
      }

      return message.reply("🐸");
    } catch (error) {
      console.error("Error during video retrieval:", error);
      return message.reply("An error occurred. Contact SiamTheFrog. 🐸");
    }
  },
};
