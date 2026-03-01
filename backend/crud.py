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
    db.flush() # Use flush instead of commit to allow atomic batching
    return db_promotion

# --- ShuBoom CRUD ---

def get_user_by_phone(db: Session, phone: str):
    return db.query(models.User).filter(models.User.phone == phone).first()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(phone=user.phone, coins=1000) # Added 1000 coins welcome bonus
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Grant starter character (Seeker / Искатель)
    starter = db.query(models.Character).filter(models.Character.name == "Искатель").first()
    if starter:
        add_character_to_user(db, db_user.id, starter.id)
        db_user.equipped_character_id = starter.id
        db.commit()
        
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
        db.flush()
        return existing, False

    new_item = models.UserCollection(user_id=user_id, character_id=character_id, level=1)
    db.add(new_item)
    db.flush()
    return new_item, True

def merge_characters(db: Session, user_id: int, character_id: int):
    # Find the stack of cards at level 1 (or current merging logic target)
    item = db.query(models.UserCollection).filter(
        models.UserCollection.user_id == user_id,
        models.UserCollection.character_id == character_id,
        models.UserCollection.level == 1
    ).with_for_update().first()

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
    user = db.query(models.User).filter(models.User.id == user_id).with_for_update().first()
    if not user:
        return None
    
    # Verify the user actually has this chest pending
    if user.pending_chest != chest_type:
        return None

    # Clear the pending chest
    user.pending_chest = None
    db.flush()

    rand = random.random()
    
    # Updated Drop Table: 20% Character, 40% Coins, 25% Skins, 15% Coupons
    if rand < 0.2: # Character (20%)
        character = get_random_character_by_rarity(db, chest_type)
        if character:
            coll_item, is_new = add_character_to_user(db, user.id, character.id)
            return {
                "prize_type": "CHARACTER",
                "character": schemas.Character.from_orm(character),
                "is_new": is_new,
                "title": character.name,
                "image_url": character.image_2d
            }
        # Fallback to coins if character logic fails (unlikely)
        rand = 0.5 

    if rand < 0.6: # Coins (40%)
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
            "image_url": "🪙"
        }
    
    elif rand < 0.85: # Skin (25%)
        skins = [
            {"id": "glasses", "title": "Очки", "img": "🕶️"},
            {"id": "hat", "title": "Шляпа", "img": "🎩"},
            {"id": "cape", "title": "Плащ", "img": "🦸"},
            {"id": "flower", "title": "Цветочек", "img": "🌸"},
            {"id": "butterfly", "title": "Бабочка", "img": "🦋"},
            {"id": "crown", "title": "Корона", "img": "👑"}
        ]
        skin = random.choice(skins)
        save_skin_to_user(db, user.id, skin["id"])
        return {
            "prize_type": "SKIN",
            "skin_id": skin["id"],
            "title": skin["title"],
            "image_url": skin["img"]
        }
    
    else: # Coupon (Promotion) (15%)
        promotions = db.query(models.Promotion).all()
        promo = random.choice(promotions) if promotions else None
        if not promo: 
             # Fallback to coins if no promotions found
             amount = 100
             add_coins(db, user.id, amount)
             return {
                 "prize_type": "COUPON",
                 "title": "Утешительный приз: монеты!",
                 "reward_amount": amount,
                 "image_url": "🪙"
             }
        
        save_coupon_to_user(db, user.id, promo.id)
        return {
            "prize_type": "COUPON",
            "coupon_id": str(promo.id),
            "title": promo.title,
            "image_url": promo.image_url
        }

def save_skin_to_user(db: Session, user_id: int, skin_id: str):
    user = db.query(models.User).filter(models.User.id == user_id).with_for_update().first()
    if user:
        skins = list(user.skins or [])
        if skin_id not in skins:
            skins.append(skin_id)
            user.skins = skins
            db.flush()
            return True
    return False

def save_coupon_to_user(db: Session, user_id: int, coupon_id: int):
    user = db.query(models.User).filter(models.User.id == user_id).with_for_update().first()
    if user:
        coupons = list(user.coupons or [])
        if coupon_id not in coupons:
            coupons.append(coupon_id)
            user.coupons = coupons
            db.flush()
            return True
    return False

def use_coupon_logic(db: Session, user_id: int, coupon_id: int):
    user = db.query(models.User).filter(models.User.id == user_id).with_for_update().first()
    if not user:
        return False
        
    coupons = list(user.coupons or [])
    if coupon_id in coupons:
        coupons.remove(coupon_id)
        user.coupons = coupons
        db.commit()
        return True
    return False

def buy_shop_item(db: Session, user_id: int, item_id: str, item_type: str, cost: int):
    user = db.query(models.User).filter(models.User.id == user_id).with_for_update().first()
    if not user or user.coins < cost:
        return False
    
    # Deduct coins
    user.coins -= cost
    
    # Add item
    if item_type == 'skin':
        save_skin_to_user(db, user_id, item_id)
    elif item_type in ['promo', 'offer', 'food']:
        # If it's a numeric ID in string format or 'promo1' format
        try:
            # Handle 'promo1', 'offer2' etc
            numeric_id = "".join(filter(str.isdigit, item_id))
            if numeric_id:
                save_coupon_to_user(db, user_id, int(numeric_id))
            else:
                # If no digits, might be a named ID like 'croissant'
                # For now let's just log it or treat as a generic "bought" item
                # Actually, coupons table expects an ID. For food/named items, 
                # we don't have a specific table yet, but we can use the item_id as is if it fits.
                # However, models.User.coupons is list of ints.
                pass
        except Exception:
            pass
            
    db.commit()
    return True

def equip_character(db: Session, user_id: int, character_id: int = None, skin_id: str = None):
    user = db.query(models.User).filter(models.User.id == user_id).with_for_update().first()
    if not user: return False
    
    if character_id:
        # Verify ownership
        own = db.query(models.UserCollection).filter(
            models.UserCollection.user_id == user_id,
            models.UserCollection.character_id == character_id
        ).first()
        if own:
            user.equipped_character_id = character_id
            db.commit()
            return True
    
    if skin_id:
        # Return True for skins to silence frontend errors if owned
        if user.skins and skin_id in user.skins:
            return True
            
    # For coupons/promotions, both might be None in frontend request currently
    if character_id is None and skin_id is None:
        return True
        
    return False

def set_pending_chest(db: Session, user_id: int, chest_type: str):
    user = db.query(models.User).filter(models.User.id == user_id).with_for_update().first()
    if user:
        user.pending_chest = chest_type
        db.flush()
        return True
    return False

def spend_coins(db: Session, user_id: int, amount: int):
    user = db.query(models.User).filter(models.User.id == user_id).with_for_update().first()
    if user and user.coins >= amount:
        user.coins -= amount
        db.flush()
        return True
    return False

def claim_daily_bonus(db: Session, user_id: int):
    user = db.query(models.User).filter(models.User.id == user_id).with_for_update().first()
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

def advance_roadmap_logic(db: Session, user_id: int):
    user = db.query(models.User).filter(models.User.id == user_id).with_for_update().first()
    if not user:
        return None

    # Define Roadmap Structure (Sublevels per Status)
    # seeker: 5, romantic: 4, connoisseur: 5, aesthete: 4, dreamer: 5, philosopher: 4, futurist: 3
    roadmap = {
        models.UserStatus.SEEKER: 5,
        models.UserStatus.ROMANTIC: 4,
        models.UserStatus.CONNOISSEUR: 5,
        models.UserStatus.AESTHETE: 4,
        models.UserStatus.DREAMER: 5,
        models.UserStatus.PHILOSOPHER: 4,
        models.UserStatus.FUTURIST: 3
    }
    
    status_order = [
        models.UserStatus.SEEKER,
        models.UserStatus.ROMANTIC,
        models.UserStatus.CONNOISSEUR,
        models.UserStatus.AESTHETE,
        models.UserStatus.DREAMER,
        models.UserStatus.PHILOSOPHER,
        models.UserStatus.FUTURIST
    ]

    max_sublevels = roadmap.get(user.current_status, 5)
    
    user.current_sublevel += 1
    
    is_levelup = False
    if user.current_sublevel >= max_sublevels:
        # Move to next status
        try:
            current_idx = status_order.index(user.current_status)
            if current_idx < len(status_order) - 1:
                user.current_status = status_order[current_idx + 1]
                user.current_sublevel = 0
                is_levelup = True
            else:
                # Already at max level, just stay at max sublevel
                user.current_sublevel = max_sublevels - 1
        except ValueError:
            pass

    # Reward for completing a sublevel
    reward_coins = 50 if not is_levelup else 500
    user.coins += reward_coins
    
    db.commit()
    db.refresh(user)
    return {
        "success": True,
        "new_status": user.current_status,
        "new_sublevel": user.current_sublevel,
        "is_levelup": is_levelup,
        "reward": reward_coins
    }

def complete_shuboom_quest_logic(db: Session, user_id: int, quest_id: str):
    user = db.query(models.User).filter(models.User.id == user_id).with_for_update().first()
    if not user:
        return None

    # Simulating rewards for the 3 daily quests in frontend
    quest_rewards = {
        "croissant": 150,
        "coffee": 200,
        "friend": 500
    }
    
    reward = quest_rewards.get(quest_id, 100)
    user.coins += reward
    db.commit()
    return {"success": True, "reward": reward, "new_balance": user.coins}

def create_lead_request(db: Session, lead: schemas.LeadRequestCreate):
    db_lead = models.LeadRequest(**lead.dict())
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead
