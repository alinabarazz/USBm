if (process.env.TELEGRAM_NOTIF === 'true') {
const fetch = require("node-fetch");
const fs = require('fs')
const chalk = require('chalk');
const TeleBot = require('telebot');
const bot = new TeleBot({
    token: process.env.TELEGRAM_TOKEN, // Required. Telegram Bot API token.
    polling: {
        proxy: ''
    } 
});
bot.start(); 


function battlesummary(logSummary,tet,sleepingTime){
    try {
            message = 'Battle result summary: \n' + " " + new Date().toLocaleString() + ' \n' + tet.replace(/\u001b[^m]*?m/g,"") + ' \n';
            for (let i = 0; i < logSummary.length; i++) {
                message = message + logSummary[i].replace(/\u001b[^m]*?m/g,"") +' \n';
            }
            message = message + ' \n' + ' Next battle in '+ sleepingTime / 1000 / 60 + ' minutes at ' + new Date(Date.now() +sleepingTime).toLocaleString() + ' \n';

            message = message + ' \n' + 'Discord https://discord.gg/hwSr7KNGs9'
            bot.sendMessage(process.env.TELEGRAM_CHATID, message);
            //notify.send(message);
            console.log(chalk.green(' \n' + ' Battle result sent to telegram'));

        } catch (e) {
                console.log(chalk.red(' [ERROR] Unable to send battle result to Telegram. Please make sure telegram setting is correct.'));
                bot.sendMessage(ChatId, ' [ERROR] Unable to send battle result to Telegram. Please make sure telegram setting is correct.');
        }   
        message = '';	
}

function sender (logMessage) {  
    bot.sendMessage(process.env.TELEGRAM_CHATID, logMessage); 
    //notify.send(logMessage);
    logMessage= '';
   return 
}

   
bot.on(['/start'], (msg) => {
    //console.log(msg);
    message = ' /checkenv - to check current env setting. \n' +
              ' /battledata - To see the battle details (battle rule, summoner, monster used) \n'  +
              ' /clearbattledata - To clear currently stored battle data.  \n'       
      bot.sendMessage(msg.from.id, message);
});

bot.on(['/battledata', '/clearbattledata'], (msg) => {  
    const command = msg.text
    if (fs.existsSync('./data/BattleHistoryData.json')) {
        fs.readFile('./data/BattleHistoryData.json','utf8',(err, rawStoredData) => {
            if (err) {
                misc.writeToLog(`Error reading file from disk: ${err}`); rej(err)
            } else {
                let storedData = JSON.parse(rawStoredData);
                if (command === '/battledata') {
                    if (storedData == "") {
                       bot.sendMessage(msg.from.id, 'No battle data yet.');
                    } else {
                        let message = 'Battle Data summary: \n' + ' \n';
                        for (let i = 0; i < storedData.length; i++) {
                              message = message + storedData[i].replace(/\u001b[^m]*?m/g,"") +' \n';
                        }
                        message = message + ' \n' + ' Please see full battle details in log.';
                        bot.sendMessage(msg.from.id, message);
                        message = '';
                    } 
                } else if (command === '/clearbattledata') {
                    fs.unlink('./data/BattleHistoryData.json', (err => {
                        if (err) console.log(err) , bot.sendMessage(msg.from.id, 'Error occured while deleting stored battle data. Please see log for details');
                        else {
                            bot.sendMessage(msg.from.id, 'Stored battle data cleared.');
                        }
                      }));
                }    
            }   
        });
    } else {
        bot.sendMessage(msg.from.id, 'No Battle data yet stored.' );
    }   
});  


async function tbotResponse(envStatus) {
    bot.on(['/checkenv'], (msg) => {
        message = '.ENV Setting status: \n' + ' \n';
        for (let i = 0; i < envStatus.length; i++) {
            message = message + envStatus[i].replace(/\u001b[^m]*?m/g,"") + ' \n';   
        }    
          bot.sendMessage(msg.from.id, message);
    });   
}

bot.on(['/account'], (msg) => {
    let player = msg.text.split(" ")[1]
    //console.log(player) 
    if (!player) {
        bot.sendMessage(msg.from.id, 'Please include an account name.');   
    } else {
    const accountusers = process.env.ACCUSERNAME.split(',');
    let myaccounts = accountusers.includes(player)     
    if (myaccounts == true) {     
            const fetchUsers = async () => {
                try {
                    let detailer = [];
                    const res = await fetch('https://game-api.splinterlands.io/players/details?name=' + player);
                    if (!res.ok) {
                        throw new Error(res.status);
                    }
                    const data = await res.json();

                    let ranknumber = Object.values(data)[19].toString()
                        if (ranknumber == '0') {
                            rankName = 'Novice';
                        } else if (ranknumber == "1") {
                            rankName = 'Bronze III';
                        } else if (ranknumber == "2") {
                            rankName = 'Bronze II';
                        } else if (ranknumber == "3") {
                            rankName ='Bronze I';
                        } else if (ranknumber == "4") {
                            rankName = 'Silver III';
                        } else if (ranknumber == "5") {
                            rankName = 'Silver II';
                        } else if (ranknumber == "6") {
                            rankName = 'Silver I';
                        } else if (ranknumber == "7") {
                            rankName = 'Gold III';
                        } else if (ranknumber == "8") {
                            rankName ='Gold II';
                        } else if (ranknumber == "9") {
                            rankName ='Gold I';
                        } else if (ranknumber == "10") {
                            rankName ='Diamond III';
                        } else if (ranknumber == "11") {
                            rankName ='Diamond II';
                        } else if (ranknumber == "12") {
                            rankName ='Diamond I';
                        } else if (ranknumber == "13") {
                            rankName ='Champion III';
                        } else if (ranknumber == "14") {
                            rankName ='Champion II';
                        } else if (ranknumber == "15") {
                            rankName ='Champion I';
                        }

                    detailer.push(' Account name: ' + Object.values(data)[0].toString())
                    detailer.push(' Current Rating: ' + Object.values(data)[2].toString()) 
                    detailer.push(' Current Rank: ' + rankName)
                    detailer.push(' Total Battles: ' + Object.values(data)[3].toString()) 
                    detailer.push(' Total Wins: ' + Object.values(data)[4].toString())
                    detailer.push(' Current Streak : ' + Object.values(data)[5].toString())
                    detailer.push(' Longest Streak: ' + Object.values(data)[6].toString())
                    detailer.push(' Max Rating Achieved: ' + Object.values(data)[7].toString())
                    detailer.push(' Max Rank Achieved: ' + Object.values(data)[8].toString())
                    detailer.push(' Collection Power: ' + Object.values(data)[18].toString())

                    let message = 'Player Details: \n \n' ;
                    for (let i = 0; i < detailer.length; i++) {
                        message = message + detailer[i].replace(/\u001b[^m]*?m/g,"") +' \n';
                    }
                    console.log(message)    
                    bot.sendMessage(msg.from.id, message);
                    detailer = [];
                } catch (error) {
                    bot.sendMessage(msg.from.id, 'Unable to get account details. ');
                }
            }
            
            fetchUsers();  
        } else {
            bot.sendMessage(msg.from.id, 'Account name you entered is not valid or not included on your .env file.');
        } 
    }         
});

      

exports.sender =sender; 
exports.battlesummary = battlesummary;
exports.tbotResponse = tbotResponse;

} 