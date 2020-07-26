const Discord = require("discord.js");
const cheerio = require("cheerio");
const request = require("request");
const command = require("./config.js")["command"];
const token = require("./config.js")["token"];

const client = new Discord.Client();

client.on("ready", () => {
  client.user.setActivity(`use: ${command} [Trackingcode]`);
  console.log("--------------------");
  console.log("Discord-PostrackBot by Siwo951");
  console.log("--------------------");
  console.log(`「${client.user.username}」の起動に成功しました`);
  console.log(`使用方法: ${command} [追跡番号]`);
  console.log("--------------------");
  console.log("終了は Ctrl+C を押して下さい");
  console.log("--------------------");
});

client.on("message", async message => {
  if (message.author.bot) return;
  if (message.content.startsWith(command)) {
    var trackcode_jp = message.content.replace(/[^0-9]/g,"");
    if (trackcode_jp === "") {
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
      var japanpost_getinfo = [];
      var japanpost_getdate = [];
      var japanpost_gettype = [];
      var japanpost_set = [];

      request({url: `https://trackings.post.japanpost.jp/services/srv/search/?requestNo1=${trackcode_jp}&search=%E8%BF%BD%E8%B7%A1%E3%82%B9%E3%82%BF%E3%83%BC%E3%83%88`, method: "GET"},
      function(err, res, body) {
        var $ = cheerio.load(body);
        $(".w_150").each((i, elem) => {
          japanpost_getinfo[i] = $(elem).text();
        });
        $(".w_120").each((i, elem) => {
          japanpost_getdate[i] = $(elem).text();
        });
        $(".w_480").each((i, elem) => {
          japanpost_gettype[i] = $(elem).text();
        });

        japanpost_getinfo.shift();
        japanpost_getdate.shift();
        japanpost_gettype.shift();

        if($(".w_180").text().indexOf("ゆうパック") > -1) {
          japanpost_getdate.splice(0,4);
          japanpost_gettype = "ゆうパック"
        }
        for (let i = 0; i < japanpost_getinfo.length; i++) {
          japanpost_set.push({name: `${japanpost_getdate[i]}`, value: `${japanpost_getinfo[i]}`})
        }
        if (typeof(japanpost_getinfo.slice(-1)[0]) === "undefined") {
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
          message.channel.send({
            embed: {
              author: {
                name: "日本郵便 - 追跡",
                icon_url: "https://www.post.japanpost.jp/img/common/touch-icon.png"
              },
              color: `0x0071c1`,
              title: `荷物の状況: ${japanpost_getinfo.slice(-1)[0]}`,
              description: `荷物種別: ${japanpost_gettype}`,
              fields: japanpost_set,
              footer: {
                icon_url: "https://github.com/fluidicon.png",
                text: `Discord-PostrackBot by Siwo951`,
              },
              timestamp: new Date(),
            }
          });
        }
      })
    }
  }
});

client.login(token);