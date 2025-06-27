const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const TOKEN = process.env.BOT_TOKEN;
const PORT = process.env.PORT || 3000;
const URL = process.env.RENDER_EXTERNAL_URL;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

const bot = new TelegramBot(TOKEN);
const app = express();
app.use(bodyParser.json()); // Needed to parse incoming Telegram updates

// Set the Telegram webhook
bot.setWebHook(`${URL}/bot${TOKEN}`);

// Handle /start command
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Welcome to Pre-University Bot!");
});

// Forward user messages to the admin
bot.on('message', (msg) => {
  const chatId = msg.chat.id.toString();
  const text = msg.text;

  // Don't forward /start or admin messages
  if (text.startsWith('/start') || chatId === ADMIN_CHAT_ID) return;

  // Forward to admin
  const forwardText = `From User ID: ${chatId}\nMessage: ${text}`;
  bot.sendMessage(ADMIN_CHAT_ID, forwardText);
});

// Admin sends messages to users in format: /send <userId> <message>
bot.onText(/\/send (\d+) (.+)/, (msg, match) => {
  const fromId = msg.chat.id.toString();

  if (fromId !== ADMIN_CHAT_ID) {
    bot.sendMessage(fromId, "❌ You are not authorized to use this command.");
    return;
  }

  const userId = match[1];
  const message = match[2];

  bot.sendMessage(userId, message)
    .then(() => bot.sendMessage(fromId, "✅ Message sent successfully."))
    .catch((err) => bot.sendMessage(fromId, `❌ Failed to send message: ${err.message}`));
});

// Express webhook endpoint
app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Bot server listening on port ${PORT}`);
});
