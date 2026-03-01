import sqlite3
import os

db_paths = ["sql_app.db", "backend/sql_app.db"]

for db_path in db_paths:
    if os.path.exists(db_path):
        print(f"Migrating {db_path}...")
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN equipped_character_id INTEGER REFERENCES characters(id)")
            print(f"Added equipped_character_id to {db_path}")
        except sqlite3.OperationalError as e:
            print(f"Skipped equipped_character_id for {db_path}: {e}")
            
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN skins TEXT DEFAULT '[]'")
            print(f"Added skins to {db_path}")
        except sqlite3.OperationalError as e:
            print(f"Skipped skins for {db_path}: {e}")

        try:
            cursor.execute("ALTER TABLE users ADD COLUMN coupons TEXT DEFAULT '[]'")
            print(f"Added coupons to {db_path}")
        except sqlite3.OperationalError as e:
            print(f"Skipped coupons for {db_path}: {e}")
            
        conn.commit()
        conn.close()
    else:
        print(f"File {db_path} not found.")
