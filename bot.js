const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const TOKEN = process.env.BOT_TOKEN;
const PORT = process.env.PORT || 3000;
const URL = process.env.RENDER_EXTERNAL_URL;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

const bot = new TelegramBot(TOKEN, { webHook: true }); // Enable webhook mode
const app = express();
app.use(bodyParser.json());

// Set Telegram webhook URL
bot.setWebHook(`${URL}/bot${TOKEN}`)
  .then(() => console.log("Webhook set successfully"))
  .catch(console.error);

// Handle /start command
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Welcome to Pre-University Bot!");
});

// Forward user messages to admin (excluding /start and admin messages)
bot.on('message', (msg) => {
  const chatId = msg.chat.id.toString();
  const text = msg.text || "";

  // Ignore /start command and messages from admin itself
  if (text.startsWith("/start") || chatId === ADMIN_CHAT_ID) return;

  const forwardText = `📩 Message from User ID: ${chatId}\n\n${text}`;
  bot.sendMessage(ADMIN_CHAT_ID, forwardText)
    .catch(err => console.error("Failed to forward message to admin:", err));
});

// Admin command to send message to users: /send <userId> <message>
bot.onText(/\/send (\d+) (.+)/, (msg, match) => {
  const fromId = msg.chat.id.toString();

  if (fromId !== ADMIN_CHAT_ID) {
    bot.sendMessage(fromId, "❌ You are not authorized to use this command.");
    return;
  }

  const userId = match[1];
  const message = match[2];

  console.log(`Admin sending message to user ${userId}: ${message}`);

  bot.sendMessage(userId, message)
    .then(() => bot.sendMessage(fromId, "✅ Message sent successfully."))
    .catch((err) => {
      console.error("Error sending message to user:", err);
      bot.sendMessage(fromId, `❌ Failed to send message: ${err.message}`);
    });
});

// Express endpoint to receive webhook updates from Telegram
app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Start Express server
app.listen(PORT, () => {
  console.log(`Bot server listening on port ${PORT}`);
});
