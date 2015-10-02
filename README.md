###RollGramBot

This is a Telegram Bot with different capabilities to assist in tabletop roleplaying games played in a group. Chiefly among them is the ability to perform dice rolls, store custom dice rolls for different users and roll them on command. It can also roll unsaved rolls on the fly.

It uses node.js + mongoDB on the server side and is made possible by the [node-telegram-bot](https://github.com/depoio/node-telegram-bot) project.

If you'd like to host your own, make sure to change the value of `botToken` in `config/config.js` to your Telegram API token.

This was originally a fork of babua's [RollGramBot](https://github.com/babua/RollGramBot) which added the capability to see individual die rolls and exploding dice, however eventually I've decided to greatly and steadily extend its functionality as my own introduction to node.js and mongoDB. So please pardon all the cringeworthy code, as it is as much of a learning experience for me as it is for the original author!