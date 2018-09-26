module.exports.run = async (bot, botconfig, fs, message, args, con, server) => {
    if (message.channel.type == "dm") { message.reply("This command can only be used in a server"); message.react("❌"); return; }

    con.query(`SELECT * FROM ssetup WHERE serverID='${server.id}' AND ticketID !=''`, (err, rows) => {
        if (err) { let errstack = err.stack; createLog(fs, err, errstack); return; }
        //Geen channel available
        if (rows.length == 0) {
            message.reply("No ticket channel available");
            return;
        } else {
            let ticketMessage = args.slice(0).join(' ');
            if (ticketMessage == "") { message.react("❌"); message.reply("Empty ticket message"); return; }
            let ticketChannel = rows[0].ticketID;
            let memberAuthor = message.guild.members.get(message.author.id);
            let voiceName = memberAuthor.voiceChannel
            let messageAuthor = message.author.id;
            if (!voiceName) voiceName = "None";
            else voiceName = memberAuthor.voiceChannel.name;

            bot.channels.get(ticketChannel).send({
                embed: {
                    color: (0, 0, 133),
                    author: {
                        name: `Ticket created by ${message.author.tag}`
                    },
                    fields: [{
                        name: `**Information about ${message.author.username}:**`,
                        value: `**Tag:** ${message.author.tag}\n**Joined ${message.guild.name} at:** ${memberAuthor.joinedAt}\n**In Voice Channel: **${voiceName}\n**Highest Role:** ${memberAuthor.highestRole}\n`
                    }, {
                        name: `**Message:**`,
                        value: "```" + ticketMessage + "```" + `\n\n\n**React with ✅ if the ticket has been completed Or ❌ to deny ticket**\nTickets can't be closed after 1 Week\nThis message was created at: ${message.createdAt}`
                    }
                    ]
                }
            }).then(function (message) {

                message.awaitReactions(reaction => {
                    if (reaction.emoji.name == '✅') {
                        bot.users.get(messageAuthor).send(`✅ Your ticket has been closed by __${reaction.users.first().tag}__ in __[${reaction.message.channel.guild}]__`)
                        message.delete();
                    }
                    else if (reaction.emoji.name == '❌') {
                        bot.users.get(messageAuthor).send(`❌ Your ticket has been denied by __${reaction.users.first().tag}__ in __[${reaction.message.channel.guild}]__\n\n**Your ticket:**` + "```" + ticketMessage + "```")
                        message.delete();
                    }
                }, { time: 604800000 })
                message.react("🕐");
            }).catch(err => {
                console.log(err);
            })
            message.react("✅");
        }
    });
}
module.exports.help = {
    name: "ticket",
    help: "Open a ticket if you need help.",
    usage: ">ticket [message]",
    permissions: "NONE"
}
