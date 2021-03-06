//'use strict';
require('dotenv').config()
const puppeteer = require('puppeteer');
const fetch = require("node-fetch");
const chalk = require('chalk');
const fs = require('fs');

const splinterlandsPage = require('./splinterlandsPage');
const user = require('./user');
const card = require('./cards');
const helper = require('./helper');
const quests = require('./quests');
const ask = require('./possibleTeams');
const api = require('./api');
const misc = require('./misc');
const tn = require('./telnotif');
const nq = require('./newquests');
const fnAllCardsDetails  = ('./data/cardsDetails.json');
const battles = require('./auto-gather');
const version = 0.42;
const unitVersion = 'mobile'

async function readJSONFile(fn){
    const jsonString = fs.readFileSync(fn);
    const ret = JSON.parse(jsonString);
    return ret;
}	


async function checkForUpdate() {
    await misc.writeToLogNoUsername('------------------------------------------------------------------------------------------------');
    //await fetch('http://jofri.pf-control.de/prgrms/splnterlnds/version.txt')
    //.then(response => response.json())
    //.then(newestVersion => {
        //if (newestVersion > version) {
            //tn.sender('New Update! Please download on https://github.com/PCJones/ultimate-splinterlands-bot')
            //misc.writeToLogNoUsername(chalk.green('New Update! Please download on https://github.com/PCJones/ultimate-splinterlands-bot'));
            //misc.writeToLogNoUsername(chalk.green('New Update! Please download on https://github.com/PCJones/ultimate-splinterlands-bot'));
            //misc.writeToLogNoUsername(chalk.green('New Update! Please download on https://github.com/PCJones/ultimate-splinterlands-bot'));
        //} else {
            //misc.writeToLogNoUsername('No update available');
            misc.writeToLogNoUsername('This version is still under development');
        //}
    //})
    misc.writeToLogNoUsername('------------------------------------------------------------------------------------------------');
}

async function checkForMissingConfigs() {
    if (!process.env.TELEGRAM_NOTIF) {
		misc.writeToLogNoUsername(chalk.red("Missing TELEGRAM_NOTIF parameter in .env - see updated .env-example!"));
        if (process.env.TELEGRAM_NOTIF === 'true'){tn.sender("ALERT: Missing TELEGRAM_NOTIF parameter in .env - see updated .env-example!")}
		await sleep(60000);
	}
    if (!process.env.LOGIN_VIA_EMAIL) {
        misc.writeToLogNoUsername(chalk.red("Missing LOGIN_VIA_EMAIL parameter in .env - see updated .env-example!"));
        if (process.env.TELEGRAM_NOTIF === 'true'){tn.sender("ALERT: Missing LOGIN_VIA_EMAIL parameter in .env - see updated .env-example!")}
        await sleep(60000);
    }
    if (!process.env.HEADLESS) {
        misc.writeToLogNoUsername(chalk.red("Missing HEADLESS parameter in .env - see updated .env-example!"));
        if (process.env.TELEGRAM_NOTIF === 'true'){tn.sender("ALERT: Missing HEADLESS parameter in .env - see updated .env-example!")}
        await sleep(60000);
    }
    if (!process.env.KEEP_BROWSER_OPEN) {
        misc.writeToLogNoUsername(chalk.red("Missing KEEP_BROWSER_OPEN parameter in .env - see updated .env-example!"));
        if (process.env.TELEGRAM_NOTIF === 'true'){tn.sender("ALERT: Missing KEEP_BROWSER_OPEN parameter in .env - see updated .env-example!")};
        await sleep(60000);
    }
    if (!process.env.CLAIM_QUEST_REWARD) {
        misc.writeToLogNoUsername(chalk.red("Missing CLAIM_QUEST_REWARD parameter in .env - see updated .env-example!"));
        if (process.env.TELEGRAM_NOTIF === 'true'){tn.sender("ALERT: Missing KEEP_BROWSER_OPEN parameter in .env - see updated .env-example!")};
        await sleep(60000);
    }
    if (!process.env.USE_CLASSIC_BOT_PRIVATE_API) {
        misc.writeToLogNoUsername(chalk.red("Missing USE_CLASSIC_BOT_PRIVATE_API parameter in .env - see updated .env-example!"));
        if (process.env.TELEGRAM_NOTIF === 'true'){tn.sender("ALERT: Missing USE_CLASSIC_BOT_PRIVATE_API parameter in .env - see updated .env-example!")};
        await sleep(60000);
    }
    if (!process.env.USE_API) {
        misc.writeToLogNoUsername(chalk.red("Missing USE_API parameter in .env - see updated .env-example!"));
        if (process.env.TELEGRAM_NOTIF === 'true'){tn.sender("ALERT: Missing USE_API parameter in .env - see updated .env-example!")};
        await sleep(60000);
    }
    if (!process.env.API_URL || (process.env.USE_API === 'true' && !process.env.API_URL.includes('http'))) {
        misc.writeToLogNoUsername(chalk.red("Missing API_URL parameter in .env - see updated .env-example!"));
        if (process.env.TELEGRAM_NOTIF === 'true'){tn.sender("ALERT: Missing API_URL parameter in .env - see updated .env-example!")};
        await sleep(60000);
    }
    if (process.env.USE_API === 'true' && process.env.USE_CLASSIC_BOT_PRIVATE_API === 'true') {
        misc.writeToLogNoUsername(chalk.red('Please only set USE_API or USE_CLASSIC_BOT_PRIVATE_API to true'));
        if (process.env.TELEGRAM_NOTIF === 'true'){tn.sender('ALERT: Please only set USE_API or USE_CLASSIC_BOT_PRIVATE_API to true')};
        await sleep(60000);
    }
    if (!process.env.ERC_THRESHOLD) {
        misc.writeToLogNoUsername(chalk.red("Missing ERC_THRESHOLD parameter in .env - see updated .env-example!"));
        if (process.env.TELEGRAM_NOTIF === 'true'){tn.sender("ALERT: Missing ERC_THRESHOLD parameter in .env - see updated .env-example!")};
        await sleep(60000);
    }
    if (!process.env.GET_DATA_FOR_LOCAL) {
        misc.writeToLogNoUsername(chalk.red("process.env.GET_DATA_FOR_LOCAL parameter in .env - see updated .env-example!"));
        if (process.env.TELEGRAM_NOTIF === 'true'){tn.sender("ALERT: Missing process.env.GET_DATA_FOR_LOCAL parameter in .env - see updated .env-example!")};
        await sleep(60000);
    }
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
// boart2k added a function to convert Number Strings to Integer
function convertToNumber(stringNum){
    let ctnArr = stringNum.split(',');
    let ctnTempNum = '';
    ctnArr.forEach(x => ctnTempNum+=x);
    return parseInt(ctnTempNum);
}

// searchFromJSON can handle key of type array with a max length of 2... For Now...
function searchFromJSON(data,key,value){
    let tempData;

    if(Array.isArray(key)){
        for(let x = 0; x < data.length-1; x++){
            let temp = typeof data[x][key[0]] == 'string' ? JSON.parse(data[x][key[0]])[key[1]] : data[x][key[0][key[1]]];
            if(temp == value){
                tempData = data[x];
                break;
            }
        }
    }else{
        // for now the codes below are not used
        for(let x = 0; x < data.length-1; x++){
            console.log(data[x][key]);
            if(data[x][key] == value){
                tempData = data[x];
                break;
            }
        }    
    }

    return tempData;
}
// boart2k end

const withTimeout = (millis, promise) => {
    const timeout = new Promise((resolve, reject) =>
        setTimeout(
            () => reject(`Timed out after ${millis} ms.`),
            millis));
    return Promise.race([
        promise,
        timeout
    ]);
};
// Close popups by Jones
async function closePopups(page) {
    if (await clickOnElement(page, '.close', 4000))
        return;
    await clickOnElement(page, '.modal-close-new', 1000);
}

// await loading circle by Jones
async function waitUntilLoaded(page) {
    try {
        await page.waitForSelector('.loading', {
            timeout: 6000
        })
        .then(() => {
            misc.writeToLog('Waiting until page is loaded...');
        });
    } catch (e) {
        misc.writeToLog('No loading circle...')
        return;
    }

    await page.waitForFunction(() => !document.querySelector('.loading'), {
        timeout: 120000
    });
}

async function clickMenuFightButton(page) {
    try {
        await page.waitForSelector('#menu_item_battle', {
            timeout: 6000
        })
        .then(button => button.click());
    } catch (e) {
        misc.writeToLog('fight button not found')
    }

}

// LOAD MY CARDS
async function getCards() {
    const myCards = await user.getPlayerCards(process.env.ACCUSERNAME, new Date(Date.now() - 86400000)) // 86400000 = 1 day in milliseconds
        return myCards;
}


async function getQuest() {
    return quests.getPlayerQuest(process.env.ACCUSERNAME.split('@')[0])
    .then(x => x)
    .catch(e => misc.writeToLog('No quest data, splinterlands API didnt respond, or you are wrongly using the email and password instead of username and posting key'))
}

async function createBrowsers(count, headless) {
    let browsers = [];
    for (let i = 0; i < count; i++) {
        const browser = await puppeteer.launch({
                product: 'chrome',
                headless: headless,
                args: process.env.CHROME_NO_SANDBOX === 'true' ? ["--no-sandbox"] : [
                    //'--incognito',
                    //'--disable-features=BlockInsecurePrivateNetworkRequests',
                    //'--disable-web-security',
                    //'--disable-features=IsolateOrigins',
                    //'--disable-site-isolation-trials'
                ],
            });
        const page = await browser.newPage();
        page.setDefaultNavigationTimeout(500000);
        page.on('dialog', async dialog => {
            await dialog.accept();
        });

        browsers[i] = browser;
    }

    return browsers;
}

async function getElementText(page, selector, timeout = 20000) {
    const element = await page.waitForSelector(selector, {
            timeout: timeout
        });
    const text = await element.evaluate(el => el.textContent);
    return text;
}

async function getElementTextByXpath(page, selector, timeout = 20000) {
    const element = await page.waitForXPath(selector, {
            timeout: timeout
        });
    const text = await element.evaluate(el => el.textContent);
    return text;
}

async function clickOnElement(page, selector, timeout = 20000, delayBeforeClicking = 300) {
    try {
        const elem = await page.waitForSelector(selector, {
                timeout: timeout
            });
        if (elem) {
            await sleep(delayBeforeClicking);
            misc.writeToLog('Clicking element ' + selector);
            await elem.click();
            return true;
        }
    } catch (e) {}
    misc.writeToLog('Error: Could not find element ' + selector);
    return false;
}

async function selectCorrectBattleType(page) {
    try {
        await page.waitForSelector("#battle_category_type", {
            timeout: 20000
        })
        let battleType = (await page.$eval('#battle_category_type', el => el.innerText)).trim();
        while (battleType !== "RANKED") {
            misc.writeToLog("Wrong battleType! battleType is " + battleType + " - Trying to change it");
            try {
                await page.waitForSelector('#right_slider_btn', {
                    timeout: 500
                })
                .then(button => button.click());
            } catch (e) {
                misc.writeToLog('Slider button not found ', e)
            }
            await page.waitForTimeout(1000);
            battleType = (await page.$eval('#battle_category_type', el => el.innerText)).trim();
        }
    } catch (error) {
        misc.writeToLog("Error: couldn't find battle category type ", error);
    }
}

async function startBotPlayMatch(page, myCards, quest, claimQuestReward, prioritizeQuest, useAPI, logSummary, getDataLocal, battledata, logSummary1, seasonRewards) {
    let newlogvisual = {};
    const ercThreshold = process.env.ERC_THRESHOLD;
    const allCardDetails = await readJSONFile(fnAllCardsDetails);
    logSummary.push(' \n -----' + process.env.ACCUSERNAME + '-----')
    logSummary1[process.env.ACCUSERNAME] = newlogvisual
    battledata.push(' \n -----' + process.env.ACCUSERNAME + '-----')
    if (myCards) {
        misc.writeToLog('Deck size: ' + myCards.length)
    } else {
        misc.writeToLog('Playing only basic cards')
    }
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.71 Safari/537.36');
    await page.setViewport({
        width: 1800,
        height: 1500,
        deviceScaleFactor: 1,
    });

    await page.goto('https://splinterlands.io/?p=battle_history');
    await page.waitForTimeout(4000);

    let username = await getElementText(page, '.dropdown-toggle .bio__name__display', 10000).catch(async () => {
        await page.goto('https://splinterlands.io');
        await page.waitForTimeout(4000);
        await getElementText(page, '.dropdown-toggle .bio__name__display', 10000)
    });

    if (username == process.env.ACCUSERNAME) {
        misc.writeToLog('Already logged in!');
    } else {
        misc.writeToLog('Login')
        await splinterlandsPage.login(page).catch(async () => {
            misc.writeToLog('Unable to login. Trying to reload page again.');
            await page.goto('https://splinterlands.io/?p=battle_history');
            await page.waitForTimeout(4000);
            await getElementText(page, '.dropdown-toggle .bio__name__display', 10000)
                await splinterlandsPage.login(page).catch(e => {
                misc.writeToLog(e);
                logSummary.push(chalk.red(' No records due to login error'));
                throw new error ('Skipping this account due to to login error. \n');
                });
        });
    }
    await waitUntilLoaded(page);
    try {
        erc = parseInt((await getElementTextByXpath(page, "//div[@class='dec-options'][1]/div[@class='value'][2]/div", 1000)).split('%')[0]);
    } catch {
        await page.goto('https://splinterlands.io/?p=battle_history');
        erc = parseInt((await getElementTextByXpath(page, "//div[@class='dec-options'][1]/div[@class='value'][2]/div", 1000)).split('%')[0]);
    }
    if (erc >= 50) {
        misc.writeToLog('Current Energy Capture Rate is ' + chalk.green(erc + "%"));
  
    } else {
        misc.writeToLog('Current Energy Capture Rate is ' + chalk.red(erc + "%"));
        
    }
    if (erc < ercThreshold) {
        misc.writeToLog('ERC is below threshold of ' + chalk.red(ercThreshold + '% ') + '- Skipping this account');
        logSummary.push(' Account skipped: ' + chalk.red('ERC is below threshold of ' + ercThreshold))
        battledata.push(' Account skipped: ERC is below threshold of ' + ercThreshold)
        return;
    }

    //check if season reward is available
    await nq.seasonQuest(page, logSummary, allCardDetails, seasonRewards);

    //if quest done claim reward
    let quester = {}
    quester['Quest:'] = quest;
    console.table(quester);

    // boart2k added
    const powerThreshold = process.env.POWER_THRESHOLD;
    let powerRaw = await getElementTextByXpath(page, "//div[@id='power_progress']/div/span[2]", 1000);
    let power = convertToNumber(powerRaw);

    if(power < powerThreshold){
        misc.writeToLog('Collection Power: ' + chalk.red(powerRaw) + ' is lower than the ' + chalk.red(powerThreshold) + ' you have set.');
        logSummary.push(' Collection Power: ' + chalk.red(powerRaw) + ' is lower than the ' + chalk.red(powerThreshold) + ' you have set.');
        newlogvisual['Power'] = power
    } else {
        misc.writeToLog('Collection Power: ' + chalk.green(powerRaw));
        logSummary.push(' Collection Power: ' + chalk.green(powerRaw));
        newlogvisual['Power'] = power
    }
    // boart2k end

    await page.waitForTimeout(1000);
    await closePopups(page);
    await page.waitForTimeout(2000);
    if (!page.url().includes("battle_history")) {
        await clickMenuFightButton(page);
        await page.waitForTimeout(3000);
    }

    let curRating = await getElementText(page, 'span.number_text', 2000).catch(() => {misc.writeToLog('Unable to get current Rating')} );
    misc.writeToLog('Current Rating is ' + chalk.yellow(curRating));

    if (!page.url().includes("battle_history")) {
        misc.writeToLog("Seems like battle button menu didn't get clicked correctly - try again");
        misc.writeToLog('Clicking fight menu button again');
        await clickMenuFightButton(page);
        await page.waitForTimeout(5000);
    }

    // LAUNCH the battle
    try {
        await page.reload()
        misc.writeToLog('waiting for battle button...')
        await selectCorrectBattleType(page);

        await page.waitForXPath("//button[contains(., 'BATTLE')]", {
            timeout: 3000
        })
        .then(button => {
            misc.writeToLog('Battle button clicked');
            button.click()
        })
        .catch(e => misc.writeErrorToLog('[ERROR] waiting for Battle button. is Splinterlands in maintenance?'));
        await page.waitForTimeout(5000);

        misc.writeToLog('waiting for an opponent...')
        await page.waitForSelector('.btn--create-team', {
            timeout: 25000
        })
        .then(() => misc.writeToLog('start the match'))
        .catch(async(e) => {
            misc.writeErrorToLog('[Error while waiting for battle]');
            misc.writeToLog('Clicking fight menu button again');
            await clickMenuFightButton(page);
            misc.writeToLog('Clicking battle button again');
            await page.waitForXPath("//button[contains(., 'BATTLE')]", {
                timeout: 3000
            })
            .then(button => {
                misc.writeToLog('Battle button clicked');
                button.click()
            })
            .catch(e => misc.writeErrorToLog('[ERROR] waiting for Battle button. is Splinterlands in maintenance?'));

            misc.writeErrorToLog('Refreshing the page and retrying to retrieve a battle');
            await page.waitForTimeout(5000);
            await page.reload();
            await page.waitForTimeout(5000);
            await page.waitForSelector('.btn--create-team', {
                timeout: 50000
            })
            .then(() => misc.writeToLog('start the match'))
            .catch(async() => {
                misc.writeToLog('second attempt failed reloading from homepage...');
                await page.goto('https://splinterlands.io/?p=battle_history');
                await page.waitForTimeout(5000);
                await page.waitForXPath("//button[contains(., 'BATTLE')]", {
                    timeout: 20000
                })
                .then(button => button.click())
                .catch(e => misc.writeErrorToLog('[ERROR] waiting for Battle button second time'));
                await page.waitForTimeout(5000);
                await page.waitForSelector('.btn--create-team', {
                    timeout: 25000
                })
                .then(() => misc.writeToLog('start the match'))
                .catch((e) => {
                    misc.writeToLog('third attempt failed');
                    misc.writeToLog('Skipping account due to error')
                    logSummary.push(' Skipping account due to error')
                    return;
                })
            })
        })
    } catch (e) {
        misc.writeErrorToLog('[Battle cannot start]:', e)
        logSummary.push(chalk.red(' No records due to battle error'));
        return;

    }
    await page.waitForTimeout(10000);
    let[mana, rules, splinters] = await Promise.all([
                splinterlandsPage.checkMatchMana(page).then((mana) => mana).catch(() => 'no mana'),
                splinterlandsPage.checkMatchRules(page).then((rulesArray) => rulesArray).catch(() => 'no rules'),
                splinterlandsPage.checkMatchActiveSplinters(page).then((splinters) => splinters).catch(() => 'no splinters')
            ]);

    const matchDetails = {
        mana: mana,
        rules: rules,
        splinters: splinters,
        myCards: myCards,
        quest: (prioritizeQuest && quest && (quest.total != quest.completed)) ? quest : '',
    }

    await page.waitForTimeout(1000);
    //TEAM SELECTION
    let teamToPlay;
    misc.writeToLog(chalk.green('Battle details:'));  
    misc.writeToLog('Mana:'+  chalk.yellow(mana) + ' Rules:' + chalk.yellow(rules) + ' Splinters:' + chalk.yellow(splinters))
    battledata.push(' Mana: '+  mana + '\n Rules: ' + rules + '\n Splinters: ' + splinters)
    misc.writeToLog(chalk.green('starting team selection'));
    if (useAPI) {
       try {
            const apiResponse = await withTimeout(100000, api.getPossibleTeams(matchDetails));
            if (apiResponse && !JSON.stringify(apiResponse).includes('api limit reached')) {
                misc.writeToLog(chalk.magenta('API Response Result: ')); 
                console.log(chalk.cyan(' Team picked by API: '));
                    console.table({
                        'Play for quest': Object.values(apiResponse)[0],
                        'Team Rank': Object.values(apiResponse)[16],
                        'Win Percentage' : (Object.values(apiResponse)[2].replace(',','.')* 100).toFixed(2) + '%',   
                        'Element' : Object.values(apiResponse)[15],  
                        'Summoner': Object.values(apiResponse)[1],
                        'Cards 1': Object.values(apiResponse)[3], 
                        'Cards 2': Object.values(apiResponse)[5],
                        'Cards 3': Object.values(apiResponse)[7],
                        'Cards 4': Object.values(apiResponse)[9],
                        'Cards 5': Object.values(apiResponse)[11],
                        'Cards 6': Object.values(apiResponse)[13]         
                    });
                teamToPlay = {
                    summoner: Object.values(apiResponse)[1],
                    cards: [Object.values(apiResponse)[1], Object.values(apiResponse)[3], Object.values(apiResponse)[5], Object.values(apiResponse)[7], Object.values(apiResponse)[9],
                        Object.values(apiResponse)[11], Object.values(apiResponse)[13], Object.values(apiResponse)[15]]
                };
                   subElement = helper.teamActualSplinterToPlay(splinters,teamToPlay.cards.slice(0, 6)).toLowerCase()
                if (Object.values(apiResponse)[15] === 'dragon' && splinters.includes(subElement) == false ) {
                    misc.writeToLog('Sub-element is ' + subElement + ' but not included on available splinters.')
                    misc.writeToLog('API choose inappropriate splinter sub-element. Reverting to local history.');
                    const possibleTeams = await ask.possibleTeams(matchDetails).catch(e => misc.writeToLog('Error from possible team API call: ', e));
                    if (possibleTeams && possibleTeams.length) {
                        //misc.writeToLog('Possible Teams based on your cards: ', possibleTeams.length, '\n', possibleTeams);
                        misc.writeToLog('Possible Teams based on your cards: ', possibleTeams.length);
                    } else {
                        misc.writeToLog('Error: ', JSON.stringify(matchDetails), JSON.stringify(possibleTeams))
                        logSummary.push(' NO TEAMS available to be played')
                        return ('NO TEAMS available to be played');
                    }
                    teamToPlay = await ask.teamSelection(possibleTeams, matchDetails, quest);
                    battledata.push( ' Battle data used: Local history')
                    useAPI = false;  

                } else {
                     winPercent = (Object.values(apiResponse)[2].replace(',','.')* 100).toFixed(2)
                if  (winPercent < 50 && JSON.parse(process.env.AUTO_SWITCH.toLowerCase()) == true) {  // auto-select to local if win percentage is below 50%
                        misc.writeToLog('API choose low winning percentage splinter . Reverting to local history.');
                        const possibleTeams = await ask.possibleTeams(matchDetails).catch(e => misc.writeToLog('Error from possible team API call: ', e));
                        if (possibleTeams && possibleTeams.length) {
                            //misc.writeToLog('Possible Teams based on your cards: ', possibleTeams.length, '\n', possibleTeams);
                            misc.writeToLog('Possible Teams based on your cards: ', possibleTeams.length);
                        } else {
                            misc.writeToLog('Error: ', JSON.stringify(matchDetails), JSON.stringify(possibleTeams))
                            logSummary.push(' NO TEAMS available to be played')
                            return;
                        }
                        teamToPlay = await ask.teamSelection(possibleTeams, matchDetails, quest);
                        battledata.push( ' Battle data used: Local history')
                        useAPI = false; 
                    } else {
                        apiSelect = true;
                        battledata.push(' Battle data used: API')
                        battledata.push(' Element used: ' + Object.values(apiResponse)[15].toString())
                        // TEMP, testing
                        if (Object.values(apiResponse)[1] == '') {
                            misc.writeToLog('Seems like the API found no possible team - using local history');
                            const possibleTeams = await ask.possibleTeams(matchDetails).catch(e => misc.writeToLog('Error from possible team API call: ', e));
                            teamToPlay = await ask.teamSelection(possibleTeams, matchDetails, quest);  
                        }
                    }    
                }
            } else {
                if (apiResponse && JSON.stringify(apiResponse).includes('api limit reached')) {
                    misc.writeToLog('API limit per hour reached, using local backup!');
                    misc.writeToLog('Visit discord or telegram group to learn more about API limits: https://t.me/ultimatesplinterlandsbot and https://discord.gg/hwSr7KNGs9');
                    apiSelect = 'false'  
                } else {
                    misc.writeToLog('API failed, using local history with most cards used tactic');
                    
                }
                const possibleTeams = await ask.possibleTeams(matchDetails).catch(e => misc.writeToLog('Error from possible team API call: ', e));

                if (possibleTeams && possibleTeams.length) {
                    //misc.writeToLog('Possible Teams based on your cards: ', possibleTeams.length, '\n', possibleTeams);
                    misc.writeToLog('Possible Teams based on your cards: ' + possibleTeams.length);
                } else {
                    misc.writeToLog('Error: ', JSON.stringify(matchDetails), JSON.stringify(possibleTeams))
                    logSummary.push(' NO TEAMS available to be played')
                    throw new Error('NO TEAMS available to be played');
                }
                teamToPlay = await ask.teamSelection(possibleTeams, matchDetails, quest);
                battledata.push( ' Battle data used: Local history')
                useAPI = false;
            }
        } catch (e){
            misc.writeToLog('API taking too long. Reverting to use local history' + e);
            const possibleTeams = await ask.possibleTeams(matchDetails).catch(e => misc.writeToLog('Error from possible team API call: ', e));
            if (possibleTeams && possibleTeams.length) {
                //misc.writeToLog('Possible Teams based on your cards: ', possibleTeams.length, '\n', possibleTeams);
                misc.writeToLog('Possible Teams based on your cards: ', possibleTeams.length);
            } else {
                misc.writeToLog('Error: ', JSON.stringify(matchDetails), JSON.stringify(possibleTeams))
                logSummary.push(' NO TEAMS available to be played');
                throw new Error(' NO TEAMS available to be played');
            }
            teamToPlay = await ask.teamSelection(possibleTeams, matchDetails, quest);
            battledata.push( ' Battle data used: Local history')
            useAPI = false;
        }         
    } else {
        const possibleTeams = await ask.possibleTeams(matchDetails).catch(e => misc.writeToLog('Error from possible team API call: ', e));
        if (possibleTeams && possibleTeams.length) {
            //misc.writeToLog('Possible Teams based on your cards: ', possibleTeams.length, '\n', possibleTeams);
            misc.writeToLog('Possible Teams based on your cards: ', possibleTeams.length);
        } else {
            misc.writeToLog('Error: ', JSON.stringify(matchDetails), JSON.stringify(possibleTeams))
            logSummary.push(' NO TEAMS available to be played')
            throw new Error(' NO TEAMS available to be played');
        }
        teamToPlay = await ask.teamSelection(possibleTeams, matchDetails, quest);
        battledata.push( ' Battle data used: Local history')
        useAPI = false;
    }

    if (teamToPlay) {
       await page.click('.btn--create-team')[0];
    } else {
        await page.reload().then(async () =>{
        await page.waitForTimeout(5000); 
        await page.click('.btn--create-team')[0];   
        }).catch((e) => {
            logSummary.push('Team Selection error')
            throw new Error('Team Selection error');
        })
    }
    await page.waitForTimeout(5000);
    try {
        await sleep(300);
        await page.waitForXPath(`//div[@card_detail_id="${teamToPlay.summoner}"]`, {
            timeout: 15000
        }).then(summonerButton => summonerButton.click()).catch( async (error) =>{ 
          await page.reload()
          await page.waitForTimeout(5000);
          page.click('.btn--create-team')[0];
          await page.waitForTimeout(5000);
          await page.waitForXPath(`//div[@card_detail_id="${teamToPlay.summoner}"]`, {
            timeout: 30000
            }).then(summonerButton => summonerButton.click())
        });
        if (card.color(teamToPlay.cards[0]) === 'Gold') {
            misc.writeToLog(' Dragon play TEAMCOLOR ' + helper.teamActualSplinterToPlay(splinters,teamToPlay.cards.slice(0, 6)))
            battledata.push(' Dragon play TEAMCOLOR ' + helper.teamActualSplinterToPlay(splinters,teamToPlay.cards.slice(0, 6)))
            await page.waitForXPath(`//div[@data-original-title="${helper.teamActualSplinterToPlay(splinters,teamToPlay.cards.slice(0, 6))}"]`, {
                timeout: 8000
            })
            .then(selector => selector.click()).catch( async (error) =>{ 
                await page.reload()
                await page.waitForTimeout(5000);
                page.click('.btn--create-team')[0];
                await page.waitForTimeout(5000);
                await page.waitForXPath(`//div[@data-original-title="${helper.teamActualSplinterToPlay(splinters,teamToPlay.cards.slice(0, 6))}"]`, {
                timeout: 30000
            })
            .then(selector => selector.click())
            }); 
        }
        await page.waitForTimeout(10000);
        misc.writeToLog('Summoner: ' + chalk.yellow(teamToPlay.summoner.toString().padStart(3)) + ' Name: ' + chalk.green(allCardDetails[(parseInt(teamToPlay.summoner))-1].name.toString()));
        battledata.push(' Summoner: ' + teamToPlay.summoner.toString().padStart(3) + ' Name: ' + allCardDetails[(parseInt(teamToPlay.summoner))-1].name.toString())
                for (i = 1; i <= 6; i++) {
                    await sleep(300);
                    let strCard = 'nocard';
                    if(teamToPlay.cards[i] != ''){ strCard = allCardDetails[(parseInt(teamToPlay.cards[i]))-1].name.toString(); }
                      if(strCard !== 'nocard'){
                        misc.writeToLog('Play: ' + chalk.yellow(teamToPlay.cards[i].toString().padStart(3)) + ' Name: ' + chalk.green(strCard));
                        battledata.push(' Play: ' + teamToPlay.cards[i].toString().padStart(3) + ' Name: ' + strCard)
                      } else {
                        misc.writeToLog(' ' + strCard);
                      }  
                    if (teamToPlay.cards[i]){
                        await page.waitForXPath(`//div[@card_detail_id="${teamToPlay.cards[i].toString()}"]`, {timeout: 20000})
                        .then(selector => selector.click())}
                    await page.waitForTimeout(1000);
                }
        await page.waitForTimeout(5000);
        try {
            misc.writeToLog('Team submit. Please wait for the result.');
            await page.click('.btn-green')[0]; //start fight
        } catch {
            misc.writeToLog('Start Fight didnt work, waiting 5 sec and retry');
            await page.waitForTimeout(5000);
            await page.click('.btn-green')[0]; //start fight
        }
        await page.waitForTimeout(5000);
        await page.waitForSelector('#btnRumble', {
            timeout: 160000
        }).then(() => misc.writeToLog('btnRumble visible')).catch(() => misc.writeToLog('btnRumble not visible'));
        await page.waitForTimeout(5000);
        await page.$eval('#btnRumble', elem => elem.click()).then(() => misc.writeToLog('btnRumble clicked')).catch(() => misc.writeToLog('btnRumble didnt click')); //start rumble
        await page.waitForSelector('#btnSkip', {
            timeout: 10000
        }).then(() => misc.writeToLog('btnSkip visible')).catch(() => misc.writeToLog('btnSkip not visible'));
        await page.$eval('#btnSkip', elem => elem.click()).then(() => misc.writeToLog('btnSkip clicked')).catch(() => misc.writeToLog('btnSkip not visible')); //skip rumble

        try {
            misc.writeToLog('Getting battle result...');
            await page.goto('https://splinterlands.io/?p=battle_history');
            await waitUntilLoaded(page);
            await page.waitForTimeout(5000);
            const winner = await getElementText(page, '.battle-log-entry .battle-log-entry__team.win  .bio__name__display', 15000).catch( async () =>{
                await getElementText(page, '.battle-log-entry .battle-log-entry__team.win  .bio__name__display', 15000)});
            const draw = await getElementText(page, '.battle-log-entry .battle-log-entry__vs .conflict__title', 15000).catch( async () =>{
                await getElementText(page, '.battle-log-entry .battle-log-entry__vs .conflict__title', 15000)});
            if (winner.trim() == process.env.ACCUSERNAME.trim()) {
                const decWon = await getElementText(page, '.battle-log-entry .battle-log-entry__vs.win  .conflict__dec', 1000).catch( async () =>{
                    await getElementText(page, '.battle-log-entry .battle-log-entry__vs.win  .conflict__dec', 1000)});
                misc.writeToLog(chalk.green('You won! Reward: ' + decWon));
				logSummary.push(' Battle result:' + chalk.green(' Win Reward: ' + decWon));
                newlogvisual['Battle Result'] = 'Win ' + decWon
                battledata.push(' Battle result: Won');
            } else if (draw.trim() == "Draw") {
                misc.writeToLog(chalk.yellow("It's a draw"));
                battledata.push(' Battle result: Draw');
                logSummary.push(' Battle result:' + chalk.blueBright(' Draw'));
                newlogvisual['Battle Result'] = 'Draw'
            } else {
                misc.writeToLog(chalk.red('You lost :('));
                battledata.push(' Battle result: Lost');
				logSummary.push(' Battle result:' + chalk.red(' Lose'));
                newlogvisual['Battle Result'] = 'Lose'
                if (useAPI) {
                    api.reportLoss(winner);
                }
            }
            if (getDataLocal == true) {
                misc.writeToLog("Gathering winner's battle data for local history backup") 
                await battles.battlesList(winner).then(x=>x).catch((e) => misc.writeToLog('Unable to gather data for local.' + e));  

            }  
        } catch (e) {
                misc.writeToLog(e);
                misc.writeToLog(chalk.blueBright('Could not find winner'));
                battledata.push(' Could not find winner');
                logSummary.push(chalk.blueBright(' Could not find winner'));
                newlogvisual['Battle Result'] = 'Could not find winner' 
        }
        try {
			let decRaw = await getElementText(page, 'div.balance', 2000);
			let UpDateDec = parseFloat(Math.round((parseFloat(decRaw * 100)).toFixed(2)) / 100 ).toFixed(2);
            let newERC = (await getElementTextByXpath(page, "//div[@class='dec-options'][1]/div[@class='value'][2]/div", 2000)).split('%')[0];
            let curRating = await getElementText(page, 'span.number_text', 2000);
            misc.writeToLog('Updated Rating after battle is ' + chalk.yellow(curRating));
            logSummary.push(' New rating: ' + chalk.yellow(curRating));
			logSummary.push(' New DEC Balance: ' + chalk.cyan(UpDateDec + ' DEC'));
            newlogvisual['Rating'] = curRating
            newlogvisual['DEC Balance'] = UpDateDec + ' dec'
			let e = parseInt(newERC);
                if (e >= 50) {
                    newERC = chalk.green(newERC + '%')
                }
                else {
                    newERC = chalk.red(newERC + '%')
                }
                logSummary.push(' Remaining ERC: ' + newERC);
                misc.writeToLog('Remaining ERC: ' + newERC);
                newlogvisual['ERC'] = newERC.replace(/\u001b[^m]*?m/g,"")

        } catch (e) {
            misc.writeToLog(e);
            misc.writeToLog(chalk.blueBright(' Unable to get new rating'));
            misc.writeToLog(chalk.blueBright(' Unable to get remaining ERC'));
            logSummary.push(chalk.blueBright(' Unable to get new rating'));
            logSummary.push(chalk.blueBright(' Unable to get remaining ERC '));
            newlogvisual['Rating'] = 'n/a'
            newlogvisual['DEC Balance'] = 'n/a'
        }
        let Newquest = await getQuest();	
		await nq.newquestUpdate(Newquest, claimQuestReward, page, logSummary, allCardDetails, searchFromJSON, newlogvisual);
        teamToPlay = '';
    } catch (e) {
        misc.writeToLog(' Unable to proceed due to error.' + e)
        logSummary.push(chalk.red(' Unable to proceed due to error. Please see logs'));
        return;
    }
}

// 30 MINUTES INTERVAL BETWEEN EACH MATCH (if not specified in the .env file)
const sleepingTimeInMinutes = process.env.MINUTES_BATTLES_INTERVAL || 30;
const sleepingTime = sleepingTimeInMinutes * 60000;

(async() => {
    try {
        if (process.env.TELEGRAM_NOTIF === 'true') { tn.startTG()}
        await checkForUpdate();
        await checkForMissingConfigs();
        const loginViaEmail = JSON.parse(process.env.LOGIN_VIA_EMAIL.toLowerCase());
        const accountusers = process.env.ACCUSERNAME.split(',');
        const accounts = loginViaEmail ? process.env.EMAIL.split(',') : accountusers;
        const passwords = process.env.PASSWORD.split(',');
        const headless = JSON.parse(process.env.HEADLESS.toLowerCase());
        const useAPI = JSON.parse(process.env.USE_API.toLowerCase());
        const keepBrowserOpen = JSON.parse(process.env.KEEP_BROWSER_OPEN.toLowerCase());
        const claimQuestReward = JSON.parse(process.env.CLAIM_QUEST_REWARD.toLowerCase());
        const prioritizeQuest = JSON.parse(process.env.QUEST_PRIORITY.toLowerCase());
        const teleNotif = JSON.parse(process.env.TELEGRAM_NOTIF.toLowerCase());
        const getDataLocal = JSON.parse(process.env.GET_DATA_FOR_LOCAL.toLowerCase());
        const autoSwitch = JSON.parse(process.env.AUTO_SWITCH.toLowerCase());


        let browsers = [];
        let envStatus = [];
        misc.writeToLogNoUsername('Headless: ' + headless);
        misc.writeToLogNoUsername('Keep Browser Open: ' + keepBrowserOpen);
        misc.writeToLogNoUsername('Login via Email: ' + loginViaEmail);
        misc.writeToLogNoUsername('Get data for local history: ' + getDataLocal);
        misc.writeToLogNoUsername('Claim Quest Reward: ' + claimQuestReward);
        misc.writeToLogNoUsername('Prioritize Quests: ' + prioritizeQuest);
        misc.writeToLogNoUsername('Auto Switch to Local: ' + autoSwitch);
        misc.writeToLogNoUsername('Telegram Notification: ' + teleNotif);
        misc.writeToLogNoUsername('Use API: ' + useAPI);
        misc.writeToLogNoUsername('Loaded ' + chalk.yellow(accounts.length) + ' Accounts');
        misc.writeToLogNoUsername('Accounts: ' + chalk.greenBright(accounts));

        envStatus.push('Headless: ' + headless);
        envStatus.push('Keep Browser Open: ' + keepBrowserOpen);
        envStatus.push('Login via Email: ' + loginViaEmail);
        envStatus.push('Get data for local history: ' + getDataLocal);
        envStatus.push('Claim Quest Reward: ' + claimQuestReward);
        envStatus.push('Prioritize Quests: ' + prioritizeQuest);
        envStatus.push('Auto Switch to Local: ' + autoSwitch);
        envStatus.push('Telegram Notification: ' + teleNotif);
        envStatus.push('Use API: ' + useAPI);
        envStatus.push('Accounts: ' + accounts);

        if (process.env.TELEGRAM_NOTIF === 'true') { 
            await tn.tbotResponse(envStatus)
            await tn.accountsdata(accountusers)
        };

        while (true) {
            let dataCollected = [];
            let logSummary = [];
            let logSummary1 = [];
            let battledata = [];
            let seasonRewards = [],
                idToken = (Math.random() + 1).toString(36).substring(2)
            var battleID = 'ID' + idToken;
            var battletTime = new Date().toLocaleString()
			startTimer = new Date().getTime();
			if (process.env.TELEGRAM_NOTIF === 'true'){tn.sender(' Bot Initiated: Battle now starting.' + ' \n' + ' Please wait for the battle results.')};
            for (let i = 0; i < accounts.length; i++) {
                process.env['EMAIL'] = accounts[i];
                process.env['PASSWORD'] = passwords[i];
                process.env['ACCUSERNAME'] = accountusers[i];

                if (keepBrowserOpen && browsers.length == 0) {
                    misc.writeToLog('Opening browsers');
                    browsers = await createBrowsers(accounts.length, headless);
                } else if (!keepBrowserOpen && browsers.length == 0) { // close browser, only have 1 instance at a time
                    misc.writeToLog('Opening browser');
                    browsers = await createBrowsers(1, headless);
                }

                const page = (await(keepBrowserOpen ? browsers[i] : browsers[0]).pages())[1];

                //page.goto('https://splinterlands.io/');
                misc.writeToLog('getting user cards collection from splinterlands API...')
                const myCards = await getCards()
                    .then((x) => {
                        misc.writeToLog('cards retrieved');
                        return x
                    })
                    .catch(() => misc.writeToLog('cards collection api didnt respond. Did you use username? avoid email!'));
                misc.writeToLog('getting user quest info from splinterlands API...');
                const quest = await getQuest();
                if (!quest) {
                    misc.writeToLog('Error for quest details. Splinterlands API didnt work or you used incorrect username');
                }
                await startBotPlayMatch(page, myCards, quest, claimQuestReward, prioritizeQuest, useAPI, logSummary, getDataLocal , battledata, logSummary1, seasonRewards)
                .then(() => {
                    misc.writeToLog('Closing battle');
                })
                .catch((e) => {
                    misc.writeToLog(e)
                })

                await page.waitForTimeout(5000);
                if (keepBrowserOpen) {
                    await page.goto('about:blank');
                } else {
                    await page.evaluate(function () {
                        SM.Logout();
                    });
                    //let pages = await browsers[0].pages();
                    //await Promise.all(pages.map(page =>page.close()));
                    //await browsers[0].close();
                    //browsers[0].process().kill('SIGKILL');
                }
            }
            misc.writeToLog('Generating battle result... ')
            battlelog = JSON.stringify(battledata)
            let dataCollect = {
                battleID : idToken,
                battletTime : battletTime,
                battledata : battlelog
            } 
            dataCollected.push(dataCollect)
            let endTimer = new Date().getTime();
			let totalTime = endTimer - startTimer;
			let tet = ' Total execution time: ' + chalk.green((totalTime / 1000 / 60).toFixed(2) + ' mins')
            console.log('--------------------------Battle Result Summary:----------------------');
            console.log(tet);
			if (unitVersion == 'default'){
                if (accounts.length > 1) {
                    logSummary.forEach(x => console.log(x));
                }
            } else if (unitVersion == 'desktop') {
                console.table(logSummary1)
                if (seasonRewards.length > 0 ){
                    console.table(seasonRewards)
               }
            } else if (unitVersion == 'mobile') {
                console.table(logSummary1,["Power",'Battle Result','Rating','DEC Balance'])
                console.table(logSummary1,['ERC', 'Quest','Reward'])
                if (seasonRewards.length > 0 ){
                    console.table(seasonRewards)
               }
            }
			// telegram notification 
			if (process.env.TELEGRAM_NOTIF === 'true') {
                if (fs.existsSync('./data/BattleHistoryData.json')) {
                    fs.readFile(`./data/BattleHistoryData.json`, 'utf8', async (err, data) => {
                        if (err) {
                          misc.writeToLogNoUsername(`Error reading saved battle history: ${err}`); rej(err)
                        } else {
                            dataCollected = data ? [...dataCollected, ...JSON.parse(data)] : dataCollected;
                            fs.writeFile(`./data/BattleHistoryData.json`, JSON.stringify(dataCollected), async (err) => {
                                if (err) { misc.writeToLogNoUsername(err,'Error saving battle history file'); rej(err);}    
                            })
                            battledata = [];
                            dataCollected= [];
                            dataCollect ={};
                        }
                    })        
                } else {
                    fs.writeFile('data/BattleHistoryData.json', JSON.stringify(dataCollected), async err => {
                        if (err) {
                            misc.writeToLogNoUsername('Error saving battle history file', err)
                        } else {
                            misc.writeToLogNoUsername('Successfully saving battle history')
                            battledata = [];
                            dataCollected= [];
                            dataCollect ={};
                        }
                    })
                }    
				await tn.battlesummary(logSummary,tet,sleepingTime,battletTime,battleID)
			}
            console.log('----------------------------------------------------------------------');
            console.log('Waiting for the next battle in', sleepingTime / 1000 / 60, ' minutes at ', new Date(Date.now() + sleepingTime).toLocaleString());
            console.log(chalk.green('Interested in a bot that transfers all cards, dec and sps to your main account? Visit the discord or telegram!'));
            console.log(chalk.green('Join the telegram group https://t.me/ultimatesplinterlandsbot and discord https://discord.gg/hwSr7KNGs9'));
            console.log('--------------------------End of Battle--------------------------------');
            battleID = ''
            seasonRewards = ''
            await new Promise(r => setTimeout(r, sleepingTime));
            
        }
    } catch (e) {
        if (process.env.TELEGRAM_NOTIF === 'true'){tn.sender("Bot stops due to error. Please see logs for details.")};
        console.log('Routine error at: ', new Date().toLocaleString(), e)
    }
})();