const botconfig = require("./botconfig.json");
const Discord = require("discord.js");
const bot = new Discord.Client({ disableEveryone: true });
const fs = require("fs");
const mysql = require("mysql");
const prefix = botconfig.prefix;
bot.commands = new Discord.Collection();

bot.on("ready", async () => {
  console.log(`${bot.user.username} has started, with ${bot.users.size} users, in ${bot.channels.size} channels in ${bot.guilds.size} servers.`);
  bot.user.setActivity(`YarBot in ${bot.guilds.size} servers, Use >help for help`);
});

//Create DB connection
const con = mysql.createConnection({
  host: botconfig.host,
  password: botconfig.password,
  port: botconfig.port,
  user: botconfig.user,
  database: botconfig.database
});

//DB error
con.connect(err => {
  if (err) { let errstack = err.stack; createLog(fs, err, errstack); return; }
  console.log("Connected to database");
});

//Bot join server
bot.on("guildCreate", guild => {
  bot.user.setActivity(`YarBot in ${bot.guilds.size} servers, Use >help for help`);
  con.query(`SELECT * FROM ssetup WHERE serverID='${guild.id}'`, (err, rows) => {
    if (err) { let errstack = err.stack; createLog(fs, err, errstack); return; }
    //If server doesn't already have an announcement channel
    if (rows.length == 0) {
      con.query(`INSERT INTO ssetup (serverID, serverName) VALUES ('${guild.id}', '${guild.name}')`);
      console.log(`New server added: ${guild.id}`)
    } else {
      con.query(`UPDATE ssetup SET serverName='${guild.name}'WHERE serverID='${guild.id}'`);
      console.log(`Updated serverName from: ${guild.id}, serverName=${guild.name}`)
    }
  });
})

//Bot leave server
bot.on("guildDelete", guild => {
  let server = guild.id;
  bot.user.setActivity(`YarBot in ${bot.guilds.size} servers, Use >help for help`);
  con.query(`SELECT * FROM ssetup WHERE serverID='${server.id}'`, (err, rows) => {
    if (err) { let errstack = err.stack; createLog(fs, err, errstack); return; }
    if (!rows.length == 0) {
      con.query(`DELETE FROM ssetup WHERE serverID='${server.id}'`);
      console.log(`Server removed, because bot left: ${server.id}`)
    }
  });
})

//Command Handler
fs.readdir("./cmds/", (err, files) => {
  if (err) { let errstack = err.stack; createLog(fs, err, errstack); return; }
  let jsfiles = files.filter(f => f.split(".").pop() === "js");
  if (jsfiles.length <= 0) return console.log("No command files found");

  console.log(`Found ${jsfiles.length} command files`);
  jsfiles.forEach((f, i) => {
    let props = require(`./cmds/${f}`);
    console.log(`${i + 1}: ${f} loaded!`);
    bot.commands.set(props.help.name, props);
  });
});

//On message handler
bot.on("message", async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(botconfig.prefix)) return;
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  let cmd = bot.commands.get(command);
  let server = message.guild;

  if (cmd) { cmd.run(bot, botconfig, fs, message, args, con, server); }
  else { message.reply("Not a command, use >help for a list of commands"); message.react("❌"); return; }
});
bot.login(botconfig.token);