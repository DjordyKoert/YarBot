module.exports.run = async (bot, botconfig, fs, message, args, con, server, serverName) => {
    if (botconfig.status == "disabled") return message.reply("Bot is disabled by developer");
    let BeforeSplit = args.slice(1).join(' ');
    let Split = BeforeSplit.split(',')
    if (Split[0] != "" && Split[1] == "") { message.react("❌"); message.reply("Please enter a title, usage: >suggestion (title), (suggestion)"); return; }
    if (BeforeSplit == "") { message.react("❌"); message.reply("Empty suggestion message"); return; }

    let suggestionName = message.author.username;

    let testServer = "492055519050203137";
    let suggestionChannel = "492756643239559168";

    bot.guilds.get(testServer).channels.get(suggestionChannel).send({
        embed: {
            color: (133, 0, 255),
            author: {
                name: `Suggestion by: ${suggestionName}`,
            },
            fields: [{
                name: `Title: ${Split[0]}`,
                value: `${Split[1]}`
            }]
        }
    });
    message.react("✅");

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
    name: "suggestion",
    help: "Send a suggestion to the Developer to add something inside the bot.",
    usage: ">suggestion [title], [message]",
    permissions: "NONE"
}