module.exports.run = async (bot, botconfig, fs, message, args, con, server) => {
    if (message.author.id == botconfig.Owner_id) {
        let txtmessage = args.slice(0).join(' ');
        if (txtmessage == "") { message.react("❌"); message.reply("Empty announcement message"); return; }
        console.log('\x1b[42m%s\x1b[0m: ',"Starting announcement");
        con.query(`SELECT * FROM ssetup WHERE announcementID !=""`, (err, rows) => {
            if (err) { let errstack = err.stack; createLog(fs, err, errstack); return; }
            let i = 0;
            whileLoop();
            function whileLoop() {
                setTimeout(function () {
                    var getServerID = rows[i].serverID;
                    var getAnnouncementID = rows[i].announcementID;
                    console.log("\x1b[32m",getServerID);
                    console.log("\x1b[35m",getAnnouncementID);
                    try {
                        bot.guilds.get(getServerID).channels.get(getAnnouncementID).send(`${txtmessage}`);
                    } catch (err) { //If bot can't reach the server. AKA bot left the server
                        if (err) { let errstack = err.stack; let extraMessage = "Bot probably left server and can't send an announcement. Removing server from database"; createLog(fs, err, errstack, extraMessage); }
                        con.query(`DELETE FROM ssetup WHERE serverID='${getServerID}'`);
                    }
                    i++;
                    if (i < rows.length) {
                        whileLoop();
                    }
                }, 1000) //Timer becuz discord
            }
        });
        message.react("✅");
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
    name: "announcement",
    help: "[DEV ONLY] Send an announchement to every server that has setup an annoucement channel using the **setup** command.",
    usage: ">announcement [message]",
    permissions: "[DEV ONLY]"
}