const botconfig = require("./botconfig.json");
const Discord = require("discord.js");
const bot = new Discord.Client({ disableEveryone: true });
const fs = require("fs");
const mysql = require("mysql");
const prefix = botconfig.prefix;


bot.on("ready", async () => {
  console.log(`${bot.user.username} has started, with ${bot.users.size} users, in ${bot.channels.size} channels in ${bot.guilds.size} servers.`);
  bot.user.setPresence({ status: "online", type: "WATCHING", name: `YarBot online in ${bot.guilds.size} servers` })
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
          message.react("✅");
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
          message.react("✅");
        }
        break;

      //Announcement command
      case "announcement":
        if (message.author.id == "228163151219130368") {
          let txt = args.slice(0).join(' ');
          if (txt == "") message.react("❌"); message.reply("Empty announcement message"); return;;
          con.query(`SELECT * FROM ssetup`, (err, rows) => {
            if (err) console.log(err);
            let i = 0;
            console.log(`test, ${rows.length}`);
            while (i < rows.length) {
              var getServerID = rows[i].serverID;
              var getAnnouncementID = rows[i].announcementID;
              console.log(getServerID);
              console.log(getAnnouncementID);

              bot.guilds.get(getServerID).channels.get(getAnnouncementID).send(`${txt}`);

              i++;
            }
          });
          message.react("✅");
        }
        break;
      //Help Command
      case "invite":
        message.author.send({
          embed: {
            color: (133, 0, 255),
            title: "Get YarBot on your server.",
            description: "[invite YarBot to your server](https://discordapp.com/oauth2/authorize?&client_id=435166838318563328&scope=bot&permissions=1304952001)",
            footer: {
              icon: bot.user.avatarURL,
              text: "Made by Yarink#4414"
            },
          }
        });
        message.react("✅");
        break;
      case "help":
        //Create embed
        message.author.send({
          embed: {
            color: (133, 0, 255),
            title: "Help",
            footer: {
              icon: bot.user.avatarURL,
              text: "Made by Yarink#4414"
            },
            author: {
              name: `👑 List of commands for ${bot.user.username}👑`,
            },
            fields: [{
              name: "👨🏼‍💻 General commands",
              value: "```help -Shows this message\nhoi -Get a nice message\ninvite -Shows YarBot invite link```"
            }, {
              name: "Admin Commands",
              value: "```setup -Create an announcement channel or see current announcement channel\n|Usage: setup #yourchannel```"
            }, {
              name: "Note",
              value: "```Prefix : '>'```"
            }
            ]
          }
        });
        break;
      default: message.author.send("Did you mean: >help?"); message.react("❌");
    }
    return;
  };

  //Guild commands
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;
  if (botconfig.status == "disabled") return message.reply("Bot is disabled by developer");
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  let server = message.guild.id;
  //Command checker
  switch (command) {
    case "hoi":
      message.channel.send(`Hallow ${message.author}`);

      if (server == "352141368023318528") {
        message.react("<:oof:377435430733348864>");
      }
      else if (server == "381909448664547329") {
        message.react("💩");
      }
      message.react("❌");
      message.react("✅");
      break;
    case "invite":
      message.author.send({
        embed: {
          color: (133, 0, 255),
          title: "Help",
          description: "[invite YarBot to your server](https://discordapp.com/oauth2/authorize?&client_id=435166838318563328&scope=bot&permissions=1304952001)",
          footer: {
            icon: bot.user.avatarURL,
            text: "Made by Yarink#4414"
          },
        }
      });
      message.react("✅");
      break;
    //Announcement setup command
    case "setup":
      //Check permissions
      if (!message.member.hasPermission("MANAGE_CHANNELS")) { message.reply("No permission to use this command"); message.react("❌"); return; };
      //Remove announcement channel
      if (args[0] == "remove") {
        con.query(`SELECT * FROM ssetup WHERE serverID='${server}'`, (err, rows) => {
          if (err) console.log(err)
          if (rows.length == 0) { message.reply("No announcement channel available"); message.react("❌"); return; }
          sql = `DELETE FROM ssetup WHERE serverID='${server}'`;
          con.query(sql);
          message.react("✅");
          return;
        });
      }
      //Show current announcement channel
      else if (!message.mentions.channels.first()) {
        con.query(`SELECT * FROM ssetup WHERE serverID='${server}'`, (err, rows) => {
          if (err) console.log(err);
          if (rows.length == 0) { message.reply("No announcement channel available"); message.react("❌"); return; }
          message.reply(`the current announcement channel is: <#${rows[0].announcementID}>`);
          return;
        });
      }
      //Als announcement channel niet gedelete moet worden en correcte command is ingevuld
      else if (args[0] == "announcement") {
        let announcementID = message.mentions.channels.first();
        con.query(`SELECT * FROM ssetup WHERE serverID='${server}'`, (err, rows) => {
          if (err) console.log(err);
          let sql;
          //If server doesn't already have an announcement channel
          if (rows.length == 0) {
            sql = `INSERT INTO ssetup (serverID, announcementID) VALUES ('${server}', '${announcementID.id}')`;
            con.query(sql);
            message.react("✅");
            console.log(`New annoucement channel in server: ${server}, announcementID=${announcementID}`)
          } //If server already has an announcement channel
          else {
            sql = `UPDATE ssetup SET announcementID='${announcementID.id}' WHERE serverID='${server}'`;
            con.query(sql);
            message.react("✅");
            console.log(`Updated annoucement channel in server: ${server}, announcementID=${announcementID}`)
          }
        });
      }
      else { message.reply("Usage: >setup (channelID) (#channelname)\nAllowed channelID's:\n| announcement\n| YarCommands"); message.react("❌"); return; }
      break;

    //Help Command
    case "help":
      //Create embed
      message.author.send({
        embed: {
          color: (133, 0, 255),
          title: "Help",
          footer: {
            icon: bot.user.avatarURL,
            text: "Made by Yarink#4414"
          },
          author: {
            name: `👑 List of commands for ${bot.user.username}👑`,
          },
          fields: [{
            name: "👨🏼‍💻 General commands",
            value: "```help -Shows this message\nhoi -Get a nice message\ninvite -Shows YarBot invite link```"
          }, {
            name: "Admin Commands",
            value: "```help -Shows this message\nhoi -Get a nice message\ninvite -Shows YarBot invite link```"
          }, {
            name: "Note",
            value: "```Prefix : '>'```"
          }
          ]
        }
      });
      message.react("✅");
      break;
    default: message.reply(`Unrecognized command use >help for a list of commands.`); message.react("❌");
  }
});
bot.login(botconfig.token);