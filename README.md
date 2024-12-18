# DayScope
[![Version](https://img.shields.io/badge/Current_DayScope_Version-2024.12_Build_2-blue)](https://github.com/bit-frame/day-scope/releases/tag/v2024.12)
[![Version](https://img.shields.io/badge/Go_to-DayScope_Dev-orange)](https://github.com/bit-frame/dayscope-dev)

[![Version](https://img.shields.io/badge/View_Current_Announcement-green)](https://github.com/bit-frame/day-scope/discussions/2)

# Installing DayScope (Beta)
To get started, clone this repository to your server
```
git clone https://github.com/bit-frame/day-scope.git
```
Navigate to the ``DayScope`` directory and install the required packages
```
npm install
```
Next, navigate out of the ``DayScope`` directory and install ``MySQL``
```
sudo apt install mysql-server
```
Enter ``MySQL`` and create a user for DayScope. You will need to apply changes to the DayScope ``config.yaml`` script in ``database`` options.
```
sudo mysql
use mysql;
create user 'dayscope-root'@'localhost' identified by 'dayscope';
grant all privileges on *.* to 'dayscope-root'@'localhost';
ALTER USER 'dayscope-root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'dayscope';
flush privileges;
exit;
```
Next, create a database for DayScope. Everything in DayScope is stored locally on your server.
First, login as ``dayscope-root`` or whatever you changed it to.
```
mysql -u dayscope-root -p
create database dayscope;
use dayscope;
exit;
```
Everything has been configured. Extra configuration settings can be found in the ``config.yaml`` script.
To start DayScope, run ``node app.js``
```
node app.js
```
On first startup of DayScope, you will be redirected to an onboarding page to setup DayScope. Everything else is handled automatically.
After completing onboarding, head over to ``/login`` to continue the setup process.
