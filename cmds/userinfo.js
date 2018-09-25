module.exports.run = async (bot, botconfig, fs, message, args, con, server) => {
    if (message.channel.type == "dm") { message.reply("This command can only be used in a server"); message.react("❌"); return; }
    if (message.mentions.channels.first() == args[0] || message.mentions.everyone || message.mentions.roles.first() == args[0]) { message.reply("Mention someone"); message.react("❌"); return; };
    if (message.mentions.members.first() != args[0] && !args[0]) { message.reply("Mention someone"); message.react("❌"); return; };
    const sm = require('string-similarity')

    let members = [];
    let memberids = [];

    message.guild.members.forEach(function (member) {
        members.push(member.displayName);
        memberids.push(member.id);
    });

    let match = sm.findBestMatch(args.join(' '), members);
    let username = match.bestMatch.target;
    let member = message.mentions.members.first() || message.guild.members.get(memberids[members.indexOf(username)]);
    //Send info
    if (member.nickname === null) nickname = "None";
    else nickname = member.nickname;
    message.channel.send({
        embed: {
            color: (133, 0, 255),
            description: `Username: ${member.user.tag} (${member.user.id})`,
            footer: {
                icon: bot.user.avatarURL,
                text: "Made by Yarink#4414"
            },
            author: {
                name: `${member.user.username}'s info`,
            },
            fields: [{
                name: `Nickname:`,
                value: '```' + nickname + '```'
            }, {
                name: `Highest role:`,
                value: "" + member.highestRole
            }, {
                name: `Bot:`,
                value: '```' + member.user.bot + '```'
            }, {
                name: `Joined discord at:`,
                value: '```' + member.user.createdAt + '```'
            }, {
                name: `Joined ${server.name} at:`,
                value: '```' + member.joinedAt + '```'
            },
            ]
        }
    });

    message.react("✅");
}

module.exports.help = {
    name: "userinfo",
    help: "Search user info",
    usage: ">userinfo [username]",
    permissions: "NONE"
}