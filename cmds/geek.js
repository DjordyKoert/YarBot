module.exports.run = async (bot, botconfig, fs, message, args, con, server) => {
    const Discord = require("discord.js");
    const superagent = require("superagent")
    let { body } = await superagent.get(`https://geek-jokes.sameerkumar.website/api`);
    let embed = new Discord.RichEmbed()
        .setColor(0x00ffff)
        .addField("Geek Joke", body)
    message.channel.send(embed)
}

module.exports.help = {
    name: "geek",
    help: "Show geek joke",
    usage: ">geek",
    permissions: "NONE",
    example: ">geek"
}