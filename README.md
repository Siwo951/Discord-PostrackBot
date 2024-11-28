# Discord-PostrackBot
日本郵便の荷物追跡結果を表示するDiscordBot  
動作には [Node.js `v20.x`](https://nodejs.org) と [必須モジュール](#必須モジュール) が必要です  

> [!CAUTION]
> **このBotを使用して発生した損害については一切の責任を負いません**

## 必須モジュール

| モジュール | バージョン |
| :-- | :-- |
| [cheerio](https://www.npmjs.com/package/cheerio) | `v1.0.0` |
| [discord.js](https://www.npmjs.com/package/discord.js) | `v14.16.3` |
| [dotenv](https://www.npmjs.com/package/dotenv) | `v16.4.5` |
  
フォルダ内でコマンドライン等を開き  
`npm install` と入力する事で必須モジュールを全てインストール出来ます  

## 起動まで
同梱されている`.env.sample`を`.env`にリネームし  
`DISCORDBOT_TOKEN=`の後にトークンを入力してください  

> [!IMPORTANT]  
> このBotは`Message Content`のIntentsを使用します  
> デベロッパーポータルにて`Message Content Intent`を必ず有効にしてください  
> 有効にしなかった場合は Botがメッセージが取得出来ず動作しません

`config.js`はお好みで変更してください  
  
その後`bot.js`のあるフォルダでコマンドラインを開き  
`node bot.js`と入力すると起動できます  
少し待ってからコマンドラインに「起動しました」と表示されれば準備は完了です  

## Discord上での使い方
`config.js`に入力したコマンドの後に追跡番号を入力すると結果が表示されます  
メッセージの埋め込み表示が無効の場合は内容が表示されませんのでご注意下さい  

> [!WARNING]
> 追跡結果の取得はスクレイピングで行っています  
> 実行から結果の表示に時間がかかりますがコマンドの連投はしないで下さい  
> 
> 連続したアクセス防止の為に取得に成功したデータは5分間保持します  
> その為5分間は新たな更新があっても次のデータが取得されるまで反映されません  
> 
> 日本郵便の追跡ページに変更が生じると使用出来なくなる事があります  