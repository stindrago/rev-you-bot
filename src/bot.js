// Include bot libreries

const Markup = require('telegraf/markup')
const Scene = require('telegraf/scenes/base')
const session = require('telegraf/session')
const Stage = require('telegraf/stage')
const Telegraf = require('telegraf')
const Telegram = require('telegraf/telegram')
const { leave } = Stage

// Include JS libreries
const fs = require('fs')

// Include files
const config = require('./config') // Configuration file that holds telegraf_token API key.
//const data = require('../resources/data.json') // User Data

const bot = new Telegraf(config.telegraf_token)
const revfeedbot = new Telegram(config.telegraf_token)
const feedChannelId = config.feedChannelId

const getExistentUser = new Scene('getExistentUser')
getExistentUser.enter((ctx) => {
    ctx.replyWithMarkdown('*Welcome back to* `Rev(You)`!  🎉🎉🎉')
    ctx.replyWithMarkdown('*Remember! Your score can be influenced by other* `Rev(Members)`.')
    ctx.replyWithMarkdown(`*Your score is:* \`${ctx.scene.state.setData.user.find(x => x.id === ctx.update.message.from.id).score}\` 👏`)
})

const getNewUser = new Scene('getNewUser')
getNewUser.enter((ctx) => {
    // TODO: refactor into getSave
    fs.readFile('../resources/data.json', 'utf-8', (err, data) => {
        if (err) throw err

        // create a JSON object
        const newUser = { "id" : ctx.update.message.from.id,
                          "firstname" : ctx.update.message.from.first_name,
                          "lastname" : ctx.update.message.from.last_name,
                          "username" : ctx.update.message.from.username,
                          "score" : 5,
                          "history" : []
                        }

        ctx.scene.state.setData = JSON.parse(data.toString())
        ctx.scene.state.setData.user.push(newUser)

        fs.writeFile('../resources/data.json', JSON.stringify(ctx.scene.state.setData, null, 4), (err) => {
            if (err) throw err
            console.log("JSON data is saved.")
        })
    })
    ctx.replyWithMarkdown('*Welcome to* `Rev(You)`!  🎉🎉🎉')
    ctx.replyWithMarkdown('*Your score can be influenced by other* `Rev(Members)`.')
    ctx.replyWithMarkdown('*Your starting score is:* `5`')
})

const getUsername = new Scene('getUsername')
getUsername.enter((ctx) => {
    fs.readFile('../resources/data.json', 'utf-8', (err, data) => {
        if (err) throw err
        ctx.scene.state.setData = JSON.parse(data.toString())
    })

    if(ctx.scene.state.setMemberScore != true)
        ctx.replyWithMarkdown('**Hello there!** *Who do you want to review?*')
})
getUsername.on('text', (ctx) => {
    ctx.scene.state.setUsername = ctx.message.text.replace('@','')
    return ctx.scene.enter('getValidation', ctx.scene.state)
})

const getValidation = new Scene('getValidation')
getValidation.enter((ctx) => {
    ctx.session.try = ctx.session.try || 0

    if(ctx.scene.state.setData.user.find(u => u.username === ctx.scene.state.setUsername) == undefined) {
        if(ctx.scene.state.setUsername == "me") {
            ctx.replyWithMarkdown("*Are you stupid?* 🤨")
            return ctx.scene.leave()
        }
        else if(ctx.session.try > 6) {
            ctx.reply("🖕")
            ctx.session.try++
            if(ctx.session.try > 10) ctx.session.try = 0 //TODO: 1 day ban
            return ctx.scene.leave()
        }
        else if(ctx.session.try > 5) {
            ctx.replyWithMarkdown("*Don't waste my computing time you noob.* 🖕")
            ctx.session.try++
            return ctx.scene.leave()
        }
        else if(ctx.session.try > 2) {
            ctx.replyWithMarkdown("*This user dosen't exist you idiot.* 🤦")
            ctx.session.try++
            return ctx.scene.leave()
        }
        else {
            ctx.replyWithMarkdown("*User dosen't exist.* 🙁 Type `/help`.")
            ctx.session.try++
            return ctx.scene.leave()
        }
    } else if(ctx.scene.state.setData.user.find(u => u.username === ctx.scene.state.setUsername).username == ctx.update.message.from.username) {
        if(ctx.scene.state.setMemberScore == true)
            ctx.replyWithMarkdown("*To find your score use* \`/score\` *instead.* 😤")
        else
            ctx.replyWithMarkdown("*You can't review yourself, idiot.* 🤣")
        return ctx.scene.leave()
    } else if(ctx.scene.state.setMemberScore == true)
        return ctx.scene.enter('getScore', ctx.scene.state)
    else
        return ctx.scene.enter('getReview', ctx.scene.state)
})

const getReview = new Scene('getReview')
getReview.enter((ctx) => {
    ctx.replyWithMarkdown('*How many stars?*',
                          Markup.inlineKeyboard([
                              Markup.callbackButton('《 1', 'key_one'),
                              Markup.callbackButton('〈 2', 'key_two'),
                              Markup.callbackButton('· 3 ·', 'key_three'),
                              Markup.callbackButton('4 〉', 'key_four'),
                              Markup.callbackButton('5 》', 'key_five')
                          ]).extra())
})
getReview.action('key_one', (ctx) => {
    ctx.scene.state.setReview = 1
    return ctx.scene.enter('getHistory', ctx.scene.state)
})
getReview.action('key_two', (ctx) => {
    ctx.scene.state.setReview = 2
    return ctx.scene.enter('getHistory', ctx.scene.state)
})
getReview.action('key_three', (ctx) => {
    ctx.scene.state.setReview = 3
    return ctx.scene.enter('getHistory', ctx.scene.state)
})
getReview.action('key_four', (ctx) => {
    ctx.scene.state.setReview = 4
    return ctx.scene.enter('getHistory', ctx.scene.state)
})
getReview.action('key_five', (ctx) => {
    ctx.scene.state.setReview = 5
    return ctx.scene.enter('getHistory', ctx.scene.state)
})

const getHistory = new Scene('getHistory')
getHistory.enter((ctx) => {
    const history = { "timestamp" : null, "from" : null, "anonymous" : false, "review" : null}

    history.timestamp = Math.floor(Date.now() / 1000)
    history.from = ctx.update.callback_query.from.id
    history.review = ctx.scene.state.setReview

    ctx.scene.state.setHistory = history

    if(ctx.scene.state.setReview == 5) {
        revfeedbot.sendMessage(feedChannelId, `@${ctx.update.callback_query.from.username} reviewed 🤜 @${ctx.scene.state.setUsername} 👉 ⭐⭐⭐⭐⭐️ - 😍`)
        ctx.editMessageText(`You reviewed @${ctx.scene.state.setUsername}: ⭐⭐⭐⭐⭐️ - 😍`)
    }
    else if(ctx.scene.state.setReview == 4) {
        revfeedbot.sendMessage(feedChannelId, `@${ctx.update.callback_query.from.username} reviewed 🤜 @${ctx.scene.state.setUsername} 👉 ⭐⭐⭐⭐️ - 🥺`)
        ctx.editMessageText(`You reviewed @${ctx.scene.state.setUsername}: ⭐⭐⭐⭐️ - 🥺`)
    }
    else if(ctx.scene.state.setReview == 3) {
        revfeedbot.sendMessage(feedChannelId, `@${ctx.update.callback_query.from.username} reviewed 🤜 @${ctx.scene.state.setUsername} 👉 ⭐⭐⭐️ - 🤧`)
        ctx.editMessageText(`You reviewed @${ctx.scene.state.setUsername}: ⭐⭐⭐️ - 🤧`)
    }
    else if(ctx.scene.state.setReview == 2) {
        revfeedbot.sendMessage(feedChannelId, `@${ctx.update.callback_query.from.username} reviewed 🤜 @${ctx.scene.state.setUsername} 👉 ⭐⭐️ - 🤢`)
        ctx.editMessageText(`You reviewed @${ctx.scene.state.setUsername}: ⭐⭐️ - 🤢`)
    }
    else if(ctx.scene.state.setReview == 1) {
        revfeedbot.sendMessage(feedChannelId, `@${ctx.update.callback_query.from.username} reviewed 🤜 @${ctx.scene.state.setUsername} 👉 ⭐️ - 🤮`)
        ctx.editMessageText(`You reviewed @${ctx.scene.state.setUsername}: ⭐️ - 🤮`)
    }

    return ctx.scene.enter('getSave', ctx.scene.state)
})

const getSave = new Scene('getSave')
getSave.enter((ctx) => {
    fs.readFile('../resources/data.json', 'utf-8', (err, data) => {
        if (err) throw err

        ctx.scene.state.setData = JSON.parse(data.toString())
        ctx.scene.state.setData.user.find(x => x.username === ctx.scene.state.setUsername)
           .history.unshift(ctx.scene.state.setHistory)

        let sum = 0
        let i = 0

        // iterate over object values
        Object.values(ctx.scene.state.setData.user.find(x => x.username === ctx.scene.state.setUsername).history)
              .forEach(val => {
                  sum += val.review
                  i++
              })

        ctx.scene.state.setData.user.find(x => x.username === ctx.scene.state.setUsername).score = (Math.round((sum/i) * 100) / 100)

        fs.writeFile('../resources/data.json', JSON.stringify(ctx.scene.state.setData, null, 4), (err) => {
            if (err) throw err
            console.log("JSON data is saved.")
        })
    })
})

const getScore = new Scene('getScore')
getScore.enter((ctx) => {
    fs.readFile('../resources/data.json', 'utf-8', (err, data) => {
        if (err) throw err

        ctx.scene.state.setData = JSON.parse(data.toString())

        if(ctx.scene.state.setMemberScore == true)
            ctx.replyWithMarkdown(`@${ctx.scene.state.setData.user.find(x => x.username === ctx.scene.state.setUsername).username}\'s score is: \`${ctx.scene.state.setData.user.find(x => x.username === ctx.scene.state.setUsername).score}\` 😉`)
        else
            ctx.replyWithMarkdown(`*Your score is:* \`${ctx.scene.state.setData.user.find(x => x.id === ctx.update.message.from.id).score}\` 👏`)
    })
})

const getMemberScore = new Scene('getMemberScore')
getMemberScore.enter((ctx) => {
    ctx.scene.state.setMemberScore = true

    ctx.replyWithMarkdown('**Hello again!** *Whose score are you trying to find?*')
    return ctx.scene.enter('getUsername', ctx.scene.state)
})

const getLeaderboard = new Scene('getLeaderboard')
getLeaderboard.enter((ctx) => {
    fs.readFile('../resources/data.json', 'utf-8', (err, data) => {
        if (err) throw err

        parsed = JSON.parse(data)

        let reformattedArray = parsed.user.map(obj => {
            let rObj = []
            rObj = [obj.username, obj.score]
            return rObj
        })

        reformattedArray.sort(function(a, b) {
            return b[1] - a[1]
        })

        reformattedArray.slice(0, 9).forEach(function(item, index) {
            if(index == 0 )
                ctx.replyWithMarkdown(`🥇 *${index + 1}° place* 🤜 @${item[0]} 👉 \`${item[1]}\``)
            if(index == 1 )
                ctx.replyWithMarkdown(`🥈 *${index + 1}° place* 🤜 @${item[0]} 👉 \`${item[1]}\``)
            if(index == 2 )
                ctx.replyWithMarkdown(`🥉 *${index + 1}° place* 🤜 @${item[0]} 👉 \`${item[1]}\``)
            if(index > 2)
                ctx.replyWithMarkdown(`*${index + 1}° place* 🤜 @${item[0]} 👉 \`${item[1]}\``)
        })
    })
})

const getMembers = new Scene('getMembers')
getMembers.enter((ctx) => {
    fs.readFile('../resources/data.json', 'utf-8', (err, data) => {
        if (err) throw err

        parsed = JSON.parse(data)

        let reformattedArray = parsed.user.map(obj => {
            let rObj = []
            rObj = [obj.username, obj.score]
            return rObj
        })

        reformattedArray.sort(function(a, b) {
            return a[0] - b[0]
        })

        reformattedArray.forEach(function(item) {
            ctx.replyWithMarkdown(`🤜 @${item[0]} 👉 \`${item[1]}\``)
        })

    })
})

const getHelp = new Scene('getHelp')
getHelp.enter((ctx) => {
    ctx.replyWithMarkdown(`*Help*
*@revyoubot is your personal assistant to influence people's behaviour. To start find the username of the person you want to review and type* \`/review\`*. Play with the rest of the commands to see what the bot can do.*

\`/review\` - review a Rev(Member) by username
\`/score\` - display your score
\`/leaderboard\` - display the top 10
\`/members\` - display all Rev(Members)
\`/search\` - get a Rev(Member)\'s score
\`/help\` - display this help

👉 *All reviews are displayed live at:* [t.me/revfeedchan](https://t.me/revfeedchan)

🔜 \`/about\` - **bot info**
🔜 \`/bio\` - **edit Rev(Bio)**
🔜 \`/anonymous_review\` - **review a Rev(Member) anonymously**
🔜 \`/comment_review\` - **review a Rev(Member) and leave a comment**
`)
    return ctx.scene.leave()
})


// Create scene manager
const stage = new Stage([
    getExistentUser,
    getNewUser,
    getUsername,
    getValidation,
    getReview,
    getHistory,
    getSave,
    getScore,
    getLeaderboard,
    getHelp,
    getMemberScore,
    getMembers], { ttl: 60 })

// Stage commands
stage.command('cancel', leave())
stage.command('review', (ctx) => {
    checkUsername(ctx)
    ctx.scene.enter('getUsername')
})
stage.command('score', (ctx) => {
    checkUsername(ctx)
    ctx.scene.enter('getScore')
})
stage.command('leaderboard', (ctx) => {
    checkUsername(ctx)
    ctx.scene.enter('getLeaderboard')
})
stage.command('members', (ctx) => {
    checkUsername(ctx)
    ctx.scene.enter('getMembers')
})
stage.command('search', (ctx) => {
    checkUsername(ctx)
    ctx.scene.enter('getMemberScore')
})
stage.command('help', (ctx) => {
    checkUsername(ctx)
    ctx.scene.enter('getHelp')
})
stage.command('help_im_noob', (ctx) => ctx.replyWithMarkdown('*There\'s nothing I can do for you.*'))

// Bot Commands
bot.use(session())
bot.use(stage.middleware())

bot.start((ctx) => {
    fs.readFile('../resources/data.json', 'utf-8', (err, data) => {
        if (err) throw err
        ctx.scene.state.setData = JSON.parse(data.toString())

        if(ctx.scene.state.setData.user.find(u => u.id === ctx.update.message.from.id) == undefined)
            ctx.scene.enter('getNewUser')
        else
            ctx.scene.enter('getExistentUser', ctx.scene.state)
    })
})

bot.on('message', (ctx) =>{
    ctx.replyWithMarkdown('Type `/help`')
    return leave()
})

bot.launch()

function checkUsername(ctx) {
    fs.readFile('../resources/data.json', 'utf-8', (err, data) => {
        if (err) throw err
        ctx.scene.state.setData = JSON.parse(data.toString())

        if(ctx.scene.state.setData.user.find(u => u.id === ctx.update.message.from.id) == undefined)
            ctx.scene.enter('getNewUser')
        else {
            if(ctx.scene.state.setData.user.find(u => u.id === ctx.update.message.from.id).username != ctx.update.message.from.username)
                ctx.scene.state.setData.user.find(u => u.id === ctx.update.message.from.id).username = ctx.update.message.from.username

            fs.writeFile('../resources/data.json', JSON.stringify(ctx.scene.state.setData, null, 4), (err) => {
                if (err) throw err
                console.log("JSON data is saved.")
            })
        }
    })
}
