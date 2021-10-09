echo "Initiating gathering battle data for local history"
read -p "Press any key to start the gathering battle data."
bash node battlesGetData.js
cd data
bash node combine.js
read -p " Done! Press any key to close window now."