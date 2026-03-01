from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON, DECIMAL
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from .database import Base
import uuid

class ShuBankUser(Base):
    __tablename__ = "shubank_users"
    
    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    bank_client_id = Column(String(255), unique=True, index=True)
    shubank_name = Column(String(50), default="ShuBank")
    energy = Column(Integer, default=50)
    calmness = Column(Integer, default=0)
    coins = Column(Integer, default=0)
    current_skin_id = Column(String(50))
    home_level = Column(Integer, default=1)
    transaction_count = Column(Integer, default=0)
    deposit_balance = Column(DECIMAL, default=0)
    quests_completed = Column(JSON, default=list) # List of quest IDs
    last_active_at = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    inventory = relationship("ShuBankInventory", back_populates="user")

class ShuBankInventory(Base):
    __tablename__ = "shubank_inventory"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("shubank_users.user_id"))
    item_id = Column(String(50))
    item_type = Column(String(20)) # 'skin', 'furniture', 'booster'
    is_equipped = Column(Boolean, default=False)

    user = relationship("ShuBankUser", back_populates="inventory")

class ShuBankPride(Base):
    __tablename__ = "shubank_prides"
    
    pride_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100))
    type = Column(String(20)) # 'family', 'friends', 'corporate'
    goal_amount = Column(DECIMAL)
    current_progress = Column(DECIMAL, default=0)
    members = Column(JSON) # Array of user_ids
