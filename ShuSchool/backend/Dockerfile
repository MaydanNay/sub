FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for psycopg2 and netcat
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    netcat-openbsd \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Make start.sh executable
RUN chmod +x start.sh

CMD ["./start.sh"]
