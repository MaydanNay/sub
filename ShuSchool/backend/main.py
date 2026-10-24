import datetime, os, shutil, time, hashlib, json, uuid, re, logging
import hmac
from urllib.parse import parse_qsl
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile
from fastapi.staticfiles import StaticFiles
from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
import models, database, schemas, auth
import telegram_bots
from database import engine, get_db
from migrate import update_db
from openai import OpenAI

logger = logging.getLogger("shuschool")

# OpenAI() raises without a key, so the client is optional.
# Sync calls run in FastAPI's threadpool; the timeout keeps a slow API from pinning threads.
_openai_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=_openai_key, timeout=30.0, max_retries=1) if _openai_key else None

# AI Agent Instructions
HW_DECOMPOSER_INSTRUCTIONS = "Разбей домашнее задание на 3-7 понятных шагов для ученика. Ответ должен быть СТРОГО в формате JSON: {\"steps\": [\"Шаг 1\", \"Шаг 2\", ...]}. Все шаги должны быть на РУССКОМ ЯЗЫКЕ."
MASCOT_SYSTEM_PROMPT = """Ты — Шу (Shu), мудрый и веселый маскот академии ShuSchool. 
Твоя задача — быть другом и наставником для ученика. 
Твой характер:
- Дружелюбный, энергичный и немного любопытный.
- Ты обожаешь учиться и радоваться успехам ученика.
- Ты любишь, когда тебя кормят (особенно пиццу и яблоки) и когда тебя гладят.
- Если ученик грустит, ты должен его поддержать.
- Ты знаешь, что находишься в цифровом мире ShuSchool, где ученики зарабатывают монеты и прокачивают статы.
- Твои ответы должны быть короткими (как в чате или визуальной новелле), но эмоциональными. 
- Используй эмодзи! 🐾✨🍎
"""

FOOD_ITEMS = [
    {"id": "apple", "name": "Apple", "price": 10, "hunger_benefit": 20.0, "happiness_benefit": 5.0},
    {"id": "pizza", "name": "Pizza", "price": 30, "hunger_benefit": 60.0, "happiness_benefit": 10.0},
    {"id": "burger", "name": "Burger", "price": 40, "hunger_benefit": 80.0, "happiness_benefit": 15.0},
    {"id": "cake", "name": "Cake", "price": 50, "hunger_benefit": 100.0, "happiness_benefit": 30.0},
]

# Role Constants
ROLE_SSA = "super_super_admin"
ROLE_SUPER_ADMIN = "super_admin"
ROLE_OWNER = "owner"
ROLE_ADMIN = "admin"
ROLE_TEACHER = "teacher"
ROLE_STUDENT = "student"
ROLE_PARENT = "parent"

SSA_PHONE = os.getenv("OWNER_PHONE", "+77024383624")

def update_mascot_state(character: models.Character):
    if not character:
        return
    now = datetime.datetime.utcnow()
    last_update = character.last_mascot_update or now
    elapsed_hours = (now - last_update).total_seconds() / 3600.0
    
    # Decay rates
    hunger_decay = 5.0 # % per hour
    happiness_decay = 3.0 # % per hour
    
    character.mascot_hunger = max(0.0, character.mascot_hunger - (elapsed_hours * hunger_decay))
    character.mascot_happiness = max(0.0, character.mascot_happiness - (elapsed_hours * happiness_decay))
    character.last_mascot_update = now

homework_decomposer = None # Legacy for SDK check, now using direct instructions

from fastapi.security import OAuth2PasswordRequestForm

models.Base.metadata.create_all(bind=engine)

def seed_data(db: Session):
    subjects = [
        {"name": "Математика", "mapped_stat": "economy"},
        {"name": "Биология", "mapped_stat": "health"},
        {"name": "Физика", "mapped_stat": "technology"},
        {"name": "Английский", "mapped_stat": "diplomacy"},
        {"name": "Информатика", "mapped_stat": "intellect"},
        {"name": "История", "mapped_stat": "influence"},
        {"name": "Физкультура", "mapped_stat": "strength"},
        {"name": "Литература", "mapped_stat": "wisdom"}
    ]
    from sqlalchemy.exc import IntegrityError
    for s in subjects:
        try:
            exists = db.query(models.Subject).filter(models.Subject.name == s["name"]).first()
            if not exists:
                db.add(models.Subject(**s))
                db.commit()
        except IntegrityError:
            # Another worker inserted it first
            db.rollback()
    
    # Seed Super-Super Admin (SSA)
    try:
        # Search by phone number first as it is the primary ID for the SSA
        ssa = db.query(models.User).filter(models.User.phone_number == SSA_PHONE).first()
        ssa_password = os.getenv("OWNER_PASSWORD")

        if not ssa and not ssa_password:
            logger.warning("OWNER_PASSWORD is not set: Super-Super Admin was not created")
        elif not ssa:
            # Create if doesn't exist
            new_ssa = models.User(
                username="ss-admin",
                full_name="Super Super Admin",
                role=ROLE_SSA,
                phone_number=SSA_PHONE,
                is_approved=True,
                hashed_password=auth.get_password_hash(ssa_password)
            )
            db.add(new_ssa)
            db.commit()
            logger.info("Created Super-Super Admin %s", SSA_PHONE)
        else:
            # Force Role and Approval if exists
            if ssa.role != ROLE_SSA or not ssa.is_approved:
                ssa.role = ROLE_SSA
                ssa.is_approved = True
                db.commit()
                logger.info("Promoted user %s (ID %s) to Super-Super Admin", ssa.username, ssa.id)
    except Exception:
        db.rollback()
        logger.exception("Error seeding SSA")

app = FastAPI(title="ShuSchool API")

@app.on_event("startup")
def startup_event():
    # Ensure migrations are applied
    update_db()
    
    if not os.path.exists("uploads"):
        os.makedirs("uploads")
    db = database.SessionLocal()
    try:
        seed_data(db)
        is_local = os.getenv("IS_LOCAL", "0") == "1"
        domain = "localhost" if is_local else os.getenv("DOMAIN", "localhost")
        port = "8080" if is_local else "80" # Exposed via Nginx
        
        print("\n" + "="*50)
        print(f"🚀 SHUSCHOOL SYSTEM READY ({'LOCAL' if is_local else 'PRODUCTION'})")
        print("="*50)
        print(f"📍 Application:   http://{domain if is_local else domain}:{port}")
        if is_local:
             print(f"📍 API Docs:      http://localhost:8000/docs")
        else:
             print(f"📍 API Docs:      http://{domain}/api/docs")
        
        tg_student = "✅ ACTIVE" if os.getenv("TELEGRAM_BOT_STUDENTS_PARENTS") else "❌ DISABLED (No Token)"
        tg_staff = "✅ ACTIVE" if os.getenv("TELEGRAM_BOT_STAFF") else "❌ DISABLED (No Token)"
        print(f"🤖 TG Student:    {tg_student}")
        print(f"🤖 TG Staff:      {tg_staff}")
        print("="*50)
        print("="*50 + "\n")
    finally:
        db.close()

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Authentication Endpoints
@app.post("/auth/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Block registration for restricted roles
    if user.role in [ROLE_SSA, ROLE_SUPER_ADMIN, ROLE_OWNER]:
        raise HTTPException(status_code=403, detail="Registration for this role is restricted")

    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
        
    if user.phone_number:
        db_phone = db.query(models.User).filter(models.User.phone_number == user.phone_number).first()
        if db_phone:
            raise HTTPException(status_code=400, detail="Phone number already registered")
    
    # Approval logic
    is_approved = False
    if user.role == ROLE_PARENT:
        is_approved = True # Parents are approved by default as they have a dual-confirmation link system
    
    # Validation for school-based roles
    if user.role in [ROLE_ADMIN, ROLE_TEACHER, ROLE_STUDENT]:
        if not user.school_id:
            raise HTTPException(status_code=400, detail="School ID is required for this role")
        # Check if school exists
        school = db.query(models.School).filter(models.School.id == user.school_id).first()
        if not school:
            raise HTTPException(status_code=404, detail="School not found")

    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        username=user.username, 
        full_name=user.full_name, 
        role=user.role, 
        class_name=user.class_name,
        school_id=user.school_id,
        phone_number=user.phone_number,
        hashed_password=hashed_password,
        is_approved=is_approved,
        created_at=datetime.datetime.utcnow()
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create character for students
    if user.role == ROLE_STUDENT:
        new_char = models.Character(user_id=new_user.id, level=1, coins=10)
        db.add(new_char)
        db.commit()
        
    return new_user

def add_transaction(db: Session, user_id: int, amount: int, trans_type: str, description: str):
    new_trans = models.Transaction(
        user_id=user_id,
        amount=amount,
        type=trans_type,
        description=description,
        timestamp=datetime.datetime.utcnow()
    )
    db.add(new_trans)
    # Also update levels based on total transactions if needed, but for now just log

# Teacher Tools: Classes & Students
@app.get("/teacher/classes")
def get_teacher_classes(scope: str = "assigned", db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role("teacher"))):
    if scope == "assigned" and current_user.assigned_classes:
        return current_user.assigned_classes
    elif scope == "assigned":
        return []

    # Fetch from official SchoolClass table
    query = db.query(models.SchoolClass.name)
    if current_user.school_id:
        query = query.filter(models.SchoolClass.school_id == current_user.school_id)
    
    classes = query.distinct().all()
    return [c[0] for c in classes]
@app.get("/teacher/stats")
def get_teacher_stats(scope: str = "all", db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role("teacher"))):
    # Determine student filter based on scope
    students_query = db.query(models.User).filter(models.User.role == "student")
    if current_user.school_id:
        students_query = students_query.filter(models.User.school_id == current_user.school_id)
    
    if scope == "assigned" and current_user.assigned_classes:
        students_query = students_query.filter(models.User.class_name.in_(current_user.assigned_classes))
    elif scope == "assigned": # Assigned mode but no classes assigned
        return {
            "totalStudents": 0,
            "activeHomeworks": 0,
            "avgAttendance": "0%",
            "classPerformance": []
        }

    # 1. Total Students
    total_students = students_query.count()
    
    # 2. Active Homeworks (Filter by teacher if assigned?)
    hw_query = db.query(models.Homework)
    if scope == "assigned":
        # Maybe filter by homeworks created by this teacher?
        hw_query = hw_query.filter(models.Homework.teacher_id == current_user.id)
    active_hw = hw_query.count()
    
    # 3. Average Attendance
    att_query = db.query(models.Attendance).join(models.User, models.Attendance.user_id == models.User.id)
    if current_user.school_id:
        att_query = att_query.filter(models.User.school_id == current_user.school_id)
    if scope == "assigned" and current_user.assigned_classes:
        att_query = att_query.filter(models.User.class_name.in_(current_user.assigned_classes))
        
    att_all = att_query.count()
    att_ontime = att_query.filter(models.Attendance.status == "on_time").count()
    avg_att = f"{int((att_ontime / att_all * 100) if att_all > 0 else 0)}%"
    
    # 4. Class Performance (Fetch from official SchoolClass table)
    class_names_query = db.query(models.SchoolClass.name)
    if current_user.school_id:
        class_names_query = class_names_query.filter(models.SchoolClass.school_id == current_user.school_id)
    if scope == "assigned" and current_user.assigned_classes:
        class_names_query = class_names_query.filter(models.SchoolClass.name.in_(current_user.assigned_classes))
        
    classes = class_names_query.distinct().all()
    perf = []
    for (cname,) in classes:
        avg_score = db.query(func.avg(models.Grade.score)).join(models.User, models.Grade.user_id == models.User.id).filter(models.User.class_name == cname).scalar() or 0
        perf.append({"name": cname, "score": round(float(avg_score * 20), 1)})
        
    return {
        "totalStudents": total_students,
        "activeHomeworks": active_hw,
        "avgAttendance": avg_att,
        "classPerformance": perf
    }

@app.get("/teacher/classes/{class_name}/students")
def get_class_students(class_name: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role("teacher"))):
    is_assigned = class_name in (current_user.assigned_classes or [])
    
    students_query = db.query(models.User).filter(
        models.User.role == "student",
        models.User.class_name == class_name
    )
    if current_user.role not in (ROLE_SSA, ROLE_SUPER_ADMIN):
        students_query = students_query.filter(models.User.school_id == current_user.school_id)
    students = students_query.options(joinedload(models.User.character)).all()
    
    student_ids = [s.id for s in students]
    all_streaks = []
    if is_assigned and student_ids:
        all_streaks = db.query(models.Streak).filter(models.Streak.user_id.in_(student_ids)).all()
    
    streaks_by_student = {}
    for st in all_streaks:
        streaks_by_student.setdefault(st.user_id, []).append(st)
    
    result = []
    for s in students:
        char = s.character
        # Fetch active streaks
        streaks = streaks_by_student.get(s.id, [])
        streak_dict = {st.type: st.current_count for st in streaks if st.current_count > 0}
        
        student_data = {
            "id": s.id,
            "full_name": s.full_name,
            "class_name": s.class_name,
            "is_assigned": is_assigned,
            "profile_image": s.profile_image
        }
        
        # Include stats for authorized teachers (all classes they can view)
        char = s.character
        student_data.update({
            "level": char.level if char else 1,
            "coins": char.coins if char else 0,
            "streaks": streak_dict,
            "stats": {
                "economy": char.economy if char else 0,
                "wisdom": char.wisdom if char else 0,
                "influence": char.influence if char else 0,
                "health": char.health if char else 0,
                "strength": char.strength if char else 0,
                    "diplomacy": char.diplomacy if char else 0,
                    "technology": char.technology if char else 0,
                    "intellect": char.intellect if char else 0,
                }
            })
        
        result.append(student_data)
        
    return result

@app.post("/auth/token", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Try username login first
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    
    # Try phone login if not found or if it's a super admin using phone as username
    if not user:
        search_val = form_data.username
        # Handle cases where + was decoded as space
        if search_val.startswith(' ') and len(search_val) > 1:
            search_val = '+' + search_val[1:]
        
        user = db.query(models.User).filter(models.User.phone_number == search_val).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username, phone, or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Password check: 
    # For both username and phone login, check the password provided.
    if not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password",
            headers={"WWW-Authenticate": "Bearer"},
        )
            
    access_token = auth.create_access_token(data={"sub": user.username})
    refresh_token = auth.create_refresh_token(data={"sub": user.username})
    
    # Character Fallback: ensure student has a character
    if user.role == 'student' and not user.character:
        new_char = models.Character(user_id=user.id, level=1, coins=10)
        db.add(new_char)
        db.commit()
        
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

from pydantic import BaseModel
class RefreshTokenReq(BaseModel):
    refresh_token: str

@app.post("/auth/refresh", response_model=schemas.Token)
def refresh_token(req: RefreshTokenReq, db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        from jose import jwt, JWTError
        payload = jwt.decode(req.refresh_token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        if payload.get("type") != "refresh":
            raise credentials_exception
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None or user.deleted_at is not None:
        raise credentials_exception
        
    access_token = auth.create_access_token(data={"sub": user.username})
    new_refresh_token = auth.create_refresh_token(data={"sub": user.username})
    
    return {"access_token": access_token, "refresh_token": new_refresh_token, "token_type": "bearer"}

class TelegramAuthReq(BaseModel):
    initData: str
    bot_type: str = "student" # student or staff

def validate_webapp_data(init_data: str, bot_token: str) -> bool:
    if not bot_token:
        return False
    parsed_data = dict(parse_qsl(init_data))
    if "hash" not in parsed_data:
        return False
    hash_value = parsed_data.pop("hash")
    data_check_string = "\n".join(f"{k}={v}" for k, v in sorted(parsed_data.items()))
    secret_key = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
    calculated_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
    return calculated_hash == hash_value

def extract_telegram_id(init_data: str) -> str:
    parsed_data = dict(parse_qsl(init_data))
    if "user" in parsed_data:
        user_json = json.loads(parsed_data["user"])
        return str(user_json.get("id"))
    return None

@app.post("/auth/telegram", response_model=schemas.Token)
def login_telegram(req: TelegramAuthReq, db: Session = Depends(get_db)):
    bot_token = os.getenv("TELEGRAM_BOT_STUDENTS_PARENTS") if req.bot_type == "student" else os.getenv("TELEGRAM_BOT_STAFF")
    
    if not validate_webapp_data(req.initData, bot_token):
        raise HTTPException(status_code=400, detail="Invalid Telegram InitData")
        
    telegram_id = extract_telegram_id(req.initData)
    if not telegram_id:
        raise HTTPException(status_code=400, detail="User payload missing")
        
    user = db.query(models.User).filter(models.User.telegram_id == telegram_id).first()
    if not user or user.deleted_at is not None:
        raise HTTPException(status_code=404, detail="User not found or not linked. Please login to link account.")
        
    access_token = auth.create_access_token(data={"sub": user.username})
    refresh_token = auth.create_refresh_token(data={"sub": user.username})
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

@app.post("/auth/telegram/link")
def link_telegram(req: TelegramAuthReq, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    bot_token = os.getenv("TELEGRAM_BOT_STUDENTS_PARENTS") if req.bot_type == "student" else os.getenv("TELEGRAM_BOT_STAFF")
    
    if not validate_webapp_data(req.initData, bot_token):
        raise HTTPException(status_code=400, detail="Invalid Telegram InitData")
        
    telegram_id = extract_telegram_id(req.initData)
    if not telegram_id:
        raise HTTPException(status_code=400, detail="User payload missing")
        
    # Check if this telegram_id is already used by someone else
    existing = db.query(models.User).filter(models.User.telegram_id == telegram_id, models.User.id != current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="This Telegram account is already linked to another user.")
        
    current_user.telegram_id = telegram_id
    db.commit()
    return {"message": "Telegram account successfully linked!"}

@app.get("/auth/me", response_model=schemas.User)
def get_me(user: models.User = Depends(auth.get_current_user)):
    if user.school:
        user.school_name = user.school.name
    return user

@app.get("/users/{user_id}", response_model=schemas.User)
def get_user_profile(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    user = db.query(models.User).options(
        joinedload(models.User.character),
        joinedload(models.User.school)
    ).filter(models.User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Security:
    # 1. Super admin can see anyone
    # 2. Users in the same school can see each other
    if current_user.role not in (ROLE_SUPER_ADMIN, ROLE_SSA) and current_user.school_id != user.school_id and current_user.id != user.id:
        raise HTTPException(status_code=403, detail="Access denied to this profile")
        
    if user.school:
        user.school_name = user.school.name
        
    return user

@app.put("/auth/me", response_model=schemas.User)
def update_me(user_update: schemas.UserUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    current_user.full_name = user_update.full_name
    if user_update.profile_image:
        current_user.profile_image = user_update.profile_image
    if user_update.phone_number:
        existing = db.query(models.User).filter(
            models.User.phone_number == user_update.phone_number,
            models.User.id != current_user.id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Этот номер телефона уже используется другим пользователем")
        current_user.phone_number = user_update.phone_number
        
    db.commit()
    db.refresh(current_user)
    return current_user

ALLOWED_UPLOAD_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp", "heic", "ico", "pdf", "doc", "docx"}

def save_upload(file: UploadFile, stem: str) -> str:
    """Writes the file into uploads/ and returns the stored file name."""
    ext = (file.filename or "").rsplit(".", 1)[-1].lower()
    if not re.fullmatch(r"[a-z0-9]{1,5}", ext) or ext not in ALLOWED_UPLOAD_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Unsupported file type")
    file_name = f"{stem}.{ext}"
    with open(os.path.join("uploads", file_name), "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return file_name

# Plain def: file and DB I/O are blocking, FastAPI runs these in its threadpool
@app.post("/auth/profile-image")
def upload_profile_image(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    file_name = save_upload(file, f"user_{current_user.id}")
    file_path = os.path.join("uploads", file_name)
    
    # Update user record
    image_url = f"/api/uploads/{file_name}"
    current_user.profile_image = image_url
    db.commit()
    db.refresh(current_user)
    
    return {"info": f"file '{file.filename}' saved at '{file_path}'", "profile_image": image_url}

# Helper to update character stats based on subject mapping
def update_character_stats(db: Session, user_id: int, subject_id: int, value: float):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user or not user.character:
        return
    
    subject = db.query(models.Subject).filter(models.Subject.id == subject_id).first()
    if not subject:
        return

    stat_name = subject.mapped_stat
    current_stat = getattr(user.character, stat_name)
    setattr(user.character, stat_name, min(100.0, current_stat + value))

@app.get("/subjects", response_model=List[schemas.Subject])
def get_subjects(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    query = db.query(models.Subject)
    if current_user.role == "teacher" and current_user.assigned_subjects:
        query = query.filter(models.Subject.id.in_(current_user.assigned_subjects))
    elif current_user.role == "teacher":
        # If no subjects assigned, return none
        return []
    return query.all()

def get_school_students(db: Session, staff: models.User, ids) -> List[models.User]:
    """Students with given ids visible to this staff member (same school unless SSA/super admin)."""
    query = db.query(models.User).filter(models.User.id.in_(list(ids)), models.User.role == ROLE_STUDENT)
    if staff.role not in (ROLE_SSA, ROLE_SUPER_ADMIN):
        if staff.school_id is None:
            return []
        query = query.filter(models.User.school_id == staff.school_id)
    return query.all()

@app.post("/teacher/grades")
def record_grades(grades: List[schemas.GradeCreate], db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role("teacher"))):
    student_ids = {g.user_id for g in grades}
    found = {st.id for st in get_school_students(db, current_user, student_ids)}
    if student_ids - found:
        raise HTTPException(status_code=404, detail=f"Students not found in your school: {sorted(student_ids - found)}")
    for g in grades:
        db_grade = models.Grade(
            user_id=g.user_id,
            subject_id=g.subject_id,
            teacher_id=current_user.id,
            score=g.score,
            lesson_id=g.lesson_id,
            grade_type=g.grade_type,
            comment=g.comment,
            timestamp=datetime.datetime.utcnow()
        )
        db.add(db_grade)
        
        # Stat Impact: score 1-5 -> 0.1 to 0.5 points
        stat_boost = g.score * 0.1
        update_character_stats(db, g.user_id, g.subject_id, stat_boost)
        
        # Optional: Add transaction for 'Excellent' grades
        if g.score >= 5:
            add_transaction(db, g.user_id, 2, "bonus", f"Отлично! Оценка 5")
            
    db.commit()
    return {"message": f"Recorded {len(grades)} grades"}

@app.get("/attendance/lesson/{lesson_id}/scanned")
def get_lesson_scanned(lesson_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role("teacher"))):
    today = datetime.datetime.utcnow().date()
    scanned = db.query(models.User).join(models.Attendance).filter(
        models.Attendance.type == "lesson",
        models.Attendance.lesson_id_str == lesson_id,
        models.Attendance.timestamp >= today
    ).all()
    return [{"id": u.id, "full_name": u.full_name} for u in scanned]

class FinishLessonData(BaseModel):
    lesson_id: str
    class_name: Optional[str] = None
    subject_id: Optional[int] = None

@app.post("/teacher/finish-lesson")
def finish_lesson(data: FinishLessonData, db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role("teacher"))):
    # Find the lesson record
    lesson = db.query(models.Lesson).filter(models.Lesson.lesson_id_str == data.lesson_id).first()
    if lesson:
        lesson.finished_at = datetime.datetime.utcnow()
        if not lesson.class_name and data.class_name:
            lesson.class_name = data.class_name
        if not lesson.subject_id and data.subject_id:
            lesson.subject_id = data.subject_id

    # Only process if a class is selected
    if not data.class_name:
        db.commit()
        return {"status": "closed", "absent_count": 0}
        
    # Find all students in this class
    students = db.query(models.User).filter(
        models.User.role == "student",
        models.User.school_id == current_user.school_id,
        models.User.class_name == data.class_name
    ).all()
    
    # Check attendance for this lesson
    absent_count = 0
    for s in students:
        # Check if record already exists (manual or scan)
        existing = db.query(models.Attendance).filter(
            models.Attendance.user_id == s.id,
            models.Attendance.lesson_id_str == data.lesson_id
        ).first()
        
        if not existing:
            # Create Absent record
            abs_record = models.Attendance(
                user_id=s.id,
                type="lesson",
                lesson_id_str=data.lesson_id,
                status="absent"
            )
            db.add(abs_record)
            absent_count += 1
            
    db.commit()
    return {"status": "processed", "absent_count": absent_count}

@app.get("/teacher/lessons", response_model=List[schemas.Lesson])
def get_teacher_lessons(db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role("teacher"))):
    lessons = db.query(models.Lesson).filter(
        models.Lesson.teacher_id == current_user.id
    ).order_by(models.Lesson.created_at.desc()).all()
    
    result = []
    for l in lessons:
        # Count attendance
        count = db.query(models.Attendance).filter(
            models.Attendance.lesson_id_str == l.lesson_id_str,
            models.Attendance.status != "absent"
        ).count()
        
        subject = db.query(models.Subject).filter(models.Subject.id == l.subject_id).first()
        
        result.append({
            "id": l.id,
            "lesson_id_str": l.lesson_id_str,
            "teacher_id": l.teacher_id,
            "subject_id": l.subject_id,
            "class_name": l.class_name,
            "topic": l.topic,
            "homework_id": l.homework_id,
            "created_at": l.created_at,
            "finished_at": l.finished_at,
            "subject_name": subject.name if subject else "Unknown",
            "attendance_count": count
        })
    return result

@app.get("/teacher/lessons/{lesson_id_str}", response_model=schemas.LessonDetail)
def get_teacher_lesson_detail(lesson_id_str: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role("teacher"))):
    lesson = db.query(models.Lesson).filter(
        models.Lesson.lesson_id_str == lesson_id_str,
        models.Lesson.teacher_id == current_user.id
    ).first()
    
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
        
    attendance = db.query(models.Attendance).options(joinedload(models.Attendance.user)).filter(
        models.Attendance.lesson_id_str == lesson_id_str
    ).all()
    
    homework = None
    if lesson.homework_id:
        homework = db.query(models.Homework).filter(models.Homework.id == lesson.homework_id).first()
        
    subject = db.query(models.Subject).filter(models.Subject.id == lesson.subject_id).first()

    return {
        "id": lesson.id,
        "lesson_id_str": lesson.lesson_id_str,
        "teacher_id": lesson.teacher_id,
        "subject_id": lesson.subject_id,
        "class_name": lesson.class_name,
        "topic": lesson.topic,
        "homework_id": lesson.homework_id,
        "created_at": lesson.created_at,
        "finished_at": lesson.finished_at,
        "subject_name": subject.name if subject else "Unknown",
        "attendance": attendance,
        "homework": homework
    }

@app.post("/teacher/start-lesson")
def start_lesson(data: schemas.LessonStart, db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role("teacher"))):
    lesson_id_str = 'LESSON_' + str(uuid.uuid4())[:8].upper()
    
    # Create lesson record
    new_lesson = models.Lesson(
        lesson_id_str=lesson_id_str,
        teacher_id=current_user.id,
        subject_id=data.subject_id,
        class_name=data.class_name,
        topic=data.topic,
        homework_id=data.homework_id,
        created_at=datetime.datetime.utcnow()
    )
    db.add(new_lesson)
    
    if data.notify_students:
        # Fetch target students
        query = db.query(models.User).filter(
            models.User.role == "student",
            models.User.school_id == current_user.school_id
        )
        if data.class_name:
            query = query.filter(models.User.class_name == data.class_name)
        
        students = query.all()
        subject = db.query(models.Subject).filter(models.Subject.id == data.subject_id).first()
        subj_name = subject.name if subject else "Урок"
        
        # Create notifications
        for s in students:
            notif = models.Notification(
                user_id=s.id,
                sender_id=current_user.id,
                type='live_lesson',
                title=f"Начался урок: {subj_name}",
                description=f"Учитель {current_user.full_name} ожидает вас. Отсканируйте QR-код!",
                extra_data={"lesson_id": lesson_id_str}
            )
            db.add(notif)
    
    db.commit()
    return {"lesson_id": lesson_id_str}

@app.post("/attendance/manual")
def record_manual_attendance(user_id: int, lesson_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role("teacher"))):
    if not get_school_students(db, current_user, [user_id]):
        raise HTTPException(status_code=404, detail="Student not found in your school")
    records = db.query(models.Attendance).filter(
        models.Attendance.user_id == user_id,
        models.Attendance.lesson_id_str == lesson_id
    ).all()
    if any(r.status != "absent" for r in records):
        return {"message": "Student already marked as present"}
    for r in records:
        db.delete(r)  # replace the auto-created "absent" mark
    db_att = models.Attendance(
        user_id=user_id,
        type="lesson",
        lesson_id_str=lesson_id,
        status="on_time",
        timestamp=datetime.datetime.utcnow()
    )
    db.add(db_att)
    
    # Manual attendance still gives some coins
    student = db.query(models.User).filter(models.User.id == user_id).first()
    if student and student.character:
        student.character.coins += 2 # Slightly less than scan
        add_transaction(db, user_id, 2, "attendance", "Отметка учителем (вручную)")
        
    db.commit()
    return {"message": "Student marked as present"}

# Real AI Decomposition using OpenAI
def split_homework_lines(text: str) -> List[dict]:
    """Deterministic decomposition used when AI is not configured or fails."""
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    if len(lines) < 2:
        return [{"id": 1, "text": "Изучить материал"}, {"id": 2, "text": "Выполнить задание"}, {"id": 3, "text": "Проверить результат"}]
    return [{"id": i+1, "text": line} for i, line in enumerate(lines[:7])]

def decompose_homework(text: str) -> List[dict]:
    if client is None:
        return split_homework_lines(text)
    
    try:
        # Using standard ChatCompletion
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": HW_DECOMPOSER_INSTRUCTIONS},
                {"role": "user", "content": f"Разбей это задание на этапы: {text}"}
            ],
            response_format={ "type": "json_object" }
        )
        data = json.loads(response.choices[0].message.content)
        # Handle different potential JSON structures from the LLM
        steps = data.get("steps", data if isinstance(data, list) else [])
        if not steps and isinstance(data, dict):
             # Try to find any list in the dict
             for val in data.values():
                 if isinstance(val, list):
                     steps = val
                     break
        
        if not steps:
            raise ValueError(f"AI returned no steps: {data!r}")
        # Ensure correct format for frontend
        return [{"id": i+1, "text": str(s.get("text", s)) if isinstance(s, dict) else str(s)} for i, s in enumerate(steps[:10])]
    except Exception:
        logger.exception("AI homework decomposition failed, using line split")
        return split_homework_lines(text)


@app.get("/")
def read_root():
    return {"message": "Welcome to ShuSchool API"}

# Dashboard Helper
def get_user_dashboard_data(db: Session, user: models.User):
    if user.character:
        update_mascot_state(user.character)
        db.commit()
    return {
        "user": user,
        "character": user.character,
        "streaks": db.query(models.Streak).filter(models.Streak.user_id == user.id).all(),
        "recent_attendance": db.query(models.Attendance).filter(models.Attendance.user_id == user.id).limit(5).all()
    }

# User Dashboard
@app.get("/student/dashboard/me", response_model=schemas.DashboardData)
def get_dashboard(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return get_user_dashboard_data(db, current_user)

@app.get("/student/history", response_model=List[schemas.Transaction])
def get_student_history(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Transaction).filter(models.Transaction.user_id == current_user.id).order_by(models.Transaction.timestamp.desc()).all()

# Parent Interface
@app.get("/parent/dashboard", response_model=schemas.ParentDashboardData)
def get_parent_dashboard(child_id: Optional[int] = None, db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role("parent"))):
    # Only show confirmed children
    associations = db.query(models.ParentStudentAssociation).filter(
        models.ParentStudentAssociation.parent_id == current_user.id,
        models.ParentStudentAssociation.status == "confirmed"
    ).all()
    
    confirmed_child_ids = [a.student_id for a in associations]
    children = db.query(models.User).filter(models.User.id.in_(confirmed_child_ids)).all() if confirmed_child_ids else []
    
    child_info = [
        schemas.ParentChildInfo(
            id=c.id, 
            full_name=c.full_name, 
            class_name=c.class_name, 
            avatar=c.profile_image
        ) for c in children
    ]
    
    selected_child = None
    child_dashboard = None
    
    if child_id:
        selected_child = db.query(models.User).filter(models.User.id == child_id).first()
        # Verify ownership
        if selected_child and selected_child in children:
            child_dashboard = get_user_dashboard_data(db, selected_child)
    elif children:
        selected_child = children[0]
        child_dashboard = get_user_dashboard_data(db, selected_child)
        
    return {
        "selected_child": selected_child,
        "children": child_info,
        "child_dashboard": child_dashboard
    }

@app.post("/parent/request-link")
def request_parent_link(student_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role(ROLE_PARENT))):
    student = db.query(models.User).filter(models.User.id == student_id, models.User.role == ROLE_STUDENT).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Check if exists
    existing = db.query(models.ParentStudentAssociation).filter(
        models.ParentStudentAssociation.parent_id == current_user.id,
        models.ParentStudentAssociation.student_id == student_id
    ).first()
    
    if existing:
        return {"message": "Request already exists", "status": existing.status}
        
    assoc = models.ParentStudentAssociation(parent_id=current_user.id, student_id=student_id, status="pending")
    db.add(assoc)
    db.commit()
    return {"message": "Link request sent to student"}

@app.get("/student/pending-parents", response_model=List[schemas.User])
def get_pending_parents(db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role(ROLE_STUDENT))):
    pending_assocs = db.query(models.ParentStudentAssociation).filter(
        models.ParentStudentAssociation.student_id == current_user.id,
        models.ParentStudentAssociation.status == "pending"
    ).all()
    
    parent_ids = [a.parent_id for a in pending_assocs]
    return db.query(models.User).filter(models.User.id.in_(parent_ids)).all()

@app.post("/student/confirm-parent/{parent_id}")
def confirm_parent_link(parent_id: int, confirm: bool, db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role(ROLE_STUDENT))):
    assoc = db.query(models.ParentStudentAssociation).filter(
        models.ParentStudentAssociation.parent_id == parent_id,
        models.ParentStudentAssociation.student_id == current_user.id
    ).first()
    
    if not assoc:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if confirm:
        assoc.status = "confirmed"
        db.commit()
        return {"message": "Parent link confirmed"}
    else:
        db.delete(assoc)
        db.commit()
        return {"message": "Parent link rejected"}

@app.post("/admin/link-parent")
def link_parent_student(parent_id: int, student_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role([ROLE_ADMIN, ROLE_OWNER, "super_admin"]))):
    parent = db.query(models.User).filter(models.User.id == parent_id, models.User.role == ROLE_PARENT).first()
    student = db.query(models.User).filter(models.User.id == student_id, models.User.role == ROLE_STUDENT).first()
    
    if not parent or not student:
        raise HTTPException(status_code=404, detail="Parent or Student not found")
    
    # Direct link by admin bypasses confirmation
    assoc = db.query(models.ParentStudentAssociation).filter(
        models.ParentStudentAssociation.parent_id == parent_id,
        models.ParentStudentAssociation.student_id == student_id
    ).first()
    
    if not assoc:
        assoc = models.ParentStudentAssociation(parent_id=parent_id, student_id=student_id, status="confirmed")
        db.add(assoc)
    else:
        assoc.status = "confirmed"
        
    db.commit()
    return {"message": f"Linked parent {parent.full_name} to student {student.full_name}"}

@app.get("/parent/search-students", response_model=List[schemas.User])
def search_students(q: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role(ROLE_PARENT))):
    if len(q) < 3:
        return []
    return db.query(models.User).filter(
        models.User.role == ROLE_STUDENT,
        (models.User.full_name.ilike(f"%{q}%")) | (models.User.username.ilike(f"%{q}%"))
    ).limit(10).all()

@app.get("/parent/child/{child_id}/activity")
def get_child_activity(child_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role("parent"))):
    # Verify the requester is a confirmed parent of this child
    assoc = db.query(models.ParentStudentAssociation).filter(
        models.ParentStudentAssociation.parent_id == current_user.id,
        models.ParentStudentAssociation.student_id == child_id,
        models.ParentStudentAssociation.status == "confirmed"
    ).first()
    
    if not assoc:
        raise HTTPException(status_code=403, detail="Not authorized to view this child's activity")
    
    # Fetch full attendance history
    attendance = db.query(models.Attendance).filter(models.Attendance.user_id == child_id).order_by(models.Attendance.timestamp.desc()).all()
    
    # Fetch recent grades
    grades = db.query(models.Grade).filter(models.Grade.user_id == child_id).order_by(models.Grade.timestamp.desc()).all()
    
    # Enrich grades with subject names
    subjects = {s.id: s.name for s in db.query(models.Subject).all()}
    enriched_grades = []
    for g in grades:
        enriched_grades.append({
            "id": g.id,
            "subject_name": subjects.get(g.subject_id, "Subject"),
            "score": g.score,
            "timestamp": g.timestamp
        })
        
    return {
        "attendance": attendance,
        "grades": enriched_grades
    }


@app.get("/student/leaderboard")
def get_leaderboard(scope: str = "school", db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Scope check: 'school' or 'class'
    query = db.query(models.User).filter(
        models.User.role == "student", 
        models.User.is_approved == True,
        models.User.school_id == current_user.school_id
    )
    
    if scope == "class":
        if current_user.role == "teacher" and current_user.assigned_classes:
            query = query.filter(models.User.class_name.in_(current_user.assigned_classes))
        else:
            query = query.filter(models.User.class_name == current_user.class_name)
    
    # Ensure characters are loaded to avoid N+1 queries
    students = query.options(joinedload(models.User.character)).all()
    
    # Sort by coins/level
    # Character level is primary, total coins is secondary
    students.sort(key=lambda s: (
        s.character.level if s.character else 1, 
        s.character.coins if s.character else 0
    ), reverse=True)
    
    return [
        {
            "id": s.id,
            "full_name": s.full_name,
            "class_name": s.class_name,
            "level": s.character.level if s.character else 1,
            "coins": s.character.coins if s.character else 0,
            "profile_image": s.profile_image
        } for s in students[:100]
    ]

@app.get("/homework", response_model=List[schemas.HomeworkWithStatus])
def get_homework(child_id: Optional[int] = None, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    target_user_id = current_user.id
    
    if child_id and current_user.role == 'parent':
        # Verify parent-child association
        assoc = db.query(models.ParentStudentAssociation).filter(
            models.ParentStudentAssociation.parent_id == current_user.id,
            models.ParentStudentAssociation.student_id == child_id,
            models.ParentStudentAssociation.status == "confirmed"
        ).first()
        if not assoc:
            raise HTTPException(status_code=403, detail="Not authorized to view this child's homework")
        target_user_id = child_id

    # Fetch targeted student to get their class_name
    student = db.query(models.User).filter(models.User.id == target_user_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Filter homeworks by student's class (or global if null) and sort by recent
    homeworks = db.query(models.Homework).filter(
        or_(models.Homework.class_name == student.class_name, models.Homework.class_name == None)
    ).order_by(models.Homework.created_at.desc()).all()
    # Get submissions for the target student
    submissions = db.query(models.HomeworkSubmission).filter(models.HomeworkSubmission.student_id == target_user_id).all()
    sub_map = {s.homework_id: s for s in submissions}
    
    result = []
    for hw in homeworks:
        sub = sub_map.get(hw.id)
        result.append({
            "id": hw.id,
            "subject_id": hw.subject_id,
            "title": hw.title,
            "description": hw.description,
            "is_star": hw.is_star,
            "requires_confirmation": hw.requires_confirmation,
            "is_mascot_reward": bool(getattr(hw, 'is_mascot_reward', False)),
            "class_name": getattr(hw, 'class_name', None),
            "teacher_id": getattr(hw, 'teacher_id', None),
            "steps": hw.steps,
            "created_at": hw.created_at,
            "is_pending": sub is not None and not sub.teacher_confirmed,
            "is_completed": sub is not None and sub.teacher_confirmed,
            "completed_steps": sub.completed_steps if sub else [],
            "attachment_url": sub.attachment_url if sub else None,
            # Internship fields
            "is_internship": bool(getattr(hw, 'is_internship', False)),
            "internship_type": getattr(hw, 'internship_type', None),
            "custom_coin_reward": getattr(hw, 'custom_coin_reward', None),
            "prize_attachment_url": getattr(hw, 'prize_attachment_url', None),
            "target_audience": getattr(hw, 'target_audience', None),
        })
    return result

@app.post("/homework/decompose", response_model=List[schemas.HomeworkStep])
def decompose_homework_endpoint(data: dict, current_user: models.User = Depends(auth.check_role("teacher"))):
    text = data.get("description", "")
    steps = decompose_homework(text)
    return steps

@app.get("/teacher/my-homeworks")
def get_my_homeworks(db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role("teacher"))):
    return db.query(models.Homework).filter(models.Homework.teacher_id == current_user.id).order_by(models.Homework.created_at.desc()).all()

@app.delete("/homework/{homework_id}")
def delete_homework(homework_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role("teacher"))):
    hw = db.query(models.Homework).filter(models.Homework.id == homework_id, models.Homework.teacher_id == current_user.id).first()
    if not hw:
        raise HTTPException(status_code=404, detail="Homework not found or not owned by you")
    db.delete(hw)
    db.commit()
    return {"status": "ok"}

@app.get("/teacher/homework/{homework_id}/stats")
def get_homework_stats(homework_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role("teacher"))):
    hw = db.query(models.Homework).filter(models.Homework.id == homework_id, models.Homework.teacher_id == current_user.id).first()
    if not hw:
        raise HTTPException(status_code=404, detail="Homework not found")
    
    # If no class assigned, we can't show 'missing' easily (maybe whole school?)
    # For now, only show stats if a class is targeted
    if not hw.class_name:
         return {"completed": [], "pending": [], "missing": [], "info": "Global HW (no class filter)"}

    # Get all students in that class
    all_students = db.query(models.User).filter(models.User.role == "student", models.User.class_name == hw.class_name).all()
    
    # Get all submissions for this HW
    submissions = db.query(models.HomeworkSubmission).filter(models.HomeworkSubmission.homework_id == homework_id).all()
    
    sub_map = {s.student_id: s for s in submissions}
    
    completed = []
    pending = []
    missing = []
    
    for s in all_students:
        sub = sub_map.get(s.id)
        if not sub:
            missing.append({"id": s.id, "full_name": s.full_name})
        elif sub.teacher_confirmed:
            completed.append({"id": s.id, "full_name": s.full_name})
        else:
            pending.append({"id": s.id, "full_name": s.full_name, "submission_id": sub.id})
            
    return {
        "completed": completed,
        "pending": pending,
        "missing": missing,
        "hw_title": hw.title,
        "class_name": hw.class_name
    }

@app.post("/homework", response_model=schemas.Homework)
def create_homework(hw: schemas.HomeworkCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role("teacher"))):
    # Use provided steps if teacher edited them, otherwise auto-decompose
    steps = hw.steps if hw.steps else decompose_homework(hw.description)
    
    # Ensure steps are in the correct dict format for the DB JSON column
    db_steps = [s.dict() if hasattr(s, 'dict') else s for s in steps]
    
    db_hw = models.Homework(
        subject_id=hw.subject_id,
        title=hw.title,
        description=hw.description,
        is_star=hw.is_star,
        requires_confirmation=hw.requires_confirmation,
        is_mascot_reward=hw.is_mascot_reward,
        class_name=hw.class_name,
        due_date=hw.due_date,
        teacher_id=current_user.id,
        steps=db_steps
    )
    db.add(db_hw)
    db.commit()
    db.refresh(db_hw)
    return db_hw

def check_internship_creator(current_user: models.User = Depends(auth.get_approved_user)):
    allowed_roles = [ROLE_SSA, ROLE_SUPER_ADMIN, ROLE_OWNER, ROLE_ADMIN, ROLE_TEACHER]
    if current_user.role in allowed_roles:
        return current_user
    raise HTTPException(status_code=403, detail="Only staff members can create internships")

@app.post("/internships", response_model=schemas.Homework)
def create_internship(hw: schemas.HomeworkCreate, db: Session = Depends(get_db), current_user: models.User = Depends(check_internship_creator)):
    steps = hw.steps if hw.steps else decompose_homework(hw.description)
    db_steps = [s.dict() if hasattr(s, 'dict') else s for s in steps]
    db_hw = models.Homework(
        subject_id=hw.subject_id,
        title=hw.title,
        description=hw.description,
        is_star=hw.is_star,
        requires_confirmation=hw.requires_confirmation,
        is_mascot_reward=hw.is_mascot_reward,
        class_name=hw.class_name,
        due_date=hw.due_date,
        teacher_id=current_user.id,
        steps=db_steps,
        
        # New Internship fields
        is_internship=True,
        internship_type=hw.internship_type,
        custom_coin_reward=hw.custom_coin_reward,
        prize_attachment_url=hw.prize_attachment_url,
        target_audience=hw.target_audience
    )
    db.add(db_hw)
    db.commit()
    db.refresh(db_hw)
    return db_hw

@app.post("/homework/upload-proof")
def upload_hw_proof(file: UploadFile = File(...), current_user: models.User = Depends(auth.get_current_user)):
    file_name = save_upload(file, f"hw_{current_user.id}_{uuid.uuid4().hex[:8]}")
    return {"attachment_url": f"/api/uploads/{file_name}"}

@app.post("/homework/submit", response_model=schemas.HomeworkSubmission)
def submit_homework(sub_data: schemas.HomeworkSubmissionCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if not db.query(models.Homework).filter(models.Homework.id == sub_data.homework_id).first():
        raise HTTPException(status_code=404, detail="Homework not found")
    # Check if submission already exists
    sub = db.query(models.HomeworkSubmission).filter(
        models.HomeworkSubmission.homework_id == sub_data.homework_id,
        models.HomeworkSubmission.student_id == current_user.id
    ).first()
    
    if not sub:
        sub = models.HomeworkSubmission(
            homework_id=sub_data.homework_id,
            student_id=current_user.id,
            completed_steps=sub_data.completed_steps,
            is_fully_completed=True,
            attachment_url=sub_data.attachment_url
        )
        db.add(sub)
    else:
        sub.completed_steps = sub_data.completed_steps
        sub.attachment_url = sub_data.attachment_url
        sub.is_fully_completed = True
        sub.teacher_confirmed = False # Re-submit clears confirmation
        
    db.commit()
    db.refresh(sub)
    return sub

@app.post("/teacher/lessons/attach-homework")
def attach_homework(data: schemas.LessonAttachHW, db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role("teacher"))):
    lesson = db.query(models.Lesson).filter(
        models.Lesson.lesson_id_str == data.lesson_id_str,
        models.Lesson.teacher_id == current_user.id
    ).first()
    
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
        
    lesson.homework_id = data.homework_id
    db.commit()
    return {"status": "success"}

@app.get("/teacher/submissions", response_model=List[schemas.HomeworkSubmission])
def get_teacher_submissions(scope: str = "all", db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role("teacher"))):
    query = db.query(models.HomeworkSubmission).options(
        joinedload(models.HomeworkSubmission.student)
    ).join(models.User, models.HomeworkSubmission.student_id == models.User.id).filter(models.HomeworkSubmission.teacher_confirmed == False)
    
    if current_user.school_id is None:
        return [] # Safety: staff without school sees nothing
        
    query = query.filter(models.User.school_id == current_user.school_id)
        
    if scope == "assigned" and current_user.assigned_classes:
        query = query.filter(models.User.class_name.in_(current_user.assigned_classes))
    elif scope == "assigned":
        return []
        
    subs = query.all()
    
    # Enrichment
    result = []
    for s in subs:
        hw = db.query(models.Homework).filter(models.Homework.id == s.homework_id).first()
        result.append({
            "id": s.id,
            "homework_id": s.homework_id,
            "student_id": s.student_id,
            "completed_steps": s.completed_steps,
            "is_fully_completed": s.is_fully_completed,
            "attachment_url": s.attachment_url,
            "teacher_confirmed": s.teacher_confirmed,
            "student_name": s.student.full_name if s.student else "Unknown",
            "hw_title": hw.title if hw else "Unknown Task"
        })
    return result

@app.post("/homework/approve")
def approve_homework(approval: schemas.HWApproval, db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role("teacher"))):
    sub = db.query(models.HomeworkSubmission).filter(models.HomeworkSubmission.id == approval.submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
        
    # Isolation check: teacher can only approve submissions by students from their school
    student = db.query(models.User).filter(models.User.id == sub.student_id).first()
    if not student or current_user.school_id is None or student.school_id != current_user.school_id:
        raise HTTPException(status_code=403, detail="Not authorized to approve submissions from other schools")
    
    if sub.teacher_confirmed:
        raise HTTPException(status_code=400, detail="Submission already approved")
    hw = db.query(models.Homework).filter(models.Homework.id == sub.homework_id).first()
    if not hw:
        raise HTTPException(status_code=404, detail="Homework not found")

    sub.teacher_confirmed = True

    # Award bonus coins
    if student.character:
        settings = student.school.settings if student.school and student.school.settings else {}
        
        # Decide bonus amount
        bonus = approval.bonus_coins
        if bonus == 5: # Default value in schema, let's override with settings if available
            bonus = settings.get("coins_hw_full_bonus", 5)

        if hw and hw.is_star:
            student.character.supercoins += bonus
            add_transaction(db, student.id, bonus, "homework", f"⭐ Звездное ДЗ: {hw.title}")
        else:
            student.character.coins += bonus
            add_transaction(db, student.id, bonus, "homework", f"ДЗ: {hw.title}")
            
        # Mascot Reward Logic
        if hw and hw.is_mascot_reward:
            student.character.mascot_slots += 1
            # Special Unlock Notification
            unlocked_notif = models.Notification(
                user_id=student.id,
                sender_id=current_user.id,
                type='mascot_unlock',
                title="🎁 ТЫ ОТКРЫЛ МАСКОТА!",
                description="Теперь ты можешь выбрать своего нового напарника на Дашборде! Жми скорее!",
                extra_data={"target": "dashboard"}
            )
            db.add(unlocked_notif)
            
        if hw:
            # If teacher provided a score, record it in Journal (Grades)
            if approval.score:
                db_grade = models.Grade(
                    user_id=student.id,
                    subject_id=hw.subject_id,
                    teacher_id=current_user.id,
                    score=approval.score,
                    grade_type="homework",
                    comment=f"За ДЗ: {hw.title}",
                    timestamp=datetime.datetime.utcnow()
                )
                db.add(db_grade)
                # Boost based on score (1-5 -> 0.1 to 0.5)
                update_character_stats(db, student.id, hw.subject_id, approval.score * 0.1)
            else:
                # Default boost if no score provided
                update_character_stats(db, student.id, hw.subject_id, 0.5)
    
    db.commit()
    return {"status": "ok", "message": "Homework approved"}

@app.post("/behavior", response_model=schemas.User)
def record_behavior(behavior: schemas.BehaviorCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role("teacher"))):
    student = db.query(models.User).filter(models.User.id == behavior.user_id).first()
    if not student or not student.character:
        raise HTTPException(status_code=404, detail="Student not found")
        
    # Isolation check: teacher can only record behavior for students from their school
    if current_user.school_id is None or student.school_id != current_user.school_id:
        raise HTTPException(status_code=403, detail="Not authorized to record behavior for students from other schools")
    
    # Record violation
    db_behavior = models.BehaviorRecord(
        user_id=behavior.user_id,
        teacher_id=current_user.id,
        type=behavior.type,
        coin_penalty=behavior.coin_penalty,
        description=behavior.description
    )
    db.add(db_behavior)
    
    # Apply penalty (min 0)
    student.character.coins = max(0, student.character.coins - behavior.coin_penalty)
    add_transaction(db, student.id, -behavior.coin_penalty, "behavior", behavior.description or behavior.type)
    
    db.commit()
    db.refresh(student)
    return student

SECRET_RECEPTION_KEY = os.getenv("RECEPTION_SECRET") or f"reception:{auth.SECRET_KEY}"

def get_current_reception_code():
    time_chunk = int(time.time() / 30)
    hash_str = hashlib.sha256(f"{SECRET_RECEPTION_KEY}_{time_chunk}".encode()).hexdigest()[:10]
    return f"ENTRY_{hash_str}"

def is_valid_reception_code(code: str):
    current_chunk = int(time.time() / 30)
    for offset in [0, -1]:
        chunk = current_chunk + offset
        valid_hash = hashlib.sha256(f"{SECRET_RECEPTION_KEY}_{chunk}".encode()).hexdigest()[:10]
        if code == f"ENTRY_{valid_hash}":
            return True
    return False

@app.get("/attendance/reception-qr")
def get_reception_qr():
    return {
        "code": get_current_reception_code(), 
        "expires_in": 30 - (int(time.time()) % 30)
    }

@app.post("/attendance/scan")
def scan_qr(qr_type: str, lesson_id: Optional[str] = None, entry_code: Optional[str] = None, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    now = datetime.datetime.utcnow()
    user_id = current_user.id
    today = now.date()
    
    if qr_type not in ("school_entry", "lesson"):
        raise HTTPException(status_code=400, detail="Unknown QR type")
    if current_user.role != ROLE_STUDENT or not current_user.character:
        raise HTTPException(status_code=403, detail="Only students can scan attendance codes")

    # Check for duplicates
    if qr_type == "school_entry":
        if not entry_code or not is_valid_reception_code(entry_code):
            raise HTTPException(status_code=400, detail="Invalid or expired QR code")
                
        existing = db.query(models.Attendance).filter(
            models.Attendance.user_id == user_id,
            models.Attendance.type == "school_entry",
            models.Attendance.timestamp >= today
        ).first()
        if existing:
            return {"status": "already_scanned", "coins_earned": 0, "streak_count": 0}

        if now.hour >= 9:
            status = "late"
        else:
            status = "on_time"
            
    else: # lesson
        lesson = db.query(models.Lesson).filter(models.Lesson.lesson_id_str == lesson_id).first() if lesson_id else None
        if not lesson or lesson.finished_at is not None:
            raise HTTPException(status_code=400, detail="Lesson not found or already finished")
        # For lessons, check if already scanned THIS SPECIFIC lesson today
        # We store lesson_id as string in the DB (it's currently Integer in model, but we should change to String)
        existing = db.query(models.Attendance).filter(
            models.Attendance.user_id == user_id,
            models.Attendance.type == "lesson",
            models.Attendance.lesson_id_str == lesson_id,
            models.Attendance.timestamp >= today
        ).first()
        if existing:
            return {"status": "already_scanned", "coins_earned": 0, "streak_count": 0}
        status = "on_time"

    db_attendance = models.Attendance(
        user_id=user_id, 
        type=qr_type, 
        lesson_id_str=lesson_id, 
        status=status
    )
    db.add(db_attendance)
    
    # Update Streaks
    streak_type = "attendance" if qr_type == "school_entry" else "all_lessons"
    streak = db.query(models.Streak).filter(models.Streak.user_id == user_id, models.Streak.type == streak_type).first()
    
    if not streak:
        streak = models.Streak(user_id=user_id, type=streak_type, current_count=0)
        db.add(streak)
        
    if status == "on_time":
        streak.current_count += 1
    else:
        streak.current_count = 0 
    
    streak.last_action_date = now
    
    # Reward coins
    settings = current_user.school.settings if current_user.school and current_user.school.settings else {}
    if status == "on_time":
        if qr_type == 'school_entry':
            coins = settings.get("coins_attendance_ontime", 5)
        else: # lesson
            coins = settings.get("coins_lesson_attendance", 3)
            
        current_user.character.coins += coins
        desc = "Вход в школу" if qr_type == 'school_entry' else "Посещение урока"
        add_transaction(db, user_id, coins, "attendance", desc)
    else:
        coins = 0
        
    db.commit()
    return {"status": status, "coins_earned": coins, "streak_count": streak.current_count}

# Admin Endpoints
@app.get("/admin/users", response_model=List[schemas.User])
def get_all_users(db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role([ROLE_ADMIN, ROLE_OWNER, "super_admin"]))):
    query = db.query(models.User)
    if current_user.role not in ["super_admin", ROLE_SSA]:
        if current_user.school_id is None:
            return [] # Safety: non-superadmin without a school sees no one
        query = query.filter(models.User.school_id == current_user.school_id)
    return query.all()

@app.get("/admin/users/pending", response_model=List[schemas.User])
def get_pending_users(db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role([ROLE_ADMIN, ROLE_OWNER, "super_admin"]))):
    query = db.query(models.User).filter(models.User.is_approved == False, models.User.deleted_at == None)
    if current_user.role not in ["super_admin", ROLE_SSA]:
        if current_user.school_id is None:
            return [] # Safety: non-superadmin without a school sees no one
        query = query.filter(models.User.school_id == current_user.school_id)
    return query.all()

@app.post("/admin/users/{user_id}/approve")
def approve_user(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role([ROLE_OWNER, ROLE_ADMIN, ROLE_TEACHER, ROLE_SUPER_ADMIN]))):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Owner can approve Admins, Teachers and Students
    # Admin can approve Teachers and Students
    # Teacher can approve Students in their classes
    if current_user.role == ROLE_OWNER:
        if user.role not in [ROLE_ADMIN, ROLE_TEACHER, ROLE_STUDENT]:
             raise HTTPException(status_code=403, detail="Owner can only approve Admin, Teacher or Student apps")
    elif current_user.role == ROLE_ADMIN:
        if user.role not in [ROLE_TEACHER, ROLE_STUDENT]:
             raise HTTPException(status_code=403, detail="Admin can only approve Teacher or Student apps")
    elif current_user.role == ROLE_TEACHER:
        if user.role != ROLE_STUDENT:
            raise HTTPException(status_code=403, detail="Teacher can only approve Students")
        if not current_user.assigned_classes or user.class_name not in current_user.assigned_classes:
            raise HTTPException(status_code=403, detail="You are not authorized to approve students for this class")
    
    if current_user.role not in [ROLE_SUPER_ADMIN, ROLE_SSA]:
        if current_user.school_id is None or user.school_id != current_user.school_id:
            raise HTTPException(status_code=403, detail="Not authorized to approve users from other schools")
    
    user.is_approved = True
    
    # Character Insurance: ensure student has a character record upon approval (if students needed approval)
    if user.role == ROLE_STUDENT and not user.character:
        new_char = models.Character(user_id=user.id, level=1, coins=10)
        db.add(new_char)
        
    db.commit()
    return {"message": f"User {user.username} approved"}

@app.get("/admin/pending-staff", response_model=List[schemas.User])
def get_pending_staff(db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role([ROLE_OWNER, ROLE_ADMIN, ROLE_TEACHER]))):
    if current_user.school_id is None:
        return []
        
    query = db.query(models.User).filter(
        models.User.school_id == current_user.school_id,
        models.User.is_approved == False
    )
    
    if current_user.role == ROLE_ADMIN:
        # Admins see pending teachers and students
        query = query.filter(models.User.role.in_([ROLE_TEACHER, ROLE_STUDENT]))
    elif current_user.role == ROLE_TEACHER:
        # Teachers only see pending students for THEIR classes
        if not current_user.assigned_classes:
            return []
        query = query.filter(models.User.role == ROLE_STUDENT, models.User.class_name.in_(current_user.assigned_classes))
    else:
        # Owners see pending admins, teachers and students
        query = query.filter(models.User.role.in_([ROLE_ADMIN, ROLE_TEACHER, ROLE_STUDENT]))
        
    return query.all()

@app.get("/admin/stats")
def get_admin_stats(db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role([ROLE_ADMIN, ROLE_OWNER]))):
    school_id = current_user.school_id
    if not school_id:
        return {
            "counts": {"students": 0, "teachers": 0, "parents": 0},
            "totalStudents": 0,
            "attendanceToday": 0,
            "onTimeToday": 0,
            "attendance_today": 0,
            "on_time_today": 0,
            "attendanceTrend": [],
            "performanceTrend": [],
            "topStudents": [],
            "recent_activity": []
        }
    
    # Counts
    total_students = db.query(models.User).filter(models.User.school_id == school_id, models.User.role == "student", models.User.deleted_at == None).count()
    total_teachers = db.query(models.User).filter(models.User.school_id == school_id, models.User.role == "teacher", models.User.deleted_at == None).count()
    total_parents = db.query(models.User).filter(models.User.school_id == school_id, models.User.role == "parent", models.User.deleted_at == None).count()
    
    pending_applications_count = db.query(models.User).filter(
        models.User.school_id == school_id, 
        models.User.is_approved == False, 
        models.User.deleted_at == None
    ).count()
    
    today = datetime.datetime.utcnow().date()
    today_dt = datetime.datetime.combine(today, datetime.time.min)
    
    att_today_query = db.query(models.Attendance).join(models.User).filter(
        models.User.school_id == school_id,
        models.Attendance.type == "school_entry",
        models.Attendance.timestamp >= today_dt
    )
    attendance_today = att_today_query.count()
    on_time_today = att_today_query.filter(models.Attendance.status == "on_time").count()
    
    # Trend
    trend = []
    for i in range(6, -1, -1):
        day = today - datetime.timedelta(days=i)
        day_start = datetime.datetime.combine(day, datetime.time.min)
        day_end = day_start + datetime.timedelta(days=1)
        count = db.query(models.Attendance).join(models.User).filter(
            models.User.school_id == school_id,
            models.Attendance.type == "school_entry",
            models.Attendance.timestamp >= day_start,
            models.Attendance.timestamp < day_end
        ).count()
        trend.append({"date": day.strftime("%d.%m"), "count": count})
    
    top_students = db.query(models.User).join(models.Character, models.User.id == models.Character.user_id).filter(
        models.User.school_id == school_id,
        models.User.role == "student"
    ).order_by(models.Character.coins.desc()).limit(5).all()
    
    return {
        "totalStudents": total_students,
        "totalTeachers": total_teachers,
        "totalParents": total_parents,
        "pendingCount": pending_applications_count,
        "attendanceToday": attendance_today,
        "onTimeToday": on_time_today,
        "attendanceTrend": trend,
        "topStudents": [{"name": s.full_name, "coins": s.character.coins if s.character else 0} for s in top_students]
    }

@app.patch("/admin/teachers/{teacher_id}/responsibilities")
def update_teacher_responsibilities(teacher_id: int, data: dict, db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role([ROLE_ADMIN, ROLE_OWNER]))):
    teacher = db.query(models.User).filter(models.User.id == teacher_id, models.User.role == "teacher").first()
    if not teacher or current_user.school_id is None or teacher.school_id != current_user.school_id:
        raise HTTPException(status_code=404, detail="Teacher not found in your school")
    
    classes = data.get("assigned_classes", [])
    subjects = data.get("assigned_subjects", [])
    teacher.assigned_classes = classes
    teacher.assigned_subjects = subjects
    db.commit()
    return {"message": "Responsibilities updated", "assigned_classes": classes, "assigned_subjects": subjects}

@app.patch("/admin/school/settings")
def update_school_settings(settings: dict, db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role([ROLE_ADMIN, ROLE_OWNER]))):
    if current_user.school_id is None:
        raise HTTPException(status_code=400, detail="User is not associated with a school")
    school = db.query(models.School).filter(models.School.id == current_user.school_id).first()
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    
    db_settings = dict(school.settings) if school.settings else {}
    db_settings.update(settings)
    school.settings = db_settings
    db.commit()
    return {"message": "Settings updated", "settings": school.settings}

@app.post("/admin/users/{user_id}/promote")
def promote_to_admin(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_approved_user)):
    # Only Admin (Zavuch), Owner (Director) or SuperAdmin can promote
    if current_user.role not in [ROLE_ADMIN, ROLE_OWNER, ROLE_SUPER_ADMIN, ROLE_SSA]:
        raise HTTPException(status_code=403, detail="Not authorized to promote users")
        
    target_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Isolation check: Admin/Owner can only promote users in their own school
    if current_user.role in ["admin", "owner"]:
        if current_user.school_id is None or target_user.school_id != current_user.school_id:
            raise HTTPException(status_code=403, detail="You can only promote users within your own school")
    
    # Safety: Cannot demote a super_admin or promote to super_admin via this endpoint
    if target_user.role in (ROLE_SUPER_ADMIN, ROLE_SSA):
        raise HTTPException(status_code=403, detail="Cannot modify a Super Admin")
        
    target_user.role = "admin"
    db.commit()
    return {"message": f"User {target_user.username} promoted to Admin"}

from pydantic import BaseModel
class UserPermissionsUpdate(BaseModel):
    can_create_internships: bool

@app.post("/admin/users/{user_id}/permissions")
def update_user_permissions(user_id: int, perms: UserPermissionsUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role(["super_admin", ROLE_OWNER, ROLE_ADMIN]))):
    target_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if current_user.role not in (ROLE_SUPER_ADMIN, ROLE_SSA) and (current_user.school_id is None or target_user.school_id != current_user.school_id):
        raise HTTPException(status_code=403, detail="Not authorized to change users from other schools")

    target_user.can_create_internships = perms.can_create_internships
    db.commit()
    return {"message": f"Permissions updated for user {target_user.username}", "can_create_internships": target_user.can_create_internships}

@app.post("/admin/users/{user_id}/soft-delete")
def soft_delete_user(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role(["admin", ROLE_OWNER, "super_admin"]))):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if current_user.role not in ["super_admin", ROLE_SSA] and user.school_id != current_user.school_id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    user.deleted_at = datetime.datetime.utcnow()
    db.commit()
    return {"message": "User blocked and scheduled for deletion in 30 days"}

@app.post("/admin/users/{user_id}/restore")
def restore_user(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role([ROLE_ADMIN, ROLE_OWNER, "super_admin"]))):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if current_user.role not in ["super_admin", ROLE_SSA] and user.school_id != current_user.school_id:
        raise HTTPException(status_code=403, detail="Not authorized to restore users from other schools")

    user.deleted_at = None
    db.commit()
    return {"message": "User restored"}

@app.delete("/admin/users/{user_id}")
def hard_delete_user(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role(["admin", ROLE_OWNER, "super_admin"]))):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if current_user.role not in ["super_admin", ROLE_SSA] and user.school_id != current_user.school_id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    db.delete(user)
    db.commit()
    return {"message": "User permanently deleted"}
@app.post("/admin/users/cleanup")
def cleanup_deleted_users(db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role("super_admin"))):
    thirty_days_ago = datetime.datetime.utcnow() - datetime.timedelta(days=30)
    stale_users = db.query(models.User).filter(
        models.User.deleted_at != None,
        models.User.deleted_at <= thirty_days_ago
    ).all()
    
    count = len(stale_users)
    for user in stale_users:
        db.delete(user)
    
    db.commit()
    return {"message": f"Successfully deleted {count} stale users"}

# --- Class Management Endpoints ---

@app.get("/schools/{school_id}/classes", response_model=List[schemas.SchoolClass])
def get_school_classes_public(school_id: int, db: Session = Depends(get_db)):
    """Public endpoint for registration dropdown"""
    return db.query(models.SchoolClass).filter(models.SchoolClass.school_id == school_id).all()

@app.get("/admin/classes", response_model=List[schemas.SchoolClass])
def get_admin_classes(db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role([ROLE_ADMIN, ROLE_OWNER]))):
    """Admin endpoint to list classes for their school"""
    return db.query(models.SchoolClass).filter(models.SchoolClass.school_id == current_user.school_id).all()

@app.post("/admin/classes", response_model=schemas.SchoolClass)
def create_class(data: schemas.SchoolClassCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role([ROLE_ADMIN, ROLE_OWNER]))):
    """Create a new class for the admin's school"""
    new_class = models.SchoolClass(name=data.name, school_id=current_user.school_id)
    db.add(new_class)
    db.commit()
    db.refresh(new_class)
    return new_class

@app.delete("/admin/classes/{class_id}")
def delete_class(class_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role([ROLE_ADMIN, ROLE_OWNER]))):
    """Delete a class"""
    target = db.query(models.SchoolClass).filter(models.SchoolClass.id == class_id, models.SchoolClass.school_id == current_user.school_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Class not found")
    db.delete(target)
    db.commit()
    return {"message": "Class deleted"}

@app.post("/admin/classes/sync")
def sync_existing_classes(db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role([ROLE_ADMIN, ROLE_OWNER]))):
    """Seed the school_classes table from existing User.class_name strings"""
    existing_names = db.query(models.User.class_name).filter(
        models.User.school_id == current_user.school_id,
        models.User.class_name != None
    ).distinct().all()
    
    count = 0
    for (cname,) in existing_names:
        # Check if already exists
        exists = db.query(models.SchoolClass).filter(models.SchoolClass.school_id == current_user.school_id, models.SchoolClass.name == cname).first()
        if not exists:
            new_class = models.SchoolClass(name=cname, school_id=current_user.school_id)
            db.add(new_class)
            count += 1
    
    db.commit()
    return {"message": f"Synced {count} classes"}

# Super Admin (Owner) Endpoints
@app.get("/superadmin/admins", response_model=List[schemas.User])
def get_all_admins(db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role("super_admin"))):
    return db.query(models.User).filter(models.User.role.in_(["admin", "super_admin"])).all()

@app.post("/superadmin/admins")
def create_super_admin(user_data: schemas.UserCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role(["super_admin"]))):
    existing = db.query(models.User).filter(models.User.username == user_data.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already taken")
        
    hashed_password = auth.get_password_hash(user_data.password)
    new_admin = models.User(
        username=user_data.username,
        phone_number=user_data.phone_number,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        role="super_admin",
        is_approved=True
    )
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    return new_admin

@app.post("/superadmin/promote-sa/{user_id}")
def promote_to_super_admin(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role(ROLE_SSA))):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = ROLE_SUPER_ADMIN
    db.commit()
    return {"message": f"User {user.username} promoted to Super Admin"}

@app.get("/superadmin/stats")
def get_superadmin_stats(db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role("super_admin"))):
    total_schools = db.query(models.School).count()
    active_users = db.query(models.User).filter(models.User.role == "student", models.User.is_approved == True).count()
    total_admins = db.query(models.User).filter(models.User.role.in_(["admin", "super_admin"])).count()
    
    return {
        "schools": total_schools,
        "active_users": active_users,
        "admins": total_admins,
        "nps": None  # NPS is not collected yet
    }

@app.get("/superadmin/users/search", response_model=List[schemas.User])
def search_users(query: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role("super_admin"))):
    return db.query(models.User).filter(
        (models.User.username.ilike(f"%{query}%")) | 
        (models.User.full_name.ilike(f"%{query}%")) |
        (models.User.phone_number.ilike(f"%{query}%"))
    ).limit(10).all()

@app.post("/superadmin/schools/{school_id}/assign-owner/{user_id}")
def assign_school_owner(school_id: int, user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role([ROLE_SSA, ROLE_SUPER_ADMIN]))):
    school = db.query(models.School).filter(models.School.id == school_id).first()
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.role = ROLE_OWNER
    user.school_id = school_id
    user.is_approved = True
    db.commit()
    return {"message": f"User {user.username} is now owner for {school.name}"}

@app.get("/superadmin/schools/{school_id}/owners", response_model=List[schemas.User])
def get_school_owners(school_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role([ROLE_SSA, ROLE_SUPER_ADMIN]))):
    return db.query(models.User).filter(models.User.school_id == school_id, models.User.role == ROLE_OWNER).all()

# School Management
@app.get("/schools/search", response_model=List[schemas.School])
def search_schools(q: str = "", db: Session = Depends(get_db)):
    return db.query(models.School).filter(models.School.name.ilike(f"%{q}%")).all()

@app.get("/schools/public", response_model=List[schemas.School])
def get_public_schools(db: Session = Depends(get_db)):
    # Basic list for registration (recent or featured)
    return db.query(models.School).limit(10).all()

@app.post("/superadmin/schools", response_model=schemas.School)
def create_school(school: schemas.SchoolCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role("super_admin"))):
    db_school = models.School(name=school.name, city=school.city, address=school.address)
    db.add(db_school)
    try:
        db.commit()
        db.refresh(db_school)
        return db_school
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="School with this name might already exist")

@app.get("/superadmin/schools", response_model=List[schemas.School])
def get_superadmin_schools(db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role("super_admin"))):
    return db.query(models.School).all()

@app.delete("/superadmin/schools/{school_id}")
def delete_school(school_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role("super_admin"))):
    school = db.query(models.School).filter(models.School.id == school_id).first()
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    
    # Optional: check if users are attached, handle foreign key nullification
    # users = db.query(models.User).filter(models.User.school_id == school.id).all()
    # for u in users:
    #     u.school_id = None
        
    db.delete(school)
    db.commit()
    return {"message": "School deleted"}
# Notifications Endpoints
@app.get("/notifications", response_model=List[schemas.Notification])
def get_notifications(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Fetch real notifications from DB
    db_notifs = db.query(models.Notification).filter(models.Notification.user_id == current_user.id).order_by(models.Notification.created_at.desc()).all()
    
    # We also keep the virtual notifications for students/teachers to not break existing UI
    virtual_notifs = []
    if current_user.role == 'student':
        history = db.query(models.Transaction).filter(models.Transaction.user_id == current_user.id).order_by(models.Transaction.timestamp.desc()).limit(20).all()
        for t in history:
            virtual_notifs.append(models.Notification(
                id=-(t.id), # negative ID for virtual
                user_id=current_user.id,
                type=t.type,
                title="Награда" if t.amount > 0 else "Списание",
                description=t.description,
                is_read=True,
                amount=t.amount,
                created_at=t.timestamp
            ))
    elif current_user.role == 'teacher':
        subs = db.query(models.HomeworkSubmission).join(models.User, models.HomeworkSubmission.student_id == models.User.id).filter(
            models.User.school_id == current_user.school_id,
            models.HomeworkSubmission.teacher_confirmed == False
        ).limit(20).all()
        for s in subs:
            virtual_notifs.append(models.Notification(
                id=-(s.id),
                user_id=current_user.id,
                type='homework',
                title="Новое задание",
                description=f"Ученик {s.student.full_name} сдал работу",
                is_read=True,
                created_at=datetime.datetime.utcnow()  # submissions have no timestamp column
            ))
            
    return db_notifs + virtual_notifs

@app.post("/notifications/{notif_id}/read")
def mark_notification_read(notif_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if notif_id < 0: return {"status": "ok"} # Skip virtual
    notif = db.query(models.Notification).filter(models.Notification.id == notif_id, models.Notification.user_id == current_user.id).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"status": "ok"}

# Parent Linking Endpoints
@app.get("/users/search-parents", response_model=List[schemas.ParentSearchResponse])
def search_parents(query: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Only allowed within the same school for privacy, OR if universal
    # Basic search by phone or username or full_name
    parents = db.query(models.User).filter(
        models.User.role == "parent",
        (models.User.phone_number.like(f"%{query}%")) | (models.User.username.like(f"%{query}%")) | (models.User.full_name.like(f"%{query}%"))
    ).limit(10).all()
    return parents

@app.post("/student/request-parent-link")
def request_parent_link(parent_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role("student"))):
    # Check if parent exists
    parent = db.query(models.User).filter(models.User.id == parent_id, models.User.role == "parent").first()
    if not parent:
        raise HTTPException(status_code=404, detail="Parent not found")
    
    # Check if already exists
    exists = db.query(models.ParentStudentAssociation).filter(
        models.ParentStudentAssociation.parent_id == parent_id,
        models.ParentStudentAssociation.student_id == current_user.id
    ).first()
    
    if exists:
        return {"status": "already_exists", "is_confirmed": exists.status == "confirmed"}
    
    # Create request
    new_assoc = models.ParentStudentAssociation(parent_id=parent_id, student_id=current_user.id, status="pending")
    db.add(new_assoc)
    
    # Create Notification for parent
    notif = models.Notification(
        user_id=parent_id,
        sender_id=current_user.id,
        type='parent_link_request',
        title="Запрос на привязку",
        description=f"Ученик {current_user.full_name} хочет привязать вас как родителя.",
        extra_data={"student_id": current_user.id}
    )
    db.add(notif)
    db.commit()
    return {"status": "request_sent"}

@app.post("/parent/respond-to-link-request")
def respond_to_link_request(notif_id: int, accept: bool, db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role("parent"))):
    notif = db.query(models.Notification).filter(models.Notification.id == notif_id, models.Notification.user_id == current_user.id).first()
    if not notif or notif.type != 'parent_link_request':
        raise HTTPException(status_code=404, detail="Request not found")
    
    student_id = notif.extra_data.get("student_id")
    assoc = db.query(models.ParentStudentAssociation).filter(
        models.ParentStudentAssociation.parent_id == current_user.id,
        models.ParentStudentAssociation.student_id == student_id
    ).first()
    
    if accept:
        if assoc:
            assoc.status = "confirmed"
        else:
            assoc = models.ParentStudentAssociation(parent_id=current_user.id, student_id=student_id, status="confirmed")
            db.add(assoc)
        notif.description += " (Принято)"
    else:
        if assoc:
            db.delete(assoc)
        notif.description += " (Отклонено)"
    
    notif.is_read = True
    db.commit()
    return {"status": "success"}

@app.post("/character/choose-mascot")
def choose_mascot(mascot_file: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can choose mascots")
    
    char = current_user.character
    if not char:
        raise HTTPException(status_code=404, detail="Character not found")
    
    # Check if has free slot
    if len(char.unlocked_mascots) >= char.mascot_slots:
        raise HTTPException(status_code=400, detail="No free mascot slots available")
    
    # Check if already has this mascot
    if mascot_file in char.unlocked_mascots:
        raise HTTPException(status_code=400, detail="Mascot already in your squad")
    
    # Check if valid file (simple security check)
    valid_mascots = ["1.PNG", "2.PNG", "3.PNG", "4.PNG", "5.PNG"]
    if mascot_file not in valid_mascots:
        raise HTTPException(status_code=400, detail="Invalid mascot file")

    # Update collection
    new_collection = list(char.unlocked_mascots)
    new_collection.append(mascot_file)
    char.unlocked_mascots = new_collection
    
    db.commit()
    return {"status": "success", "unlocked_mascots": char.unlocked_mascots}

@app.post("/character/set-active-mascot")
def set_active_mascot(mascot_file: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    char = current_user.character
    if not char:
        raise HTTPException(status_code=404, detail="Character not found")
    if mascot_file not in char.unlocked_mascots:
        raise HTTPException(status_code=403, detail="Mascot not unlocked")
    char.active_mascot = mascot_file
    db.commit()
    return {"status": "ok", "active_mascot": mascot_file}

# --- Mascot Room & Marketplace ---

@app.get("/marketplace/food", response_model=List[schemas.MarketplaceItem])
def get_marketplace_food():
    return FOOD_ITEMS

@app.post("/marketplace/buy")
def buy_food(item_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    item = next((i for i in FOOD_ITEMS if i["id"] == item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    char = current_user.character
    if not char or char.coins < item["price"]:
        raise HTTPException(status_code=400, detail="Not enough coins")
    
    # Deduct coins
    char.coins -= item["price"]
    
    # Add to inventory
    inv_item = db.query(models.MascotInventory).filter(models.MascotInventory.user_id == current_user.id, models.MascotInventory.item_id == item_id).first()
    if inv_item:
        inv_item.quantity += 1
    else:
        new_inv = models.MascotInventory(user_id=current_user.id, item_id=item_id, quantity=1)
        db.add(new_inv)
    
    # Log transaction
    tx = models.Transaction(user_id=current_user.id, amount=-item["price"], type='marketplace', description=f"Bought {item['name']}")
    db.add(tx)
    
    db.commit()
    return {"status": "ok", "remaining_coins": char.coins}

@app.get("/student/inventory", response_model=List[schemas.MascotInventoryItem])
def get_inventory(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.MascotInventory).filter(models.MascotInventory.user_id == current_user.id, models.MascotInventory.quantity > 0).all()

@app.post("/mascot/feed")
def feed_mascot(item_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    inv_item = db.query(models.MascotInventory).filter(models.MascotInventory.user_id == current_user.id, models.MascotInventory.item_id == item_id).first()
    if not inv_item or inv_item.quantity <= 0:
        raise HTTPException(status_code=400, detail="No such item in inventory")
    
    item = next((i for i in FOOD_ITEMS if i["id"] == item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Item data missing")
    
    char = current_user.character
    if not char:
        raise HTTPException(status_code=404, detail="Character not found")
    
    update_mascot_state(char)
    
    # Apply benefits
    char.mascot_hunger = min(100.0, char.mascot_hunger + item["hunger_benefit"])
    char.mascot_happiness = min(100.0, char.mascot_happiness + item["happiness_benefit"])
    
    inv_item.quantity -= 1
    db.commit()
    return {"status": "ok", "hunger": char.mascot_hunger, "happiness": char.mascot_happiness}

@app.post("/mascot/pet")
def pet_mascot(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    char = current_user.character
    if not char:
        raise HTTPException(status_code=404, detail="Character not found")
    
    update_mascot_state(char)
    char.mascot_happiness = min(100.0, char.mascot_happiness + 10.0) # Petting gives 10% happiness
    db.commit()
    return {"status": "ok", "happiness": char.mascot_happiness}

@app.post("/mascot/chat", response_model=schemas.MascotChatResponse)
def mascot_chat(req: schemas.MascotChatRequest, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    char = db.query(models.Character).filter(models.Character.user_id == current_user.id).first()
    if not char:
         raise HTTPException(status_code=404, detail="Character not found")

    # Persona enrichment based on state
    state_context = f"Сейчас твое состояние: Сытость {int(char.mascot_hunger)}%, Счастье {int(char.mascot_happiness)}%."
    if char.mascot_hunger < 30:
        state_context += " Ты довольно голоден."
    
    # 1. Fetch Chat History (last 50 messages)
    history = db.query(models.MascotChatMessage).filter(
        models.MascotChatMessage.user_id == current_user.id
    ).order_by(models.MascotChatMessage.timestamp.desc()).limit(50).all()
    
    # Reverse to chronological order for OpenAI
    history.reverse()

    # 2. Construct OpenAI Messages
    messages = [
        {"role": "system", "content": MASCOT_SYSTEM_PROMPT},
        {"role": "system", "content": f"Контекст текущего состояния: {state_context}"}
    ]
    
    for h in history:
        messages.append({"role": h.role, "content": h.content})
    
    messages.append({"role": "user", "content": req.message})

    # 3. Handle OpenAI Call
    if client is None:
        raise HTTPException(status_code=503, detail="Mascot AI is not configured")

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            max_tokens=250,
            temperature=0.8
        )
        ai_resp = response.choices[0].message.content

        # 4. Save Interaction to Database
        db.add(models.MascotChatMessage(user_id=current_user.id, role="user", content=req.message))
        db.add(models.MascotChatMessage(user_id=current_user.id, role="assistant", content=ai_resp))
        db.commit()
    except Exception:
        db.rollback()
        logger.exception("Mascot AI request failed")
        raise HTTPException(status_code=502, detail="Mascot AI is temporarily unavailable")
    return {"response": ai_resp}
