module.exports.run = async (bot, botconfig, fs, message, args, con, server) => {
    //Help to user
    if (message.mentions.users.first() == args[0]) {
        let Mention = message.mentions.users.first();
        bot.users.get(Mention.id).send({ //Fix dit crasht
            embed: {
                color: (133, 0, 255),
                title: "Help",
                description: "[SourceCode (github)](https://github.com/DjordyKoert/YarBot)",
                footer: {
                    icon: bot.user.avatarURL,
                    text: "Made by Yarink#4414"
                },
                author: {
                    name: `👑 List of commands for ${bot.user.username} (send by: ${message.author.tag})👑`,
                },
                fields: [{
                    name: "General commands",
                    value: "```\nhelp\ninvite\nsuggestion [title], [message]\ndm [username] [message]\nuserinfo [username]```"
                }, {
                    name: "🕶Fun Commands",
                    value: "```8ball```"
                }, {
                    name: "🛠 Admin Commands",
                    value: "```\nsetup [channelProperty] #[channel]\nsay```"
                }, {
                    name: "Note",
                    value: "```Prefix : '>'\nUse >help [command] for more info and usage```"
                }
                ]
            }
        });
        message.react("✅");
    }
    //Help specific command
    else if (args[0]) {
        args[0] = args[0].toLowerCase();
        let cmd = bot.commands.get(args[0]);
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
            message.react("✅");
        } else { message.reply("not a command!"); message.react("❌"); }
    }
    //Help
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
                    name: "General commands",
                    value: "```\nhelp\ninvite\nsuggestion [title], [message]\ndm [username] [message]\nuserinfo [username]```"
                }, {
                    name: "🕶Fun Commands",
                    value: "```8ball```"
                }, {
                    name: "🛠 Admin Commands",
                    value: "```\nsetup [channelProperty] #[channel]\nsay```"
                }, {
                    name: "Note",
                    value: "```Prefix : '>'\nUse >help [command] for more info and usage```"
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