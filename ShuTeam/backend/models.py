from sqlalchemy import Column, Integer, String, Text, Float, Boolean, ForeignKey, Enum, DateTime, JSON, DECIMAL
from sqlalchemy.orm import relationship
from database import Base
import enum
import datetime

class PrivacyType(str, enum.Enum):
    CLOSED = "CLOSED"
    PARTIAL = "PARTIAL"
    OPEN = "OPEN"

class MemberRole(str, enum.Enum):
    LEADER = "LEADER"
    MODERATOR = "MODERATOR"
    MEMBER = "MEMBER"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String, unique=True, index=True)
    name = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    memberships = relationship("CommunityMember", back_populates="user")
    goal_progress = relationship("GoalProgress", back_populates="user")
    registrations = relationship("MeetingRegistration", back_populates="user")
    wallet = relationship("Wallet", back_populates="user", uselist=False)
    transactions = relationship("Transaction", back_populates="user")

class Community(Base):
    __tablename__ = "communities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text)
    avatar_url = Column(String, nullable=True)
    banner_url = Column(String, nullable=True)
    privacy_type = Column(Enum(PrivacyType), default=PrivacyType.PARTIAL)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    members = relationship("CommunityMember", back_populates="community")
    meetings = relationship("Meeting", back_populates="community")
    goals = relationship("Goal", back_populates="community")
    wallet = relationship("Wallet", back_populates="community", uselist=False)

class CommunityMember(Base):
    __tablename__ = "community_members"

    id = Column(Integer, primary_key=True, index=True)
    community_id = Column(Integer, ForeignKey("communities.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    role = Column(Enum(MemberRole), default=MemberRole.MEMBER)
    joined_at = Column(DateTime, default=datetime.datetime.utcnow)

    community = relationship("Community", back_populates="members")
    user = relationship("User", back_populates="memberships")

class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    community_id = Column(Integer, ForeignKey("communities.id"))
    title = Column(String)
    description = Column(Text)
    date_time = Column(DateTime)
    location_address = Column(String)
    location_coords = Column(JSON)
    venue_id = Column(Integer, ForeignKey("venues.id"), nullable=True)
    materials = Column(JSON)
    age_group = Column(String)
    is_open = Column(Boolean, default=False)
    cost = Column(DECIMAL, default=0)
    media_urls = Column(JSON, default=[])

    community = relationship("Community", back_populates="meetings")
    venue = relationship("Venue", back_populates="meetings")
    registrations = relationship("MeetingRegistration", back_populates="meeting")

class MeetingRegistration(Base):
    __tablename__ = "meeting_registrations"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    registered_at = Column(DateTime, default=datetime.datetime.utcnow)
    is_attended = Column(Boolean, default=False)

    meeting = relationship("Meeting", back_populates="registrations")
    user = relationship("User", back_populates="registrations")

class Venue(Base):
    __tablename__ = "venues"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(Text)
    address = Column(String)
    coords = Column(JSON)
    capacity = Column(Integer)
    amenities = Column(JSON)
    discount_info = Column(String)
    image_urls = Column(JSON)
    is_partner = Column(Boolean, default=True)

    meetings = relationship("Meeting", back_populates="venue")

class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    community_id = Column(Integer, ForeignKey("communities.id"))
    title = Column(String)
    description = Column(Text)
    goal_type = Column(String)
    duration_days = Column(Integer)
    reward_badge_id = Column(Integer, ForeignKey("badges.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    community = relationship("Community", back_populates="goals")
    progress = relationship("GoalProgress", back_populates="goal")

class GoalProgress(Base):
    __tablename__ = "goal_progress"

    id = Column(Integer, primary_key=True, index=True)
    goal_id = Column(Integer, ForeignKey("goals.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    current_value = Column(Integer, default=0)
    target_value = Column(Integer, default=1)
    is_completed = Column(Boolean, default=False)
    proof_url = Column(String, nullable=True)

    goal = relationship("Goal", back_populates="progress")
    user = relationship("User", back_populates="goal_progress")

class Badge(Base):
    __tablename__ = "badges"

    id = Column(Integer, primary_key=True, index=True)
    community_id = Column(Integer, ForeignKey("communities.id"), nullable=True)
    name = Column(String)
    icon_url = Column(String)
    description = Column(String)

class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    community_id = Column(Integer, ForeignKey("communities.id"), nullable=True)
    balance = Column(DECIMAL, default=0)
    currency = Column(String, default="KZT")

    user = relationship("User", back_populates="wallet")
    community = relationship("Community", back_populates="wallet")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(DECIMAL)
    type = Column(String) # "DEBIT", "CREDIT"
    description = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="transactions")
