module.exports.run = async (bot, botconfig, fs, message, args, con) => {
    if (botconfig.status == "disabled") return message.reply("Bot is disabled by developer");
    //Check permissions
    if (!message.member.hasPermission("MANAGE_CHANNELS")) { message.reply("No permission to use this command"); message.react("❌"); return; };
    //Check if server is in database before continuing
    con.query(`SELECT serverID FROM ssetup WHERE serverID='${server}'`, (err, rows) => {
        if (err) { let errstack = err.stack; createLog(fs, err, errstack); return; }
        if (rows.length == 0) {
            con.query(`INSERT INTO ssetup (serverID, serverName) VALUES ('${server}', '${serverName}')`);
            console.log(`New server added: ${server}, Trough setup command`);
        }
    });
    //Remove announcement channel
    switch (true) {
        //Als er een channel geremoved moet worden
        case (args[0] == "remove"):
            if (args[0] == "remove" && args[1] == "announcement") {
                con.query(`SELECT * FROM ssetup WHERE serverID='${server}' AND announcementID !=''`, (err, rows) => {
                    if (err) { let errstack = err.stack; createLog(fs, err, errstack); return; }
                    if (rows.length == 0) { message.reply("No announcement channel available"); message.react("❌"); return; }
                    con.query(`UPDATE ssetup SET announcementID="" WHERE serverID='${server}'`);
                    message.react("✅");
                    return;
                });
            } else if (args[0] == "remove" && args[1] == "dm") {
                con.query(`SELECT * FROM ssetup WHERE serverID='${server}' AND dmID !=''`, (err, rows) => {
                    if (err) { let errstack = err.stack; createLog(fs, err, errstack); return; }
                    if (rows.length == 0) { message.reply("No dm channel available"); message.react("❌"); return; }
                    con.query(`UPDATE ssetup SET dmID="" WHERE serverID='${server}'`);
                    message.react("✅");
                    return;
                });
            }
            else { message.react("❌"); message.reply("Correct usage: >setup remove (channelProperty)"); return; }
            break;
        //Als announcement channel niet gedelete moet worden en correcte command is ingevuld
        case (args[0] == "announcement"):
            //Show current announcement channel
            if (!message.mentions.channels.first()) {
                con.query(`SELECT * FROM ssetup WHERE serverID='${server}' AND announcementID !=''`, (err, rows) => {
                    if (err) { let errstack = err.stack; createLog(fs, err, errstack); return; }
                    if (rows.length == 0) { message.reply("No announcement channel available"); message.react("❌"); return; }
                    message.reply(`the current announcement channel is: <#${rows[0].announcementID}>`);
                    return;
                });
            }
            else {
                let announcementID = message.mentions.channels.first();
                con.query(`SELECT * FROM ssetup WHERE serverID='${server}' AND announcementID !=''`, (err, rows) => {
                    if (err) { let errstack = err.stack; createLog(fs, err, errstack); return; }
                    //If server doesn't already have an announcement channel
                    if (rows.length == 0) {
                        con.query(`UPDATE ssetup SET announcementID='${announcementID.id}', serverName='${serverName}'WHERE serverID='${server}'`);
                        message.react("✅");
                        console.log(`New annoucement channel in server: ${server}, announcementID=${announcementID}`)
                    } //If server already has an announcement channel
                    else {
                        con.query(`UPDATE ssetup SET announcementID='${announcementID.id}', serverName='${serverName}'WHERE serverID='${server}'`);
                        message.react("✅");
                        console.log(`Updated annoucement channel in server: ${server}, announcementID=${announcementID}`)
                    }
                });
            }
            break;
        case (args[0] == "dm"):
            //Show current dm channel
            if (!message.mentions.channels.first()) {
                con.query(`SELECT * FROM ssetup WHERE serverID='${server}' AND dmID !=''`, (err, rows) => {
                    if (err) { let errstack = err.stack; createLog(fs, err, errstack); return; }
                    if (rows.length == 0) { message.reply("No dm channel available"); message.react("❌"); return; }
                    message.reply(`the current dm channel is: <#${rows[0].dmID}>`);
                    return;
                });
            }
            else {
                let dmID = message.mentions.channels.first();
                con.query(`SELECT * FROM ssetup WHERE serverID='${server}' AND dmID !=''`, (err, rows) => {
                    if (err) { let errstack = err.stack; createLog(fs, err, errstack); return; }
                    //If server doesn't already have an dm channel
                    if (rows.length == 0) {
                        con.query(`UPDATE ssetup SET dmID='${dmID.id}', serverName='${serverName}'WHERE serverID='${server}'`);
                        message.react("✅");
                        console.log(`New annoucement channel in server: ${server}, dmID=${dmID}`)
                    } //If server already has an dm channel
                    else {
                        con.query(`UPDATE ssetup SET dmID='${dmID.id}', serverName='${serverName}'WHERE serverID='${server}'`);
                        message.react("✅");
                        console.log(`Updated annoucement channel in server: ${server}, dmID=${dmID}`)
                    }
                });
            }
            break;
        default: { message.reply("\nUsage: >setup (channelProperty) (#channelname)\nAllowed channelProperty's:\n| announcement\n| dm"); message.react("❌"); return; }
    }
    
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
    name: "setup",
    help: "Create an announcement or dm channel, See current [channelProperty] channel or Remove an announcement or dm channel.",
    usage: (">setup [channelProperty] #[channel]\n>setup [channelProperty]\n>setup remove [channelProperty]"),
    permissions: "MANAGE_CHANNELS"
}