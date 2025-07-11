const fs = require('fs');
const path = './slotData.json';

// Load previous data
let slotData = {};
if (fs.existsSync(path)) {
  try {
    slotData = JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch {
    slotData = {};
  }
}

// Save data function
function saveSlotData() {
  try {
    fs.writeFileSync(path, JSON.stringify(slotData, null, 2));
  } catch (e) {
    console.error("❌ Failed to save slot data:", e);
  }
}

module.exports = {
  config: {
    name: "slot",
    aliases: [],
    author: "SiamTheFrog",
    version: "3.2",
    shortDescription: "Slot game with balance, loan, give",
    longDescription: "Play slot, take loan, send coins, and save balance using JSON.",
    category: "games",
    guide: "+slot <amount>\n+slot balance\n+slot balance @user\n+slot bank <amount>\n+slot @user <amount>"
  },

  onStart: async function ({ api, event, args }) {
    const userID = event.senderID;
    const threadID = event.threadID;
    const messageID = event.messageID;
    const mentions = event.mentions || {};
    const mentionID = Object.keys(mentions)[0];
    const firstArg = args[0];
    const secondArg = args[1];

    // Initialize user if not exists
    if (!slotData[userID]) {
      slotData[userID] = { balance: 0, loan: 0, streak: 0 };
      saveSlotData();
    }

    // ✅ +slot balance [optional @user]
    if (firstArg === "balance") {
      const targetID = mentionID || userID;
      if (!slotData[targetID]) {
        slotData[targetID] = { balance: 0, loan: 0, streak: 0 };
        saveSlotData();
      }
      const bal = slotData[targetID].balance;
      const name = mentionID ? mentions[mentionID].replace("@", "") : "Your";
      return api.sendMessage(`💰 ${name} balance is: ${bal} coins`, threadID, messageID);
    }

    // ✅ +slot bank <amount>
    if (firstArg === "bank") {
      const loanAmount = parseInt(secondArg);
      if (isNaN(loanAmount) || loanAmount <= 0)
        return api.sendMessage("❌ Please enter a valid loan amount.", threadID, messageID);

      if (slotData[userID].loan + loanAmount > 5000)
        return api.sendMessage("🚫 Maximum loan limit is 5000 coins.", threadID, messageID);

      slotData[userID].balance += loanAmount;
      slotData[userID].loan += loanAmount;
      saveSlotData();

      return api.sendMessage(
        `🏦 You took a loan of ${loanAmount} coins.\n💳 Total Loan: ${slotData[userID].loan}\n💰 New Balance: ${slotData[userID].balance}`,
        threadID, messageID
      );
    }

    // ✅ +slot @user <amount> → Give coins
    if (mentionID && args.length >= 2) {
      const sendAmount = parseInt(args[args.length - 1]);
      if (isNaN(sendAmount) || sendAmount <= 0) {
        return api.sendMessage("❌ Please provide a valid amount to send.", threadID, messageID);
      }

      if (slotData[userID].balance < sendAmount) {
        return api.sendMessage("❌ You don't have enough balance to send!", threadID, messageID);
      }

      if (!slotData[mentionID]) {
        slotData[mentionID] = { balance: 0, loan: 0, streak: 0 };
      }

      slotData[userID].balance -= sendAmount;
      slotData[mentionID].balance += sendAmount;
      saveSlotData();

      return api.sendMessage(
        `✅ You gave ${sendAmount} coins to ${mentions[mentionID]}\n💰 Your new balance: ${slotData[userID].balance}`,
        threadID, messageID
      );
    }

    // ✅ +slot <amount> → Play
    const bet = parseInt(firstArg);
    if (isNaN(bet) || bet <= 0) {
      return api.sendMessage("❌ Usage: +slot <amount>", threadID, messageID);
    }

    if (slotData[userID].balance < bet) {
      return api.sendMessage("😢 You don't have enough balance. Please take a loan using `+slot bank <amount>`.", threadID, messageID);
    }

    // ✅ Dynamic streak-based win rate
    if (slotData[userID].streak === undefined) slotData[userID].streak = 0;

    let baseChance = 0.5; // Default 50%

    if (slotData[userID].streak >= 2) baseChance = 0.3; // Too many wins, reduce chance
    if (slotData[userID].streak <= -2) baseChance = 0.8; // Too many losses, give relief

    const win = Math.random() < baseChance;

    if (win) {
      const winAmount = bet * 2;
      slotData[userID].balance += bet;
      slotData[userID].streak = slotData[userID].streak >= 0 ? slotData[userID].streak + 1 : 1;
      saveSlotData();
      return api.sendMessage(
        `🎉 You won! 🎰\nBet: ${bet} coins\nWinnings: ${winAmount}\n💰 New Balance: ${slotData[userID].balance}`,
        threadID, messageID
      );
    } else {
      slotData[userID].balance -= bet;
      slotData[userID].streak = slotData[userID].streak <= 0 ? slotData[userID].streak - 1 : -1;
      saveSlotData();
      return api.sendMessage(
        `💔 You lost. 🎰\nBet: ${bet} coins\n💰 Remaining Balance: ${slotData[userID].balance}`,
        threadID, messageID
      );
    }
  }
};
