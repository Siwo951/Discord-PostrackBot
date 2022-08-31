const config = require("./config");
const Discord = require("discord.js");
const https = require("https");
const cheerio = require("cheerio");
const client = new Discord.Client({
  intents: ["GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES"],
  allowedMentions: {parse: [], repliedUser: false}
});

// ------------------------- //

if (["", undefined].includes(config.command) || ["", undefined].includes(config.token)) {
  console.log(`--------------------\nconfigの ${["", undefined].includes(config.command) ? "command" : "token"} が見つかりませんでした\nconfigをもう一度確認してください\n--------------------`);
  process.exit(1);
}

client.on("ready", () => {
  console.log("--------------------\n起動しました\n--------------------");
  client.user.setActivity(`${config.command} [追跡番号]`);
});

// ------------------------- //

client.on("messageCreate", message => {
  if (message.author.bot || !message.content.startsWith(config.command)) return;

  message.reply({
    embeds: [{
      author: {
        name: "Loading..."
      },
      color: "0x292929",
      title: "荷物の状況: 読み込み中...",
      timestamp: new Date()
    }]
  }).then(msg => {
    let body = "";
    const trackCode = message.content.replace(`${config.command}`, "").replace(/\s+/g,"");

    https.request(`https://trackings.post.japanpost.jp/services/srv/search/?requestNo1=${trackCode}&search=%E8%BF%BD%E8%B7%A1%E3%82%B9%E3%82%BF%E3%83%BC%E3%83%88`, (res) => {
      res.setEncoding("utf-8");
      res.on("data", (data) => body += data);
      res.on("end", () => {
        const $ = cheerio.load(body);

        if ($(".txt_l > font:nth-child(1)").text() != "") return msg.edit({
          embeds: [{
            color: "0xff0000",
            title: "追跡番号に誤りがあります",
            timestamp: new Date()
          }]
        });

        const japanPostDate = [];
        const japanPostInfo = [];
        const japanPostPlaceName = [];
        const japanPostSet = [];
        let japanPostAuthor = "日本郵便";
        let japanPostType = $("td.w_480").text();

        $("table.tableType01:nth-child(5) > tbody > tr > td:nth-child(2)").each((i, elem) => {japanPostInfo[i] = $(elem).text()});
        $("table.tableType01:nth-child(5) > tbody > tr > td.w_120:nth-child(1)").each((i, elem) => {japanPostDate[i] = $(elem).text()});

        if ($(".ttl_line").text().indexOf("ゆうパック") != -1) {
          japanPostType = $("table.tableType01:nth-child(2) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(2)").text();
          for (let i = 0; i < japanPostInfo.length; i++) japanPostSet.push({name: `${japanPostDate[i].slice(5)}`, value: `${japanPostInfo[i]}`});
        } else if ($(".ttl_line").text().indexOf("国際") != -1) {
          japanPostAuthor = "日本郵便 / 国際郵便";
          japanPostType = `${$("table.tableType01:nth-child(2) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(2)").text()}\n(海外での履歴は現地時間)`;
          $("table.tableType01:nth-child(5) > tbody:nth-child(1) > tr > td:nth-child(5)").each((i, elem) => {japanPostPlaceName[i] = $(elem).text()});
          for (let i = 0; i < japanPostInfo.length; i++) japanPostSet.push({
            name: `${japanPostDate[i].slice(5)} (${japanPostPlaceName[i].replace(/\s+/g,"").replace(/[A-Z]/g,"") == "" ? japanPostPlaceName[i].replace(/\s+/g,"") : "JAPAN"})`,
            value: `${japanPostInfo[i]}`
          });
        } else {
          for (let i = 0; i < japanPostInfo.length; i++) japanPostSet.push({name: `${japanPostDate[i].slice(5)}`, value: `${japanPostInfo[i]}`});
        }

        msg.edit({
          embeds: [{
            author: {
              name: japanPostAuthor
            },
            color: "0x292929",
            title: `荷物の状況: ${japanPostInfo[japanPostInfo.length - 1]}`,
            description: `荷物種別: ${japanPostType}`,
            fields: japanPostSet,
            timestamp: new Date()
          }]
        });
      });
    }).on("error", () => {
      msg.edit({
        embeds: [{
          color: "0xff0000",
          title: "追跡結果取得中にエラーが発生しました",
          timestamp: new Date()
        }]
      });
    }).end();
  });
});

// ------------------------- //

client.login(config.token);