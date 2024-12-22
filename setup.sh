#!/bin/bash

echo "DayScope 2024.12 Build 2"
echo "Starting setup. Please do not turn off this computer."
sudo apt install nodejs
sudo apt install npm
npm install
sudo apt install mysql-server
read -p "New database user (e.g. dayscope-root): " newUser
read -p "New user password (e.g. dayscope): " newPass
sudo mysql
use mysql;
create user "$newUser"@"localhost" identified with mysql_native_password by "$newPass";
flush privileges;
create database dayscope;
exit;
chmod +x run_dayscope.sh
sudo mv run_dayscope.sh /usr/local/bin/run.dayscope
echo "Initial setup complete. Access DayScope by running: run.dayscope"
echo "Please configure the configuration script and start up DayScope to continue to onboarding."
echo "Exiting... [DayScope Installer V1]"