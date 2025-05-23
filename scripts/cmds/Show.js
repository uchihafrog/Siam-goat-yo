module.exports = {
  config: {
    name: "show",
    version: "1.0.0",
    author: "SiamTheFrog>ðŸ¸",
    countDown: 0,
    role: 0,
    category: "tools",
    description: "Many people are facing issues with linking and copying on Facebook, hence this command.",
    shortDescription: "Use /show in reply to any message or link, and it will send back the replied message content. It also works with a direct text or link.",
  },
  onStart: async function ({ api, event }) {
    let messageToSend = "";
    
    if (event.messageReply) {
      messageToSend = event.messageReply.body || "No text found in the replied message.";
    } 
    
    else if (event.body) {
    
      messageToSend = event.body.replace(/^\/show\s+/i, "") || "No text provided in the command.";
    } else {
      return api.sendMessage("Please reply to a message or link, or type some text after the command.", event.threadID, event.messageID);
    }
    
    api.sendMessage(messageToSend, event.threadID, event.messageID);
  }
};
