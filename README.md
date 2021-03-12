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

## Local Backend Setup:
  
1. Create new API folder (db_api) and copy in routes, index.js and dbconn.js from [GitHub](https://github.com/ghempy/fetchAPI) into API root folder
2. Run the following commands inside db_api in a terminal
    - `sudo mysql_secure_installation`
    - `sudo mysql`
    - `create user 'username'@'localhost' identified by 'password';` **LEAVE PASSWORD AS PASSWORD!**
    - `grant all privileges on *.* to ‘username’@’localhost’;`
    - `flush privileges;`
    - `create database climate_data;`
    - `exit;`
3. Open dbconn.js and modify username, password, and database name to what you just set for all these values
4. Execute `sudo mysql -u username -p climate_data < climatescript.sql`
5. Enter the password you set for the SQL user and let it load (this will take a bit)
6. Execute:
    - `npm init`
    - `npm install express --save`
    - `npm install cors body-parser mysql --save`
    - `npm install compression --save`
    - `node index.js`
7. Server will be running on port 4040, to access API for LOCAL ONLY go to the following link (http://localhost:4040/co2/all this links to the results of the query in a web brower)
  

# AWS Instructions

## API First Time Setup

1. Use PuTTY to SSH into the API server
2. Execute `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash`
3. Execute `. ~/.nvm/nvm.sh`
4. Execute `nvm install node`
5. Execute `sudo yum install mariadb`
6. Execute `sudo yum install mariadb-server`
7. Execute `sudo systemctl start mariadb`
8. Execute `sudo mysql_secure_installation`
9. Setup root password **only** for final build, click yes for all other options.
10. Execute `mysql`
    - Execute `create user ‘ec2-user’@’localhost’ identified by ‘password’;`
    - Execute `grant all privileges on *.* to ‘ec2-user’@’localhost’;`
    - Execute `flush privileges;`
    - Execute `exit;`
11. `mkdir /home/ec2-user/db_data`
12. `mkdir /home/ec2-user/db_api`
13. `cd /home/ec2-user/db_api`
14. `npm init`
15. `npm install express --save`
16. `npm install cors body-parser mysql --save`
17. SCP data and script into `/home/ec2-user/db_data`
18. SCP api into `/home/ec2-user/db_api`
19. fix dbconn.js
20. `cd /home/ec2-user/db_data`
21. `unzip climate_data.zip`
22. `sudo mysql`
    - `create database climate_data;`
    - `exit;`
23. `sudo mysql -u ec2-user -p climate_data < climatescript.sql`
24. `screen`
    - `cd /home/ec2-user/db_api`
    - `node index.js`
    - `ctrl+a`
    - `ctrl+d`
  
**Backgrounding a process**
- ssh into your remote box. Type `screen` Then start the process you want.
- Press `Ctrl-A` then `Ctrl-D`. This will "detach" your screen session but leave your processes running. You can now log out of the remote box.
- If you want to come back later, log on again and type `screen -r` This will "resume" your screen session, and you can see the output of your process.
  
## Optional Setup:

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
