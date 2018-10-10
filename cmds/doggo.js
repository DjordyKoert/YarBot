module.exports.run = async (bot, botconfig, fs, message, args, con, server) => {
    const Discord = require("discord.js");
    const superagent = require("superagent")
    let { body } = await superagent.get(`https://random.dog/woof.json`);
    let embed = new Discord.RichEmbed()
        .setTitle(`Doggo`)
        .setColor(0x00ffff)
        .setImage(body.url)
    message.channel.send(embed)
}

module.exports.help = {
    name: "doggo",
    help: "Show doggo pic",
    usage: ">doggo",
    permissions: "NONE",
    example: ">doggo"
}