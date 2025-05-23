const { createCanvas, loadImage } = require('canvas');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: 'iup',
    version: '1.0.0',
    author: 'Siam the Frog 🐸',
    countDown: 0,
    role: 0,
    category: 'display see the current uptime',
    shortDescription: 'display the current Bot uptime with image 🐸',
    longDescription: 'Check the current uptimewith image 🐸',
    guide: {
      en: '{pn}',
    },
  },
  onStart: async function ({ api, event, message }) {
  
    const randomTextAPI = "https://froggy-text-api.vercel.app/Siam-Munna-Najmul";
    const randomImageAPI = "https://iup-api-v1.vercel.app/SiamTheFrog";

    const loadingMessage = await message.reply({
      body: "Please wait...🐸",
      
    });

    try {


      const textResponse = await axios.get(randomTextAPI);
      const randomText = textResponse.data.text;

      const imageResponse = await axios.get(randomImageAPI);
      
      const randomImageLink = imageResponse.data.photo_url;

      const image = await loadImage(randomImageLink);


      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);


      const os = require('os');
      const uptime = process.uptime();
      const seconds = Math.floor(uptime % 60);
      const minutes = Math.floor((uptime / 60) % 60);
      const hours = Math.floor((uptime / (60 * 60)) % 24);
      const days = Math.floor(uptime / (60 * 60 * 24));
      const uptimeString = `${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`;
      const totalMemory = `Total Memory: ${Math.round(os.totalmem() / (1024 * 1024 * 1024))} GB`;
      const currentDate = new Date();
      const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
      const date = currentDate.toLocaleDateString('en-US', options);
      const time = currentDate.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Dhaka',
        
        hour12: true,
      });
      



      const textLines = [
        `Uptime: ${uptimeString}`,
        `RAM: ${totalMemory}`,
        `Date: ${date}`,
        `Time: ${time}`,
        `Health: ${randomText}`,
      ];



      const fontSize = Math.floor(canvas.height / 15); 
      
      ctx.font = `bold ${fontSize}px "Comic Sans MS"`;
      
      ctx.fillStyle = '#FFFFFF';
      
      ctx.textAlign = 'left'; 
      
      ctx.strokeStyle = 'black';
      
      ctx.lineWidth = Math.floor(fontSize / 10); 
      
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      
      ctx.shadowBlur = Math.floor(fontSize / 5);
      

      const lineHeight = fontSize + 10;
      
      const startX = canvas.width * 0.05; 
      
      const startY = canvas.height / 3;

      textLines.forEach((line, index) => {
      
        const yPosition = startY + index * lineHeight;
        
        ctx.strokeText(line, startX, yPosition);
        
        ctx.fillText(line, startX, yPosition);
      });



      const outputPath = path.resolve(__dirname, 'uptime-image.png');
      
      const buffer = canvas.toBuffer('image/png');
      
      fs.writeFileSync(outputPath, buffer);



      message.reply({ attachment: fs.createReadStream(outputPath) }, event.threadID);
      
    } catch (error) {
    
      console.error(error);
      
      message.reply("error contact SiamTheFrog 🐸 ");
    } finally {

      api.unsendMessage(loadingMessage.messageID);
    }
  },
};
