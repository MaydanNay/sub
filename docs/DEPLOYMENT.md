# Инструкция по деплою проекта Gamification Catalog

Этот документ содержит техническую информацию для DevOps-инженера по развертыванию приложения на сервер.

## Архитектура проекта
Проект представляет собой Fullstack-приложение:
- **Frontend**: React + Vite (SPA).
- **Backend**: Python FastAPI.
- **Database**: SQLite (миграции не требуются, БД инициализируется автоматически при запуске).

---

## 1. Подготовка окружения

### Системные требования:
- **Node.js**: v18 или выше.
- **Python**: v3.9 или выше.
- **Nginx**: для обслуживания статики фронтенда и проксирования запросов к API.

---

## 2. Развертывание Backend (FastAPI)

Бэкенд находится в директории `/backend`.

### Шаги установки:
1. Создайте виртуальное окружение:
   ```bash
   python -m venv venv
   source venv/bin/activate  # для Linux/macOS
   # или
   venv\Scripts\activate     # для Windows
   ```
2. Установите зависимости:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. Запуск сервера:
   Для продакшена рекомендуется использовать `gunicorn` с воркерами `uvicorn`:
   ```bash
   pip install gunicorn
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker backend.main:app --bind 0.0.0.0:8000
   ```

> [!NOTE]
> База данных SQLite (`sql_app.db`) будет создана в корне проекта автоматически. Убедитесь, что у процесса есть права на запись в эту директорию.

---

## 3. Развертывание Frontend (React)

Фронтенд находится в директории `/frontend`.

### Шаги сборки:
1. Перейдите в директорию: `cd frontend`.
2. Установите зависимости: `npm install`.
3. Соберите проект: `npm run build`.

Результат сборки появится в директории `frontend/dist`. Эти статические файлы нужно раздавать через Nginx.

---

## 4. Конфигурация Nginx (Пример)

Рекомендуется использовать следующую конфигурацию для обработки статики и API:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Раздача фронтенда
    location / {
        root /path/to/project/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Проксирование запросов к API
    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 5. Рекомендации по безопасности (Checklist)

1. **CORS**: В `backend/main.py` сейчас установлено `allow_origins=["*"]`. В продакшене замените это на конкретный домен:
   ```python
   allow_origins=["https://your-domain.com"]
   ```
2. **Environment Variables**: Рекомендуется вынести настройки (порт, хост) в переменные окружения.
3. **Автозапуск**: Настройте `systemd` или `Supervisor` для автоматического перезапуска бэкенда в случае сбоя.
