module.exports.run = async (bot, botconfig, fs, message, args, con) => {
    if (message.author.id == "228163151219130368") {
        //Update Status
        botconfig.status = "enabled";
        fs.writeFile("./botconfig.json", JSON.stringify(botconfig), function (err) {
            if (err) { let errstack = err.stack; createLog(fs, err, errstack); return; }
        });
        message.author.send("Bot Enabled.");
        console.log("Bot Enabled.");
        message.react("✅");
    }
}

module.exports.help = {
    name: "disable",
    help: "[DEV ONLY] Enables YarBot",
    usage: ">disable",
    permissions: "[DEV ONLY]"
}