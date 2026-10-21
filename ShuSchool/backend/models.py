from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float, JSON
from sqlalchemy.orm import relationship
from database import Base
import datetime

class School(Base):
    __tablename__ = "schools"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    city = Column(String, nullable=True)
    address = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    settings = Column(JSON, nullable=True) # {"coins_attendance_ontime": 5, ...}
    
    users = relationship("User", back_populates="school")
    classes = relationship("SchoolClass", back_populates="school")

class SchoolClass(Base):
    __tablename__ = "school_classes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True) # e.g. "10-A"
    school_id = Column(Integer, ForeignKey("schools.id"))
    
    school = relationship("School", back_populates="classes")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    full_name = Column(String)
    role = Column(String) # student, teacher, admin
    class_name = Column(String, nullable=True) # e.g. "10-A"
    hashed_password = Column(String)
    profile_image = Column(String, nullable=True)
    is_approved = Column(Boolean, default=False)
    phone_number = Column(String, unique=True, nullable=True)
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=True)
    deleted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    telegram_id = Column(String, unique=True, nullable=True)
    can_create_internships = Column(Boolean, default=False)
    
    assigned_classes = Column(JSON, nullable=True) # ["10-A", "11-B"]
    assigned_subjects = Column(JSON, nullable=True) # [1, 2, 3] (Subject IDs)
    
    school = relationship("School", back_populates="users")
    character = relationship("Character", back_populates="user", uselist=False)
    attendance = relationship("Attendance", back_populates="user")
    homework_submissions = relationship("HomeworkSubmission", back_populates="student")

    # Parent-Student Relationship
    students = relationship(
        "User",
        secondary="parent_student_association",
        primaryjoin="User.id==parent_student_association.c.parent_id",
        secondaryjoin="User.id==parent_student_association.c.student_id",
        back_populates="parents"
    )
    parents = relationship(
        "User",
        secondary="parent_student_association",
        primaryjoin="User.id==parent_student_association.c.student_id",
        secondaryjoin="User.id==parent_student_association.c.parent_id",
        back_populates="students"
    )

class ParentStudentAssociation(Base):
    __tablename__ = "parent_student_association"
    parent_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    student_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    status = Column(String, default="pending") # pending, confirmed

class Character(Base):
    __tablename__ = "characters"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    level = Column(Integer, default=1)
    coins = Column(Integer, default=0)
    supercoins = Column(Integer, default=0)
    
    # Stats
    economy = Column(Float, default=0.0) # Math
    wisdom = Column(Float, default=0.0)  # Lit/Russian
    influence = Column(Float, default=0.0) # History
    health = Column(Float, default=0.0) # Bio/Chem
    strength = Column(Float, default=0.0) # PE
    diplomacy = Column(Float, default=0.0) # English
    technology = Column(Float, default=0.0) # Physics
    intellect = Column(Float, default=0.0) # CS
    
    # Mascot Squad & State
    mascot_slots = Column(Integer, default=0)
    unlocked_mascots = Column(JSON, default=[]) # e.g. ["1.PNG", "3.PNG"]
    active_mascot = Column(String, nullable=True)
    mascot_hunger = Column(Float, default=100.0)
    mascot_happiness = Column(Float, default=100.0)
    last_mascot_update = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="character")

class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    mapped_stat = Column(String) # economy, wisdom, etc.

class Homework(Base):
    __tablename__ = "homeworks"

    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    title = Column(String)
    description = Column(String)
    is_star = Column(Boolean, default=False) # supercoins if True
    requires_confirmation = Column(Boolean, default=False)
    steps = Column(JSON) # List of subtasks: [{"text": "...", "id": 1}]
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    is_mascot_reward = Column(Boolean, default=False)
    class_name = Column(String, nullable=True) # Targeting a specific class
    due_date = Column(DateTime, nullable=True) # DEADLINE
    
    # Internship fields
    is_internship = Column(Boolean, default=False)
    internship_type = Column(String, nullable=True)
    custom_coin_reward = Column(Integer, nullable=True)
    prize_attachment_url = Column(String, nullable=True)
    target_audience = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    submissions = relationship("HomeworkSubmission", backref="homework", cascade="all, delete-orphan")

class MascotInventory(Base):
    __tablename__ = "mascot_inventory"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    item_id = Column(String) # e.g. "apple", "pizza"
    quantity = Column(Integer, default=1)

class HomeworkSubmission(Base):
    __tablename__ = "homework_submissions"

    id = Column(Integer, primary_key=True, index=True)
    homework_id = Column(Integer, ForeignKey("homeworks.id"))
    student_id = Column(Integer, ForeignKey("users.id"))
    completed_steps = Column(JSON, default=[]) # List of step IDs
    is_fully_completed = Column(Boolean, default=False)
    attachment_url = Column(String, nullable=True)
    teacher_confirmed = Column(Boolean, default=False)
    
    student = relationship("User", back_populates="homework_submissions")

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(String) # 'school_entry', 'lesson'
    lesson_id_str = Column(String, nullable=True)
    status = Column(String) # 'on_time', 'late', 'absent'
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="attendance")
    lesson = relationship("Lesson", primaryjoin="Attendance.lesson_id_str == Lesson.lesson_id_str", foreign_keys="Attendance.lesson_id_str", back_populates="attendance_records", viewonly=True)

class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id_str = Column(String, unique=True, index=True)
    teacher_id = Column(Integer, ForeignKey("users.id"))
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    class_name = Column(String, nullable=True) # e.g. "10-A"
    topic = Column(String, nullable=True)
    homework_id = Column(Integer, ForeignKey("homeworks.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    finished_at = Column(DateTime, nullable=True)

    teacher = relationship("User")
    subject = relationship("Subject")
    homework = relationship("Homework")
    attendance_records = relationship("Attendance", 
                                     primaryjoin="Lesson.lesson_id_str == Attendance.lesson_id_str", 
                                     foreign_keys="Attendance.lesson_id_str",
                                     back_populates="lesson")

class Streak(Base):
    __tablename__ = "streaks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(String) # 'attendance', 'homework', 'all_lessons', 'star_homework'
    current_count = Column(Integer, default=0)
    last_action_date = Column(DateTime)

class BehaviorRecord(Base):
    __tablename__ = "behavior_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    teacher_id = Column(Integer, ForeignKey("users.id"))
    type = Column(String) # 'discipline', 'phone', 'dress_code', 'manual_penalty'
    coin_penalty = Column(Integer, default=0)
    description = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Integer)
    type = Column(String) # 'attendance', 'homework', 'behavior', 'bonus'
    description = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class Grade(Base):
    __tablename__ = "grades"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    teacher_id = Column(Integer, ForeignKey("users.id"))
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=True)
    score = Column(Integer)
    grade_type = Column(String, default="classwork") # classwork, homework, exam, etc.
    comment = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class MascotChatMessage(Base):
    __tablename__ = "mascot_chat_messages"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    role = Column(String) # 'user' or 'assistant'
    content = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    type = Column(String) # 'parent_link_request', 'system', etc.
    title = Column(String)
    description = Column(String)
    extra_data = Column(JSON, nullable=True) # {student_id: 123, etc}
    is_read = Column(Boolean, default=False)
    amount = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
