echo "Bot modified by virgaux(based on bot by PC jones) - have fun"
read -p "Press any key to start the installation."
npm install
npm update
cd node_modules/puppeteer
if [-e  .local-chromium] 
then 
node install.js
cd ultimate-splinterlands-bot-mobile
else
cd ultimate-splinterlands-bot-mobile
fi

echo Installation complete!

echo "Want to start the bot now?"
select yn in "Yes" "No"; do
    case $yn in
        Yes ) sh start.sh
        No ) exit;;
    esac
done

