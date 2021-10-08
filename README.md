# Ultimate Splinterlands Bot V1 Mobile by Virgaux
A fast, free, multi-account splinderlands bot

Based on https://github.com/PCJones/ultimate-splinterlands-bot

## Preamble 
Not really good at coding so please don't mind how I code this bot. 

Feel free to give suggestions for features/code refurbishing via github or on discord.


## New Features
- Multiple accounts with only one instance
- Login via Email
- Better Team Selection - the bot will chose cards with best win rate, not the ones that are most used
- Faster Login & Fighting:
- The bot no longer refreshes the page all the time (which often got you blocked from splinterlands for a few minutes)
- The bot clicks away popups
- The bot waits if there is a loading circle from splinterlands
- Option to disable automatic quest reward chest opening
- Support for the private API of the original bot
- Minimum Energy Capture Rate - the bot will pause automatically if the energy capture rate is below a specified percentage
- New battle log summary after all battles
- New DEC log after battle. 
- Receive Battle log summary notification via Telegram 
- Accurate battle summary 
- Auto gather the battle history for local back.(In case supported API is down)
- Telegram notification if bot had an error/stop running. Call to function on telegram. (virgaux)
- **Coming Soon**: More Telegram command
- Any suggestions?

# Support / Community

[Discord](https://discord.gg/s9HKjqYW)

## How to install
- Download [Termux] (https://f-droid.org/packages/com.termux/)
Open Termux then type 
pkg update -y
press enter/next 2x
pkg install proot-distro (Choose which distro you want to use but recommened to to use Alpine)
after installation, type proot-distro login (Name of the distro you choosed)

or 

- Install [AndroNix](https://andronix.app/) and choose which distro you will use. (Recommended to use Alpine)
    Follow instruction [here] (https://www.youtube.com/watch?v=XkL1B0arrbw) to use VNSC 
                or 
    Using terminal only: 
    Copy link from AndroNix for terminal only. Paste in Termux the copied linked. 
    Paste in Termux the copied linked.
    After installation, type  bash start-alpine.sh
    (Try to google steps on how to log in on your preferred distro)           

- 2nd step (Install chromium)
Copy and paste this:
  apk update && apk add --no-cache nmap && \
  echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
  echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
  apk update && \
  apk add --no-cache \
  chromium

- 3rd step: 
Type: apk add nodejs npm git

- 4th step 
Type: git clone https://github.com/virgaux/ultimate-splinterlands-bot-mobile

- 5th step 
Type cd ultimate-splinterlands-bot
Install nano by typing apk add nano 
Fill nano .env-example

 - 6th step
Edit the data inside the .env-example
After editing, press ctrl x, press y, remove "-example" then enter

7th step 
Type sh install.bat 

## How to start the bot
- You can type either of the following: sh start.bat , npm start or node index.js

## How to get telegram token
- Follow the instruction on [how to get telegram token](https://www.siteguarding.com/en/how-to-get-telegram-bot-api-token)

## Bot configuration:

Configuration with default values:

- `QUEST_PRIORITY=true` Disable/Enable quest priority

- `MINUTES_BATTLES_INTERVAL=` Sleep time before the bot will fight with all accounts again. Subtract 2-3 minutes per account

- `ERC_THRESHOLD=` If your energy capture rate goes below this the bot will stop fighting with this account until it's above again. Set to 0 to disable 

- `POWER_THRESHOLD=` Able to see the current collection power. It will let you know if your collection power is below theshold. 
  
- `ERC_REGEN=true` Disable/Enable ERC regeneration function.

- `CLAIM_SEASON_REWARD=false` Disable/Enable season reward claiming

- `CLAIM_QUEST_REWARD=true` Disable/Enable quest reward claiming

- `HEADLESS=true` Disable/Enable headless("invisible") browser (e.g. to see where the bot fails)

- `KEEP_BROWSER_OPEN=true` Disable/Enable keeping the browser instances open after fighting. Recommended to have it on true to avoid having each account to login for each fight. Disable if CPU/Ram usage is too high (check in task manager)

- `CHROME_NO_SANDBOX=true` Don't change to false as you will not able to run the bot on a linux proot-distro. 

- `LOGIN_VIA_EMAIL=false` Disable/Enable login via e-mail adress. See below for further explanation

- `EMAIL=account1@email.com,account2@email.com,account3@email.com` Your login e-mails, each account seperated by comma. Ignore line if `LOGIN_VIA_EMAIL` is `false`

- `ACCUSERNAME=username1,username2,username3` Your login usernames, each account seperated by comma. **Even if you login via email you have to also set the usernames!**

- `PASSWORD=password1,password2,password3` Your login passwords/posting keys. Use password if you login via email, **use the posting key if you login via username**

- `USE_API=true` Enable/Disable the team selection API. If disabled the bot will play the most played cards from local newHistory.json file. **Experimental - set to false if you lose a lot**

- `API_URL=` Ignore/Don't change unless you have the private API from the original bot

- `USE_CLASSIC_BOT_PRIVATE_API=false` Set to false unless you have the private API from the original bot

- `TELEGRAM_NOTIF=false` Disable/Enable to receive telegram notification for battle result. 

- `TELEGRAM_TOKEN=` API TOKEN from telegram which will send you the notification. This is private key. DO NOT GIVE IT TO ANYONE. [how to get telegram token](https://www.siteguarding.com/en/how-to-get-telegram-bot-api-token)

- `TELEGRAM_CHATID` telegram chat id for notify, get the id: https://t.me/get_id_bot

# Donations

In case you want to donate to me for updating this bot, I would be very happy! Please also consider donating to the original bot creator.

- DEC or cards into the game to the player **virgaux** 
- Metamask wallet address: 0x6b11890566077AAC2B7fA7511d484f50Ec1335f6
- Hive wallet address: @virgaux

# FAQ
**Can I have some accounts that login via email and some via username?**

Yes! Config Example:
```
LOGIN_VIA_EMAIL=true
EMAIL=account1@email.com,account2@email.com,username3
ACCUSERNAME=username1,username2,username3
PASSWORD=password1,password2,POST_KEY3
```

**How to get history data from users of my choice?**

1. Open battlesGetData.js in notepad and change the usersToGrab on line 70 to the users of your choice
2. Run `node battlesGetData.js` in the bot folder
3. File history.json is created, rename it to newHistory.json to replace the existing history data OR extend the newHistory.json file (see below)

**How to extend the newHistory.json without deleting existing data?**

1. Backup newHistory.json in case something goes wrong
2. Run `node combine.js` in the data folder to add the data from history.json to the newHistory.json file

**Why I can't see the Telegram notification after setting it up?**

1. Look for the name of your bot in Telegram. 
2. Type `/start` to receive notifcation once battle summary result is available. 
