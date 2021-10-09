echo "Initiating gathering battle data for local history"
read -p "Press any key to start the gathering battle data."
node battlesGetData.js
cd data
node combine.js
read -p " Done! Press any key to close window now."