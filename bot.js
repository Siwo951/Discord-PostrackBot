const Discord = require("discord.js");
const cheerio = require("cheerio");
const rp = require("request-promise");
const command = require("./config.js")["command"];
const token = require("./config.js")["token"];

const client = new Discord.Client();

client.on("ready", () => {
  client.user.setActivity(`use: ${command} [Trackingcode]`);
  console.log("--------------------");
  console.log("Discord-PostrackBot by Siwo951");
  console.log("--------------------");
  console.log(`「${client.user.username}」の起動に成功しました`);
  console.log(`コマンド: ${command} [追跡番号]`);
  console.log("--------------------");
  console.log("終了は Ctrl+C を押して下さい");
  console.log("--------------------");
});

client.on("message", async message => {
  if (message.content.startsWith(command)) {
    var tracknumber = message.content.replace(/[^0-9]/g,"");
    if (tracknumber === "") {
      message.channel.send({
        embed: {
          author: {
            name: "日本郵便 - 追跡",
            icon_url: "https://www.post.japanpost.jp/img/common/touch-icon.png"
          },
          color: `0xff0000`,
          title: "追跡番号を入力して下さい",
          footer: {
            icon_url: "https://github.com/fluidicon.png",
            text: `Discord-PostrackBot by Siwo951`,
          },
          timestamp: new Date(),
        }
      });
    }
    else {
      const options = {
        transform: (body) => {
          return cheerio.load(body);
        }
      };
      rp.get(`https://trackings.post.japanpost.jp/services/srv/sequenceNoSearch/?requestNo=${tracknumber}&count=1&sequenceNoSearch.x=104&sequenceNoSearch.y=26&locale=ja`, options)
      .then(($1) => {
        var trackresult = $1(".w_180").text().replace("最新状態","");
        if (trackresult === "") {
          message.channel.send({
            embed: {
              author: {
                name: "日本郵便 - 追跡",
                icon_url: "https://www.post.japanpost.jp/img/common/touch-icon.png"
              },
              color: `0xff0000`,
              title: `追跡番号に誤りが有ります`,
              footer: {
                icon_url: "https://github.com/fluidicon.png",
                text: `Discord-PostrackBot by Siwo951`,
              },
              timestamp: new Date(),
            }
          });
        }
        else {
          rp.get(`https://trackings.post.japanpost.jp/services/srv/search/?requestNo1=${tracknumber}&search=%E8%BF%BD%E8%B7%A1%E3%82%B9%E3%82%BF%E3%83%BC%E3%83%88`, options)
          .then(($2) => {
            var packtype = $2(".w_480").text().replace("商品種別","");
            message.channel.send({
              embed: {
                author: {
                  name: "日本郵便 - 追跡",
                  icon_url: "https://www.post.japanpost.jp/img/common/touch-icon.png"
                },
                color: `0x7289da`,
                title: `荷物の状況: ${trackresult}`,
                description: `荷物種別: ${packtype}`,
                footer: {
                  icon_url: "https://github.com/fluidicon.png",
                  text: `Discord-PostrackBot by Siwo951`,
                },
                timestamp: new Date(),
              }
            });
          })
        }
      })
    }
  }
});

client.login(token);