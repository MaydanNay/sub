#!/bin/bash

# === НАСТРОЙКИ СЕРВЕРА ===
SERVER_IP="94.131.80.210"
SERVER_USER="shustudio"
LOCAL_DIR="$(pwd)"
REMOTE_DIR="/home/shustudio/shu_ecosystem"

echo "=========================================================="
echo "🚀 Начинаем автоматический деплой всей экосистемы SHU..."
echo "=========================================================="

# 1. КОПИРОВАНИЕ ФАЙЛОВ
echo ""
echo "📦 Шаг 1: Копируем файлы на сервер (без тяжелых папок)..."
# Используем rsync для умного копирования: пропускаем кэш, логи и виртуальные окружения
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '.venv' \
    --exclude '__pycache__' \
    --exclude 'shuschool.db' \
    --exclude 'sql_app.db' \
    "$LOCAL_DIR/" "$SERVER_USER@$SERVER_IP:$REMOTE_DIR/"

# 2. НАСТРОЙКА И ЗАПУСК НА СЕРВЕРЕ
echo ""
echo "🔧 Шаг 2: Подключаемся к серверу для настройки Nginx и запуска Docker..."

# Обрати внимание: 'EOF' в кавычках означает, что все переменные (например $host) 
# отправятся на сервер "как есть", без локальной подстановки.
ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" << 'EOF'

echo "🔄 Обновляем список пакетов и ставим Nginx + Certbot..."
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx

echo "🐳 Запускаем Основные проекты (Landing, Catalog, Backend)..."
cd /home/shustudio/shu_ecosystem
docker-compose up --build -d

echo "🎓 Запускаем ShuSchool..."
if [ -d "ShuSchool" ]; then
    cd ShuSchool
    docker-compose up --build -d
    cd ..
fi

echo "👥 Запускаем ShuGroup (ShuTeam)..."
if [ -d "ShuTeam" ]; then
    cd ShuTeam
    docker-compose up --build -d
    cd ..
fi

echo "🏥 Запускаем Restart Clinic..."
if [ -d "Restart Clinic" ]; then
    cd "Restart Clinic"
    docker-compose up --build -d
    cd ..
fi

echo "✅ Все сервисы на сервере успешно перезапущены!"
EOF

echo "=========================================================="
echo "🎉 ДЕПЛОЙ УСПЕШНО ЗАВЕРШЕН!"
echo "=========================================================="
echo "Чтобы включить HTTPS (замочек в браузере), убедись, что все домены"
echo "уже привязаны к IP 94.131.80.210 в панели регистратора."
echo "Затем зайди на сервер (ssh shustudio@94.131.80.210) и выполни команду:"
echo ""
echo "sudo certbot --nginx -d shustudio.kz -d www.shustudio.kz -d app.shustudio.kz -d school.shustudio.kz -d group.shustudio.kz -d clinic.shustudio.kz"
echo "=========================================================="
