module.exports.run = async (bot, botconfig, fs, message, args, con, server) => {
    //Create embed
    if (args[0]) {
        args[0] = args[0].toLowerCase();
        let cmd = bot.commands.get(args[0]);
        console.log(cmd)
        if (cmd) {
            message.author.send({
                embed: {
                    color: (133, 0, 255),
                    title: ">" + cmd.help.name,
                    description: `[SourceCode (github)](https://github.com/DjordyKoert/YarBot/blob/master/cmds/${args.shift().toLowerCase()}.js)`,
                    fields: [{
                        name: "Info",
                        value: "```" + cmd.help.help + "```",
                    }, {
                        name: "Usage",
                        value: "```" + cmd.help.usage + "```"
                    }, {
                        name: "Permissions needed:",
                        value: "```" + cmd.help.permissions + "```"
                    }],
                    footer: {
                        icon: bot.user.avatarURL,
                        text: "Made by Yarink#4414"
                    }
                }
            });
        } else { message.reply("not a command!") }
    }
    else {
        message.author.send({
            embed: {
                color: (133, 0, 255),
                title: "Help",
                description: "[SourceCode (github)](https://github.com/DjordyKoert/YarBot)",
                footer: {
                    icon: bot.user.avatarURL,
                    text: "Made by Yarink#4414"
                },
                author: {
                    name: `👑 List of commands for ${bot.user.username}👑`,
                },
                fields: [{
                    name: "👨🏼‍💻 General commands",
                    value: "```help -Shows this message\nhoi -Get a nice message\ninvite -Shows YarBot invite link```"
                }, {
                    name: "Fun Commands",
                    value: "```8ball -Ask the magic 8ball a question```"
                }, {
                    name: "Admin Commands",
                    value: "```setup -Create an announcement channel or see current announcement channel\n|Usage: setup (channelProperty) #(yourchannel)\n\nsay -Let the bot send a message```"
                }, {
                    name: "Note",
                    value: "```Prefix : '>'```"
                }
                ]
            }
        });
        message.react("✅");
    }
}

module.exports.help = {
    name: "help",
    help: "Show list of command or info about a command",
    usage: ">help [command]",
    permissions: "NONE"
}