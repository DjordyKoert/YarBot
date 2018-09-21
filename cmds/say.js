module.exports.run = async (bot, botconfig, message, args) => {
    if (botconfig.status == "disabled") return message.reply("Bot is disabled by developer");
    if (!message.member.hasPermission("ADMINISTRATOR")) { message.reply("No permission to use this command"); message.react("❌"); return; }
    let txtmessage = args.slice(0).join(' ');
    if (txtmessage == "") { message.react("❌"); message.reply("Empty message"); return; }
    message.delete();
    message.channel.send(txtmessage);
}

module.exports.help = {
    name: "say",
    help: "Let the bot speak!",
    usage: ">say  [message]",
    permissions: "ADMINISTRATOR"
  }