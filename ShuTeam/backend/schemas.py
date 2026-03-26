from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from decimal import Decimal
from enum import Enum

class PrivacyType(str, Enum):
    CLOSED = "CLOSED"
    PARTIAL = "PARTIAL"
    OPEN = "OPEN"

class MemberRole(str, Enum):
    LEADER = "LEADER"
    MODERATOR = "MODERATOR"
    MEMBER = "MEMBER"

class UserBase(BaseModel):
    phone: str
    name: Optional[str] = None
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    created_at: datetime
    wallet: Optional["Wallet"] = None

    class Config:
        from_attributes = True

class BadgeBase(BaseModel):
    name: str
    icon_url: str
    description: str

class Badge(BadgeBase):
    id: int
    community_id: Optional[int] = None

    class Config:
        from_attributes = True

class WalletBase(BaseModel):
    user_id: Optional[int] = None
    community_id: Optional[int] = None
    balance: Decimal = Decimal(0)
    currency: str = "KZT"

class Wallet(WalletBase):
    id: int

    class Config:
        from_attributes = True

class TransactionBase(BaseModel):
    user_id: int
    amount: Decimal
    type: str
    description: str

class Transaction(TransactionBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class CommunityBase(BaseModel):
    name: str
    description: str
    avatar_url: Optional[str] = None
    banner_url: Optional[str] = None
    privacy_type: PrivacyType = PrivacyType.PARTIAL

class CommunityCreate(CommunityBase):
    pass

class Community(CommunityBase):
    id: int
    created_at: datetime
    wallet: Optional["Wallet"] = None

    class Config:
        from_attributes = True

class CommunityMemberBase(BaseModel):
    community_id: int
    user_id: int
    role: MemberRole = MemberRole.MEMBER

class CommunityMember(CommunityMemberBase):
    id: int
    joined_at: datetime

    class Config:
        from_attributes = True

class MeetingBase(BaseModel):
    community_id: int
    title: str
    description: str
    date_time: datetime
    location_address: str
    location_coords: Optional[Dict[str, float]] = None
    venue_id: Optional[int] = None
    materials: List[str] = []
    age_group: str = "All ages"
    is_open: bool = False
    cost: Decimal = Decimal(0)

class MeetingCreate(MeetingBase):
    pass

class MeetingRegistrationBase(BaseModel):
    meeting_id: int
    user_id: int

class MeetingRegistrationCreate(MeetingRegistrationBase):
    pass

class MeetingRegistration(MeetingRegistrationBase):
    id: int
    registered_at: datetime
    is_attended: bool
    user: Optional[User] = None

    class Config:
        from_attributes = True

class Meeting(MeetingBase):
    id: int
    media_urls: List[str] = []
    registration_count: int = 0

    class Config:
        from_attributes = True

class VenueBase(BaseModel):
    name: str
    description: str
    address: str
    coords: Optional[Dict[str, float]] = None
    capacity: int
    amenities: List[str] = []
    discount_info: str
    image_urls: List[str] = []
    is_partner: bool = True

class Venue(VenueBase):
    id: int

    class Config:
        from_attributes = True

class GoalBase(BaseModel):
    community_id: int
    title: str
    description: str
    goal_type: str
    duration_days: int
    reward_badge_id: Optional[int] = None

class GoalCreate(GoalBase):
    pass

class Goal(GoalBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class GoalProgressBase(BaseModel):
    goal_id: int
    user_id: int
    current_value: int = 0
    target_value: int = 1
    is_completed: bool = False
    proof_url: Optional[str] = None

class GoalProgress(GoalProgressBase):
    id: int

    class Config:
        from_attributes = True
