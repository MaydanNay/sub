import express from 'express';
import cors from 'cors';
import TelegramBot from 'node-telegram-bot-api';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const token = process.env.TELEGRAM_BOT_TOKEN;
const adminPassword = process.env.ADMIN_PASSWORD || 'Aa12345';
const port = process.env.PORT || 3001;

if (!token) {
    console.error('TELEGRAM_BOT_TOKEN is not defined in .env');
    process.exit(1);
}

// Store admin chat_id locally
const ADMIN_FILE = path.join(__dirname, 'admin.json');

let adminChatId = null;

// Helper to load admin
const loadAdmin = () => {
    if (fs.existsSync(ADMIN_FILE)) {
        try {
            const data = fs.readFileSync(ADMIN_FILE, 'utf8');
            const parsed = JSON.parse(data);
            if (parsed.chat_id) {
                adminChatId = parsed.chat_id;
                console.log(`Loaded admin chat_id: ${adminChatId}`);
            }
        } catch (e) {
            console.error('Failed to read admin.json', e);
        }
    }
};

// Helper to save admin
const saveAdmin = (chatId) => {
    adminChatId = chatId;
    fs.writeFileSync(ADMIN_FILE, JSON.stringify({ chat_id: chatId }), 'utf8');
    console.log(`Saved new admin chat_id: ${chatId}`);
};

loadAdmin();

// Initialize bot
const bot = new TelegramBot(token, { polling: true });

// Listen for /start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Пожалуйста, введите пароль для получения уведомлений с сайта:');

    // Wait for the next message from this user
    const checkPassword = (responseMsg) => {
        if (responseMsg.chat.id === chatId) {
            if (responseMsg.text === adminPassword) {
                saveAdmin(chatId);
                bot.sendMessage(chatId, 'Пароль правильный! Теперь вы админ, и я буду отправлять вам уведомления о заявках с сайта.');
            } else {
                bot.sendMessage(chatId, 'Неверный пароль. Регистрация отменена. Попробуйте снова через /start');
            }
            // Remove the listener after checking
            bot.removeListener('message', checkPassword);
        }
    };

    // Add temporary listener for the password
    bot.on('message', checkPassword);
});

// Setup Express API to receive forms from frontend
const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/notify', async (req, res) => {
    const { name, contact, task } = req.body;

    if (!adminChatId) {
        console.warn('Cannot send notification: No admin registered.');
        return res.status(500).json({ error: 'No admin registered to receive notifications. Please use /register_admin in the bot.' });
    }

    const message = `
🚨 <b>НОВАЯ ЗАЯВКА С САЙТА!</b> 🚨

👤 <b>Имя:</b> ${name || 'Не указано'}
📞 <b>Контакты:</b> ${contact || 'Не указано'}
📝 <b>Задача:</b>
${task || 'Не указана'}
`;

    try {
        await bot.sendMessage(adminChatId, message, { parse_mode: 'HTML' });
        res.status(200).json({ success: true, message: 'Notification sent successfully.' });
    } catch (error) {
        console.error('Error sending Telegram notification:', error.message);
        res.status(500).json({ error: 'Failed to send notification via Telegram.' });
    }
});

app.listen(port, () => {
    console.log(`Bot server is running on http://localhost:${port}`);
    console.log(`Waiting for commands in Telegram...`);
});
