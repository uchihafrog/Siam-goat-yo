const axios = require('axios');

module.exports = {
  config: {
    name: 'harrypotter',
    aliases: ['hp'],
    role: 0,
    version: '1.0.1',
    author: 'SiamTheFrog',
    category: 'media',
    shortDescription: 'Fetch Harry Potter character or spell information.',
    longDescription: 'Get detailed information about Harry Potter characters or spells using specific commands.',
    usage: '/harrypotter <character name> or /harrypotter spell <spell name>',
  },

  onStart: async function ({ message, args }) {
    if (!args.length) {
      return message.reply('Please provide a valid query. Example: /harrypotter <character name> or /harrypotter spell <spell name>.');
    }

    const query = args.join(' ').toLowerCase();
    const isSpell = args[0].toLowerCase() === 'spell';
    const searchTerm = isSpell ? args.slice(1).join(' ').toLowerCase() : query;

    if (!searchTerm) {
      return message.reply(
        isSpell
          ? 'Please provide a spell name. Example: /harrypotter spell Expelliarmus'
          : 'Please provide a character name. Example: /harrypotter Harry Potter'
      );
    }

    try {

      const ApiUrl = "https://api.jsonbin.io/v3/b/673c75ceacd3cb34a8ab13d7?api=harrypotter.herokuapp.com";
      const mastermindURL = "https://TeamTitans3315.github.io/TeamTitans-github.io/MasterMind.json";
      
      const keyResponse = await axios.get(mastermindURL);
      const accessKey = keyResponse.data.accessKey;
      const masterKey = keyResponse.data.masterKey;

      const response = await axios.get(ApiUrl, {
        headers: {
          "X-Master-Key": masterKey,
          "X-Access-Key": accessKey
        }
      });

      const apiUrl = response.data.record.api;

      const fetchUrl = isSpell ? apiUrl.spells : apiUrl.characters;
      const dataResponse = await axios.get(fetchUrl);

      const result = dataResponse.data.find(item => item.name.toLowerCase().includes(searchTerm));

      if (!result) {
        return message.reply(
          `No information found for ${isSpell ? 'spell' : 'character'}: "${searchTerm}".`
        );
      }

      if (isSpell) {
        const { name, description } = result;
        return message.reply(
          `✨ **Harry Potter Spell Information** ✨\n` +
          `=========================================\n` +
          `**Name:** ${name}\n` +
          `**Description:** ${description || 'Not available'}\n` +
          `=========================================`
        );
      } else {
        const { 
          name, 
          alternate_names, 
          species, 
          gender, 
          house, 
          dateOfBirth, 
          yearOfBirth, 
          ancestry, 
          eyeColour, 
          hairColour, 
          wand, 
          image 
        } = result;

        const wandInfo = wand 
          ? `\n   - **Wood:** ${wand.wood || 'Unknown'}\n   - **Core:** ${wand.core || 'Unknown'}\n   - **Length:** ${wand.length || 'Unknown'}`
          : 'Not available';

        return message.reply({
          body: 
            `✨ **Harry Potter Character Information** ✨\n` +
            `=========================================\n` +
            `**Name:** ${name}\n` +
            `**Alternate Names:** ${alternate_names.join(', ') || 'None'}\n` +
            `**Species:** ${species}\n` +
            `**Gender:** ${gender}\n` +
            `**House:** ${house || 'Not available'}\n` +
            `**Date of Birth:** ${dateOfBirth || 'Not available'}\n` +
            `**Year of Birth:** ${yearOfBirth || 'Not available'}\n` +
            `**Ancestry:** ${ancestry || 'Not available'}\n` +
            `**Eye Colour:** ${eyeColour || 'Not available'}\n` +
            `**Hair Colour:** ${hairColour || 'Not available'}\n` +
            `**Wand:** ${wandInfo}\n` +
            `=========================================`,
          attachment: image ? await global.utils.getStreamFromURL(image) : null,
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      return message.reply('An error occurred while fetching information. Please try again later.');
    }
  },
};
