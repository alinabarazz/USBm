echo "Bot modified by virgaux(based on bot by PC jones) - have fun"
read -p "Press any key to start the installation."
npm install
npm update
cd node_modules/puppeteer
if [-e  .local-chromium] 
then 
  cd ..\..\ 
else
   node install
cd ..\..\ 
fi
echo.
echo Installation complete!
echo.
echo "Want to start the bot now?"
select yn in "Yes" "No"; do
    case $yn in
        Yes ) sh start.sh
        No ) exit;;
    esac
done

