#!/bin/bash

echo "DayScope 2024.12 Build 2"
echo "Starting setup. Please do not turn off this computer."

echo "Getting files..."
sleep 2

# Install necessary dependencies
sudo apt install -y nodejs -y
sudo apt install -y npm -y
npm install
sudo apt install -y mysql-server -y

# Prompt for new database user and password
read -p "New database user (e.g. dayscope-root): " newUser
read -p "New user password (e.g. dayscope): " newPass

# Create a new MySQL user and database
sudo mysql -e "CREATE USER '$newUser'@'localhost' IDENTIFIED WITH mysql_native_password BY '$newPass';"
sudo mysql -e "CREATE DATABASE dayscope;"
sudo mysql -e "GRANT ALL PRIVILEGES ON dayscope.* TO '$newUser'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# Make run script executable and move it to the correct location
chmod +x run_dayscope.sh
sudo mv run_dayscope.sh /usr/local/bin/run.dayscope

echo "Initial setup complete. Access DayScope by running: run.dayscope"
echo "Please configure the configuration script and start up DayScope to continue to onboarding."
echo "Exiting... [DayScope Installer V1]"
