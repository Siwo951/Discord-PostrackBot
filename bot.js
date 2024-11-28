require("dotenv").config();

const config = require("./config");
const resultCachies = {}

if (!Object.values(config).every(it => it || false)) {
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
      color: config.embedColor,
      description: "取得中です...",
      timestamp: new Date(),
      title: "荷物追跡"
    }]
  }).then(msg => {
    const trackCode = message.content.toLowerCase().replace(config.command, "").replace(/[^0-9A-Za-z]/g, "");

    const cache = resultCachies[trackCode];
    const nowTimeStamp = new Date().getTime();

    const trackMessage = (body, fromCache) => {
      const $ = cheerio.load(body);

      let latestStatus = null;

      const isInternationalMail = $(".ttl_line").text().indexOf("国際") != -1;

      const embedFields = $(`table[summary="履歴情報"] > tbody > tr`).toArray().map((elem, i) => {
        if (i % 2 != 0 || $(elem).find("th").length != 0) return null;
        
        const history = $(elem).find("td").toArray().map(elem => $(elem).text());
        const place = isInternationalMail ? (history[4]?.trim()?.replace(/[^A-Z]/g, "") || "JAPAN") : null;

        latestStatus = history[1];
    
        return {
          name: [
            history[0].replace(/\d{4}\/(\d{2})\/(\d{2})(\s\d{2}:\d{2}|)/, "$1/$2$3"),
            place != null ? `\`${place}\`` : null
          ].filter(n => n).join(" - "),
          value: history[1]
        }
      }).filter(n => n);

      if (latestStatus == null) {
        return msg.edit({
          embeds: [{
            color: config.embedErrorColor,
            description: "荷物が見つかりませんでした",
            timestamp: new Date(),
            title: "荷物追跡"
          }]
        });
      }

      if (!fromCache) {
        resultCachies[trackCode] = {
          "timestamp": nowTimeStamp,
          "body": body
        }
      }

      msg.edit({
        embeds: [{
          color: config.embedColor,
          description: [
            `## ${latestStatus}`,
            isInternationalMail ? "  - 海外での履歴は現地時間" : null,
          ].filter(n => n).join("\n"),
          fields: embedFields,
          timestamp: new Date(),
          title: "荷物追跡"
        }]
      });
    }

    if (cache != undefined && nowTimeStamp - cache["timestamp"] < 300000) {
      trackMessage(cache["body"], true);
    } else {
      fetch(`https://trackings.post.japanpost.jp/services/srv/search/?requestNo1=${trackCode}&search=追跡スタート`)
      .then(res => res.text()).then(body => {
        trackMessage(body, false);
      }).catch(() => {
        msg.edit({
          embeds: [{
            color: config.embedErrorColor,
            description: "取得中にエラーが発生しました",
            timestamp: new Date(),
            title: "荷物追跡"
          }]
        });
      });
    }
  });
});

client.login(process.env["DISCORDBOT_TOKEN"].replace(/\s+/g, ""));