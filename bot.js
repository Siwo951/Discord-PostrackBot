const Discord = require("discord.js");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const client = new Discord.Client();
const config = require("./config");

// ------------------------- //

if (process.versions.node < 12) {
  console.log("--------------------");
  console.log("Node.jsのバージョンがv12以降ではありません");
  console.log("Node.jsのバージョンをv12以降に更新して下さい");
  console.log("--------------------");
  process.exit(0);
}
if (config.command == "") {
  console.log("--------------------");
  console.log("config.jsの command が空欄になっています");
  console.log("記入して再度実行して下さい");
  console.log("--------------------");
  process.exit(0);
}
if (config.token == "") {
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
  client.user.setActivity(`${config.command} [追跡番号]`);
});

// ------------------------- //

client.on("message", message => {
  if (message.author.bot) return;
  if (message.content.startsWith(config.command)) {
    message.channel.send({
      embed: {
        author: {
          name: `Loading...`
        },
        color: `0x292929`,
        title: `荷物の状況: 読み込み中...`,
        timestamp: new Date()
      }
    })
    .then(msg => {
      var trackCode = message.content.replace(`${config.command}`,"").replace(/\s+/g,"");
      fetch(`https://trackings.post.japanpost.jp/services/srv/search/?requestNo1=${trackCode}&search=%E8%BF%BD%E8%B7%A1%E3%82%B9%E3%82%BF%E3%83%BC%E3%83%88`)
      .then(res => res.text())
      .then(body => {
        var $ = cheerio.load(body);
        if ($(".txt_l > font:nth-child(1)").text() == "") {
          var japanpostSet = [];
          var japanpostInfo = [];
          var japanpostDate = [];
          var japanPostPlaceName = [];
          $("table.tableType01:nth-child(5) > tbody > tr > td:nth-child(2)").each((i, elem) => {japanpostInfo[i] = $(elem).text()});
          $("table.tableType01:nth-child(5) > tbody > tr > td.w_120:nth-child(1)").each((i, elem) => {japanpostDate[i] = $(elem).text()});
          if ($(".ttl_line").text().indexOf("ゆうパック") > -1) {
            var japanpostAuthor = "日本郵便";
            var japanpostType = $("table.tableType01:nth-child(2) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(2)").text();
            for (let i = 0; i < japanpostInfo.length; i++) japanpostSet.push({name: `${japanpostDate[i].slice(5)}`, value: `${japanpostInfo[i]}`});
          }
          else if ($(".ttl_line").text().indexOf("国際") > -1) {
            var japanpostAuthor = "日本郵便 / 国際郵便";
            var japanpostType = `${$("table.tableType01:nth-child(2) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(2)").text()}\n(海外での履歴は現地時間)`;
            $("table.tableType01:nth-child(5) > tbody:nth-child(1) > tr > td:nth-child(5)").each((i, elem) => {japanPostPlaceName[i] = $(elem).text()});
            for (let i = 0; i < japanpostInfo.length; i++) {
              if (japanPostPlaceName[i].replace(/\s+/g,"").replace(/[A-Z]/g,"") == "") {
                japanpostSet.push({name: `${japanpostDate[i].slice(5)} (${japanPostPlaceName[i].replace(/\s+/g,"")})`, value: `${japanpostInfo[i]}`});
              }
              else japanpostSet.push({name: `${japanpostDate[i].slice(5)} (JAPAN)`, value: `${japanpostInfo[i]}`});
            };
          }
          else {
            var japanpostAuthor = "日本郵便";
            var japanpostType = $("td.w_480").text();
            for (let i = 0; i < japanpostInfo.length; i++) japanpostSet.push({name: `${japanpostDate[i].slice(5)}`, value: `${japanpostInfo[i]}`});
          }
          msg.edit({
            embed: {
              author: {
                name: japanpostAuthor
              },
              color: `0x292929`,
              title: `荷物の状況: ${japanpostInfo[japanpostInfo.length-1]}`,
              description: `荷物種別: ${japanpostType}`,
              fields: japanpostSet,
              timestamp: new Date()
            }
          });
        }
        else {
          msg.edit({
            embed: {
              color: `0xff0000`,
              title: `追跡番号に誤りがあります`,
              timestamp: new Date()
            }
          });
        };
      });
    });
  };
});

// ------------------------- //

client.login(token);