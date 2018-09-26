module.exports.run = async (bot, botconfig, fs, message, args, con, server) => {
    if (message.channel.type == "dm") { message.reply("This command can only be used in a server"); message.react("❌"); return; }
    //Check permissions
    if (!message.member.hasPermission("MANAGE_CHANNELS")) { message.reply("No permission to use this command"); message.react("❌"); return; };
    //Check if server is in database before continuing
    con.query(`SELECT serverID FROM ssetup WHERE serverID='${server.id}'`, (err, rows) => {
        if (err) { let errstack = err.stack; createLog(fs, err, errstack); return; }
        if (rows.length == 0) {
            con.query(`INSERT INTO ssetup (serverID, serverName) VALUES ('${server.id}', '${server.name}')`);
            console.log(`New server added: ${server.id}, Trough setup command`);
        }
    });
    //Remove channel
    if (!args[0]) { message.reply("Use >help setup to see how the command works"); message.react("❌"); return; }
    //Als er een channel geremoved moet worden
    else if (args[0] == "remove" && (args[1] == "ticket" || args[1] == "announcement" || args[1] == "dm" || args[1] == "commands")) {
        con.query(`SELECT * FROM ssetup WHERE serverID='${server.id}' AND ${args[1]}ID !=''`, (err, rows) => {
            if (err) { let errstack = err.stack; createLog(fs, err, errstack); return; }
            if (rows.length == 0) { message.reply(`No ${args[1]} channel available`); message.react("❌"); return; }
            con.query(`UPDATE ssetup SET ${args[1]}ID="" WHERE serverID='${server.id}'`);
            message.react("✅");
            return;
        });

    }
    else if (args[0] == "remove" && (!args[1] || args[1] == "")) { message.react("❌"); message.reply("Correct usage: >setup remove (channelProperty)"); return; }


    //Verkorte case versie support WEL All
    else if (args[0] == "dm" || args[0] == "commands") {
        //Show current x channel
        if (!message.mentions.channels.first() && args[1] != "all") {
            con.query(`SELECT * FROM ssetup WHERE serverID='${server.id}' AND ${args[0]}ID !=''`, (err, rows) => {
                if (err) { let errstack = err.stack; createLog(fs, err, errstack); return; }
                if (rows.length == 0) { message.reply(`No ${args[0]} channel available`); message.react("❌"); return; }
                if (args[0] == "dm") message.reply(`the current ticket channel is: ${rows[0].dmID}`);
                else if (args[0] == "commands") message.reply(`the current commands channel is: ${rows[0].commandsID}`);
                return;
            });
        }
        else {
            let channelPropertyA = message.mentions.channels.first() || args[1];
            con.query(`SELECT * FROM ssetup WHERE serverID='${server.id}' AND ${args[0]}ID !=''`, (err, rows) => {
                if (err) { let errstack = err.stack; createLog(fs, err, errstack); return; }
                //If server doesn't already have an x channel
                if (rows.length == 0) {
                    con.query(`UPDATE ssetup SET ${args[0]}ID='${channelPropertyA}', serverName='${server.name}'WHERE serverID='${server.id}'`);
                    message.react("✅");
                    console.log(`New ${args[0]} channel in server: ${server.id}, ${args[0]}ID=${channelPropertyA}`)
                } //If server already has an x channel
                else {
                    con.query(`UPDATE ssetup SET ${args[0]}ID='${channelPropertyA}', serverName='${server.name}'WHERE serverID='${server.id}'`);
                    message.react("✅");
                    console.log(`Updated ${args[0]} channel in server: ${server.id}, ${args[0]}ID=${channelPropertyA}`)
                }
            });
        }
    }


    //Verkorte case versie support GEEN All
    else if (args[0] == "ticket" || args[0] == "announcement") {
        //Show current x channel
        if (!message.mentions.channels.first()) {
            con.query(`SELECT * FROM ssetup WHERE serverID='${server.id}' AND ${args[0]}ID !=''`, (err, rows) => {
                if (err) { let errstack = err.stack; createLog(fs, err, errstack); return; }
                if (rows.length == 0) { message.reply(`No ${args[0]} channel available`); message.react("❌"); return; }
                if (args[0] == "ticket") message.reply(`the current ticket channel is: <#${rows[0].ticketID}>`);
                else if (args[0] == "announcement") message.reply(`the current announcement channel is: <#${rows[0].announcementID}>`);
                return;
            });
        }
        else {
            let channelProperty = message.mentions.channels.first();
            con.query(`SELECT * FROM ssetup WHERE serverID='${server.id}' AND ${args[0]}ID !=''`, (err, rows) => {
                if (err) { let errstack = err.stack; createLog(fs, err, errstack); return; }
                //If server doesn't already have x channel
                if (rows.length == 0) {
                    con.query(`UPDATE ssetup SET ${args[0]}ID='${channelProperty.id}', serverName='${server.name}'WHERE serverID='${server.id}'`);
                    message.react("✅");
                    console.log(`New ${args[0]} channel in server: ${server.id}, ${args[0]}ID=${channelProperty.id}`)
                } //If server already has an x channel
                else {
                    con.query(`UPDATE ssetup SET ${args[0]}ID='${channelProperty.id}', serverName='${server.name}'WHERE serverID='${server.id}'`);
                    message.react("✅");
                    console.log(`Updated ${args[0]} channel in server: ${server.id}, ${args[0]}ID=${channelProperty.id}`)
                }
            });
        }
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
    usage: (">setup [channelProperty] #[channel]\n>setup [channelProperty]\n>setup remove [channelProperty]\n\nChannelProperty's:\n| announcement\n| ticket\n\n------{Accepts 'all' as #[channel]}------\n| commands\n| dm\n(If a commands or dm channel is not set it defaults to 'all')"),
    permissions: "MANAGE_CHANNELS",
    example: ">setup commands #Bot-spam-channel"
}