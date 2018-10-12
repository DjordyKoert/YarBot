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
  "prefix",
  "ftnshopID",
  "announcementID",
  "ticketID",
  //Support 'all'
  "dmID",
  "commandsID"
]

bot.on("ready", async () => {
  console.log(`${bot.user.username} has started, with ${bot.users.size} users, in ${bot.channels.size} channels in ${bot.guilds.size} servers.`);
  let statuses = [
    `YarBot in ${bot.guilds.size} servers`,
    `Use >help for a list of commands`,
    `Created by Yarink#4414`
  ]
  updateShop()
  let N = 0
  //Auto-change status
  setInterval(function () {
    if (N != (statuses.length - 1)) { N++; }
    else { N = 0; }
    let status = statuses[N];

    bot.user.setActivity(status);
  }, 5000)

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
  prefix varchar(1) NOT NULL,
  ftnshopID varchar(30) NOT NULL,
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
  for (let i = 6; i < (columns.length); i++) {
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
  //Check server prefix
  if (message.channel.type != "dm") server = message.guild.id;
  else server = "noguild"
  con.query(`SELECT * FROM ssetup WHERE serverID='${server}'`, (err, rows) => {
    try {
      if (!rows[0].prefix) serverPrefix = ">";
      else serverPrefix = rows[0].prefix;
    } catch (e) {
      serverPrefix = ">";
    }
    if (!message.content.startsWith(serverPrefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    let cmd = bot.commands.get(command);
    let server = message.guild;
    //Check of commands zijn toegestaan in deze channel
    if (message.channel.type != "dm") {
      con.query(`SELECT * FROM ssetup WHERE serverID='${server.id}' AND commandsID !=''`, (err, rows) => {
        if (err) { let errstack = err.stack; createLog(fs, err, errstack); return; }
        if (rows.length > 0) {
          //Check if channel = DBid or DBid = all or user has permission or user is owner
          if (message.channel != rows[0].commandsID && rows[0].commandsID != "all" && !message.member.hasPermission("MANAGE_CHANNELS")) {
            //message.reply(`commands only work in: ${rows[0].commandsID}`);
            message.react("❌");
            return;
          }
          else {
            if (cmd) { cmd.run(bot, botconfig, fs, message, args, con, server); }
            else { message.reply(`Not a command, use ${serverPrefix}help for a list of commands`); message.react("❌"); return; }
          }
        }//If DBid = ""
        else {
          if (cmd) { cmd.run(bot, botconfig, fs, message, args, con, server); }
          else { message.reply(`Not a command, use ${serverPrefix}help for a list of commands`); message.react("❌"); return; }
        }
      });
    }
    else {//if server is not in db already
      if (cmd) { cmd.run(bot, botconfig, fs, message, args, con, server); }
      else { message.reply(`Not a command, use ${serverPrefix}help for a list of commands`); message.react("❌"); return; }
    }
  });
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


function updateShop() {
  setInterval(async function () {
    con.query(`SELECT * FROM shoptime`, (err, rows) => {
      if (err) { let errstack = err.stack; createLog(fs, err, errstack); return; }
      if (rows.length == 0) lastUpdate= ""
      else lastUpdate = rows[0].Time
    });
    const superagent = require("superagent");
    let { body } = await superagent
      .get("https://fnbr.co/api/shop")
      .set('x-api-key', botconfig.FNBRapi);
    UpdateTime = body.data.date

    if (UpdateTime != lastUpdate) {
      let dailyShop = weeklyShop = featuredImg = "";

      body.data.featured.forEach(element => {
        if (element.images.gallery == false) ImgLink = element.images.icon;
        else ImgLink = element.images.gallery
        weeklyShop += `[${element.name}](${ImgLink})- ${element.price} Vbucks \n`

      });
      body.data.daily.forEach(element => {
        if (element.images.gallery == false) ImgLink = element.images.icon;
        else ImgLink = element.images.gallery
        dailyShop += `[${element.name}](${ImgLink})- ${element.price} Vbucks \n`
      });
      let length = body.data.featured.length - 1
      let Rnum = Math.floor(Math.random() * length)
      if (body.data.featured[Rnum].images.gallery == false) Rimg = body.data.featured[Rnum].images.icon;
      else Rimg = body.data.featured[Rnum].images.gallery

      let shopembed = new Discord.RichEmbed()
        .setColor("#ff9800")
        .setTitle("Fortnite Item shop")
        .addField("Daily",
          `${dailyShop} \n`
        )
        .addField("Featured",
          `${weeklyShop}\n`
        )
        .setImage(Rimg)
      console.log("Updating shop...", UpdateTime)
      con.query(`SELECT * FROM ssetup WHERE ftnshopID!=""`, (err, rows) => {
        if (err) { let errstack = err.stack; createLog(fs, err, errstack); return; }
        rows.forEach(element => {
          try {
            bot.guilds.get(element.serverID).channels.get(element.ftnshopID).send(shopembed);
          } catch (err) { //If bot can't reach the server. AKA bot left the server
            if (err) { let errstack = err.stack; let extraMessage = "Bot probably left server and can't send an fortnite Shop. Removing server from database"; createLog(fs, err, errstack, extraMessage); }
            con.query(`DELETE FROM ssetup WHERE serverID='${element.serverID}'`);
          }
        });
      })
      con.query(`UPDATE shoptime SET time="${UpdateTime}"`);
    }
  }, 30000)
}