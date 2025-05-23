const axios = require("axios");
const fs = require("fs");

module.exports = {
  config: {
    name: "afford",
    version: "1.2.2",
    author: "SiamTheFrog",
    countDown: 5,
    role: 2,
    description: {
      en: "Generate an afford image in art and anime style based on the given prompt."
    },
    category: "image",
    guide: {
      en: "   {pn} <afford> <prompt>"
    }
  },

  onStart: async function ({ message, args }) {
    if (args.length === 0) {
      return message.reply("give me prompt for example: /afford pink cat walking on street 1");
    }

    let prompt = args.slice(0, -1).join(" ");
    let style = args[args.length - 1];

    if (style !== "1" && style !== "2") {
      prompt = args.join(" ");
      style = "1"; 
    }

    const styles = { "1": "art", "2": "anime" };
    const selectedStyle = styles[style];

    try {
      const startTime = Date.now(); 

      const Apiurl = ["https://afford-api-v3", "vercel.app"].join(".");
      const MastermindUrl = ["https://afford-powerfull-api-v3", "vercel.app"].join(".");
      const apikey = ["Siam", "TheFrog"].join("");

      const froggy = await axios.get(`${Apiurl}/${apikey}`);
      const key = froggy.data.key;

      const apiUrlResponse = await axios.get(`${MastermindUrl}/${apikey}?key=${apikey}`);
      const { api_url, api_host } = apiUrlResponse.data;

      const apiUrl = `${api_url}/${selectedStyle}?prompt=${encodeURIComponent(prompt)}&format=sq`;

      const response = await axios.get(apiUrl, {
        headers: {
          "x-rapidapi-host": api_host,
          "x-rapidapi-key": key,
        },
        responseType: "arraybuffer",
      });

      const endTime = Date.now(); 
      const duration = ((endTime - startTime) / 1000).toFixed(2); 

      const fileName = `ai_${selectedStyle}_${Date.now()}.jpg`;
      fs.writeFileSync(fileName, response.data);

      await message.reply({
        body: `✅ Image generated in ${duration} seconds!\n🎨 Style: ${selectedStyle.toUpperCase()} 🐸`,
        attachment: fs.createReadStream(fileName),
      });

      fs.unlinkSync(fileName);
    } catch (error) {
      console.error("❌ Image generation error:", error);
      message.reply("Error generating image contact SiamTheFrog.");
    }
  },
};
