const axios = require("axios");
module.exports = {
  config: {
    name: "newton",
    version: "1.0",
    author: "SiamTheFrog",
    description: "Solve mathematical expressions using Newton cmd",
    shortDescription: "Math solver",
    category: "tools",
    guide: "{pn} <operation> <expression>\n\nExample: {pn} factor x^2-1"
  },

  onStart: async function({ api, event, args }) {
    if (args.length < 2) {
      return api.sendMessage("Please provide an operation and an expression. Example: /newton factor x^2-1", event.threadID, event.messageID);
    }

    const operation = args[0];
    const expression = args.slice(1).join(" ");
    
    try {
      const MastermindUrl = await axios.get("https://TeamTitans3315.github.io/TeamTitans-github.io/MasterMind.json");
      const accessKey = MastermindUrl.data.accessKey;
      const masterKey = MastermindUrl.data.masterKey;

      const frogUrl = "https://api.jsonbin.io/v3/b/672d022facd3cb34a8a48568?host=NewtonbaseApiurl.heroku.com";
      const configResponse = await axios.get(frogUrl, {
        headers: {
          "X-Master-Key": masterKey,
          "X-Access-Key": accessKey
        }
      });

      const newtonApiUrl = configResponse.data.record.newtonApiUrl;

      const response = await axios.get(`${newtonApiUrl}/${operation}/${encodeURIComponent(expression)}`);
      
      if (response.data && response.data.result) {
        api.sendMessage(`ðŸ” Operation: ${operation}\nðŸ“ Expression: ${expression}\n\nResult: ${response.data.result}`, event.threadID, event.messageID);
      } else {
        api.sendMessage("âŒ No result found. Please check your input.", event.threadID, event.messageID);
      }
    } catch (error) {
      api.sendMessage("âŒ Error: Unable to process the request. contact SiamTheFrog", event.threadID, event.messageID);
    }
  }
};
