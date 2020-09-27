const Discord = require("discord.js");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const client = new Discord.Client();
const command = require("./config.js")["command"];
const token = require("./config.js")["token"];

// ------------------------- //

if (command == "") {
  console.log("--------------------");
  console.log("config.jsの command が空欄になっています");
  console.log("記入して再度実行して下さい");
  console.log("--------------------");
  process.exit(0);
}
if (token == "") {
  console.log("--------------------");
  console.log("config.jsの token が空欄になっています");
  console.log("記入して再度実行して下さい");
  console.log("--------------------");
  process.exit(0);
}

// ------------------------- //

client.on("ready", () => {
  console.log("--------------------");
  console.log("起動しました");
  console.log("--------------------");
  client.user.setActivity(`${command} [追跡番号]`);
});

// ------------------------- //

client.on("message", async message => {
  if (message.author.bot) return;
  if (message.content.startsWith(command)) {
    var trackCode = message.content.replace(/[^0-9]/g,"");
    var japanpostInfo = [];
    var japanpostDate = [];
    var japanpostType;
    var japanpostSet = [];
    fetch(`https://trackings.post.japanpost.jp/services/srv/search/?requestNo1=${trackCode}&search=%E8%BF%BD%E8%B7%A1%E3%82%B9%E3%82%BF%E3%83%BC%E3%83%88`)
    .then(res => res.text())
    .then(body => {
      var $ = cheerio.load(body);
      $("table.tableType01:nth-child(5) > tbody > tr > td:nth-child(2)").each((i, elem) => {
        japanpostInfo[i] = $(elem).text();
      });
      $("table.tableType01:nth-child(5) > tbody > tr > td.w_120:nth-child(1)").each((i, elem) => {
        japanpostDate[i] = $(elem).text();
      });
      japanpostType = $("td.w_480").text();
      if ($("table.tableType01:nth-child(2) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(2)").text().indexOf("ゆうパック") > -1) japanpostType = "ゆうパック";
      for (let i = 0; i < japanpostInfo.length; i++) {
        japanpostSet.push({name: `${japanpostDate[i]}`, value: `${japanpostInfo[i]}`})
      }
      if ($(".txt_l > font:nth-child(1)").text() == "") {
        message.channel.send({
          embed: {
            color: `0x292929`,
            title: `荷物の状況: ${japanpostInfo.slice(-1)[0]}`,
            description: `荷物種別: ${japanpostType}`,
            fields: japanpostSet,
            timestamp: new Date(),
          }
        });
      }
      else {
        message.channel.send({
          embed: {
            color: `0xff0000`,
            title: `追跡番号に誤りが有ります`,
            timestamp: new Date(),
          }
        });
      }
    });
  };
});

// ------------------------- //

client.login(token);