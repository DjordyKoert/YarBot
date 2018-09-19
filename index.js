const botconfig = require("./botconfig.json");
const Discord = require("discord.js");
const bot = new Discord.Client({ disableEveryone: true });
const fs = require("fs");
const mysql = require("mysql");

let prefix = botconfig.prefix;


bot.on("ready", async () => {
  console.log(`Bot has started, with ${bot.users.size} users, in ${bot.channels.size} channels in ${bot.guilds.size} servers.`);
  bot.user.setPresence({ status: "online", game: { name: `YarBot online in ${bot.guilds.size} servers` } })
});

//Create DB connection
const con = mysql.createConnection({
  host: botconfig.host,
  port: botconfig.port,
  user: botconfig.user,
  database: botconfig.database
});

//DB error
con.connect(err => {
  if (err) throw err;
  console.log("Connected to database");
});

//On message
bot.on("message", async message => {
  //Check if member is in database
  con.query(`SELECT * FROM Test WHERE id='${message.author.id}'`, (err, rows) => {
    if (err) console.log(err);
    let sql;
    //If member not in database add member
    if (rows.length < 1) {
      sql = `INSERT INTO Test (id, rep) VALUES ('${message.author.id}', 0)`;
      con.query(sql);
    }
  });

  //DM berichten
  if (!message.guild) {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    //Enable Bot
    switch (command) {
      //Enable Command
      case "enable":
        if (message.author.id == "228163151219130368") {
          //Update Status
          botconfig.status = "enabled";
          fs.writeFile("./botconfig.json", JSON.stringify(botconfig), function (err) {
            if (err) return console.log(err);
          });
          message.author.send("Bot Enabled.");
          console.log("Bot Enabled.");
        }
        break;

      //Disable Command
      case "disable":
        if (message.author.id == "228163151219130368") {
          //Update Status
          botconfig.status = "disabled";
          fs.writeFile("./botconfig.json", JSON.stringify(botconfig), function (err) {
            if (err) return console.log(err);
          });
          message.author.send("Bot Disabled.");
          console.log("Bot Disabled");
        }
        break;

      //Help Command
      case "help":
        message.author.send(`help is nog niet klaar ${message.author.id}`);
        break;
    }
    return;
  };


  //Server commands
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;
  if (botconfig.status == "disabled") return message.reply("Bot is disabled by developer");
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  //Command checker
  switch (command) {
    case "hoi":
      message.channel.send(`Hallow ${message.author}`);
      break;
    case "help":
      message.author.send(`help is nog niet klaar ${message.author.id}`);
      break;
    default: message.reply(`Unrecognized command use !help for a list of commands.`);
  }
});
bot.login(botconfig.token);