#!/bin/bash
apt update
printf "INSTALL build-essential\n\n"
apt install build-essential
printf "INSTALL NODE\n\n"
curl -sL https://deb.nodesource.com/setup_12.x -o nodesource_setup.sh
sudo bash nodesource_setup.sh
apt install nodejs
printf "REMOVE nodesource_setup\n\n"
rm nodesource_setup.sh
nodejs -v
npm -v
printf "Install PM2\n\n"
npm install pm2 -g
pm2 completion install
pm2 startup
pm2 save
printf "Setup Git email\n\n"
git config --global user.name "Ionel Crisu"
git config --global user.email crisu.ionel@gmail.com