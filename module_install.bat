@echo off
chcp 65001 > nul 2>&1
title Discord-PostrackBot Module Installer

echo ====================
echo インストール中です...
echo 完了すると自動でウィンドウが閉じます
echo ====================

npm i discord.js node-fetch cheerio --save