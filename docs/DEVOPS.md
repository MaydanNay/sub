# DevOps Documentation — Gamification Platform

> **Версия:** 1.0 | **Updated:** 2026-02-20  
> Этот документ описывает всё необходимое для развёртывания, эксплуатации и сопровождения платформы.

---

## Содержание

1. [Обзор архитектуры](#1-обзор-архитектуры)
2. [Требования к окружению](#2-требования-к-окружению)
3. [Структура репозитория](#3-структура-репозитория)
4. [Локальный запуск (разработка)](#4-локальный-запуск-разработка)
5. [Переменные окружения](#5-переменные-окружения)
6. [Backend — FastAPI](#6-backend--fastapi)
7. [Frontend — React / Vite](#7-frontend--react--vite)
8. [База данных](#8-база-данных)
9. [API — эндпоинты](#9-api--эндпоинты)
10. [Игровые модули](#10-игровые-модули)
11. [Production-развёртывание](#11-production-развёртывание)
12. [Мониторинг и логи](#12-мониторинг-и-логи)
13. [Известные ограничения и TODO](#13-известные-ограничения-и-todo)

---

## 1. Обзор архитектуры

```
┌─────────────────────────────────────────────────────────┐
│                     Browser / Mobile                    │
│               React SPA  (port 5175 dev)                │
└──────────────────────┬──────────────────────────────────┘
                       │  /api/*  proxy (dev)
                       │  direct request (prod)
┌──────────────────────▼──────────────────────────────────┐
│               FastAPI Backend  (port 8000)               │
│   ┌────────────┐  ┌──────────┐  ┌─────────────────────┐ │
│   │  main.py   │  │ crud.py  │  │  models.py /        │ │
│   │  (router)  │  │ (logic)  │  │  models_shubank.py  │ │
│   └────────────┘  └──────────┘  └─────────────────────┘ │
│                     SQLAlchemy ORM                       │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│            SQLite  (sql_app.db в корне проекта)          │
└─────────────────────────────────────────────────────────┘
```

**Тип:** Монорепозиторий, SPA + REST API  
**Общение:** JSON через HTTP  
**Авторизация:** Mock-авторизация по номеру телефона (без токенов, для MVP)

---

## 2. Требования к окружению

### Минимальные

| Инструмент | Версия       | Зачем                     |
|------------|--------------|---------------------------|
| Python     | 3.10+        | FastAPI backend            |
| Node.js    | 18+          | Vite + React frontend      |
| npm        | 9+           | Управление пакетами        |
| Git        | любая        | Клонирование репозитория   |

### Опционально (production)

| Инструмент | Зачем                               |
|------------|-------------------------------------|
| nginx      | Reverse proxy, отдача статики       |
| PM2        | Менеджер процессов для FastAPI      |
| PostgreSQL | Замена SQLite для высоких нагрузок  |
| Docker     | Контейнеризация (см. раздел 11)     |

---

## 3. Структура репозитория

```
sub/
├── backend/                  # Python / FastAPI
│   ├── main.py               # Главный файл приложения, все роутеры
│   ├── database.py           # Подключение к БД (SQLite)
│   ├── models.py             # ORM-модели (ShuBoom, Promotions, User...)
│   ├── models_shubank.py     # ORM-модели для ShuBank
│   ├── schemas.py            # Pydantic-схемы запросов/ответов
│   ├── crud.py               # CRUD-операции (бизнес-логика)
│   ├── shubeauty.py          # Роутер для ShuBeauty (отдельный файл)
│   └── requirements.txt      # Python-зависимости
│
├── frontend/                 # React / Vite
│   ├── src/
│   │   ├── App.jsx           # Главный роутер (все маршруты)
│   │   ├── main.jsx          # Entry point
│   │   ├── api.js            # Базовый URL API
│   │   ├── index.css         # Глобальные стили
│   │   ├── components/       # Общие компоненты
│   │   └── pages/            # Игры и страницы
│   │       ├── ShuBoom/
│   │       ├── ShuBank/
│   │       ├── ShuBeauty/
│   │       ├── ShuDom/
│   │       ├── ShuGnum/
│   │       ├── ShuMetal/
│   │       ├── ShuQaz/
│   │       ├── ShuShi/
│   │       ├── Shalam/
│   │       ├── Nauryz/
│   │       └── ...           # Другие игры-прототипы
│   ├── package.json
│   ├── vite.config.js        # Vite конфигурация + proxy
│   └── tailwind.config.js
│
├── docs/                     # ← Документация (этот файл)
├── sql_app.db                # SQLite база данных (в .gitignore нет!)
├── run_project.py            # Кросс-платформенный скрипт запуска
├── start_servers.bat         # Альтернативный запуск для Windows
└── .venv/                    # Виртуальное окружение Python (локально)
```

---

## 4. Локальный запуск (разработка)

### Быстрый старт (рекомендуется)

```bash
# Клонирование
git clone https://github.com/MaydanNay/sub.git
cd sub

# Запуск обоих серверов одной командой
python run_project.py
```

После запуска:
- **Frontend:** http://localhost:5175
- **Backend API:** http://localhost:8000
- **API Docs (Swagger):** http://localhost:8000/docs

---

### Ручной запуск

#### Backend

```bash
# Создать виртуальное окружение
python -m venv .venv

# Активировать (Linux/Mac)
source .venv/bin/activate

# Активировать (Windows)
.venv\Scripts\activate

# Установить зависимости
pip install -r backend/requirements.txt

# Запустить сервер
uvicorn backend.main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend

# Установить зависимости
npm install --legacy-peer-deps

# Запустить dev-сервер
npm run dev
```

> **Флаг `--legacy-peer-deps`** необходим из-за конфликтов зависимостей между `react-dnd`, `lucide-react` и другими пакетами.

---

## 5. Переменные окружения

На данный момент проект **не использует файл `.env`**. Все настройки хардкодированы:

| Параметр          | Файл                      | Значение по умолчанию        |
|-------------------|---------------------------|------------------------------|
| Database URL      | `backend/database.py`     | `sqlite:///./sql_app.db`     |
| Backend port      | `run_project.py`          | `8000`                       |
| Frontend port     | `frontend/vite.config.js` | `5175`                       |
| API proxy target  | `frontend/vite.config.js` | `http://127.0.0.1:8000`      |
| CORS origins      | `backend/main.py`         | `localhost:5175`, `127.0.0.1:5175` |

> ⚠️ **Для production:** необходимо вынести все настройки в `.env` файл и ограничить CORS конкретными доменами.

---

## 6. Backend — FastAPI

### Запуск

```bash
uvicorn backend.main:app --reload --port 8000
```

### Зависимости (`backend/requirements.txt`)

```
fastapi==0.111.0
uvicorn[standard]==0.29.0
sqlalchemy==2.0.30
pydantic==2.7.1
```

### Структура приложения

| Файл               | Назначение                                     |
|--------------------|------------------------------------------------|
| `main.py`          | Регистрация middleware, роутеров, startup-seed |
| `database.py`      | SQLAlchemy engine + сессия                     |
| `models.py`        | ORM-таблицы (users, characters, promotions...) |
| `models_shubank.py`| ORM-таблицы для ShuBank игры                  |
| `schemas.py`       | Pydantic-схемы для валидации                   |
| `crud.py`          | Бизнес-логика, CRUD-операции                   |
| `shubeauty.py`     | APIRouter для ShuBeauty                        |

### Startup seeding

При первом запуске `startup_event()` автоматически заполняет БД:
- 3 промоакции
- 7 персонажей (ShuBoom) с редкостями COMMON / RARE / LEGENDARY

---

## 7. Frontend — React / Vite

### Ключевые зависимости

| Пакет              | Версия    | Назначение                        |
|--------------------|-----------|-----------------------------------|
| react              | ^18.2.0   | UI-фреймворк                      |
| react-router-dom   | ^7.13.0   | SPA-роутинг                       |
| framer-motion      | ^12.33.0  | Анимации                          |
| tailwindcss        | ^3.3.3    | CSS utility-классы                |
| phaser             | ^3.90.0   | 2D игровой движок (ShuGnum, Shalam) |
| zustand            | ^5.0.11   | Глобальный стейт                  |
| axios              | ^1.6.0    | HTTP-запросы к API                |
| three              | ^0.182.0  | 3D (используется в ShuBoom AR)    |
| leaflet            | ^1.9.4    | Карты (ShuBoom Map)               |

### Сборка для production

```bash
cd frontend
npm run build
```

Результат: папка `frontend/dist/` — готовые статичные файлы.

### Vite конфигурация

```
base: './'              ← относительные пути (важно для деплоя в подпапку)
port: 5175              ← dev-сервер
proxy /api → :8000      ← только для dev, в prod нужен nginx
assetsInclude: ['**/*.PNG']  ← поддержка файлов с расширением .PNG
```

---

## 8. База данных

**Тип:** SQLite (файл `sql_app.db` в корне проекта)  
**ORM:** SQLAlchemy

### Таблицы (models.py)

| Таблица           | Описание                                   |
|-------------------|--------------------------------------------|
| `promotions`      | Акции и спецпредложения                    |
| `users`           | Пользователи (идентификация по телефону)   |
| `characters`      | Персонажи-коллекционабли (ShuBoom)         |
| `user_collections`| Коллекция карточек пользователя            |
| `quests`          | Квесты (DAILY / WEEKLY / GEO / PRODUCT)    |

### Таблицы (models_shubank.py)

| Таблица         | Описание                                     |
|-----------------|----------------------------------------------|
| `shubank_users` | Пользователи ShuBank (по `bank_client_id`)   |
| `shubank_prides`| Копилки / цели сбережений                   |

### Миграции

Миграции отсутствуют — схема создаётся автоматически при старте (`create_all`). При изменении моделей необходимо **удалить `sql_app.db`** и перезапустить сервер, или настроить Alembic.

```bash
# Сброс БД (удаляет все данные!)
rm sql_app.db
uvicorn backend.main:app --reload --port 8000
```

> ⚠️ **Для production рекомендуется:** перейти на PostgreSQL + Alembic для управления миграциями.

---

## 9. API — эндпоинты

Интерактивная документация доступна по адресу: **http://localhost:8000/docs**

### Основные группы

#### Авторизация
| Метод | Путь                 | Описание                    |
|-------|----------------------|-----------------------------|
| POST  | `/api/v1/auth/login` | Mock-логин по номеру телефона |
| GET   | `/api/v1/user/{phone}` | Профиль пользователя      |

#### ShuBoom — сундуки и коллекция
| Метод | Путь                         | Описание                 |
|-------|------------------------------|--------------------------|
| POST  | `/api/v1/transactions/scan`  | Сканирование чека → сундук |
| POST  | `/api/v1/chests/open`        | Открытие сундука          |
| GET   | `/api/v1/collection/{phone}` | Коллекция пользователя    |
| POST  | `/api/v1/collection/merge`   | Объединение карточек      |
| POST  | `/api/v1/shop/buy_chest`     | Покупка сундука за монеты |
| POST  | `/api/v1/user/daily_reward`  | Ежедневная награда        |

#### ShuBank
| Метод | Путь                           | Описание              |
|-------|--------------------------------|-----------------------|
| GET   | `/api/v1/shubank/state`        | Состояние игры        |
| POST  | `/api/v1/shubank/shop/buy`     | Покупка в магазине    |
| POST  | `/api/v1/shubank/pride/create` | Создание копилки      |
| POST  | `/api/v1/shubank/minigame/sync`| Синхронизация монет   |

#### Вебхуки (банк → игра)
| Метод | Путь                            | Описание                |
|-------|---------------------------------|-------------------------|
| POST  | `/webhooks/bank/transaction`    | Новая транзакция → +энергия |
| POST  | `/webhooks/bank/deposit_update` | Обновление баланса → уровень дома |

---

## 10. Игровые модули

Каждая игра — отдельный модуль в `frontend/src/pages/`. Большинство игр полностью фронтенд (localStorage), некоторые интегрированы с backend.

| Модуль    | URL-база          | Backend? | Движок         | Описание                         |
|-----------|-------------------|----------|----------------|----------------------------------|
| ShuBoom   | `/game/shuboom`   | ✅ Да   | React          | Коллекционные карточки + AR      |
| ShuBank   | `/game/shubank`   | ✅ Да   | React          | Банковская тематика, Tushkan     |
| ShuBeauty | `/game/shubeauty` | ✅ Да   | Phaser 3       | Лабиринт, Beauty бренд          |
| ShuDom    | `/game/shudom`    | ❌ Нет  | React          | Match-3 + обустройство комнаты   |
| ShuMetal  | `/game/shumetal`  | ❌ Нет  | React          | Металл тема, Alucoin             |
| ShuGnum   | `/game/shugnum`   | ❌ Нет  | Phaser 3       | Оливье Doda, экшн-игра           |
| ShuQaz    | `/game/shuqaz`    | ❌ Нет  | React          | Изучение казахского языка        |
| ShuShi    | `/game/shushi`    | ❌ Нет  | React          | Суши-тема                        |
| Shalam    | `/game/shalam`    | ❌ Нет  | Phaser 3       | Cola-тема, Агент                 |
| Nauryz    | `/game/nauryz`    | ❌ Нет  | React          | Наурыз тематика                  |
| Slots     | `/game/slots`     | ❌ Нет  | React          | Слоты                            |
| Memory    | `/game/memory`    | ❌ Нет  | React          | Карточная память                 |
| Quiz      | `/game/quiz`      | ❌ Нет  | React          | Квиз                             |
| и другие  | `/game/...`       | ❌ Нет  | React          | Прочие прототипы                 |

---

## 11. Production-развёртывание

### Вариант A: VPS (nginx + uvicorn)

#### 1. Клонирование и сборка frontend
```bash
git clone https://github.com/MaydanNay/sub.git /var/www/sub
cd /var/www/sub/frontend
npm install --legacy-peer-deps
npm run build
# → dist/ готов
```

#### 2. Запуск backend (systemd)

Создать `/etc/systemd/system/sub-backend.service`:
```ini
[Unit]
Description=Sub Gamification Backend
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/sub
ExecStart=/var/www/sub/.venv/bin/uvicorn backend.main:app --host 127.0.0.1 --port 8000 --workers 2
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
systemctl daemon-reload
systemctl enable sub-backend
systemctl start sub-backend
```

#### 3. Nginx конфигурация

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend (статика)
    root /var/www/sub/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Webhooks
    location /webhooks/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
    }
}
```

```bash
nginx -t
systemctl reload nginx
```

---

### Вариант B: Docker (базовый пример)

#### `Dockerfile.backend`
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ ./backend/
EXPOSE 8000
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### `Dockerfile.frontend`
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY frontend/package*.json .
RUN npm install --legacy-peer-deps
COPY frontend/ .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
```

#### `docker-compose.yml`
```yaml
version: '3.9'
services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "8000:8000"
    volumes:
      - ./sql_app.db:/app/sql_app.db

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

```bash
docker-compose up -d
```

---

## 12. Мониторинг и логи

### Backend логи

```bash
# Systemd
journalctl -u sub-backend -f

# Прямой запуск
uvicorn backend.main:app --reload --log-level info
```

### Health check

```bash
curl http://localhost:8000/docs
# или
curl http://localhost:8000/api/v1/promotions
```

### FastAPI автодокументация

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

## 13. Известные ограничения и TODO

### ⚠️ Критично для production

| Проблема | Статус | Рекомендация |
|----------|--------|---|
| CORS `allow_origins=["*"]` | ✅ Исправлено | Ограничен `localhost:5175` (prod: заменить на домен) |
| Авторизация по телефону без токенов | ❌ Открыто | Внедрить JWT или OAuth2 |
| SQLite как production БД | ❌ Открыто | Перейти на PostgreSQL |
| Нет Alembic-миграций | ❌ Открыто | Настроить `alembic init` |
| Зависимости без версий в `requirements.txt` | ✅ Исправлено | Версии зафиксированы |
| `sql_app.db` может попасть в git | ✅ В `.gitignore` | Выполнить `git rm --cached sql_app.db` если уже закоммичен |

### 🔧 Технический долг

| Проблема | Файл |
|----------|------|
| Mock-логин (`phone` = query param) | `main.py:81` |
| Mock `ShuBank` без реальной интеграции с банком | `main.py:203+` |
| Нет rate limiting на API | `main.py` |
| QR-сканирование — заглушка | `main.py:102` |
| ~~`start_servers.bat` использует неверный порт 5173 вместо 5175~~ | ✅ Исправлено |

### 📋 Запланированные улучшения

- [ ] Перейти на PostgreSQL + Alembic
- [ ] Добавить JWT-аутентификацию
- [ ] Настроить CI/CD (GitHub Actions)
- [ ] Добавить тесты (pytest для backend, Vitest для frontend)
- [ ] Вынести конфигурацию в `.env`
- [ ] Реальная интеграция с банком через webhook с подписью HMAC
- [ ] CDN для статических активов (изображения игр)
