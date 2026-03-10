import os
from sqlalchemy import create_engine, text
from backend.database import SQLALCHEMY_DATABASE_URL, SessionLocal
from backend import models

def fix_users():
    print(f"Connecting to {SQLALCHEMY_DATABASE_URL} for user fix...")
    db = SessionLocal()
    
    try:
        # 1. Get starter character
        starter_char = db.execute(text("SELECT id FROM characters WHERE name = 'Искатель'")).fetchone()
        if not starter_char:
            print("Starter character 'Искатель' not found. Skipping.")
            return
        
        starter_id = starter_char[0]
        
        # 2. Find all users
        users = db.execute(text("SELECT id, phone FROM users")).fetchall()
        
        for user_id, phone in users:
            # Check if user has any character in collection
            count = db.execute(text("SELECT count(*) FROM user_collections WHERE user_id = :u"), {"u": user_id}).scalar()
            
            if count == 0:
                print(f"Granting starter character to user {phone}...")
                db.execute(
                    text("INSERT INTO user_collections (user_id, character_id, quantity, level, characteristics) VALUES (:u, :c, 1, 1, '{}')"),
                    {"u": user_id, "c": starter_id}
                )
                db.execute(
                    text("UPDATE users SET equipped_character_id = :c WHERE id = :u"),
                    {"u": user_id, "c": starter_id}
                )
        
        db.commit()
        print("User synchronization complete.")
        
    except Exception as e:
        print(f"Error during user fix: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_users()
