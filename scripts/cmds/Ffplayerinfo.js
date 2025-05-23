const axios = require("axios");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

module.exports = {
  config: {
    name: "ffplayerinfo",
    aliases: ["ff", "ffinfo"],
    version: "1.0.0",
    author: "SiamTheFrog",
    countDown: 0,
    role: 0,
    shortDescription: "Get Free Fire player info",
    longDescription: "Retrieve Free Fire player information by providing their UID and server.",
    category: "game",
    guide: "{pn} <UID> <Server>\n\nExample:\n{pn} 3566361392 BD Region: 3235283669 (SG)\nEUROPE Region: 6728011545 SG\nSG Region: 611311242 SG\nID Region: 776946147 SG\nVN Region: 1751187906 SG\nPK Region: 7765733267 SG\nRU Region: 2697300957 SG\nME Region: 2797011919 SG\nTH Region: 3032924930 SG\nTW Region: 2215679285 SG",
  },
  onStart: async function ({ api, args, event }) {
    const { threadID, messageID } = event;

    const authorCheckUrl = "https://siamthefrog-check.vercel.app/SiamTheFrog";
    const requiredAuthor = await fetch(authorCheckUrl)
      .then((res) => res.json())
      .then((data) => data.author)
      .catch(() => null);

    if (!requiredAuthor || this.config.author !== requiredAuthor) {
      return api.sendMessage(
        "Don't change credit. This code belongs to SiamTheFrog. 🐸",
        threadID,
        messageID
      );
    }

    if (args.length < 2) {
      return api.sendMessage(
        "Usage: /ffinfo <UID> <Server>\nExample: /ffinfo 3566361392 SG",
        threadID,
        messageID
      );
    }
    const uid = args[0];
    const server = args[1];

    const mastermindUrl = "https://ff-info-api.vercel.app";
    const param = Buffer.from("SiamTheFrog").toString("base64");
    const froggy = `${mastermindUrl}/${Buffer.from(param, "base64").toString()}`;

    try {
      const apiResponse = await axios.get(froggy + "?key=SiamTheFrog");
      const { url, host, apiKey } = apiResponse.data.apis.ffPlayerInfo;

      const apiUrl = url.replace("{uid}", uid).replace("{server}", server);

      const response = await axios.get(apiUrl, {
        headers: {
          "x-rapidapi-host": host,
          "x-rapidapi-key": apiKey,
        },
      });

      const data = response.data;
      if (data.error) {
        return api.sendMessage(
          `Error: ${data.msg || "Unable to fetch player data."}`,
          threadID,
          messageID
        );
      }
      const playerInfo = data.data.basicInfo;
      const profileInfo = data.data.profileInfo;
      const socialInfo = data.data.socialInfo;
      const clanBasicInfo = data.data.clanBasicInfo;
      const captainBasicInfo = data.data.captainBasicInfo;
      const petInfo = data.data.petInfo;
      const diamondCostRes = data.data.diamondCostRes;
      const creditScoreInfo = data.data.creditScoreInfo;

      const avatars = playerInfo.avatars || [];
      const clothesImages = profileInfo.clothes?.images || [];
      const firstClothesImage = clothesImages[0];

      let avatarFilePath = null;
      let clothesFilePath = null;

      if (firstClothesImage) {
        clothesFilePath = path.resolve(__dirname, "clothes_image.jpg");
        const writerClothes = fs.createWriteStream(clothesFilePath);
        const imageResponseClothes = await axios({
          url: firstClothesImage,
          method: "GET",
          responseType: "stream",
        });
        imageResponseClothes.data.pipe(writerClothes);

        await new Promise((resolve, reject) => {
          writerClothes.on("finish", resolve);
          writerClothes.on("error", reject);
        });
      }
      if (avatars[0]) {
        avatarFilePath = path.resolve(__dirname, "avatar_image.jpg");
        const writerAvatar = fs.createWriteStream(avatarFilePath);
        const imageResponseAvatar = await axios({
          url: avatars[0],
          method: "GET",
          responseType: "stream",
        });
        imageResponseAvatar.data.pipe(writerAvatar);
        await new Promise((resolve, reject) => {
          writerAvatar.on("finish", resolve);
          writerAvatar.on("error", reject);
        });
      }

      const formattedInfo = `
 ==== Free Fire Player Info ====
Nickname: ${playerInfo.nickname || "N/A"}
Account ID: ${playerInfo.accountId || "N/A"}
Region: ${playerInfo.region || "N/A"}
Level: ${playerInfo.level || "N/A"}
Rank: ${playerInfo.rank || "N/A"}
Rank Points: ${playerInfo.rankingPoints || "N/A"}
Badge Count: ${playerInfo.badgeCnt || "N/A"}
Likes: ${playerInfo.liked || "N/A"}
Max Rank: ${playerInfo.maxRank || "N/A"}
CS Max Rank: ${playerInfo.csMaxRank || "N/A"}
Created At: ${new Date(playerInfo.createAt * 1000).toLocaleString() || "N/A"}
============================
==== Social Info ====
Account ID: ${socialInfo.accountId || "N/A"}
Gender: ${socialInfo.gender || "N/A"}
Language: ${socialInfo.language || "N/A"}
Time Active: ${socialInfo.timeActive || "N/A"}
Mode Preference: ${socialInfo.modePrefer || "N/A"}
Signature: ${socialInfo.signature || "N/A"}
Rank Show: ${socialInfo.rankShow || "N/A"}
============================
==== Clan Info ====
Clan ID: ${clanBasicInfo.clanId || "N/A"}
Clan Name: ${clanBasicInfo.clanName || "N/A"}
Captain ID: ${clanBasicInfo.captainId || "N/A"}
Clan Level: ${clanBasicInfo.clanLevel || "N/A"}
Capacity: ${clanBasicInfo.capacity || "N/A"}
Member Count: ${clanBasicInfo.memberNum || "N/A"}
============================
==== Captain Info ====
Captain Nickname: ${captainBasicInfo.nickname || "N/A"}
Captain Account ID: ${captainBasicInfo.accountId || "N/A"}
Captain Region: ${captainBasicInfo.region || "N/A"}
Captain Level: ${captainBasicInfo.level || "N/A"}
Captain Rank: ${captainBasicInfo.rank || "N/A"}
Captain Max Rank: ${captainBasicInfo.maxRank || "N/A"}
Captain CS Rank: ${captainBasicInfo.csRank || "N/A"}
Captain Badge Count: ${captainBasicInfo.badgeCnt || "N/A"}
Captain Likes: ${captainBasicInfo.liked || "N/A"}
Weapon Skin Shows: ${captainBasicInfo.weaponSkinShows ? captainBasicInfo.weaponSkinShows.join(", ") : "N/A"}
=============================
==== Pet Info ====
Pet ID: ${petInfo.id || "N/A"}
Pet Name: ${petInfo.name || "N/A"}
Pet Level: ${petInfo.level || "N/A"}
Pet Exp: ${petInfo.exp || "N/A"}
============================
==== Diamond Info ====
Diamond Cost: ${diamondCostRes.diamondCost || "N/A"}
============================
==== Credit Score Info ====
Credit Score: ${creditScoreInfo.creditScore || "N/A"}
Reward State: ${creditScoreInfo.rewardState || "N/A"}
=============================
      `;
      await api.sendMessage(
        {
          body: formattedInfo,
          attachment: [
            avatarFilePath ? fs.createReadStream(avatarFilePath) : null,
            clothesFilePath ? fs.createReadStream(clothesFilePath) : null,
          ].filter(Boolean),
        },
        threadID,
        messageID
      );
      if (avatarFilePath) fs.unlinkSync(avatarFilePath);
      if (clothesFilePath) fs.unlinkSync(clothesFilePath);
    } catch (error) {
      console.error(error.message || error);
      if (!response || !response.data) {
        return api.sendMessage(
          "An error occurred while fetching player data. Please try again later.",
          threadID,
          messageID
        );
      }
    }
  },
};
