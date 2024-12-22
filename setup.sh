#!/bin/bash

echo "DayScope 2024.12 Build 2"
echo "Starting setup. Please do not turn off this computer."

sleep 2

sudo apt install -y nodejs -y
sudo apt install -y npm -y
npm install
sudo apt install -y mysql-server -y

read -p "New database user (e.g. dayscope-root): " newUser
read -p "New user password (e.g. dayscope): " newPass

sudo mysql -e "CREATE USER '$newUser'@'localhost' IDENTIFIED WITH mysql_native_password BY '$newPass';"
sudo mysql -e "CREATE DATABASE dayscope;"
sudo mysql -e "GRANT ALL PRIVILEGES ON dayscope.* TO '$newUser'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

chmod +x run_dayscope.sh
sudo mv run_dayscope.sh /usr/local/bin/run.dayscope

echo ""
echo ""
echo "Initial setup complete. Access DayScope by running: run.dayscope"
echo "Please configure the configuration script and start up DayScope to continue to onboarding."
echo ""
echo ""
echo "For more information, go to github.com/bit-frame/day-scope"
echo "Exiting... [DayScope Installer V1]"