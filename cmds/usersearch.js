module.exports.run = async (bot, botconfig, fs, message, args, con, server) => {
    const sm = require('string-similarity')

    let members = [];
    let memberids = [];

    message.guild.members.forEach(function (member) {
        members.push(member.user.username);
        memberids.push(member.id);
    });

    let match = sm.findBestMatch(args.join(' '), members);
    let username = match.bestMatch.target; // This now holds the username of the bestmatch.

    let member = message.guild.members.get(memberids[members.indexOf(username)]); // We can view this from the out, in. It first gets the index of username, and finds it in members, and since indexes and members have the same values/length it will show the ID there, which can be translated into members.

    message.channel.send(`First user found: ${member}`)
}

module.exports.help = {
    name: "8ball",
    help: "Ask the magic 8ball a question.",
    usage: ">8ball [question]",
    permissions: "NONE"
}
