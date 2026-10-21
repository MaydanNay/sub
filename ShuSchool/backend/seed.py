import models, database, auth
from database import SessionLocal, engine
from sqlalchemy import text
import datetime

# Create tables if they don't exist
models.Base.metadata.create_all(bind=engine)

# Auto-migration: Ensure columns exist for existing DBs
with engine.connect() as conn:
    # Use 'IF NOT EXISTS' for PostgreSQL to avoid noisy error logs
    migrations = [
        ("ALTER TABLE users ADD COLUMN IF NOT EXISTS hashed_password VARCHAR", "hashed_password"),
        ("ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image VARCHAR", "profile_image"),
        ("ALTER TABLE users ADD COLUMN IF NOT EXISTS assigned_classes JSON", "assigned_classes"),
        ("ALTER TABLE homeworks ADD COLUMN IF NOT EXISTS teacher_id INTEGER", "teacher_id"),
        ("ALTER TABLE homeworks ADD COLUMN IF NOT EXISTS requires_confirmation BOOLEAN DEFAULT FALSE", "requires_confirmation"),
        ("ALTER TABLE schools ADD COLUMN IF NOT EXISTS settings JSON", "settings"),
        ("ALTER TABLE parent_student_association ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'pending'", "status"),
        ("ALTER TABLE attendance ADD COLUMN IF NOT EXISTS lesson_id_str VARCHAR", "lesson_id_str"),
        ("ALTER TABLE homeworks ADD COLUMN IF NOT EXISTS is_mascot_reward BOOLEAN DEFAULT FALSE", "is_mascot_reward"),
        ("ALTER TABLE characters ADD COLUMN IF NOT EXISTS mascot_slots INTEGER DEFAULT 0", "mascot_slots"),
        ("ALTER TABLE characters ADD COLUMN IF NOT EXISTS unlocked_mascots JSON DEFAULT '[]'", "unlocked_mascots"),
    ]
    
    for sql, col in migrations:
        try:
            conn.execute(text(sql))
            conn.commit()
            # We don't print anything here to keep logs clean unless it's a first-time migration
        except Exception as e:
            print(f"Migration note: {col} column handling: {e}")
            pass

def seed_db():
    db = SessionLocal()
    
    # 1. Create Subjects
    subjects_data = [
        ("Математика", "economy"),
        ("Литература", "wisdom"),
        ("Русский язык", "wisdom"),
        ("История", "influence"),
        ("Биология", "health"),
        ("Химия", "health"),
        ("Физкультура", "strength"),
        ("Английский язык", "diplomacy"),
        ("Физика", "technology"),
        ("Информатика", "intellect"),
    ]
    
    for name, stat in subjects_data:
        if not db.query(models.Subject).filter(models.Subject.name == name).first():
            db.add(models.Subject(name=name, mapped_stat=stat))
    db.commit()

    # 2. Create Core Test Users
    default_hpw = auth.get_password_hash("password123")
    
    users_to_create = [
        ("student1", "Иван Иванов", "student", "10-A"),
        ("teacher1", "Марья Ивановна", "teacher", None),
        ("admin1", "Админ Админов", "admin", None),
        ("parent1", "Петр Петров", "parent", None),
    ]

    created_users = {}
    for uname, fname, role, cname in users_to_create:
        user = db.query(models.User).filter(models.User.username == uname).first()
        if not user:
            user = models.User(
                username=uname, 
                full_name=fname, 
                role=role, 
                class_name=cname, 
                hashed_password=default_hpw, 
                is_approved=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"Seeded user: {uname}")
        created_users[role] = user

    # 3. Character & Streaks for Student
    student = created_users.get("student")
    if student:
        # Create character if missing
        if not student.character:
            char = models.Character(
                user_id=student.id, 
                level=3, 
                coins=150, 
                supercoins=5,
                economy=45, wisdom=60, influence=30, health=80, 
                strength=55, diplomacy=40, technology=25, intellect=70
            )
            db.add(char)
            db.commit()
            print(f"Created character for {student.username}")

        # Create streaks if missing
        existing_streaks = db.query(models.Streak).filter(models.Streak.user_id == student.id).count()
        if existing_streaks == 0:
            streak1 = models.Streak(user_id=student.id, type="attendance", current_count=12, last_action_date=datetime.datetime.utcnow())
            streak2 = models.Streak(user_id=student.id, type="homework", current_count=5, last_action_date=datetime.datetime.utcnow())
            db.add_all([streak1, streak2])
            db.commit()
            print(f"Created initial streaks for {student.username}")

    # 4. Link Parent to Student if missing
    parent = created_users.get("parent")
    if parent and student and student not in parent.students:
        parent.students.append(student)
        db.commit()
        print("Linked parent1 to student1")

    # 5. Create Sample Homework if missing
    if db.query(models.Homework).count() == 0:
        math_subject = db.query(models.Subject).filter(models.Subject.name == "Математика").first()
        if math_subject:
            hw1 = models.Homework(
                subject_id=math_subject.id,
                title="Квадратные уравнения",
                description="Решить задачи из учебника на стр. 45",
                steps=[
                    {"id": 1, "text": "Выписать коэффициенты a, b, c"},
                    {"id": 2, "text": "Найти дискриминант D"},
                    {"id": 3, "text": "Найти корни x1 и x2"}
                ],
                is_star=False
            )
            db.add(hw1)
        
        phys_subject = db.query(models.Subject).filter(models.Subject.name == "Физика").first()
        if phys_subject:
            hw2 = models.Homework(
                subject_id=phys_subject.id,
                title="Закон Ома",
                description="Экспериментальное подтверждение закона",
                steps=[
                    {"id": 1, "text": "Нарисовать схему цепи"},
                    {"id": 2, "text": "Рассчитать общее сопротивление"}
                ],
                is_star=True
            )
            db.add(hw2)
        
        db.commit()
        print("Sample homework created")

    # 6. Ensure all test accounts are approved
    for uname in ['student1', 'teacher1', 'admin1', 'parent1']:
        u = db.query(models.User).filter(models.User.username == uname).first()
        if u and not u.is_approved:
            u.is_approved = True
            print(f"Approved existing user: {uname}")
    db.commit()
    print("Database seeding completed.")

if __name__ == "__main__":
    try:
        seed_db()
    except Exception as e:
        print(f"CRITICAL ERROR DURING SEEDING: {e}")
        import traceback
        traceback.print_exc()
