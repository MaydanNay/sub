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
const adminPassword = process.env.ADMIN_PASSWORD;
const port = process.env.PORT || 3001;

if (!token) {
    console.error('TELEGRAM_BOT_TOKEN is not defined in .env');
    process.exit(1);
}
if (!adminPassword) {
    // There used to be a hardcoded fallback password anyone could guess
    console.error('ADMIN_PASSWORD is not defined in .env');
    process.exit(1);
}

// Store admin chat_id locally
const ADMIN_FILE = path.join(__dirname, 'admin.json');

let adminChatId = null;

// Helper to load admin (startup only, sync is fine here)
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

// Helper to save admin: async so a slow disk never blocks the HTTP server
const saveAdmin = async (chatId) => {
    await fs.promises.writeFile(ADMIN_FILE, JSON.stringify({ chat_id: chatId }), 'utf8');
    adminChatId = chatId;
    console.log(`Saved new admin chat_id: ${chatId}`);
};

// Values go into a parse_mode=HTML message: an unescaped "<" made Telegram reject it
const escapeHtml = (value) =>
    String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

loadAdmin();

// Initialize bot
const bot = new TelegramBot(token, { polling: true });
bot.on('polling_error', (error) => console.error('Telegram polling error:', error.message));

// Chats that were asked for the password and haven't answered yet
const awaitingPassword = new Set();

bot.onText(/^\/start/, async (msg) => {
    awaitingPassword.add(msg.chat.id);
    try {
        await bot.sendMessage(msg.chat.id, 'Пожалуйста, введите пароль для получения уведомлений с сайта:');
    } catch (error) {
        console.error('Failed to send /start reply:', error.message);
    }
});

// One listener for all chats (a listener per /start used to pile up on repeated /start)
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    if (!awaitingPassword.has(chatId) || !msg.text || msg.text.startsWith('/start')) return;
    awaitingPassword.delete(chatId);

    try {
        if (msg.text === adminPassword) {
            await saveAdmin(chatId);
            await bot.sendMessage(chatId, 'Пароль правильный! Теперь вы админ, и я буду отправлять вам уведомления о заявках с сайта.');
        } else {
            await bot.sendMessage(chatId, 'Неверный пароль. Регистрация отменена. Попробуйте снова через /start');
        }
    } catch (error) {
        console.error('Failed to handle admin password:', error.message);
        await bot.sendMessage(chatId, 'Не удалось сохранить администратора. Попробуйте ещё раз через /start').catch(() => undefined);
    }
});

// Setup Express API to receive forms from frontend
const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/notify', async (req, res) => {
    const { name, contact, task } = req.body ?? {};

    if (!contact) {
        return res.status(400).json({ error: 'Field "contact" is required.' });
    }

    if (!adminChatId) {
        console.warn('Cannot send notification: No admin registered.');
        return res.status(503).json({ error: 'No admin registered to receive notifications. Send /start to the bot and enter the admin password.' });
    }

    const message = `
🚨 <b>НОВАЯ ЗАЯВКА С САЙТА!</b> 🚨

👤 <b>Имя:</b> ${escapeHtml(name || 'Не указано')}
📞 <b>Контакты:</b> ${escapeHtml(contact)}
📝 <b>Задача:</b>
${escapeHtml(task || 'Не указана')}
`;

    try {
        await bot.sendMessage(adminChatId, message, { parse_mode: 'HTML' });
        res.status(200).json({ success: true, message: 'Notification sent successfully.' });
    } catch (error) {
        console.error('Error sending Telegram notification:', error.message);
        res.status(502).json({ error: 'Failed to send notification via Telegram.' });
    }
});

// JSON instead of Express' default HTML page (e.g. for malformed JSON bodies)
app.use((err, req, res, next) => {
    console.error('Request failed:', err.message);
    res.status(err.status || 500).json({ error: err.status ? err.message : 'Internal server error' });
});

app.listen(port, () => {
    console.log(`Bot server is running on http://localhost:${port}`);
    console.log(`Waiting for commands in Telegram...`);
});
