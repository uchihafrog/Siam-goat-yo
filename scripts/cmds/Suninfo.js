const axios = require('axios');

module.exports = {
  config: {
    name: 'suninfo',
    aliases: ['sun'],
    version: '1.0.0',
    author: 'SiamTheFrog',
    category: 'info',
    shortDescription: 'Get sunrise and sunset times any country`s.',
    longDescription: 'Fetches sunrise and sunset times for a specific country or defaults to Bangladesh.',
    usage: '/suninfo <country_name>',
  },

  onStart: async function ({ message, args }) {
    const country = args.join(' ') || 'Bangladesh';

    try {

      const Mastermind = await axios.get('https://TeamTitans3315.github.io/TeamTitans-github.io/MasterMind.json');
    
      const { masterKey, accessKey } = Mastermind.data;

      const ApiUrl = await axios.get('https://api.jsonbin.io/v3/b/6739dc37acd3cb34a8a9fa09?api=SiamTheFrog.herokuapp.com', {
        headers: {
          'X-Master-Key': masterKey,
          'X-Access-Key': accessKey
        }
      });


      const { GeoApiUrl, SunApiUrl } = ApiUrl.data.record;


      const geoResponse = await axios.get(`${GeoApiUrl}${encodeURIComponent(country)}`);
      const geoData = geoResponse.data;

      if (!geoData || !geoData.results || geoData.results.length === 0) {
        return message.reply(`Could not find location information for "${country}".`);
      }

      const { latitude, longitude, timezone } = geoData.results[0];

      const sunResponse = await axios.get(`${SunApiUrl}?lat=${latitude}&lng=${longitude}&formatted=0`);
      const sunData = sunResponse.data;

      if (sunData.status !== 'OK') {
        return message.reply('Failed to fetch sunrise and sunset data. Please try again.');
      }

      const { sunrise, sunset } = sunData.results;

      const sunriseTime = new Date(sunrise).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: timezone,
      });
      const sunsetTime = new Date(sunset).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: timezone,
      });

      return message.reply(
        `Sunrise and Sunset times for ${country}:\n\n` +
        `ðŸŒ… Sunrise: ${sunriseTime}\nðŸŒ‡ Sunset: ${sunsetTime}`
      );
    } catch (error) {
      console.error('Error fetching sunrise/sunset data:', error);
      return message.reply('An error occurred while fetching data. contact SiamTheFrog');
    }
  },
};
