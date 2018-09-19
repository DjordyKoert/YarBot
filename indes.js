const botconfig = require("./botconfig.json");
const Discord = require("discord.js");
const bot = new Discord.Client({ disableEveryone: true });
const guild = new Discord.Guild();
const mysql = require("mysql");

var prefix = botconfig.prefix;


bot.on("ready", async () => {
  console.log(`Bot has started, with ${bot.users.size} users, in ${bot.channels.size} channels in ${bot.guilds.size} servers.`);
  if (guild.available) {
    console.log("Guild is available.");
  }
});

var con = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  database: "bottest"
});

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

    if (rows.length < 1) {
      sql = `INSERT INTO Test (id, rep) VALUES ('${message.author.id}', 0)`;
      con.query(sql);
    }
  });
  if (!message.guild) return;
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  //Command checker
  switch (command) {
    case "name":
      message.reply(`Hallow ${message.author}`);
      break;
    case "quitbot":
      if (message.author.id == 228163151219130368) {
        message.reply("Permission to use this command");
        var child_process = require('child_process');

        child_process.exec('run', function (error, stdout, stderr) {
          console.log(stdout);
        });
        throw new Error("Stopped bot");
      }
      else message.reply("No permission to use this command");
      break;
  }
});
bot.login(botconfig.token);
