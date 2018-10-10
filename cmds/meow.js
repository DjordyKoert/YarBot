module.exports.run = async (bot, botconfig, fs, message, args, con, server) => {
    const Discord = require("discord.js");
    const superagent = require("superagent")
    let { body } = await superagent.get(`http://aws.random.cat/meow`);
    let embed = new Discord.RichEmbed()
        .setTitle(`Meow`)
        .setColor(0x00ffff)
        .setImage(body.file)
    message.channel.send(embed)
}

module.exports.help = {
    name: "meow",
    help: "Show cat pic",
    usage: ">meow",
    permissions: "NONE",
    example: ">meow"
}