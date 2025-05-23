const fetch = require('node-fetch');

module.exports = {
  config: {
    name: 'ytinfo',
    version: '1.0.0',
    author: 'SiamTheFrog',
    countDown: 0,
    role: 0,
    category: 'info',
    shortDescription: 'Searches and returns YouTube video details for a song.',
    longDescription: 'Search for a song on YouTube and return the video details including views, likes, dislikes, and published date.',
    guide: {
      en: '{pn} song name to search for the song video on YouTube.',
    },
  },

  onStart: async function ({ api, event, message, args }) {
    if (args.length === 0) {
      return message.reply('Please provide a song name to search for.');
    }

    const query = args.join(' ');
    const configUrl = 'https://Siamfroggy.github.io/Yt-info-github.io/yt-info.json'; // URL à¦¸à§‡à¦Ÿ à¦•à¦°à¦¾ à¦¹à§Ÿà§‡à¦›à§‡

    try {
      const configResponse = await fetch(configUrl);
      if (!configResponse.ok) throw new Error("Unable to load API configuration.");
      
      const configData = await configResponse.json();
      const apiKey = configData.apiKey;
      const api = configData.api;
      const detailsUrl = configData.detailsUrl;

      const searchUrl = `${api}search?part=snippet&q=${encodeURIComponent(query)}&key=${apiKey}&type=video&maxResults=1`;
      const searchResponse = await fetch(searchUrl);
      if (!searchResponse.ok) throw new Error("Failed to fetch from YouTube API");

      const searchData = await searchResponse.json();
      if (searchData.items.length === 0) {
        return message.reply('No results found for your search.');
      }

      const videoId = searchData.items[0].id.videoId;
      const detailsFetchUrl = detailsUrl.replace('{videoId}', videoId).replace('{apiKey}', apiKey);
      const detailsResponse = await fetch(detailsFetchUrl);
      if (!detailsResponse.ok) throw new Error("Failed to fetch video details");

      const detailsData = await detailsResponse.json();
      const videoDetails = detailsData.items[0];
      const views = formatNumber(videoDetails.statistics.viewCount);
      const likes = formatNumber(videoDetails.statistics.likeCount);
      const dislikes = formatNumber(videoDetails.statistics.dislikeCount || 0);
      const publishedAt = new Date(videoDetails.snippet.publishedAt).toLocaleDateString();
      const channelName = videoDetails.snippet.channelTitle;
      const thumbnailUrl = videoDetails.snippet.thumbnails.high.url;

      const channelId = videoDetails.snippet.channelId;
      const channelDetailsUrl = `${api}channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`;
      const channelDetailsResponse = await fetch(channelDetailsUrl);
      if (!channelDetailsResponse.ok) throw new Error("Failed to fetch channel details");

      const channelDetailsData = await channelDetailsResponse.json();
      const subscribers = channelDetailsData.items[0].statistics.subscriberCount;
      const channelReach = calculateChannelReach(channelDetailsData.items[0].statistics);
      const hasBadge = channelDetailsData.items[0].snippet.publishedAt ? "Yes" : "No";
      const downloadPermission = videoDetails.status ? videoDetails.status.embeddable : 'off';

      const messageBody = `====================\n` +
                          `**Video Info:**\n` +
                          `==\n` +
                          `Title:\n${videoDetails.snippet.title}\n` +
                          `==\n` +
                          `Views: ${views}\n` +
                          `==\n` +
                          `Likes: ${likes}\n` +
                          `==\n` +
                          `Dislikes: ${dislikes}\n` +
                          `==\n` +
                          `Published Date: ${publishedAt}\n` +
                          `==\n` +
                          `Video Download Permission: ${downloadPermission === 'true' ? 'On' : 'Off'}\n` +
                          `====================\n` +
                          `**Channel Info:**\n` +
                          `====================\n` +
                          `Channel: ${channelName}\n` +
                          `==\n` +
                          `Subscribers: ${formatNumber(subscribers)}\n` +
                          `==\n` +     
                          `Channel Badge: ${hasBadge}\n` +
                          `==\n` +
                          `Channel Reach: ${channelReach}\n` +
                          `====================`;

      message.reply({
        body: messageBody,
        attachment: await global.utils.getStreamFromURL(thumbnailUrl),
      });
    } catch (error) {
      console.error("Error fetching YouTube data: ", error);
      message.reply("Unable to search YouTube at the moment. Please try again later.");
    }
  },
};

function formatNumber(num) {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(1) + 'B';
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(1) + 'M';
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(1) + 'K';
  }
  return num;
}

function calculateChannelReach(statistics) {
  const viewCount = parseInt(statistics.viewCount, 10);
  const subscriberCount = parseInt(statistics.subscriberCount, 10);
  const previousYearViews = parseInt(statistics.previousYearViews, 10) || 1;
  const currentYearViews = viewCount || 1;

  const percentage = Math.min((currentYearViews / previousYearViews) * 100, 100);
  return percentage.toFixed(2) + '%';
}
