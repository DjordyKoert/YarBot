module.exports.run = async (bot, botconfig, fs, message, args, con, server) => {
  const Discord = require("discord.js");
  const superagent = require("superagent")
  if (!args[0]) { message.reply(`Kinda hard to search nothing`); message.react("❌"); return; }
  let arg = args.slice(0).join(' ');

  let { body } = await superagent.get(`http://api.urbandictionary.com/v0/define?term=${arg}`);
  if (!body.list[0]) { message.reply(`No definition found`); message.react("❌"); return; }
  let embed = new Discord.RichEmbed()
    .setTitle(`The definition of: ${body.list[0].word}`)
    .setColor(0x6832e3)
    .setAuthor(`Author: ${body.list[0].author}`)
    .setURL(body.list[0].permalink)
    .addField("Word", body.list[0].word)
    .addField("Definition", body.list[0].definition)
    .addField("Example", body.list[0].example)
    .addField("Thumbs up", body.list[0].thumbs_up)
    .addField("Thumbs down", body.list[0].thumbs_down);
  message.channel.send(embed)
}
module.exports.help = {
  name: "urban",
  help: "Returns a definition of a word.",
  usage: ">urban [word]",
  permissions: "NONE",
  example: ">urban yeet"
}