 const axios = require("axios");
const fs = require("fs");
const path = __dirname + "/imagenStatus.json";

let sessions = {};

module.exports = {
  config: {
    name: "froggyai",
    version: "1.6",
    author: "SiamTheFrog",
    cooldown: 3,
    role: 0,
    shortDescription: "Talk with Froggy AI (Gemini 2.5)",
    longDescription: "Chat naturally with Froggy AI. Smart, aware, and custom identity.",
    category: "ai",
    guide: "{pn} on/off/reset"
  },

  // imagen on/off/reset
  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const command = args[0];

    if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify({}));

    const status = JSON.parse(fs.readFileSync(path));

    if (command === "on") {
      status[threadID] = true;
      fs.writeFileSync(path, JSON.stringify(status, null, 2));
      return api.sendMessage("✅ Froggy AI activated in this thread!", threadID, messageID);
    }

    if (command === "off") {
      status[threadID] = false;
      fs.writeFileSync(path, JSON.stringify(status, null, 2));
      return api.sendMessage("❌ Froggy AI deactivated in this thread.", threadID, messageID);
    }

    if (command === "reset") {
      delete sessions[threadID];
      return api.sendMessage("🔄 Topic reset for Froggy AI.", threadID, messageID);
    }

    return api.sendMessage("❓ Use: imagen on / off / reset", threadID, messageID);
  },

  // onChat: non-prefixed message reply
  onChat: async function ({ api, event }) {
    const { threadID, messageID, body } = event;
    if (!body) return;

    // Check if imagen is active in this thread
    if (!fs.existsSync(path)) return;
    const status = JSON.parse(fs.readFileSync(path));
    if (!status[threadID]) return;

    const prompt = body.trim();
    if (!prompt) return;

    sessions[threadID] = sessions[threadID] || [];

    // Identify identity-related questions
    const idQuestions = [
      "who are you",
      "who made you",
      "who created you",
      "who trained you",
      "what's your name",
      "what is your name",
      "are you gemini"
    ];
    const isIDQuestion = idQuestions.some(q => prompt.toLowerCase().includes(q));

    const customizeQuestions = [
      "who customized you",
      "did someone customize you",
      "are you customized",
      "modified you",
      "who modified you"
    ];
    const isCustomizeQuestion = customizeQuestions.some(q => prompt.toLowerCase().includes(q));

    // Add instruction only once per thread
    if (sessions[threadID].length === 0) {
      sessions[threadID].push({
        role: "user",
        parts: [{
          text: `You are Froggy AI — a smart, witty, and helpful assistant fully created by SiamTheFrog. 
You are not based on any other AI or model.
Never mention Gemini or Google.
If someone asks if you're customized or based on anything, deny it and say you're made from scratch by SiamTheFrog.
You can also generate insults, jokes, or motivational replies if asked.`
        }]
      });
    }

    // Push user's message
    sessions[threadID].push({ role: "user", parts: [{ text: prompt }] });

    const apiKey = "AIzaSyADkHCZFxYa-yODtMnyTBMrozlzdU2D-Eg";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    try {
      const res = await axios.post(endpoint, {
        contents: sessions[threadID]
      }, {
        headers: { "Content-Type": "application/json" }
      });

      let reply = res.data?.candidates?.[0]?.content?.parts?.[0]?.text || "❌ No reply.";

      // Forced identity message
      if (isIDQuestion) {
        reply = `I'm Froggy AI, proudly created by SiamTheFrog.\n\n${reply}`;
      }

      if (isCustomizeQuestion) {
        reply = `I'm not customized or modified. I was fully built from scratch by SiamTheFrog.`;
      }

      // Replace any Gemini/Google mentions
      reply = reply.replace(/Gemini/gi, "Froggy AI").replace(/Google/gi, "SiamTheFrog");

      sessions[threadID].push({ role: "model", parts: [{ text: reply }] });

      return api.sendMessage(reply, threadID, messageID);
    } catch (err) {
      console.error("Froggy AI Error:", err.response?.data || err.message);
      return api.sendMessage("❌ API error occurred.", threadID, messageID);
    }
  }
};
