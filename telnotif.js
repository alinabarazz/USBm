const chalk = require('chalk');
const TeleBot = require('telebot');
const ChatId = process.env.TELEGRAM_CHATID
const bot = new TeleBot({
    token: process.env.TELEGRAM_TOKEN, // Required. Telegram Bot API token.
    polling: {
        proxy: 'https://dns.quad9.net/dns-query'
    }
});

function battlesummary(logSummary,tet,sleepingTime){
    try {
        message = 'Battle result summary: \n' + " " + new Date().toLocaleString() + ' \n' + tet.replace(/\u001b[^m]*?m/g,"") + ' \n';
        for (let i = 0; i < logSummary.length; i++) {
            message = message + logSummary[i].replace(/\u001b[^m]*?m/g,"") +' \n';

        }
        message = message + ' \n' + ' Next battle in '+ sleepingTime / 1000 / 60 + ' minutes at ' + new Date(Date.now() +sleepingTime).toLocaleString() + ' \n';

        message = message + ' \n' +'Telegram https://t.me/ultimatesplinterlandsbot' + ' \n' + 'Discord https://discord.gg/hwSr7KNGs9'

        bot.sendMessage(ChatId, message);
        console.log(chalk.green(' \n' + ' Battle result sent to telegram'));
        message = '';	
    }
    catch (e) {
         console.log(chalk.red(' [ERROR] Unable to send battle result to Telegram. Please make sure telegram setting is correct.'));
         bot.sendMessage(ChatId, '[ERROR] Unable to send battle result.');
    } 
}
function sender (...logMessage) {
     bot.sendMessage(ChatId, logMessage);   
    return
}

bot.start();

exports.sender =sender; 
exports.battlesummary = battlesummary;
