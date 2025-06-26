require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Handle incoming messages
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const from = msg.from;
    const text = msg.text;

    // Check if admin is replying to a user
    if (chatId.toString() === process.env.ADMIN_CHAT_ID) {
        if (msg.reply_to_message && msg.reply_to_message.text.includes('USER_ID:')) {
            const match = msg.reply_to_message.text.match(/USER_ID: (\d+)/);
            if (match) {
                const userId = match[1];
                await bot.sendMessage(userId, `👨‍🏫 Admin replied:\n\n${text}`);
                return;
            }
        }

        return bot.sendMessage(chatId, "❗ Please reply to a forwarded user message to respond.");
    }

    // Forward user message to the admin
    const forwardText = `
📩 Message from ${from.first_name} (@${from.username || 'no username'})  
USER_ID: ${from.id}

💬 ${text}
    `;

    await bot.sendMessage(process.env.ADMIN_CHAT_ID, forwardText);
});
