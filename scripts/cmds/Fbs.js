const axios = require('axios');

module.exports = {
  config: {
    name: 'fbs',
    version: '1.2',
    author: 'SiamTheFrog',
    countDown: 5,
    role: 0,
    shortDescription: 'Fetch Facebook public group details',
    longDescription: 'Fetch details of a public Facebook group using public group URL.',
    category: 'info',
    guide: '{pn} <group_url>\n\nExample:\n{pn} https://www.facebook.com/groups/gieldagryplanszowe',
  },

  formatNumber: function (num) {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + "B"; 
    if (num >= 1e6) return (num / 1e6).toFixed(1) + "M"; 
    if (num >= 1e3) return (num / 1e3).toFixed(1) + "K"; 
    return num.toString();
  },

  onStart: async function ({ message, args }) {
    if (args.length === 0) {
      return message.reply('❌ Please provide a Facebook group URL.\nExample: /fbs https://www.facebook.com/groups/gieldagryplanszowe');
    }

    const groupUrl = args[0];
    const apiEndpoint = `https://fb-pgc-scrap-siamthefrog-api.vercel.app/fbs?url=${encodeURIComponent(groupUrl)}`;

    try {
      const response = await axios.get(apiEndpoint);
      const group = response.data.group_details; 

      if (!group) {
        return message.reply('❌ Unable to fetch group details. Please check the URL and try again.');
      }

      const membersFormatted = this.formatNumber(group.members_count);

      const replyMessage = `
📌 **Group Name:** ${group.name}
🔗 **URL:** ${group.url}
📍 **Location:** ${group.group_location ? group.group_location.name : 'Not specified'}
👥 **Members:** ${membersFormatted}
🔒 **Privacy:** ${group.privacy}
📝 **Description:** ${group.description.substring(0, 300)}...
      `;

      if (group.cover_photo && group.cover_photo.uri) {
        await message.reply({
          body: replyMessage.trim(),
          attachment: await global.utils.getStreamFromURL(group.cover_photo.uri),
        });
      } else {
        await message.reply(replyMessage.trim());
      }
    } catch (error) {
      console.error('❌ Error fetching group details contact SiamTheFrog:', error);
      message.reply('❌ Unable to fetch group details. contact SiamTheFrog');
    }
  },
};
