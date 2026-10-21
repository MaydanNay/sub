#!/bin/bash

# Wait for postgres to be ready
echo "Waiting for postgres..."

while ! nc -z shuschool-db 5432; do
  sleep 0.1
done

echo "PostgreSQL started"

# Run migrations and seeding scripts before starting the server
echo "Applying migrations..."
python -u migrate.py

echo "Seeding database..."
python -u seed.py

# Start the uvicorn server
echo ""
echo "=================================================="
echo "🚀 SHUSCHOOL SYSTEM READY"
echo "=================================================="
echo "📍 Student & Parent Portal:  http://localhost:8080/login"
echo "📍 Teacher & Admin Portal:   http://localhost:8080/staff"
echo "📍 System Owner (Core):      http://localhost:8080/core"
echo "📍 Reception Terminal:       http://localhost:8080/reception"
echo "📍 API Documentation:        http://localhost:8080/api/docs"
echo "=================================================="
echo ""

exec uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
