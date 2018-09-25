const botconfig = require("./botconfig.json");
const Discord = require("discord.js");
const bot = new Discord.Client({ disableEveryone: true });
const fs = require("fs");
const mysql = require("mysql");
const prefix = botconfig.prefix;
bot.commands = new Discord.Collection();

let botTesting = true;

columns = [
  "serverID",
  "serverName",
  "announcementID",
  "ticketID",
  "dmID",
  "commandsID"
]

bot.on("ready", async () => {
  console.log(`${bot.user.username} has started, with ${bot.users.size} users, in ${bot.channels.size} channels in ${bot.guilds.size} servers.`);
  bot.user.setActivity(`YarBot in ${bot.guilds.size} servers, Use >help for help`);
});

if (botTesting) {
  con = mysql.createConnection({
    host: botconfig.testhost,
    port: botconfig.testport,
    user: botconfig.testuser,
    database: botconfig.testdatabase
  });
  console.log('\x1b[31m%s\x1b[0m: ', "Entering testing mode...")
}
else {
  con = mysql.createConnection({
    host: botconfig.host,
    password: botconfig.password,
    port: botconfig.port,
    user: botconfig.user,
    database: botconfig.database
  });
  console.log('\x1b[32m%s\x1b[0m: ', "Entering online mode...")
}

//DB error
con.connect(err => {
  if (err) { let errstack = err.stack; createLog(fs, err, errstack); return; }
  console.log('\x1b[32m%s\x1b[0m: ', "Connected to database");
});

//Create table if not exist
con.query(`CREATE TABLE IF NOT EXISTS ssetup (
  serverID varchar(255) NOT NULL,
  serverName varchar(255) NOT NULL,
  announcementID varchar(255) NOT NULL,
  dmID varchar(255) NOT NULL,
  ticketID varchar(255) NOT NULL,
  commandsID varchar(255) NOT NULL)`
)

//Create column if not exists
columns.forEach(element => {
  con.query(`ALTER TABLE ssetup ADD ${element} varchar(255) NOT NULL`, err => {
    if (err) console.log(`${element} already exists`)
    else console.log(`Creating ${element}...`)
  });
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

//Channeldelete
bot.on("channelDelete", channel => {
  for (let i = 2; i < (columns.length - 2); i++) {
    con.query(`UPDATE ssetup SET ${columns[i]}="" WHERE ${columns[i]}='${channel.id}'`, err => {
      if (err) { let errstack = err.stack; createLog(fs, err, errstack); return; }
    });
  }
  for (let i = 4; i < (columns.length); i++) {
    con.query(`UPDATE ssetup SET ${columns[i]}="" WHERE ${columns[i]}='${channel}'`, err => {
      if (err) { let errstack = err.stack; createLog(fs, err, errstack); return; }
    });
  }
});

//Command Handler
fs.readdir("./cmds/", (err, files) => {
  if (err) { let errstack = err.stack; createLog(fs, err, errstack); return; }
  let jsfiles = files.filter(f => f.split(".").pop() === "js");
  if (jsfiles.length <= 0) return console.log("No command files found");

  console.log(`Found ${jsfiles.length} command files`);
  jsfiles.forEach((f, i) => {
    let props = require(`./cmds/${f}`);
    console.log('\x1b[33m%s\x1b[0m: ', `${i + 1}: ${f} loaded!`);
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
  //Check of commands zijn toegestaan in deze channel
  if (message.channel.type != "dm") {
    con.query(`SELECT * FROM ssetup WHERE serverID='${server.id}' AND commandsID !=''`, (err, rows) => {
      if (err) { let errstack = err.stack; createLog(fs, err, errstack); return; }
      if (rows.length != 0) {
        if (message.channel != rows[0].commandsID && rows[0].commandsID != "all" && !message.member.hasPermission("MANAGE_CHANNELS")) {
          message.reply(`commands only works in: ${rows[0].commandsID}`)
          return;
        }
      }
    });
  }
  if (cmd) { cmd.run(bot, botconfig, fs, message, args, con, server); }
  else { message.reply("Not a command, use >help for a list of commands"); message.react("❌"); return; }
});
bot.login(botconfig.token);

bot.on("error", (err) => {
  if (err) {
    let errstack = err.stack; createLog(fs, err, errstack); return;
  }
});

//Create an errorLog
function createLog(fs, err, errstack, extraMessage) {
  if (!extraMessage) extraMessage = "";

  let date = new Date();
  let currentYear = date.getFullYear();
  let currentMonth = date.getMonth();
  let currentDay = date.getDate();
  let currentHours = date.getHours();
  let currentMinutes = date.getMinutes();
  let currentSecs = date.getSeconds();
  let error_date = (`${currentDay}-${currentMonth}-${currentYear}_${currentHours}.${currentMinutes}.${currentSecs}`)

  //Create logs folder if it doens't exist
  if (!fs.existsSync("./logs")) {
    fs.mkdirSync("./logs");
    console.log("Creating ./logs folder");
  }

  fs.writeFile(`./logs/err_${error_date}.txt`, `${err}\n${errstack}\n\n${extraMessage}`, { flag: 'w' }, function (err) {
    if (err) return console.error(err);
    console.log(`Succefully made logs file: err_${error_date}.txt`);
  });
}
