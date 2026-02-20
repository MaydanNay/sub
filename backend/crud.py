from sqlalchemy.orm import Session
from sqlalchemy.sql.expression import func
from . import models, schemas
import random
import datetime

# --- Promotions ---
def get_promotion(db: Session, promotion_id: int):
    return db.query(models.Promotion).filter(models.Promotion.id == promotion_id).first()

def get_random_promotion(db: Session):
    return db.query(models.Promotion).order_by(func.random()).first()

def get_promotions(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Promotion).offset(skip).limit(limit).all()

def create_promotion(db: Session, promotion: schemas.PromotionCreate):
    db_promotion = models.Promotion(**promotion.dict())
    db.add(db_promotion)
    db.commit()
    db.refresh(db_promotion)
    return db_promotion

# --- ShuBoom CRUD ---

def get_user_by_phone(db: Session, phone: str):
    return db.query(models.User).filter(models.User.phone == phone).first()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(phone=user.phone, coins=1000) # Added 1000 coins welcome bonus
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_character(db: Session, character_id: int):
    return db.query(models.Character).filter(models.Character.id == character_id).first()

def get_all_characters(db: Session):
    return db.query(models.Character).all()

def get_user_collection(db: Session, user_id: int):
    return db.query(models.UserCollection).filter(models.UserCollection.user_id == user_id).all()

def add_character_to_user(db: Session, user_id: int, character_id: int):
    # Filter by level=1 because new drops should only stack with existing level 1 cards
    existing = db.query(models.UserCollection).filter(
        models.UserCollection.user_id == user_id,
        models.UserCollection.character_id == character_id,
        models.UserCollection.level == 1
    ).first()

    if existing:
        existing.quantity += 1
        db.commit()
        db.refresh(existing)
        return existing, False # False = not new

    new_item = models.UserCollection(user_id=user_id, character_id=character_id, level=1)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item, True # True = new

def merge_characters(db: Session, user_id: int, character_id: int):
    # Find the stack of cards at level 1 (or current merging logic target)
    # For now, let's assume merging only happens for level 1 -> level 2
    item = db.query(models.UserCollection).filter(
        models.UserCollection.user_id == user_id,
        models.UserCollection.character_id == character_id,
        models.UserCollection.level == 1
    ).first()

    if not item or item.quantity < 3:
        return None

    # Deduct 3 from level 1
    item.quantity -= 3
    
    # Add (or create) 1 card of level 2
    next_level_item = db.query(models.UserCollection).filter(
        models.UserCollection.user_id == user_id,
        models.UserCollection.character_id == character_id,
        models.UserCollection.level == 2
    ).first()
    
    if next_level_item:
        next_level_item.quantity += 1
    else:
        next_level_item = models.UserCollection(
            user_id=user_id, 
            character_id=character_id, 
            level=2, 
            quantity=1
        )
        db.add(next_level_item)

    db.commit()
    db.refresh(next_level_item)
    return next_level_item

def get_random_character_by_rarity(db: Session, chest_type: str):
    # Simple logic
    # Bronze: 90% Common, 10% Rare
    # Silver: 75% Common, 25% Rare
    # Gold: 50% Common, 50% Rare
    # Legendary: 10% Rare, 90% Legendary
    
    rand = random.random()
    rarity = models.Rarity.COMMON
    
    if chest_type == "BRONZE":
        if rand > 0.9: rarity = models.Rarity.RARE
    elif chest_type == "SILVER":
        if rand > 0.75: rarity = models.Rarity.RARE
    elif chest_type == "GOLD":
        if rand > 0.5: rarity = models.Rarity.RARE
    elif chest_type == "LEGENDARY":
        if rand > 0.1: rarity = models.Rarity.LEGENDARY
        else: rarity = models.Rarity.RARE

    chars = db.query(models.Character).filter(models.Character.rarity == rarity).all()
    if not chars:
        # Fallback
        chars = db.query(models.Character).all()
        
    return random.choice(chars) if chars else None

def add_coins(db: Session, user_id: int, amount: int):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user:
        user.coins += amount
        db.commit()
        db.refresh(user)
    return user

def open_chest_logic(db: Session, user_id: int, chest_type: str):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return None
    
    # Verify the user actually has this chest pending
    if user.pending_chest != chest_type:
        return None

    # Clear the pending chest before processing rewards
    user.pending_chest = None
    db.commit()

    rand = random.random()
    
    # New Drop Table: 50% Coins, 30% Skins, 20% Coupons
    if rand < 0.5: # Coins (50%)
        # Bronze: 100-300, Silver: 300-600, Gold: 600-1500, Legendary: 1500-5000
        ranges = {
            "BRONZE": (100, 300),
            "SILVER": (300, 600),
            "GOLD": (600, 1500),
            "LEGENDARY": (1500, 5000)
        }
        low, high = ranges.get(chest_type, (50, 100))
        amount = random.randint(low, high)
        add_coins(db, user.id, amount)
        return {
            "prize_type": "COINS",
            "reward_amount": amount,
            "title": f"+{amount} монет",
            "image_url": "https://cdn-icons-png.flaticon.com/512/272/272525.png"
        }
    
    elif rand < 0.8: # Skin (30%)
        skins = [
            {"id": "glasses", "title": "Очки", "img": "https://cdn-icons-png.flaticon.com/512/1253/1253756.png"},
            {"id": "hat", "title": "Шляпа", "img": "https://cdn-icons-png.flaticon.com/512/2135/2135835.png"},
            {"id": "cape", "title": "Плащ", "img": "https://cdn-icons-png.flaticon.com/512/3531/3531744.png"},
            {"id": "flower", "title": "Цветочек", "img": "https://cdn-icons-png.flaticon.com/512/4604/4604925.png"},
            {"id": "butterfly", "title": "Бабочка", "img": "https://cdn-icons-png.flaticon.com/512/2042/2042469.png"},
            {"id": "crown", "title": "Корона", "img": "https://cdn-icons-png.flaticon.com/512/616/616551.png"}
        ]
        skin = random.choice(skins)
        return {
            "prize_type": "SKIN",
            "skin_id": skin["id"],
            "title": skin["title"],
            "image_url": skin["img"]
        }
    
    else: # Coupon (Promotion) (20%)
        promotions = db.query(models.Promotion).all()
        promo = random.choice(promotions) if promotions else None
        if not promo: 
             # Fallback to coins if no promotions found
             # Note: recursively calling open_chest_logic would normally be risky but here it's fine since we already cleared pending_chest
             # and verified it. HOWEVER, we need to bypass the verification if we recurse, OR just return a fixed coin reward.
             # Let's just return a fixed coin reward to avoid recursion issues with the now-cleared pending_chest.
             amount = 100
             add_coins(db, user.id, amount)
             return {
                 "prize_type": "COUPON",
                 "title": "Утешительный приз: монеты!",
                 "reward_amount": amount,
                 "image_url": "https://cdn-icons-png.flaticon.com/512/272/272525.png"
             }
        
        return {
            "prize_type": "COUPON",
            "coupon_id": str(promo.id),
            "title": promo.title,
            "image_url": promo.image_url
        }

def set_pending_chest(db: Session, user_id: int, chest_type: str):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user:
        user.pending_chest = chest_type
        db.commit()
        db.refresh(user)
        return True
    return False

def spend_coins(db: Session, user_id: int, amount: int):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user and user.coins >= amount:
        user.coins -= amount
        db.commit()
        db.refresh(user)
        return True
    return False

def claim_daily_bonus(db: Session, user_id: int):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return None, 0, 0

    now = datetime.datetime.utcnow()
    today = now.date()
    
    last_date = user.last_bonus_date.date() if user.last_bonus_date else None
    
    if last_date == today:
        return False, 0, user.daily_streak

    # Check streak
    if last_date == today - datetime.timedelta(days=1):
        user.daily_streak += 1
    else:
        user.daily_streak = 1
        
    # Cap streak at 7 for visual purposes (or let it grow, but reward caps?)
    # Let's cap reward multiplier at 7
    multiplier = min(user.daily_streak, 7)
    reward = 100 + (10 * (multiplier - 1)) # 100, 110, 120... 160
    
    user.coins += reward
    user.last_bonus_date = now
    
    db.commit()
    db.refresh(user)
    return True, reward, user.daily_streak
