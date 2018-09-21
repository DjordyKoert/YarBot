module.exports.run = async (bot, botconfig, message, args) => {
  if (botconfig.status == "disabled") return message.reply("Bot is disabled by developer");
  if (!args[0]) { message.reply("Shaking this ball won't do anything if there isn't a question."); message.react("❌"); return; }
  const answers = [
    "Probably",
    "The almighty 8ball says yes",
    "Perhaps",
    "Most likely",
    "My sources say no",
    "Don't count on it",
    "It is certain",
    'Concentrate and ask again.',
    'It is decidedly so.',
    'Better not tell you now.',
    'Very doubtful.',
    'Yes - definitely.',
  ]
  let answer = answers[Math.floor(Math.random() * answers.length)];
  message.reply(`The 8ball says: ${answer}`);
  message.react("✅");
}

module.exports.help = {
  name: "8ball",
  help: "Ask the magic 8ball a question.",
  usage: ">8ball [question]",
  permissions: "NONE"
}