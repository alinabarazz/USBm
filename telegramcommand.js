//'use strict';
require('dotenv').config()
const Slimbot = require('slimbot');
const slimbot = new Slimbot(process.env.TELEGRAM_TOKEN);
const chatID = process.env.TELEGRAM_CHATID


// Register listeners

slimbot.on('message', message => {
    // reply when user sends a message
    slimbot.sendMessage(chatID, 'Message received');
  });
  
  slimbot.on('edited_message', edited_message => {
    // reply when user edits a message
    slimbot.sendMessage(chatID, 'Message edited');
  });
  
  // Call API
  slimbot.startPolling();
  
  console.log('polling...');
  
  setTimeout(() => {
    slimbot.stopPolling();
  }, 10000);

module.exports.tbotResponse = tbotResponse;