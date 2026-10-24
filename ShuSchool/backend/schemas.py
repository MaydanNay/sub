from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import datetime

class SchoolBase(BaseModel):
    name: str
    city: Optional[str] = None
    address: Optional[str] = None

class SchoolCreate(SchoolBase):
    pass

class School(SchoolBase):
    id: int
    created_at: datetime.datetime
    class Config:
        from_attributes = True

class SchoolClassBase(BaseModel):
    name: str
    school_id: Optional[int] = None

class SchoolClassCreate(SchoolClassBase):
    pass

class SchoolClass(SchoolClassBase):
    id: int
    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    username: str
    password: str
    full_name: str
    role: str # student, teacher, parent, admin
    class_name: Optional[str] = None
    school_id: Optional[int] = None
    phone_number: Optional[str] = None

class UserUpdate(BaseModel):
    full_name: str
    phone_number: Optional[str] = None
    profile_image: Optional[str] = None

class HomeworkSubmissionCreate(BaseModel):
    homework_id: int
    completed_steps: List[int]
    attachment_url: Optional[str] = None

class HomeworkSubmission(BaseModel):
    id: int
    homework_id: int
    student_id: int
    completed_steps: List[int]
    is_fully_completed: bool
    attachment_url: Optional[str] = None
    teacher_confirmed: bool
    student_name: Optional[str] = None
    hw_title: Optional[str] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class BehaviorCreate(BaseModel):
    user_id: int
    type: str
    coin_penalty: int = Field(ge=0)
    description: Optional[str] = None

class HWApproval(BaseModel):
    submission_id: int
    bonus_coins: int = Field(default=5, ge=0)
    score: Optional[int] = Field(default=None, ge=1, le=5)

class Character(BaseModel):
    id: int
    level: int
    coins: int
    supercoins: int
    economy: float
    wisdom: float
    influence: float
    health: float
    strength: float
    diplomacy: float
    technology: float
    intellect: float
    mascot_slots: int
    unlocked_mascots: List[str]
    active_mascot: Optional[str] = None
    mascot_hunger: float
    mascot_happiness: float
    last_mascot_update: datetime.datetime
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    username: str
    full_name: str
    role: str
    class_name: Optional[str] = None
    profile_image: Optional[str] = None
    is_approved: bool = False
    phone_number: Optional[str] = None
    school_id: Optional[int] = None
    assigned_classes: Optional[List[str]] = None
    assigned_subjects: Optional[List[int]] = None
    can_create_internships: bool = False
    deleted_at: Optional[datetime.datetime] = None
    created_at: Optional[datetime.datetime] = None

class User(UserBase):
    id: int
    character: Optional[Character] = None
    school_name: Optional[str] = None
    
    class Config:
        from_attributes = True

class Streak(BaseModel):
    id: int
    type: str
    current_count: int
    last_action_date: Optional[datetime.datetime]
    class Config:
        from_attributes = True

class Attendance(BaseModel):
    id: int
    type: str
    status: str
    timestamp: datetime.datetime
    class Config:
        from_attributes = True

class DashboardData(BaseModel):
    user: User
    character: Optional[Character]
    streaks: List[Streak]
    recent_attendance: List[Attendance]

class ParentChildInfo(BaseModel):
    id: int
    full_name: str
    class_name: Optional[str]
    avatar: Optional[str]

class ParentDashboardData(BaseModel):
    selected_child: Optional[User]
    children: List[ParentChildInfo]
    child_dashboard: Optional[DashboardData]

class HomeworkStep(BaseModel):
    id: int
    text: str

class HomeworkCreate(BaseModel):
    subject_id: int
    title: str
    description: str
    is_star: Optional[bool] = False
    requires_confirmation: Optional[bool] = False
    is_mascot_reward: Optional[bool] = False
    class_name: Optional[str] = None
    due_date: Optional[datetime.datetime] = None
    steps: Optional[List[HomeworkStep]] = None
    
    # Internship specific fields
    is_internship: Optional[bool] = False
    internship_type: Optional[str] = None
    custom_coin_reward: Optional[int] = None
    prize_attachment_url: Optional[str] = None
    target_audience: Optional[dict] = None

class Homework(BaseModel):
    id: int
    subject_id: int
    title: str
    description: str
    is_star: bool
    requires_confirmation: bool
    is_mascot_reward: bool
    class_name: Optional[str] = None
    steps: List[HomeworkStep]
    teacher_id: Optional[int] = None
    
    # Internship specific fields
    is_internship: bool = False
    internship_type: Optional[str] = None
    custom_coin_reward: Optional[int] = None
    prize_attachment_url: Optional[str] = None
    target_audience: Optional[dict] = None
    
    created_at: datetime.datetime
    class Config:
        from_attributes = True

class HomeworkWithStatus(Homework):
    is_pending: bool = False
    is_completed: bool = False
    completed_steps: List[int] = []
    attachment_url: Optional[str] = None
    # Internship extra fields echoed through
    is_internship: bool = False
    internship_type: Optional[str] = None
    custom_coin_reward: Optional[int] = None
    prize_attachment_url: Optional[str] = None
    target_audience: Optional[dict] = None

class Transaction(BaseModel):
    id: int
    user_id: int
    amount: int
    type: str
    description: str
    timestamp: datetime.datetime
    class Config:
        from_attributes = True

class GradeCreate(BaseModel):
    user_id: int
    subject_id: int
    score: int = Field(ge=1, le=5)
    lesson_id: Optional[int] = None
    grade_type: Optional[str] = "classwork"
    comment: Optional[str] = None

class Grade(BaseModel):
    id: int
    user_id: int
    subject_id: int
    teacher_id: int
    score: int
    lesson_id: Optional[int] = None
    grade_type: Optional[str] = None
    comment: Optional[str] = None
    timestamp: datetime.datetime
    class Config:
        from_attributes = True

class Subject(BaseModel):
    id: int
    name: str
    mapped_stat: str
    class Config:
        from_attributes = True

class Notification(BaseModel):
    id: int
    user_id: int
    sender_id: Optional[int] = None
    type: str
    title: str
    description: str
    extra_data: Optional[dict] = None
    is_read: bool
    amount: Optional[int] = None
    created_at: datetime.datetime
    class Config:
        from_attributes = True

class NotificationUpdate(BaseModel):
    is_read: bool

class ParentSearchResponse(BaseModel):
    id: int
    full_name: str
    username: str
    phone_number: Optional[str] = None
    profile_image: Optional[str] = None

class MascotInventoryItem(BaseModel):
    id: int
    user_id: int
    item_id: str
    quantity: int
    class Config:
        from_attributes = True

class MarketplaceItem(BaseModel):
    id: str
    name: str
    price: int
    hunger_benefit: float
    happiness_benefit: float

class LessonStart(BaseModel):
    subject_id: int
    class_name: Optional[str] = None
    topic: Optional[str] = None
    homework_id: Optional[int] = None
    notify_students: bool = True

class Lesson(BaseModel):
    id: int
    lesson_id_str: str
    teacher_id: int
    subject_id: int
    class_name: Optional[str]
    topic: Optional[str]
    homework_id: Optional[int]
    created_at: datetime.datetime
    finished_at: Optional[datetime.datetime]
    
    subject_name: Optional[str] = None
    teacher_name: Optional[str] = None
    attendance_count: Optional[int] = 0

    class Config:
        from_attributes = True

class LessonDetail(Lesson):
    attendance: List[Attendance] = []
    homework: Optional[Homework] = None
class LessonAttachHW(BaseModel):
    lesson_id_str: str
    homework_id: int

class MascotChatRequest(BaseModel):
    message: str

class MascotChatResponse(BaseModel):
    response: str
