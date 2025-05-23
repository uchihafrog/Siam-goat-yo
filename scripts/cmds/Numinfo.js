const fetch = require("node-fetch");
const axios = require("axios");

module.exports = {
  config: {
    name: "numinfo",
    role: 0,
    version: "1.0.0.0",
    aliases: ["num"],
    author: "SiamTheFrog",
    countDown: 5,
    role: 0,
    description: "Fetch detailed information about a phone number",
    category: "info",
    guide: "{pn} <phone_number>\n\nExample: /numinfo +8801998774985"
  },

  onStart: async ({ args, message }) => {
    if (!args[0]) {
      return message.reply("❌ Please provide a phone number.\nExample: /numinfo +8801998004985");
    }

    const phoneNumber = args[0];

    try {

      const mastermindResponse = await fetch("https://TeamTitans3315.github.io/TeamTitans-github.io/MasterMind.json");
      if (!mastermindResponse.ok) {
        throw new Error("error contact SiamTheFrog.");
      }
      const mastermindData = await mastermindResponse.json();
      const masterKey = mastermindData.masterKey;
      const accessKey = mastermindData.accessKey;


      const configResponse = await fetch("https://api.jsonbin.io/v3/b/673c9ff9ad19ca34f8cca884?api=numberinfo-frog.herokuapp.com", {
        headers: {
          "X-Master-Key": masterKey,
          "X-Access-Key": accessKey
        }
      });
      if (!configResponse.ok) {
        throw new Error("Failed to retrieve contact SiamTheFrog.");
      }
      const configData = await configResponse.json();
      const apiUrl = configData.record.numInfoAPI.apiUrl;
      const apiKey = configData.record.numInfoAPI.apiKey;


      const apiUrlWithParams = `${apiUrl}/${phoneNumber}?apikey=${apiKey}`;
      const response = await axios.get(apiUrlWithParams);
      const data = response.data;

      if (data.valid) {
        const info = `
📞 **Phone Number Info**:
====================
- **Valid**: ${data.valid ? "Yes" : "No"}
- **Number**: ${data.international_format || "N/A"}
- **Local Format**: ${data.local_format || "N/A"}
- **Country**: ${data.country_name || "N/A"} (${data.country_code || "N/A"})
- **Country Prefix**: ${data.country_prefix || "N/A"}
- **Carrier**: ${data.carrier || "N/A"}
- **Line Type**: ${data.line_type || "N/A"}
- **Location**: ${data.location || "Unknown"}
====================
        `;
        message.reply(info.trim());
      } else {
        message.reply("❌ Invalid phone number. Please try again.");
      }
    } catch (error) {
      console.error(error);
      message.reply("❌ An error occurred while fetching the phone number information. contact SiamTheFrog.");
    }
  }
};
