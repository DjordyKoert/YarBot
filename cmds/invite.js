module.exports.run = async (bot,  botconfig, fs, message, args, con, server) => {
    message.author.send({
        embed: {
            color: (133, 0, 255),
            title: "Get YarBot on your server.",
            description: "[invite YarBot to your server](https://discordapp.com/oauth2/authorize?&client_id=435166838318563328&scope=bot&permissions=230948086)",
            footer: {
                icon: bot.user.avatarURL,
                text: "Made by Yarink#4414"
            },
        }
    });
    message.react("✅");
}

module.exports.help = {
    name: "invite",
    help: "Sends you the YarBot invite link",
    usage: ">invite",
    permissions: "NONE"
}