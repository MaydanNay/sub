import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Use environment variable for DB connection string
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./shuschool.db")

# For PostgreSQL, we don't need 'check_same_thread'
if SQLALCHEMY_DATABASE_URL.startswith("postgresql"):
    host_info = SQLALCHEMY_DATABASE_URL.split('@')[-1] if '@' in SQLALCHEMY_DATABASE_URL else SQLALCHEMY_DATABASE_URL
    print(f"Connecting to PostgreSQL database at: {host_info}")
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
else:
    print(f"USING SQLITE DATABASE: {SQLALCHEMY_DATABASE_URL}")
    print("WARNING: Data in SQLite is NOT persistent if running in ephemeral Docker container!")
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
