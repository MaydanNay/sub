from database import engine
from sqlalchemy import text
import models

def update_db():
    print("Updating database schema...")
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE parent_student_association ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'pending'"))
            print("Status column added to parent_student_association")
        except Exception as e:
            print(f"Status column may already exist or error: {e}")
        
        try:
            conn.execute(text("ALTER TABLE schools ADD COLUMN IF NOT EXISTS settings JSON"))
            print("Settings column added to schools")
        except Exception as e:
            print(f"Settings column error: {e}")

        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS assigned_classes JSON"))
            print("assigned_classes column added to users")
        except Exception as e:
            print(f"assigned_classes column error: {e}")

        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS assigned_subjects JSON"))
            print("assigned_subjects column added to users")
        except Exception as e:
            print(f"assigned_subjects column error: {e}")

        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_id VARCHAR UNIQUE"))
            print("telegram_id column added to users")
        except Exception as e:
            print(f"telegram_id column error: {e}")

        try:
            conn.execute(text("ALTER TABLE homeworks ADD COLUMN IF NOT EXISTS teacher_id INTEGER REFERENCES users(id)"))
            print("teacher_id column added to homeworks")
        except Exception as e:
            print(f"teacher_id column error: {e}")

        try:
            conn.execute(text("ALTER TABLE homeworks ADD COLUMN IF NOT EXISTS is_mascot_reward BOOLEAN DEFAULT FALSE"))
            print("is_mascot_reward column added to homeworks")
        except Exception as e:
            print(f"is_mascot_reward column error: {e}")

        try:
            conn.execute(text("ALTER TABLE homeworks ADD COLUMN IF NOT EXISTS class_name VARCHAR"))
            print("class_name column added to homeworks")
        except Exception as e:
            print(f"class_name column error: {e}")

        try:
            conn.execute(text("ALTER TABLE homeworks ADD COLUMN IF NOT EXISTS due_date TIMESTAMP"))
            print("due_date column added to homeworks")
        except Exception as e:
            print(f"due_date column error: {e}")

        try:
            conn.execute(text("ALTER TABLE characters ADD COLUMN IF NOT EXISTS mascot_slots INTEGER DEFAULT 0"))
            print("mascot_slots column added to characters")
        except Exception as e:
            print(f"mascot_slots column error: {e}")

        try:
            conn.execute(text("ALTER TABLE characters ADD COLUMN IF NOT EXISTS unlocked_mascots JSON DEFAULT '[]'"))
            print("unlocked_mascots column added to characters")
        except Exception as e:
            print(f"unlocked_mascots column error: {e}")

        try:
            conn.execute(text("ALTER TABLE characters ADD COLUMN IF NOT EXISTS active_mascot VARCHAR"))
            print("active_mascot column added to characters")
        except Exception as e:
            print(f"active_mascot column error: {e}")

        try:
            conn.execute(text("ALTER TABLE characters ADD COLUMN IF NOT EXISTS mascot_hunger FLOAT DEFAULT 100.0"))
            print("mascot_hunger column added to characters")
        except Exception as e:
            print(f"mascot_hunger column error: {e}")

        try:
            conn.execute(text("ALTER TABLE characters ADD COLUMN IF NOT EXISTS mascot_happiness FLOAT DEFAULT 100.0"))
            print("mascot_happiness column added to characters")
        except Exception as e:
            print(f"mascot_happiness column error: {e}")

        try:
            # Use TIMESTAMP for Postgres, SQLite will handle it as well
            conn.execute(text("ALTER TABLE characters ADD COLUMN IF NOT EXISTS last_mascot_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP"))
            print("last_mascot_update column added to characters")
        except Exception as e:
            print(f"last_mascot_update column error: {e}")

        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS can_create_internships BOOLEAN DEFAULT FALSE"))
            print("can_create_internships column added to users")
        except Exception as e:
            print(f"can_create_internships column error: {e}")

        try:
            conn.execute(text("ALTER TABLE homeworks ADD COLUMN IF NOT EXISTS is_internship BOOLEAN DEFAULT FALSE"))
            conn.execute(text("ALTER TABLE homeworks ADD COLUMN IF NOT EXISTS internship_type VARCHAR"))
            conn.execute(text("ALTER TABLE homeworks ADD COLUMN IF NOT EXISTS custom_coin_reward INTEGER"))
            conn.execute(text("ALTER TABLE homeworks ADD COLUMN IF NOT EXISTS prize_attachment_url VARCHAR"))
            conn.execute(text("ALTER TABLE homeworks ADD COLUMN IF NOT EXISTS target_audience JSON"))
            print("internship columns added to homeworks")
        except Exception as e:
            print(f"internship columns error: {e}")
        
        try:
            conn.execute(text("ALTER TABLE grades ADD COLUMN IF NOT EXISTS lesson_id INTEGER REFERENCES lessons(id)"))
            conn.execute(text("ALTER TABLE grades ADD COLUMN IF NOT EXISTS grade_type VARCHAR DEFAULT 'classwork'"))
            conn.execute(text("ALTER TABLE grades ADD COLUMN IF NOT EXISTS comment VARCHAR"))
            print("lesson_id, grade_type and comment columns added to grades")
        except Exception as e:
            print(f"grades columns error: {e}")
        
        conn.commit()
    
    try:
        # metadata.create_all will create new tables like 'notifications'
        models.Base.metadata.create_all(bind=engine)
        print("All models created (including notifications if missing)")
    except Exception as e:
        print(f"Error creating tables: {e}")
        
    print("Done")

if __name__ == "__main__":
    update_db()
