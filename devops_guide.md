# Руководство DevOps: Развертывание экосистемы SHU на Yandex Cloud

Данная документация предназначена для DevOps инженера и описывает процесс настройки сервера (Yandex Compute Cloud), контейнеризации проектов, настройки Nginx для маршрутизации поддоменов и конфигурации переменных окружения.

Экосистема состоит из 4-х основных проектов:
1. **Landing** (`shustudio.kz`)
2. **Catalog** (`app.shustudio.kz`)
3. **ShuSchool** (`school.shustudio.kz`)
4. **ShuTeam** (`team.shustudio.kz`)

---

## 1. Архитектура и распределение портов

Приложения запускаются через Docker Compose. Архитектура построена так, что для каждого проекта внутри Docker сети работает свой внутренний Nginx, который раздает статику React/Vite и проксирует `/api` на свой Backend-контейнер.  
**Хост-Nginx** (на самой ВМ Yandex) выступает лишь "входной дверью" (Reverse Proxy), которая распределяет трафик с определенного домена на конкретный опубликованный наружу порт Docker-контейнера.

| Ресурс / Домен | Расположение | Локальный Порт | Комментарий |
| --- | --- | --- | --- |
| **Landing** (`shustudio.kz`) | `SHU/frontend/` | `3000` | Контейнер `frontend`. |
| **Backend / Bot** | Корень (`backend/`, `SHU/bot/`) | `8000`, `3001` | Доступ для нужд внутренних сервисов и API. |
| **Catalog** (`app.shustudio.kz`)| Корень проекта (`frontend/`) | `3005` | Контейнер `catalog-frontend`. |
| **ShuSchool** (`school.shustudio.kz`)| `ShuSchool/` | `8080` | Контейнер `shuschool-frontend` из `ShuSchool/docker-compose.yml`. |
| **ShuTeam** (`team.shustudio.kz`) | `ShuTeam/` | `3012` | Контейнер `crm-frontend` из `ShuTeam/docker-compose.yml`. |

---

## 2. Подготовка сервера Yandex Cloud

1. Установите **Docker** и **Docker Compose V2**.
2. Установите **Nginx** (`sudo apt install nginx`), он будет служить маршрутизатором для доменов.
3. Установите **Certbot** (`sudo apt install certbot python3-certbot-nginx`) для SSL сертификатов.
4. В панели Yandex Cloud настройте **Network (VPC) Security Groups**, разрешив входящий трафик на порты `80`, `443`, и `22` (SSH).
5. Привяжите A-записи доменов: `shustudio.kz`, `www.shustudio.kz`, `app.shustudio.kz`, `school.shustudio.kz`, `team.shustudio.kz` к публичному IP-адресу вашей виртуальной машины.

---

## 3. Контейнеризация Каталога (app.shustudio.kz)

В текущей кодовой базе проект **Catalog** (`SHU/frontend/`) запускается через `start.sh` скрипт и не имеет Docker-образа. Чтобы унифицировать развертывание, **необходимо сделать следующее:**

### Шаг 1. Создать Nginx-конфигурацию для каталога
Создайте файл `SHU/frontend/nginx.conf`:
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        # Проксируем API-запросы к Telegram Node.js боту
        proxy_pass http://bot:3001; 
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Шаг 2. Создать Dockerfile для каталога
Создайте файл `SHU/frontend/Dockerfile`:
```dockerfile
# Stage 1: Build
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Шаг 3. Добавить сервис в корневой `docker-compose.yml`
Отредактируйте `/home/maydan/sub/docker-compose.yml`, добавив сервис `catalog-frontend`:
```yaml
  catalog-frontend:
    build: ./frontend
    restart: always
    depends_on:
      - backend
    ports:
      - "3005:80"
```

---

## 4. Запуск всех проектов (Docker Compose)

На сервере необходимо прописать `.env` файлы (можно скопировать из `.env.example`).
Вам потребуется запустить 3 независимых `docker-compose.yml` файла.

```bash
# 1. Landing + Backend + Bot + Catalog
cp .env.example .env
nano .env # Добавить пароли, БД и порты
docker compose up -build -d

# 2. ShuSchool
cd ShuSchool/
cp .env.example .env
nano .env # Заполните SECRET_KEY, OWNER_PHONE, OPENAI_API_KEY и др.
docker compose up --build -d
cd ..

# 3. ShuTeam
cd ShuTeam/
cp .env.example .env
nano .env 
docker compose up --build -d
cd ..
```

---

## 5. Конфигурация Nginx (На Хост-Машине)

После того как все Docker-контейнеры подняты и слушают свои порты (`3000`, `3005`, `8080`, `3012`), необходимо перенаправить на них трафик с соответствующих доменов.

Отредактируйте файл `/etc/nginx/sites-available/shustudio` хостовой машины:

```nginx
# Оптимизации и общие настройки
client_max_body_size 100M;

# --------------------------
# 1. LANDING (shustudio.kz)
# --------------------------
server {
    listen 80;
    server_name shustudio.kz www.shustudio.kz;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# --------------------------
# 2. CATALOG (app.shustudio.kz)
# --------------------------
server {
    listen 80;
    server_name app.shustudio.kz;

    location / {
        proxy_pass http://127.0.0.1:3005;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# --------------------------
# 3. SHU SCHOOL (school.shustudio.kz)
# --------------------------
server {
    listen 80;
    server_name school.shustudio.kz;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

# --------------------------
# 4. SHU TEAM (team.shustudio.kz)
# --------------------------
server {
    listen 80;
    server_name team.shustudio.kz;

    location / {
        proxy_pass http://127.0.0.1:3012;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Активируйте конфигурацию и перезапустите Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/shustudio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 6. Настройка SSL (HTTPS)

Как только порты настроены на HTTP 80, запустите Certbot, чтобы он автоматически запросил сертификаты через Let's Encrypt и отредактировал этот Nginx-файл для поддержки HTTPS 443:

```bash
sudo certbot --nginx -d shustudio.kz -d www.shustudio.kz -d app.shustudio.kz -d school.shustudio.kz -d team.shustudio.kz
```
**Важно:** certbot автоматически установит переадресацию с HTTP на HTTPS для всех блоков `server`.

## 7. Чек-лист перед сдачей продакшена
- [ ] Порты `80`, `443` открыты в Yandex VPC Firewall.
- [ ] Острожные порты (напр. Postgres `5432`/`5433`, Backend `8000`) **НЕ** смотрят наружу (или закрыты брандмауэром). Доступ к БД должен производиться только через SSH Tunnels или VPN.
- [ ] Базы Данных работают со storage-волюмами (`postgres_data`, `pgdata`), чтобы данные не уничтожились при перезапуске контейнеров.
- [ ] Файлы `.env` содержат сильные пароли и секреты, которых нет в репозитории `.env.example`.
