const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
require("dotenv").config();

const TOKEN = process.env.BOT_TOKEN;
const PORT = process.env.PORT || 3000;
const URL = process.env.RENDER_EXTERNAL_URL; // only available in Render

const bot = new TelegramBot(TOKEN, { webHook: { port: PORT } });
const app = express();

// Set the Telegram webhook
bot.setWebHook(`${URL}/bot${TOKEN}`);

// Basic command
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Welcome to Pre-University Bot!");
});

// Express endpoint for Telegram webhook
app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Bot server listening on port ${PORT}`);
});
