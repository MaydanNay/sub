# Быстрый старт — Шпаргалка

## Запуск (одна команда)

```bash
python run_project.py
```

| Сервис       | URL                          |
|--------------|------------------------------|
| Frontend     | http://localhost:5175        |
| Backend API  | http://localhost:8000        |
| Swagger Docs | http://localhost:8000/docs   |

---

## Ручной запуск backend

```bash
source .venv/bin/activate                              # Linux/Mac
# .venv\Scripts\activate                               # Windows
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000
```

## Ручной запуск frontend

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

## Production сборка frontend

```bash
cd frontend && npm run build
# → frontend/dist/
```

---

## Сброс базы данных

```bash
rm sql_app.db
python run_project.py   # БД пересоздастся автоматически
```

---

## Порты

| Сервис   | Порт  |
|----------|-------|
| Backend  | 8000  |
| Frontend | 5175  |

---

## Полная документация

[DEVOPS.md](./DEVOPS.md)
