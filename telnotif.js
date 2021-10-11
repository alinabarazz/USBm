require('dotenv').config()
if (process.env.TELEGRAM_NOTIF === 'true') {
const moment = require("moment");    
const fetch = require("node-fetch");
const fs = require('fs')
const chalk = require('chalk');
const TeleBot = require('telebot');
const axios = require('axios');
const fnAllCardsDetails  = ('./data/cardsDetails.json');
const bot = new TeleBot({
    token: process.env.TELEGRAM_TOKEN, // Required. Telegram Bot API token.
    polling: {
        proxy: ''
    } 
});
bot.start();  

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function battlesummary(logSummary,tet,sleepingTime,battletTime,battleID){
    try {
            message = 'Battle result summary: \n' + " " + battletTime + ' \n' + tet.replace(/\u001b[^m]*?m/g,"") + ' \n';
            for (let i = 0; i < logSummary.length; i++) {
                message = message + logSummary[i].replace(/\u001b[^m]*?m/g,"") +' \n';
            }
            message = message + ' \n' + ' Next battle in '+ sleepingTime / 1000 / 60 + ' minutes at ' + new Date(Date.now() +sleepingTime).toLocaleString() + ' \n';
            message = message + ' \n' + ' To see battle log, type /battledata' + battleID +' \n'
            message = message + ' \n' + 'Discord https://discord.gg/s9HKjqYW'
            const max_size = 4096
            var messageString = message
            var amount_sliced = messageString.length / max_size
            var start = 0
            var end = max_size
            for (let i = 0; i < amount_sliced; i++) {
                message = messageString.slice(start, end) 
                await bot.sendMessage(process.env.TELEGRAM_CHATID, message);
                start = start + max_size
                end = end + max_size
            }
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
    message = 'Welcome to USBm! \n' + ' \n' + 
              'This bot is still under development. If you encounter errors, please tell the dev of this bot about it so it can be fixed or not. To know the commands available, type /help . \n' + ' \n' + 'To support the dev from his creation, you can send some donation! (Apparently he is currently broke and needs your help XD). You can send DEC,SPS or cards to his account which is virgaux.  \n' + ' \n' + 'For crypto donations, you can send it to his wallet: \n' + ' \n' + 
              'BTC: 3NkbuyYB1EkyrVJ3KLwEsWRaXG87xbiBmd   \n' +
              'XRP: rU2mEJSLqBRkYLVTv55rFTgQajkLTnT6mA (tag: 643020)   \n' +
              'HIVE: @virgaux  \n' + ' \n' + 'Have fun!!'     

      bot.sendMessage(msg.from.id, message);
});

bot.on(['/help'], (msg) => {
    //console.log(msg);
    message = 'List of commands: \n' + ' \n' +
              ' /accounts - To show all account details.  \n' +
              ' /checkenv - to check current env setting. \n' +
              ' /battledataID - To see the battle logs (Must include battle ID). \n' +
              ' /clearbattledata - To clear currently stored battle data.  \n' +
              ' /questreward - To show all recent rewards claimed.  \n' 

      bot.sendMessage(msg.from.id, message);
});

bot.on([/^\/battledata(.+)$/, '/clearbattledata'], (msg) => {  
    const command = msg.text.split("ID")[0]
    const battleId =  msg.text.split("ID")[1]
    if (!battleId) {
        bot.sendMessage(msg.from.id, "Please include the battle log ID.") 
    } else {
        if (fs.existsSync('./data/BattleHistoryData.json')) {
            fs.readFile('./data/BattleHistoryData.json', 'utf8', async (err, rawStoredData) => {
                if (err) {
                    misc.writeToLogNoUsername(`Error reading saved battle history: ${err}`); rej(err);
                } else {
                    const storedData = JSON.parse(rawStoredData);
                    const CheckID = storedData.findIndex(img => img.battleID === battleId);
                    if (command === '/battledata') {
                        if (storedData == "") {
                            bot.sendMessage(msg.from.id, 'No battle data yet.');
                        } else {
                            if (CheckID == -1) {
                                await bot.sendMessage(msg.from.id, "Battle log can't be found in local storage.")
                            } else {
                                const data2 = storedData.find(img => img.battleID === battleId);
                                let message = 'Battle log summary: \n' +  '\n';
                                message = message + "Battle ID: " + Object.values(data2)[0] +  '\n'
                                message = message + "Battle Time: " + Object.values(data2)[1] +  '\n'
                                let battlelogs = JSON.parse(Object.values(data2)[2].toString())
                                for (let i = 0; i < battlelogs.length; i++) {
                                    message = message + battlelogs[i] + ' \n';
                                }
                                message = message + ' \n' + ' Please see full battle details in log.';
                                const max_size = 4096
                                var messageString = message
                                var amount_sliced = messageString.length / max_size
                                var start = 0
                                var end = max_size
                                if (amount_sliced>1) {
                                    for (let i = 0; i < amount_sliced; i++) {
                                        message = messageString.slice(start, end) 
                                        await bot.sendMessage(msg.from.id, message)
                                        start = start + max_size
                                        end = end + max_size
                                    }
                                } else {
                                    await bot.sendMessage(msg.from.id, message)
                                }
                                message = '';
                            }
                        }
                    } else if (command === '/clearbattledata') {
                        fs.unlink('./data/BattleHistoryData.json', (err => {
                            if (err)
                                console.log(err), bot.sendMessage(msg.from.id, 'Error occured while deleting stored battle data. Please see log for details');
                            else {
                                bot.sendMessage(msg.from.id, 'Stored battle data cleared.');
                            }
                        }));
                    }
                }
            })
        } else {
            bot.sendMessage(msg.from.id, 'No Battle data stored.' );
        }
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

async function accountsdata (accountusers) {
    bot.on(['/accounts', /^\/accountdetails@(.+)$/], (msg) => {
            let command = msg.text
            if (command == '/accounts') {
                let message = 'Please choose which account: \n' +' \n'
            for (let i = 0; i < accountusers.length; i++) {
                message = message + 'For ' + accountusers[i] + ':' +' \n'
                message = message + '/accountdetails@' + accountusers[i] +' \n'
            }
            bot.sendMessage(msg.from.id, message);
            message = '';
        }
    if (command.includes('/accountdetails@') ==  true) {
        let player = msg.text.split("@")[1]
        if (!player) {
            bot.sendMessage(msg.from.id, 'Please include an account name.');   
        } else {
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
                                rankName = 'Bronze I';
                            } else if (ranknumber == "4") {
                                rankName = 'Silver III';
                            } else if (ranknumber == "5") {
                                rankName = 'Silver II';
                            } else if (ranknumber == "6") {
                                rankName = 'Silver I';
                            } else if (ranknumber == "7") {
                                rankName = 'Gold III';
                            } else if (ranknumber == "8") {
                                rankName = 'Gold II';
                            } else if (ranknumber == "9") {
                                rankName = 'Gold I';
                            } else if (ranknumber == "10") {
                                rankName = 'Diamond III';
                            } else if (ranknumber == "11") {
                                rankName = 'Diamond II';
                            } else if (ranknumber == "12") {
                                rankName = 'Diamond I';
                            } else if (ranknumber == "13") {
                                rankName = 'Champion III';
                            } else if (ranknumber == "14") {
                                rankName = 'Champion II';
                            } else if (ranknumber == "15") {
                                rankName = 'Champion I';
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
                        //console.log(message)    
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
    }
}); //end of bot.on(['/account']

bot.on(['/questreward'], (msg) => {

    async function readJSONFile(fn){
        const jsonString = fs.readFileSync(fn);
        const ret = JSON.parse(jsonString);
        return ret;
      }
      bot.sendMessage(msg.from.id, 'Processing data. Please wait...');
      function makeGetRequest(path) {
        return new Promise(function (resolve, reject) {
            axios.get(path).then(
                (response) => {
                    var result = response.data;
                    resolve(result);
                },
                    (error) => {
                    reject(error);
                }
            );
        });
      }
      
      async function main() {
        let rewardData = [];
        namer = accountusers
        for (let j = 0; j < namer.length; j++) { 
            const allCardDetails =  await readJSONFile(fnAllCardsDetails);
            const data =  await makeGetRequest('https://api.steemmonsters.io/players/history?username=' + namer[j] + '&types=claim_reward'); 
            const data1 = data[0] 
                try{
                    if (!data) {
                        rewardData.push(' ' + namer[j] + ' \nNo data found.') 
                    } else {
                        const generalResult = Object.values(JSON.parse(Object.values(data1)[11]).rewards) // general result
                        let detailer1 = [];
                        let timer = moment.utc((Object.values(data1)[10].split('T')[1]).split('.')[0],["HH.mm"]).local().format("hh:mm a"); 
                        let dater = moment.utc(Object.values(data1)[10].split('T')[0]).local().format('MM-DD-YYYY');
                        let message1 = ' ' + namer[j] + ' \n' +' Received at ' + dater + ' ' +  timer + ' \n'
                        for (let i = 0; i < generalResult.length; i++) {
                            rewardcard = Object.values(generalResult[i])[0]
                            if (rewardcard === 'reward_card'){
                                cardNumber = Object.values(Object.values(generalResult[i])[2])[1]
                                goldFoil = Object.values(Object.values(generalResult[i])[2])[3]
                                if (goldFoil == false ) {
                                    detailer1.push(' Card: ' + allCardDetails[(parseInt(cardNumber))-1].name.toString())
                                } else {
                                    detailer1.push(' Card: GoldFoil' + allCardDetails[(parseInt(cardNumber))-1].name.toString())     
                                }  
                            } else if (rewardcard === 'potion'){
                                detailer1.push(' ' + Object.values(generalResult[i])[2] + ' Potion Qty: ' + Object.values(generalResult[i])[1])
                            } else if (rewardcard === 'dec'){
                                detailer1.push(' DEC Qty: ' + Object.values(generalResult[i])[1])
                            } else if (rewardcard === 'credits'){ 
                                detailer1.push(' Credits Qty: ' + Object.values(generalResult[i])[1])
                            }
                        }
                            for (let i = 0; i < detailer1.length; i++) {
                                message1 = message1 + detailer1[i] +' \n';
                            }    
                            rewardData.push(message1) 
                    }
                } catch {
                    rewardData.push(' ' + Object.values(data1)[8] + ' \n')   
                }             
            }
            let message = ' Quest rewards result: '  + ' \n' + ' \n'
            if (!rewardData) {
                console.log('No data.')
            } else {
                for (let i = 0; i < rewardData.length; i++) {
                    message = message + rewardData[i] +' \n';
                }
            
            }  
            rewardData = '';   
            bot.sendMessage(msg.from.id, message);
        } 
         main();
        
         
    }); // end of bot.on(['/questreward']















} // end of async function accountsdata (accountusers)

 


exports.sender =sender; 
exports.battlesummary = battlesummary;
exports.tbotResponse = tbotResponse;
exports.accountsdata = accountsdata;
}; 