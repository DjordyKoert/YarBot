module.exports.run = async (bot, botconfig, fs, message, args, con, server) => {
    if (message.channel.type == "dm") { message.reply("This command can only be used in a server"); message.react("❌"); return; }
    const sm = require('string-similarity')

    let members = [];
    let memberids = [];

    message.guild.members.forEach(function (member) {
        members.push(member.user.username);
        memberids.push(member.id);
    });

    let match = sm.findBestMatch(args.join(' '), members);
    let username = match.bestMatch.target; // This now holds the username of the bestmatch.
    let member = message.guild.members.get(memberids[members.indexOf(username)]);
    message.channel.send(`First user found: ${member}`)
}

module.exports.help = {
    name: "userinfo",
    help: "Search user info",
    usage: ">userinfo [username]",
    permissions: "NONE"
}
