# GETTING SETUP

## Instructions on How to Setup Dev Environment (curated by Garrett)
  
_As packages are installed, you should update this document on how to install those packages for other teammates_  
  
## Front-end setup
1. [Download VirtualBox](https://www.virtualbox.org/wiki/Downloads)
2. Create a new VM with Ubuntu (20.0.4 is a good version)
    - I would dedicate at least 2 processors, 4 GB RAM, and 30 GB of memory to your VM to have enough space and resources to run without latency issues
3. Execute `sudo apt-get install -y nodejs`
4. Execute `sudo apt-get install git`
5. Navigate in your directory to where you would like to create a new project and make a new folder
6. Open up a Terminal and navigate to this new folder as the current directory
7. Execute `npx create-react-app APP_NAME_HERE` (obviously replace `app_name_here`)
8. Create a new folder outside of the project entirely (for repo)
9. Open up a Terminal and navigate to this new folder
10. Clone the climate_sonification repository into this folder
    - Open up a Terminal and navigate to this new folder
11. Clone the climate_sonification repository into this folder
    - This repository only contains the src folder and README.md, nothing else
12. Copy contents of repo into your react app (replacing /src/, /public/, package.json)
13. Open up a Terminal and navigate to your folder APP_NAME_HERE
14. Execute `npm install --force`
15. Execute `npm start` to view app in your browser and test locally
    - You do not have to close and reopen the app to view changes. Just save the file locally and hit refresh or sometimes it updates on its own.

# AWS Instructions (S3)
1. Execute `npm run build` inside project folder
2. Create a folder on S3 for the frontend (/frontend/)
3. Upload build files to /frontend/, make sure organization stays the same


### Changing Virtual Box Resolution
Virtual Box has this really weird default viewing settings that bugged that shit out of me. I spent a lot of time figuring out how to fix it so I thought I would share it. If you don't like the small viewing with the awful resolution, follow these steps.  
1. Open up a Terminal in your VM
2. Execute: 
    - `sudo apt-get update`
    - `sudo apt-get install build-essential gcc make perl dkms`
3. Restart your VM
4. Click Devices->Insert Guest Additions CD Image in the top Toolbar
5. Click Run on the popup that comes up
6. Now you should be able to change your resolution of your VM with View->Virtual Screen 1 and it will fill up the window!
  
### Sublime Text
I love Sublime text, however there is no React syntax option for Sublime Text by default. Do not fret, there is always a solution. I found this great Git repository for enhanced Sublime text which highlights your code for React development. The only thing I have found wrong with this is sometimes comments don’t highlight correctly, but when actually coding it makes it SO much more readable than the default JavaScript syntax with Sublime. If you want to use Sublime on your VM as your IDE, then follow these instructions.  
  
[Link to Repository](https://github.com/borela/naomi)  
  
1. Install Sublime text
2. Open up a Terminal
3. Execute:
    - `sudo apt-get update`
    - `sudo apt-get install sublime-text`
4. Execute `cd ~/.config/sublime-text-3/Packages`
5. Execute git clone https://github.com/borela/naomi.git Naomi
6. Open Sublime
7. Select through View->Syntax->Naomi->JavaScript
8. Now you have syntax highlighting for React in Sublime
  
_Note: I think you can install JavaScript (babel) from sublime package control and get React syntax highlighting as well._  
