module.exports = {
  config: {
    name: 'gayfind',
    version: '1.0.0.0',
    aliases: ['gay'],
    role: 0,
    author: 'SiamTheFrog',
    category: 'fun',
    shortDescription: 'Find a random gay person in the group.',
    longDescription: 'Mentions a random user in the group and calls them gay with a random message.',
  },

  onStart: async function ({ message, event, api }) {
    const { participantIDs, senderID, threadID } = event;

    if (!participantIDs || participantIDs.length === 0) {
      return message.reply('No participants found in this group.');
    }

    
    const filteredParticipants = participantIDs.filter((userID) => userID !== senderID && userID !== api.getCurrentUserID());

    if (filteredParticipants.length === 0) {
      return message.reply('No suitable participants to choose from.');
    }

    const randomIndex = Math.floor(Math.random() * filteredParticipants.length);
    const selectedUserID = filteredParticipants[randomIndex];

    const gayMessages = [
      "You are now gay",
      "1 gay detected",
      "Hey gay, how are you?",
      "Really? You gay???",
      "Gay 🐸"
    ];


    const randomMessage = gayMessages[Math.floor(Math.random() * gayMessages.length)];


    try {
      const userInfo = await api.getUserInfo(selectedUserID);
      const userName = userInfo[selectedUserID].name;

      const imageURL = 'https://iili.io/2RcS40F.md.jpg';

      message.reply({
        body: `${userName}, ${randomMessage}`,
        mentions: [{ tag: userName, id: selectedUserID }],
        attachment: await global.utils.getStreamFromURL(imageURL),
      });
    } catch (error) {
      console.error('Error fetching user info:', error);
      return message.reply('Could not fetch the selected user’s information.');
    }
  },
};
