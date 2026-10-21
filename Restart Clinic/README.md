# Restart Clinic — MVP Telegram App

Telegram-бот + Mini App + веб-панель для геймификации реабилитации в Restart Clinic.

## Архитектура

```
restart-clinic/
├── backend/      # API (Fastify) + Telegram-бот (grammY) + cron-уведомления
├── mini-app/     # Telegram Mini App для пациентов (React)
├── dashboard/    # Панель администратора и врача (React)
├── shared/       # Общая бизнес-логика (этапы, награды, мотивация)
└── docker-compose.yml  # PostgreSQL
```

## Быстрый старт

### 1. Зависимости

```bash
npm install
cp .env.example .env
cp mini-app/.env.example mini-app/.env
cp dashboard/.env.example dashboard/.env
```

### 2. База данных

```bash
docker compose up -d
cd backend && npx prisma db push && npm run db:seed
```

### 3. Telegram-бот

1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Укажите `TELEGRAM_BOT_TOKEN` в `.env`
3. В BotFather → Bot Settings → Menu Button → укажите URL Mini App (для продакшена — HTTPS)

### 4. Запуск

```bash
npm run dev
```

| Сервис    | URL                      |
|-----------|--------------------------|
| API + Bot | http://localhost:3001    |
| Mini App  | http://localhost:5173    |
| Dashboard | http://localhost:5174    |

### Тестовые аккаунты (после seed)

| Роль          | Email                          | Пароль    |
|---------------|--------------------------------|-----------|
| Администратор | admin@restart-clinic.local     | admin123  |
| Врач          | doctor@restart-clinic.local    | doctor123 |

## Пользовательские сценарии (реализовано)

### Пациент
1. Сканирует QR → `/start` в боте
2. «Записаться на консультацию» → делится контактом
3. После апрува админом — push с кнопкой Mini App
4. В Mini App: профиль, «Путь героя», маскот, внутренние бегунки на этапе 3

### Администратор
- Просмотр новых заявок → «Открыть доступ» (ФИО, возраст, диагноз, врач)
- База пациентов

### Врач
- Список своих пациентов
- «Пациент прошёл занятие» — рост статов + уведомление в Telegram
- Смена этапа (1–4)
- Назначение следующего визита
- «Завершить курс» — расчёт дисциплины и медали (Бронза/Серебро/Золото)

### Push-уведомления (cron)
- За сутки до визита
- Анти-отток: если нет визита > 7 дней (настраивается `INACTIVE_DAYS_THRESHOLD`)

## Деплой

Для продакшена нужны:
- HTTPS для Mini App (обязательно для Telegram Web App)
- Публичный URL API для бота (webhook или long polling)
- PostgreSQL

## Что вне scope MVP

- Прямая интеграция с CRM
- Реальные иллюстрации маскота (сейчас emoji-заглушки)
- QR-генератор (можно добавить ссылку `https://t.me/YourBot`)
