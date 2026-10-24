import os
import asyncio
import logging
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

STUDENT_BOT_TOKEN = os.getenv("TELEGRAM_BOT_STUDENTS_PARENTS")
STAFF_BOT_TOKEN = os.getenv("TELEGRAM_BOT_STAFF")

DOMAIN = os.getenv("DOMAIN", "school.shustudio.kz")
# Telegram WebApps strongly require HTTPS
WEB_APP_URL_STUDENT = f"https://{DOMAIN}"
WEB_APP_URL_STAFF = f"https://{DOMAIN}/staff"

if not STUDENT_BOT_TOKEN:
    logging.info("📢 Телеграмм Бот (Ученики/Родители) отключен: отсутствует токен в .env")
student_bot = Bot(token=STUDENT_BOT_TOKEN) if STUDENT_BOT_TOKEN else None
student_dp = Dispatcher()

if not STAFF_BOT_TOKEN:
    logging.info("📢 Телеграмм Бот (Персонал) отключен: отсутствует токен в .env")
staff_bot = Bot(token=STAFF_BOT_TOKEN) if STAFF_BOT_TOKEN else None
staff_dp = Dispatcher()

@student_dp.message(Command("start"))
async def student_start_handler(message: types.Message):
    keyboard = InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(text="🎓 Открыть ShuSchool", web_app=WebAppInfo(url=WEB_APP_URL_STUDENT))
    ]])
    await message.answer(
        "Привет! Я бот ShuSchool 🐾\nНажмите кнопку ниже, чтобы открыть приложение или привязать свой аккаунт.", 
        reply_markup=keyboard
    )

@staff_dp.message(Command("start"))
async def staff_start_handler(message: types.Message):
    keyboard = InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(text="🏫 Панель Учителя/Админа", web_app=WebAppInfo(url=WEB_APP_URL_STAFF))
    ]])
    await message.answer(
        "Добро пожаловать в рабочую панель ShuSchool!\nНажмите кнопку ниже для входа в систему.", 
        reply_markup=keyboard
    )

async def start_bots():
    tasks = []
    if student_bot:
        tasks.append(student_dp.start_polling(student_bot, handle_signals=False))
    if staff_bot:
        tasks.append(staff_dp.start_polling(staff_bot, handle_signals=False))
    
    if tasks:
        logging.info("🚀 Запуск опроса Telegram ботов (aiogram)...")
        try:
            await asyncio.gather(*tasks)
        except Exception:
            # Exit non-zero so the container restart policy brings the bots back
            logging.exception("❌ Ошибка в работе Telegram ботов")
            raise
    else:
        logging.warning("⚠️ Телеграмм боты полностью отключены: отсутствуют токены в .env")

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    try:
        asyncio.run(start_bots())
    except KeyboardInterrupt:
        logging.info("🛑 Бот остановлен пользователем")
