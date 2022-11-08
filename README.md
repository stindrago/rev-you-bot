# Rev(You)

Telegram bot to review people.

Using [telegraf](https://telegraf.js.org) with [Node.js](https://nodejs.org/en/)

## Ty it yourself

1. [Create a bot](https://core.telegram.org/bots#6-botfather) on Telegram
1. [Create a channel](https://www.telegram.org/faq_channels#q-what-39s-a-channel) for your bot feed
1. Install packages
   - [node.js](https://nodejs.org/en/)
   - [git](https://git-scm.com)
1. Download repository
   - `git clone https://git.dragoi.me/costin/rev-you-bot.git`.
1. Init database
   - `cd rev-you-bot/resources`.
   - `cp data.json.empty data.json`.
1. Edit bot configuration
   - `cd ../src`.
   - `cp config.js.empty config.js`.
   - open `config.js` with your favorite editor.
     - Replace `TOKEN` with the **API TOKEN** of your bot got from Bot Father.
     - Replace `0` with the **ChatID** of your feed channel
       - Get the Channel ID
         1. Go to https://web.telegram.org.
         1. Click on your channel.
         1. Look at the URL and find the part that looks like `#-1234567890/12`.
         1. Remove the `#`: like `-1234567890/12`.
         1. Remove what follows and the `/`: like `-1234567890`.
         1. Add a prefix of `100` after `-`: like `-1001234567890`.
         1. That's your channel id.
       - copy/paste the Chat ID
1. Install required modules
   - `npm i`
1. Run
   - `node index.js`

## Deploy

Instead of just running `node index.js` in the terminal, run it in background.

1. `cd /opt`.
1. Do the steps above.
1. Install _pm2_
   - `npm install pm2 -g`.
1. Start the node app
   - `pm2 start index.js`.

You can view logs with `pm2 logs`.

## Contribute

The code needs more documentation and some cleaning.

To contribute find issues and if you know JavaScript send pull requests.

Any help is appreciated.

## License

Free Software (GPLv3)
   
