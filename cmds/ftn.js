
module.exports.run = async (bot, botconfig, fs, message, args, con, server) => {
    const Discord = require("discord.js");
    const Client = require('fortnite');
    const ftn = new Client(botconfig.ftnapi);

    if (!args[0]) { message.reply(`Please mention a username`); message.react("❌"); return; }
    let BeforeSplit = args.slice(0).join(' ');
    let Split = BeforeSplit.split(',')

    let username = Split[0];
    let platform = Split[1] || "pc"
    try {
        platform = platform.replace(/\s+/g, '');
    }catch (e){

    }
    if (!Split[0]) { message.react("❌"); message.reply("Please enter username"); return; }
    ftn.user(username, platform).then(data => {
        let lifetime = data.stats.lifetime;

        let score = lifetime[6]['Score']
        let matchesPlayed = lifetime[7]['Matches Played']
        let wins = lifetime[8]['Wins']
        let winsPercentage = lifetime[9]['Win%']
        let kills = lifetime[10]['Kills']
        let kd = lifetime[11]['K/d']

        let embed = new Discord.RichEmbed()
            .setTitle(`YarBot fortnite tracker`)
            .setAuthor(username)
            .addField("Wins", wins, true)
            .addField("Kills", kills, true)
            .addField("Score", score, true)
            .addField("Matches Played", matchesPlayed, true)
            .addField("Win%", winsPercentage, true)
            .addField("K/d", kd, true);
        message.channel.send(embed)

    }).catch(err => {
        console.log(err);
        message.channel.send(`Couldn't find ${username}, platform: ${platform} in database.`)
    })

}

module.exports.help = {
    name: "ftn",
    help: "Show fortnite stats",
    usage: ">ftn [name], [platform e.g:(pc, psn, xb1)]",
    permissions: "NONE",
    example: ">ftn Ninja"
}
