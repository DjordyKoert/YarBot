
module.exports.run = async (bot, botconfig, fs, message, args, con, server) => {
    const Discord = require("discord.js");
    const Client = require('fortnite');
    const ftn = new Client(botconfig.ftnapi);

    if (args[0] == "leaks") {
        let embed = new Discord.RichEmbed()
            .setColor("#ff9933")
            .setTitle("Latest leak:")
            .setDescription("[Fortnite Leaks Reddit](https://www.reddit.com/r/FortniteLeaks/comments/9my37w/v602_cosmetics/)")
            .setImage("https://i.redd.it/sqtedkauzbr11.png")
        message.channel.send(embed);
        return;
    }

    if (args[0] == "search") {
        const superagent = require("superagent");
        let searchTerm = args.slice(1).join(' ');
        if (!searchTerm) { message.reply(`Enter a search term`); message.react("❌"); return; }
        let { body } = await superagent
            .get(`https://fnbr.co/api/images?search=${searchTerm}`)
            .set('x-api-key', botconfig.FNBRapi);
        if (!body.data[0]) { message.reply(`${searchTerm} not found`); message.react("❌"); return; }
        else {
            let itemSearch = body.data[0]
            let embed = new Discord.RichEmbed()
                .setColor("#ff9800")
                .setTitle("Fortnite item info")
                .addField("Name",
                    "```" + `${itemSearch.name}` + "```"
                )
                .addField("Rarity",
                    "```" + `${itemSearch.rarity}` + "```"
                )
                .addField("Type",
                    "```" + `${itemSearch.type}` + "```"
                )
                .addField("Price",
                    "```" + `${itemSearch.price}` + "```"
                )
                .setThumbnail(itemSearch.priceIconLink)
                .setImage(itemSearch.images.icon)
            message.author.send(embed)
            message.react("✅");
        }
        return
    }


    if (args[0] == "shop" || args[0] == "store") {
        const superagent = require("superagent");
        let dailyShop = weeklyShop = featuredImg = "";
        let { body } = await superagent
            .get("https://fnbr.co/api/shop")
            .set('x-api-key', botconfig.FNBRapi);

        body.data.featured.forEach(element => {
            if (element.images.icon == false) ImgLink = element.images.gallery;
            else ImgLink = element.images.icon
            weeklyShop += `[${element.name}](${ImgLink})- ${element.price} Vbucks \n`
        });
        body.data.daily.forEach(element => {
            if (element.images.icon == false) ImgLink = element.images.gallery;
            else ImgLink = element.images.icon
            dailyShop += `[${element.name}](${ImgLink})- ${element.price} Vbucks \n`
        });
        let length = body.data.featured.length - 1
        let Rnum = Math.floor(Math.random() * length)
        if (body.data.featured[Rnum].images.icon == false) { Rimg = body.data.featured[Rnum].images.gallery; Rinfo = `${body.data.featured[Rnum].name}- ${body.data.featured[Rnum].price} Vbucks`; }
        else { Rimg = body.data.featured[Rnum].images.icon; Rinfo = `${body.data.featured[Rnum].name}- ${body.data.featured[Rnum].price} Vbucks`; }
        let embed = new Discord.RichEmbed()
            .setColor("#ff9800")
            .setTitle("Fortnite Item shop")
            .addField("Daily",
                `${dailyShop} \n`
            )
            .addField("Featured",
                `${weeklyShop}\n`
            )
            .setImage(Rimg)
            .setFooter(Rinfo)
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
            matchesPlayed = parseFloat(stats.matches)
            wins = parseFloat(stats.wins)
            tempwinsPercentage = ((wins / matchesPlayed) * 100).toFixed(2)
            winsPercentage = `${tempwinsPercentage}%`
            kills = stats.kills
            kd = stats.kd
        }
        else if (gamemode == "duo") {
            stats = data.stats.duo;
            score = stats.score
            matchesPlayed = parseInt(stats.matches)
            wins = parseInt(stats.wins)
            tempwinsPercentage = ((wins / matchesPlayed) * 100).toFixed(2)
            winsPercentage = `${tempwinsPercentage}%`
            kills = stats.kills
            kd = stats.kd
        }
        else if (gamemode == "squad") {
            stats = data.stats.squad;
            score = stats.score
            matchesPlayed = parseInt(stats.matches)
            wins = parseInt(stats.wins)
            tempwinsPercentage = ((wins / matchesPlayed) * 100).toFixed(2)
            winsPercentage = `${tempwinsPercentage}%`
            kills = stats.kills
            kd = stats.kd
        }
        else {
            stats = data.stats.lifetime;
            score = stats[6]['Score']
            matchesPlayed = stats[7]['Matches Played']
            wins = stats[8]['Wins']
            tempwinsPercentage = ((wins / matchesPlayed) * 100).toFixed(2)
            winsPercentage = `${tempwinsPercentage}%`
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
