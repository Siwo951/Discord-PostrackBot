require("dotenv").config();

const config = require("./config");

if (Object.values(config).map(it => ["", undefined].includes(it)).includes(true)) {
  console.log("--------------------\nconfigに不備があります\n--------------------");
  process.exit(1);
}

const cheerio = require("cheerio");
const Discord = require("discord.js");

const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.MessageContent
  ],
  allowedMentions: {
    parse: [],
    repliedUser: false
  }
});

client.once("ready", () => {
  console.log("--------------------\n起動しました\n--------------------");
  client.user.setActivity(`${config.command} [追跡番号]`);
});

client.on("messageCreate", async message => {
  if (message.author.bot || !message.content.startsWith(config.command)) return;

  message.reply({
    embeds: [{
      author: {
        name: "Loading..."
      },
      color: config.embedColor,
      title: "荷物の状況: 読み込み中...",
      timestamp: new Date()
    }]
  }).then(msg => {
    const trackCode = message.content.replace(`${config.command}`, "").replace(/\s+/g,"");

    fetch(`https://trackings.post.japanpost.jp/services/srv/search/?requestNo1=${trackCode}&search=%E8%BF%BD%E8%B7%A1%E3%82%B9%E3%82%BF%E3%83%BC%E3%83%88`)
    .then(res => res.text()).then(body => {
      const $ = cheerio.load(body);

      if ($(".txt_l > font:nth-child(1)").text() != "") {
        msg.edit({
          embeds: [{
            color: config.embedErrorColor,
            title: "追跡番号に誤りがあります",
            timestamp: new Date()
          }]
        });

        return;
      }

      const japanPostDate = [];
      const japanPostInfo = [];
      const japanPostPlaceName = [];
      const japanPostSet = [];

      let japanPostAuthor = "日本郵便";
      let japanPostType = $("td.w_480").text();

      $("table.tableType01:nth-child(5) > tbody > tr > td:nth-child(2)").each((i, elem) => japanPostInfo[i] = $(elem).text());
      $("table.tableType01:nth-child(5) > tbody > tr > td.w_120:nth-child(1)").each((i, elem) => japanPostDate[i] = $(elem).text());

      const packageType = $(".ttl_line").text();

      if (packageType.indexOf("ゆうパック") != -1) {
        japanPostType = $("table.tableType01:nth-child(2) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(2)").text();
        for (let i = 0; i < japanPostInfo.length; i++) japanPostSet.push({name: `${japanPostDate[i].slice(5)}`, value: `${japanPostInfo[i]}`});
      } else if (packageType.indexOf("国際") != -1) {
        japanPostAuthor = "日本郵便 / 国際郵便";
        japanPostType = `${$("table.tableType01:nth-child(2) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(2)").text()}\n(海外での履歴は現地時間)`;
        $("table.tableType01:nth-child(5) > tbody:nth-child(1) > tr > td:nth-child(5)").each((i, elem) => japanPostPlaceName[i] = $(elem).text());
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
          color: config.embedColor,
          title: `荷物の状況: ${japanPostInfo[japanPostInfo.length - 1]}`,
          description: `荷物種別: ${japanPostType}`,
          fields: japanPostSet,
          timestamp: new Date()
        }]
      });
    }).catch(() => {
      msg.edit({
        embeds: [{
          color: config.embedErrorColor,
          title: "追跡結果取得中にエラーが発生しました",
          timestamp: new Date()
        }]
      });

      return;
    });
  });
});

client.login(process.env["DISCORDBOT_TOKEN"]);