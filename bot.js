const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const TOKEN = process.env.BOT_TOKEN;
const PORT = process.env.PORT || 3000;
const URL = process.env.RENDER_EXTERNAL_URL;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

const bot = new TelegramBot(TOKEN, { webHook: true });
const app = express();
app.use(bodyParser.json());

// Set Telegram webhook
bot.setWebHook(`${URL}/bot${TOKEN}`)
  .then(() => console.log("✅ Webhook set successfully"))
  .catch(console.error);

// Handle /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "👋 Welcome to Pre-University Bot!");
});

// Forward user messages to admin
bot.on("message", async (msg) => {
  const chatId = msg.chat.id.toString();
  const text = msg.text || "";
  const from = msg.from;

  console.log("🔍 Incoming message:", JSON.stringify(msg, null, 2)); // <--- ADD THIS

  // Admin is replying to a user
  if (chatId === ADMIN_CHAT_ID) {
    if (msg.reply_to_message && msg.reply_to_message.text && msg.reply_to_message.text.includes("USER_ID:")) {
      const match = msg.reply_to_message.text.match(/USER_ID: (\d+)/);
      if (match) {
        const userId = match[1];
        await bot.sendMessage(userId, `👨‍🏫 Admin replied:\n\n${text}`);
        return;
      }
    }

    return bot.sendMessage(chatId, "❗ Please reply to a forwarded user message that contains USER_ID to respond.");
  }

  // Forward user message to admin
  const forwardText = `
📩 Message from ${from.first_name} (@${from.username || "no username"})  
USER_ID: ${from.id}

💬 ${text}
  `;
  await bot.sendMessage(ADMIN_CHAT_ID, forwardText);
});


// Webhook endpoint
app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Bot server listening on port ${PORT}`);
});
