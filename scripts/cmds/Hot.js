const axios = require('axios');

const quotesUrl = "https://api.jsonbin.io/v3/b/671cef0dad19ca34f8bedec1?host=SiamTheFrog.heroku.app";
const photosUrl = "https://api.jsonbin.io/v3/b/671cf220ad19ca34f8bee087?host=SiamTheFrog.heroku.app"; 
const mastermindUrl = "https://TeamTitans3315.github.io/TeamTitans-github.io/MasterMind.json"; 

let previousIndexes = [];

const fetchKeys = async () => {
  try {
    const response = await axios.get(mastermindUrl, { timeout: 5000 });
    return response.data; 
  } catch (error) {
    console.error('Error fetching keys:', error.message);
    throw error;
  }
};

const fetchData = async (url, masterKey, accessKey) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'X-Master-Key': masterKey,
        'X-Access-Key': accessKey
      },
      timeout: 5000 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error.message);
    throw error;
  }
};

module.exports = {
  config: {
    name: 'hot',
    version: '1.0.0',
    author: 'SiamTheFrog',
    countDown: 0,
    role: 0,
    category: 'fun',
    shortDescription: 'Sends a random girl photo with a hot quote.',
    longDescription: 'Responds with a randomly selected girl photo along with a hot quote from a predefined list.',
    guide: {
      en: '{pn} - Sends a random girl photo with a hot quote.',
    },
  },

  onStart: async function ({ api, event }) {
    try {
      const keys = await fetchKeys();
      const masterKey = keys.masterKey;
      const accessKey = keys.accessKey;

      const [photoData, quoteData] = await Promise.all([
        fetchData(photosUrl, masterKey, accessKey),
        fetchData(quotesUrl, masterKey, accessKey)
      ]);

      const girlPhotos = photoData.record.hentaiPhotos;
      const hotQuotes = quoteData.record.hotQuotes;

      if (previousIndexes.length === girlPhotos.length) {
        previousIndexes = [];
      }

      let randomPhotoIndex;
      do {
        randomPhotoIndex = Math.floor(Math.random() * girlPhotos.length);
      } while (previousIndexes.includes(randomPhotoIndex));

      previousIndexes.push(randomPhotoIndex);

      const randomPhoto = girlPhotos[randomPhotoIndex];
      const randomQuote = hotQuotes[Math.floor(Math.random() * hotQuotes.length)];

      const startTime = Date.now();

      const response = await axios.get(randomPhoto, { responseType: 'stream', timeout: 5000 });
      const timeTaken = (Date.now() - startTime) / 1000;

      return api.sendMessage(
        { body: `${randomQuote}\n\nHere's your photo! \nTime taken: ${timeTaken} seconds`, attachment: response.data },
        event.threadID,
        event.messageID
      );
    } catch (error) {
      console.error('Error details:', error.message);
      return api.sendMessage('Server slow please try again.', event.threadID, event.messageID);
    }
  },
};
