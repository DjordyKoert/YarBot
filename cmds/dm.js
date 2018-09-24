module.exports.run = async (bot, botconfig, fs, message, args, con, server) => {
    if (message.channel.type == "dm") { message.reply("This command can only be used in a server"); message.react("❌"); return; }
    //if (!message.member.hasPermission("ADMINISTRATOR")) { message.reply("No permission to use this command"); message.react("❌"); return; };
    if (message.mentions.users.first() != args[0] && !args[0]) { message.reply("Mention someone"); message.react("❌"); return; };
    //Autocomplete user
    const sm = require('string-similarity')

    let members = [];
    let memberids = [];

    message.guild.members.forEach(function (member) {
        members.push(member.user.username);
        memberids.push(member.id);
    });

    let match = sm.findBestMatch(args.join(' '), members);
    let username = match.bestMatch.target;
    let member = message.guild.members.get(memberids[members.indexOf(username)]);

    let Mentioned = false;
    // Start Dm
    if (message.mentions.users.first() == args[0]) {
        dmUser = message.mentions.users.first()
        Mentioned = true;
    } else { dmUser = member }
    let dmMessage = args.slice(1).join(' ');
    if (dmMessage == "") { message.react("❌"); message.reply("Empty dm message"); return; }
    con.query(`SELECT * FROM ssetup WHERE serverID='${server.id}' AND dmID !=''`, (err, rows) => {
        if (err) { let errstack = err.stack; createLog(fs, err, errstack); return; }
        //Geen channel available
        if (rows.length == 0) {
            message.delete();
            message.reply("No dm channel available").then(msg => {
                msg.delete(8000)
            })
                .catch((err) => {
                    if (err) { let errstack = err.stack; let extraMessage = "DM message remove error"; createLog(fs, err, errstack, extraMessage); }
                });
            return;
        }
        //If message.channel is not same as in database
        if (message.channel != rows[0].dmID && rows[0].dmID != "all") {
            message.reply(`The >dm command only works in a dm channel\nCurrent DM Channel: ${rows[0].dmID}`)
                .then(msg => {
                    msg.delete(8000)
                })
                .catch((err) => {
                    if (err) { let errstack = err.stack; let extraMessage = "DM message remove error"; createLog(fs, err, errstack, extraMessage); }
                });
            message.delete();
            return;
        }
        bot.users.get(dmUser.id).send(`${dmMessage}\n\nThis message was sent by: ${message.author.tag}`);
        if (Mentioned) { message.author.send(`✅ DM succesfully send to ${dmUser.tag}\n` + "```Message:\n" + dmMessage + "```") }
        else { message.author.send(`✅ DM succesfully send to ${dmUser.user.tag}\n` + "```Message:\n" + dmMessage + "```") }
        message.delete();
        return;
    });

    //Create an errorLog
    function createLog(fs, err, errstack, extraMessage) {
        if (!extraMessage) extraMessage = "";

        let date = new Date();
        let currentYear = date.getFullYear();
        let currentMonth = date.getMonth();
        let currentDay = date.getDate();
        let currentHours = date.getHours();
        let currentMinutes = date.getMinutes();
        let currentSecs = date.getSeconds();
        let error_date = (`${currentDay}-${currentMonth}-${currentYear}_${currentHours}.${currentMinutes}.${currentSecs}`)

        //Create logs folder if it doens't exist
        if (!fs.existsSync("./logs")) {
            fs.mkdirSync("./logs");
            console.log("Creating ./logs folder");
        }

        fs.writeFile(`./logs/err_${error_date}.txt`, `${err}\n${errstack}\n\n${extraMessage}`, { flag: 'w' }, function (err) {
            if (err) return console.error(err);
            console.log(`Succefully made logs file: err_${error_date}.txt`);
        });
    }
}
module.exports.help = {
    name: "dm",
    help: "Send a dm to a user.",
    usage: ">dm @[user] [message]",
    permissions: "NONE"
}