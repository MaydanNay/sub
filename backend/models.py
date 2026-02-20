from sqlalchemy import Column, Integer, String, Text, Float, Boolean, ForeignKey, Enum, DateTime, JSON
from sqlalchemy.orm import relationship
from .database import Base
import enum
import datetime

class Promotion(Base):
    __tablename__ = "promotions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    image_url = Column(String)

# --- ShuBoom Models ---

class Rarity(str, enum.Enum):
    COMMON = "COMMON"
    RARE = "RARE"
    LEGENDARY = "LEGENDARY"

class UserStatus(str, enum.Enum):
    SEEKER = "SEEKER"           # Искатель
    ROMANTIC = "ROMANTIC"       # Романтик
    CONNOISSEUR = "CONNOISSEUR" # Ценитель
    AESTHETE = "AESTHETE"       # Эстет
    DREAMER = "DREAMER"         # Мечтатель
    PHILOSOPHER = "PHILOSOPHER" # Философ
    FUTURIST = "FUTURIST"       # Футурист

class ChestType(str, enum.Enum):
    BRONZE = "BRONZE"
    SILVER = "SILVER"
    GOLD = "GOLD"
    LEGENDARY = "LEGENDARY"
    KIDS = "KIDS"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String, unique=True, index=True)
    balance_points = Column(Float, default=0.0)
    coins = Column(Integer, default=0)
    current_status = Column(Enum(UserStatus), default=UserStatus.SEEKER)
    current_sublevel = Column(Integer, default=0)  # 0-based index within current level
    daily_streak = Column(Integer, default=0)
    last_bonus_date = Column(DateTime, nullable=True)
    last_purchase_date = Column(DateTime, default=datetime.datetime.utcnow)
    pending_chest = Column(String, nullable=True) # Type of chest purchased but not yet opened
    
    collection = relationship("UserCollection", back_populates="user")

class Character(Base):
    __tablename__ = "characters"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(String)
    rarity = Column(Enum(Rarity))
    drop_weight = Column(Float)
    image_2d = Column(String)
    model_3d = Column(String)
    season_id = Column(Integer, default=1)

class UserCollection(Base):
    __tablename__ = "user_collections"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    character_id = Column(Integer, ForeignKey("characters.id"))
    quantity = Column(Integer, default=1)
    level = Column(Integer, default=1)
    characteristics = Column(JSON, default={})

    user = relationship("User", back_populates="collection")
    character = relationship("Character")

class Quest(Base):
    __tablename__ = "quests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    type = Column(String) # DAILY, WEEKLY, GEO, PRODUCT
    condition = Column(JSON)
    reward_chest_type = Column(Enum(ChestType))
