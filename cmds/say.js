module.exports.run = async (bot, botconfig, fs, message, args, con, server) => {
    if (message.channel.type == "dm") { message.reply("This command can only be used in a server"); message.react("❌"); return; }
    if (!message.member.hasPermission("ADMINISTRATOR") && !message.author.id == botconfig.Owner_id) { message.reply("No permission to use this command"); message.react("❌"); return; }
    let txtmessage = args.slice(0).join(' ');
    if (txtmessage == "") { message.react("❌"); message.reply("Empty message"); return; }
    message.delete();
    message.channel.send(txtmessage);
}

module.exports.help = {
    name: "say",
    help: "Let the bot speak!",
    usage: ">say  [message]",
    permissions: "ADMINISTRATOR",
    example: ">say Hi, I can speak now too"
  }