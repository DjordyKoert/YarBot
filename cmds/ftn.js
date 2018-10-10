
module.exports.run = async (bot, botconfig, fs, message, args, con, server) => {
    const Discord = require("discord.js");
    const Client = require('fortnite');
    const ftn = new Client(botconfig.ftnapi);

    if (args[0] == "shop" || args[0] == "store") {
        const superagent = require("superagent");
        let dailyShop = weeklyShop = featuredImg = "";
        let largest = price = 0;
        let { body } = await superagent
            .get("https://fnbr.co/api/shop")
            .set('x-api-key', botconfig.FNBRapi);

        body.data.featured.forEach(element => {
            if (element.price.includes(",")) price = parseInt(element.price.replace(",", ".")) * 1000
            else price = parseInt(element.price.replace(",", "."))
            if (element.images.gallery == false) ImgLink = element.images.icon;
            else ImgLink = element.images.gallery
            weeklyShop += `[${element.name}](${ImgLink})- ${price} Vbucks \n`

            if (price >= largest) {
                largest = price;
                if (element.images.gallery == false) featuredImg = element.images.icon;
                else featuredImg = element.images.gallery
            }
        });
        body.data.daily.forEach(element => {
            if (element.price.includes(",")) price = parseInt(element.price.replace(",", ".")) * 1000
            else price = parseInt(element.price.replace(",", "."))
            if (element.images.gallery == false) ImgLink = element.images.icon;
            else ImgLink = element.images.gallery
            dailyShop += `[${element.name}](${ImgLink})- ${price} Vbucks \n`
        });
        let embed = new Discord.RichEmbed()
            .setColor("#ff9800")
            .setTitle("Fortnite Item shop")
            .addField("Daily",
                `${dailyShop} \n`
            )
            .addField("Featured",
                `${weeklyShop}\n`
            )
            .setImage(featuredImg)
        message.author.send(embed)
        message.react("✅");
        return;
    }

    //Get stats
    const playstation = [
        "psn",
        "ps4",
        "ps",
        "playstation"
    ];
    const xbox = [
        "xbox",
        "xb1",
        "xbox1",
        "xb"
    ];
    if (!args[0]) { message.reply(`Please mention a username`); message.react("❌"); return; }
    let BeforeSplit = args.slice(0).join(' ');
    let Split = BeforeSplit.split(':')

    let username = Split[0];
    let gamemode = Split[1] || "lifetime"
    let platform = Split[2] || "pc"
    //Remove spaces
    try {
        platform = platform.replace(/\s+/g, '');
    } catch (e) {

    }
    try {
        gamemode = gamemode.replace(/\s+/g, '');
    } catch (e) {

    }

    if (playstation.indexOf(platform) > -1) platform = "psn";
    else if (xbox.indexOf(platform) > -1) platform = "xb1";

    if (!Split[0]) { message.react("❌"); message.reply("Please enter username"); return; }
    ftn.user(username, platform).then(data => {
        //Check which gamemode to get stats from
        if (gamemode == "solo") {
            stats = data.stats.solo;
            score = stats.score
            matchesPlayed = parseInt(stats.matches)
            wins = parseInt(stats.wins)
            winsPercentage = Math.floor(matchesPlayed / wins)
            kills = stats.kills
            kd = stats.kd
        }
        else if (gamemode == "duo") {
            stats = data.stats.duo;
            score = stats.score
            matchesPlayed = parseInt(stats.matches)
            wins = parseInt(stats.wins)
            winsPercentage = Math.floor(matchesPlayed / wins)
            kills = stats.kills
            kd = stats.kd
        }
        else if (gamemode == "squad") {
            stats = data.stats.squad;
            score = stats.score
            matchesPlayed = parseInt(stats.matches)
            wins = parseInt(stats.wins)
            winsPercentage = Math.floor(matchesPlayed / wins)
            kills = stats.kills
            kd = stats.kd
        }
        else {
            stats = data.stats.lifetime;
            score = stats[6]['Score']
            matchesPlayed = stats[7]['Matches Played']
            wins = stats[8]['Wins']
            winsPercentage = stats[9]['Win%']
            kills = stats[10]['Kills']
            kd = stats[11]['K/d']
        }

        let embed = new Discord.RichEmbed()
            .setTitle(`YarBot fortnite tracker`)
            .setAuthor(`${username}, ${gamemode}, ${platform}`)
            .addField("Wins", wins, true)
            .addField("Kills", kills, true)
            .addField("Score", score, true)
            .addField("Matches Played", matchesPlayed, true)
            .addField("Win%", winsPercentage, true)
            .addField("K/d", kd, true);
        message.channel.send(embed);
        message.react("✅");

    }).catch(err => {
        console.log(err);
        message.react("❌");
        message.channel.send(`Couldn't find ${username},  mode: ${gamemode}, platform: ${platform} in database.`)
    })

}

module.exports.help = {
    name: "ftn",
    help: "Show fortnite stats",
    usage: ">ftn [name]:[mode]:[platform]",
    permissions: "NONE",
    example: ">ftn Ninja:lifetime:pc"
}
