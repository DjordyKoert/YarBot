module.exports.run = async (bot, botconfig, fs, message, args, con, server) => {
    if (botconfig.status == "disabled") return message.reply("Bot is disabled by developer");
    let BeforeSplit = args.slice(0).join(' ');
    let Split = BeforeSplit.split(',')
    if (!Split[0]) { message.react("❌"); message.reply("Please enter a title, usage: >suggestion (title)**,** (suggestion)"); return; }
    if (!Split[1]) { message.react("❌"); message.reply("Empty suggestion message, usage: >suggestion (title)**,** (suggestion)"); return; }

    let testServer = "492055519050203137";
    let suggestionChannel = "492756643239559168";

    bot.guilds.get(testServer).channels.get(suggestionChannel).send({
        embed: {
            color: (133, 0, 255),
            author: {
                name: `Suggestion by: ${message.author.tag}`,
            },
            fields: [{
                name: `Title: ${Split[0]}`,
                value: `${Split[1]}`
            }]
        }
    });
    message.react("✅");
}

module.exports.help = {
    name: "suggestion",
    help: "Send a suggestion to the Developer to add something inside the bot.",
    usage: ">suggestion [title], [message]",
    permissions: "NONE"
}