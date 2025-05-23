const axios = require("axios");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "dtime2",
    aliases: ["time", "ti"],
    version: "1.0.0",
    author: "SiamTheFrog>ðŸ¸",
    countDown: 5,
    role: 0,
    category: "utilities",
    shortDescription: "Get the current time of any country with extra information",
    longDescription: "Displays the current time, date, and extra details like tomorrow's date, next year's year, and today's/ tomorrow's weekday",
    guide: {
      en: "/time <country name>\nExample: /time Bangladesh"
    }
  },

  onStart: async function ({ message, args }) {
    try {
      const masterConfigResponse = await axios.get(
        "https://TeamTitans3315.github.io/TeamTitans-github.io/MasterMind.json"
      );
      const masterConfig = masterConfigResponse.data;

      const { masterKey, accessKey } = masterConfig;

      const countriesResponse = await axios.get(
        "https://api.jsonbin.io/v3/b/67332aa9acd3cb34a8a74ea8?api=SiamTheFrog-country-info.heroku.com",
        {
          headers: {
            "X-Master-Key": masterKey,
            "X-Access-Key": accessKey
          }
        }
      );
      
      const countries = countriesResponse.data.record;
      
      const input = args.join(" ").toLowerCase();
      const countryKey = Object.keys(countries).find(
        (key) => key.toLowerCase() === input
      );

      if (!countryKey) {
        return message.reply("Country not found. Please check the name and try again.");
      }

      const timezone = countries[countryKey];
      const now = moment().tz(timezone);

      const tomorrow = now.clone().add(1, 'days');
      const nextYear = now.clone().add(1, 'years');

      const currentMonth = now.format('MMMM');
      const daysInMonth = now.daysInMonth();
      
      const isLeapYear = now.isLeapYear() ? 'Yes' : 'No';
      const currentTime24 = now.format('HH:mm:ss');
      
      const unixTimestamp = now.unix();
      const daysRemainingInYear = moment().endOf('year').diff(now, 'days');
      
      const daysPassedInYear = now.dayOfYear();
      const weekNumber = now.isoWeek();
      
      const currentTimeGMT = now.utc().format("HH:mm:ss");
      const timezoneOffset = now.utcOffset() / 60;

      const todayWeekday = now.format('dddd');
      const tomorrowWeekday = tomorrow.format('dddd');

      const responseMessage = `
**Country**: ${args.join(" ")}  
====================
**Time**: ${now.format("hh:mm:ss A")}
**Date**: ${now.format("YYYY-MM-DD")}
**Tomorrow's Date**: ${tomorrow.format("YYYY-MM-DD")}
**Year**: ${now.format("YYYY")}
**Next Year**: ${nextYear.format("YYYY")}
**Today**: ${todayWeekday}
**Tomorrow's Weekday**: ${tomorrowWeekday}
**Current Month**: ${currentMonth}
**Days in Current Month**: ${daysInMonth}
**Is Leap Year**: ${isLeapYear}
**Current Time (24-Hour)**: ${currentTime24}
**Unix Timestamp**: ${unixTimestamp}
**Days Remaining in Current Year**: ${daysRemainingInYear}
**Days Passed in Current Year**: ${daysPassedInYear}
**Week Number**: ${weekNumber}
**Current Time in GMT**: ${currentTimeGMT}
**Timezone Offset from GMT**: UTC${timezoneOffset >= 0 ? `+${timezoneOffset}` : timezoneOffset}
`;

      const imageUrl = "https://i.imgur.com/73yr29u.jpeg";
      
      const imageStream = await global.utils.getStreamFromURL(imageUrl);

      message.reply({
        body: responseMessage,
        attachment: imageStream
      });

    } catch (error) {
      console.error("Error:", error);
      message.reply("âŒ There was an error fetching country data. contact SiamTheFrog>ðŸ¸");
    }
  }
};
