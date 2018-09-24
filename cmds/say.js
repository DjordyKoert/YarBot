module.exports.run = async (bot, /* botconfig,*/ fs, message, args, con, server) => {
    if (!message.member.hasPermission("ADMINISTRATOR") && !message.author.id == process.env.Owner_id) { message.reply("No permission to use this command"); message.react("❌"); return; }
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