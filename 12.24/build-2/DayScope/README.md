# DayScope
[![Version](https://img.shields.io/badge/DayScope-2024.12.08-blue)](https://example.com)

# Installing DayScope
To get started, clone this repository
```
git clone https://github.com/bit-frame/DayScope.git
```
Navigate to the DayScope directory and install ``nodejs``, ``npm``, and ``express``
```
sudo apt install nodejs npm

npm install
npm install express
```
All Completed! Follow the on screen steps to set up DayScope for your school!
Launch DayScope with:
```
node app.js
```
The server by default will start on port 3000 and will listen on the whole network.

# Updating DayScope
To continue updating your DayScope shutdown the application.
Next, run the command below to pull the stable version:
```
git pull origin v1-stable
```
After that, update your packages with ``npm``
```
npm install
```
That's it! You can power on your DayScope server and try out its newest features!
