import os
from sqlalchemy import create_engine, text
from backend.database import SQLALCHEMY_DATABASE_URL

def run_migrations():
    print(f"Connecting to {SQLALCHEMY_DATABASE_URL}...")
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    
    with engine.connect() as conn:
        # PostgreSQL handled differently than SQLite for 'ADD COLUMN IF NOT EXISTS'
        is_postgres = SQLALCHEMY_DATABASE_URL.startswith("postgresql")
        
        migrations = [
            ("users", "equipped_character_id", "INTEGER REFERENCES characters(id)"),
            ("users", "skins", "TEXT DEFAULT '[]'"),
            ("users", "coupons", "TEXT DEFAULT '[]'")
        ]
        
        for table, column, col_type in migrations:
            try:
                if is_postgres:
                    # check if column exists in postgres
                    check_sql = text(f"SELECT column_name FROM information_schema.columns WHERE table_name='{table}' AND column_name='{column}'")
                    exists = conn.execute(check_sql).fetchone()
                    if not exists:
                        conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {col_type}"))
                        conn.commit()
                        print(f"Added {column} to {table}")
                else:
                    # SQLite simple alter
                    conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {col_type}"))
                    conn.commit()
                    print(f"Added {column} to {table}")
            except Exception as e:
                print(f"Skipped {column} for {table}: {e}")

if __name__ == "__main__":
    run_migrations()
