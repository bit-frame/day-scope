# DayScope
[![Version](https://img.shields.io/badge/Current_DayScope_Version-2024.12_Build_3-blue)](https://github.com/bit-frame/day-scope/releases/tag/v2024.12)
[![Version](https://img.shields.io/badge/Go_to-DayScope_Dev-orange)](https://github.com/bit-frame/dayscope-dev)

[![Version](https://img.shields.io/badge/View_Current_Announcement-green)](https://github.com/bit-frame/day-scope/discussions/2)

# Installing DayScope using the Installer (Beta)
Download the Installer from ``day-scope/installer/dayscope-util.deb`` or from [here](https://github.com/bit-frame/day-scope/blob/main/installer/dayscope-util.deb):
```
https://github.com/bit-frame/day-scope/blob/main/installer/dayscope-util.deb
```
Add the DayScope installer to your linux server.
Next, run ``sudo apt install ./dayscope-util.deb`` in the same directory as the debian file. This will install the utility.
```
sudo apt install ./dayscope-util.deb
```
After that, simply install the latest version of DayScope using ``install.dayscope`` and follow the instructions. No other things are needed.
```
install.dayscope
```

# Install DayScope using manual process
Before we continue, the DayScope application is currently only available to run on linux. If you are a windows user, use WSL.
To get started, run ``sudo apt update`` to update packages:
```
sudo apt update
```
Then, clone this repository to your server
```
git clone https://github.com/bit-frame/day-scope.git
```
Navigate to the ``DayScope`` directory and run the setup shell script as root. This script contains all required setup items, no other initial setup is required.
```
sudo sh setup.sh
```
Or running it using npm:
```
npm run setup
```
Follow the on-screen instructions to finish initial setup.

Next, run DayScope using ``run.dayscope`` in the terminal:
```
run.dayscope
```
Or using npm:
```
npm run dayscope
```
On the initial startup of DayScope, you will be redirected to an onboarding page to setup DayScope. Everything else is handled automatically.
After completing onboarding, head over to ``/login`` to continue the setup process.
