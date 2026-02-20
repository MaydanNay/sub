from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime

class PromotionBase(BaseModel):
    title: str
    description: str
    image_url: str

class PromotionCreate(PromotionBase):
    pass

class Promotion(PromotionBase):
    id: int

    class Config:
        from_attributes = True

# --- ShuBoom Schemas ---

class Rarity(str, Enum):
    COMMON = "COMMON"
    RARE = "RARE"
    LEGENDARY = "LEGENDARY"

class UserStatus(str, Enum):
    SEEKER = "SEEKER"
    ROMANTIC = "ROMANTIC"
    CONNOISSEUR = "CONNOISSEUR"
    AESTHETE = "AESTHETE"
    DREAMER = "DREAMER"
    PHILOSOPHER = "PHILOSOPHER"
    FUTURIST = "FUTURIST"

class ChestType(str, Enum):
    BRONZE = "BRONZE"
    SILVER = "SILVER"
    GOLD = "GOLD"
    LEGENDARY = "LEGENDARY"
    KIDS = "KIDS"

class PrizeType(str, Enum):
    CHARACTER = "CHARACTER"
    COINS = "COINS"
    SKIN = "SKIN"
    COUPON = "COUPON"

class CharacterBase(BaseModel):
    name: str
    description: Optional[str] = None
    rarity: Rarity
    image_2d: str
    model_3d: Optional[str] = None

class Character(CharacterBase):
    id: int

    class Config:
        from_attributes = True

class UserCollectionBase(BaseModel):
    quantity: int
    level: int
    characteristics: Dict[str, Any]

class UserCollection(UserCollectionBase):
    id: int
    character: Character

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    phone: str

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    balance_points: float
    coins: int
    current_status: UserStatus
    current_sublevel: int = 0
    daily_streak: int = 0
    last_bonus_date: Optional[datetime] = None
    pending_chest: Optional[str] = None
    collection: List[UserCollection] = []

    class Config:
        from_attributes = True

class ScanRequest(BaseModel):
    qr_data: str
    user_phone: Optional[str] = None

class ScanResponse(BaseModel):
    chest_type: ChestType
    animation_url: Optional[str] = None

class ChestResult(BaseModel):
    prize_type: PrizeType
    character: Optional[Character] = None
    reward_amount: Optional[int] = None
    skin_id: Optional[str] = None
    coupon_id: Optional[str] = None
    title: Optional[str] = None
    image_url: Optional[str] = None
    is_new: Optional[bool] = False

class MergeRequest(BaseModel):
    character_id: int

# --- ShuBank Together Schemas ---

class ShuBankUserState(BaseModel):
    energy: int
    calmness: int
    coins: int
    home_level: int
    shubank_name: str
    deposit_balance: Optional[float] = 0

class ShuBankShopBuyRequest(BaseModel):
    item_id: str

class ShuBankPrideCreateRequest(BaseModel):
    name: str
    type: str # 'family', 'friends', 'corporate'
    goal_amount: float

class ShuBankMinigameSyncRequest(BaseModel):
    coins: int

class BankTransactionWebhook(BaseModel):
    client_hash: str
    amount: float
    category: str
    timestamp: datetime

class BankDepositUpdateWebhook(BaseModel):
    client_hash: str
    total_balance: float
