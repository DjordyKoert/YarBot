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
                        value: `**Tag:** ${message.author.tag}\n**Joined ${message.guild.name} at:** ${memberAuthor.joinedAt}\n**In Voice Channel: **${voiceName}\nHighest Role: ${memberAuthor.highestRole}`
                    }, {
                        name: `**Message:**`,
                        value: `${ticketMessage}\n\n\n**React with ✅ if the ticket has been completed.*\nTickets can't be closed after 1 Week\nThis message was created at: ${message.createdAt}`
                    }
                    ]
                }
            }).then(function (message) {
                message.react("🕐");
                message.awaitReactions(reaction => {
                    if (reaction.emoji.name == '✅') {
                        bot.users.get(messageAuthor).send(`Your ticket has been closed by ${reaction.users.first().tag} in ${reaction.message.channel.guild}`)
                        message.delete();
                    }
                }, { time: 604800000 })
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
