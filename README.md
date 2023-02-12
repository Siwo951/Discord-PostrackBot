# Discord-PostrackBot
日本郵便の荷物追跡結果を表示するDiscordBot  
動作には [Node.js](https://nodejs.org)(`v18.x`以降) と [必須モジュール](#必須モジュール) が必要です  

## 必須モジュール
| モジュール名 | バージョン (以降) |
| :-- | :-- |
| [cheerio](https://www.npmjs.com/package/cheerio) | `v1.0.0-rc.12` |
| [discord.js](https://www.npmjs.com/package/discord.js) | `v14.7.1` |
| [dotenv](https://www.npmjs.com/package/dotenv) | `v16.0.3` |
  
フォルダ内でコマンドライン等を開き  
`npm install` と入力する事で必須モジュールを全てインストール出来ます  

## 起動まで
同梱されている`.env.sample`を`.env`にリネームし、  
`DISCORDBOT_TOKEN=`の後に**スペースを入れずに**トークンを入力してください  

**なお、このBotは`Message Content`のIntentsを使用します**  
**`Discord Developer Portal`にて`Message Content Intent`を必ず有効にしてください**  
**有効にしなかった場合は Botがメッセージが取得出来ず動作しません**

`config.js`はお好みで変更してください  
  
その後`bot.js`のあるフォルダでコマンドラインを開き  
`node bot.js`と入力すると起動できます  
少し待ってからコマンドラインに「起動しました」と表示されれば準備は完了です  

## Discord上での使い方
`config.js`に入力したコマンドの後に追跡番号を入力すると結果が表示されます  
追跡番号を入力してから表示までは数秒かかります (下記の[注意点](#注意点)も参照)  
メッセージの埋め込み表示が無効の場合、内容が表示されませんのでご注意下さい  

## 注意点
追跡結果の取得はスクレイピングで行っています  
その為結果の表示に時間がかかりますがコマンドの連投はお控え下さい  
リクエスト過多になりアクセス不可能になる可能性があります  
また日本郵便の追跡ページに更新等で変更が生じると使用出来なくなる場合があります  
**このBotを使用して発生した損害については一切の責任を負いません**