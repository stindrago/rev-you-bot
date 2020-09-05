# Rev(You)
Telegram bot to review people.  
Using [https://telegraf.js.org](telegraf) with [Node.js](https://nodejs.org/en/)

## Ty it yourself

1. [Create a bot](https://core.telegram.org/bots#6-botfather) on Telegram
1. [Create a channel](https://www.telegram.org/faq_channels#q-what-39s-a-channel) for your bot feed
1. Install packages
   - [node.js](https://nodejs.org/en/)
   - [git](https://git-scm.com)
1. Download repository
   - `git clone https://github.com/stindrago/rev-you-bot.git`
1. Init database
   - `cd rev-you-bot/resources`
   - `cp data.json.empty data.json`
1. Edit bot configuration
   - `cd ../src`
   - `cp config.js.empty config.js`
   - open `config.js` with your favorite editor
     - Replace `TOKEN` with the **API TOKEN** got from Bot Father
     - Replace `0` with the **ChatID** of your feed channel
       - Get the ID: `curl -X POST "https://api.telegram.org/bot<TOKEN>/sendMessage" -d "chat_id=@<ChatID>&text=hi"`
       - copy/paste the Chat ID
1. Install required modules
   - `npm i`
1. Run
   - `node index.js`
   
## Contribute
The code needs more documentation and some cleaning.  
To contribute find issues and if you know JavaScript send pull requests.  
Any help is appreciated.  

## License
Free Software (GPLv3)
   
