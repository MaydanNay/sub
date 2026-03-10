# Main entry point for ShuRun API
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
import crud, models, schemas, models_shubank, shubeauty
from database import SessionLocal, engine
from fastapi.middleware.cors import CORSMiddleware
import random
from datetime import datetime, timezone
from typing import List

import os

models.Base.metadata.create_all(bind=engine)
models_shubank.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(shubeauty.router)

# CORS Configuration
allowed_origins = [
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    "http://localhost:3000",
]

# Allow additional origins via environment variable (comma-separated)
env_origins = os.getenv("ALLOWED_ORIGINS")
if env_origins:
    allowed_origins.extend([o.strip() for o in env_origins.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    # Seed Promotions
    if db.query(models.Promotion).count() == 0:
        promotions = [
            {"title": "Скидка 10%", "description": "Получите скидку 10% на следующую покупку.", "image_url": "🏷️"},
            {"title": "Бесплатная доставка", "description": "Бесплатная доставка при заказе от 3000 руб.", "image_url": "🚚"},
            {"title": "1+1", "description": "Купи один товар, получи второй такой же бесплатно.", "image_url": "🎁"},
             # ... (keep existing if needed, or focused on game)
        ]
        for p in promotions:
            crud.create_promotion(db, schemas.PromotionCreate(**p))
        db.commit()

    # Seed Characters (ShuBoom) - 7 Status-based characters
    chars = [
        {"name": "Искатель", "rarity": "COMMON", "drop_weight": 0.5, "image_2d": "🔍", "model_3d": "https://modelviewer.dev/shared-assets/models/Astronaut.glb"},
        {"name": "Романтик", "rarity": "COMMON", "drop_weight": 0.5, "image_2d": "💜", "model_3d": "https://modelviewer.dev/shared-assets/models/RobotExpressive.glb"},
        {"name": "Ценитель", "rarity": "RARE", "drop_weight": 0.3, "image_2d": "🍷", "model_3d": "https://modelviewer.dev/shared-assets/models/Horse.glb"},
        {"name": "Эстет", "rarity": "RARE", "drop_weight": 0.3, "image_2d": "🎨", "model_3d": "https://modelviewer.dev/shared-assets/models/NeilArmstrong.glb"},
        {"name": "Мечтатель", "rarity": "RARE", "drop_weight": 0.2, "image_2d": "🌙", "model_3d": "https://modelviewer.dev/shared-assets/models/Astronaut.glb"},
        {"name": "Философ", "rarity": "LEGENDARY", "drop_weight": 0.1, "image_2d": "📚", "model_3d": "https://modelviewer.dev/shared-assets/models/AlphaBlendModeTest.glb"},
        {"name": "Футурист", "rarity": "LEGENDARY", "drop_weight": 0.05, "image_2d": "🚀", "model_3d": "https://modelviewer.dev/shared-assets/models/NeilArmstrong.glb"},
    ]
    for c in chars:
        if not db.query(models.Character).filter(models.Character.name == c["name"]).first():
            db_char = models.Character(**c)
            db.add(db_char)
    db.commit()

    db.close()

# --- Existing Endpoints ---

@app.get("/api/v1/promotions/random", response_model=schemas.Promotion)
def read_random_promotion(db: Session = Depends(get_db)):
    promotion = crud.get_random_promotion(db)
    if promotion is None:
        raise HTTPException(status_code=404, detail="No promotions found")
    return promotion

@app.get("/api/v1/promotions", response_model=list[schemas.Promotion])
def read_promotions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # Add explicit order_by to avoid random test failures or unpredictable order
    return db.query(models.Promotion).order_by(models.Promotion.id).offset(skip).limit(limit).all()

@app.post("/api/notify", response_model=schemas.LeadRequest)
def create_notify_request(lead: schemas.LeadRequestCreate, db: Session = Depends(get_db)):
    return crud.create_lead_request(db, lead)

# --- ShuBoom Endpoints ---

@app.post("/api/v1/auth/login", response_model=schemas.User)
def login(phone: str = "7770000000", db: Session = Depends(get_db)):
    # Mock login: Get or Create
    user = crud.get_user_by_phone(db, phone)
    if not user:
        try:
            user = crud.create_user(db, schemas.UserCreate(phone=phone))
        except Exception:
            # Handle race condition: user created by another request concurrently
            db.rollback()
            user = crud.get_user_by_phone(db, phone)
            if not user:
                raise HTTPException(status_code=500, detail="Could not create user")
    return user

@app.get("/api/v1/user/{phone}", response_model=schemas.User)
def get_user_profile(phone: str, db: Session = Depends(get_db)):
    user = crud.get_user_by_phone(db, phone)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/api/v1/transactions/scan", response_model=schemas.ScanResponse)
def scan_receipt(request: schemas.ScanRequest, db: Session = Depends(get_db)):
    # Logic: Analyze amount from mock string or random
    # Mock: if request.qr_data contains "GOLD" -> GOLD chest, etc.
    
    amount = 0
    if "1500" in request.qr_data: amount = 1500
    elif "3000" in request.qr_data: amount = 3000
    elif "5000" in request.qr_data: amount = 5000
    elif "8000" in request.qr_data: amount = 8500
    else: amount = random.randint(1000, 10000)

    chest_type = models.ChestType.BRONZE
    if amount >= 8000: chest_type = models.ChestType.LEGENDARY
    elif amount >= 5000: chest_type = models.ChestType.GOLD
    elif amount >= 3000: chest_type = models.ChestType.SILVER
    
    # Store the pending chest in the database
    if request.user_phone:
        user = crud.get_user_by_phone(db, request.user_phone)
        if user:
            user.pending_chest = chest_type
            db.commit()
    
    return {
        "chest_type": chest_type,
        "animation_url": f"/animations/chest_{chest_type.lower()}.gif"
    }

@app.post("/api/v1/shop/buy_item")
def buy_item(request: schemas.BuyRequest, user_phone: str, db: Session = Depends(get_db)):
    user = crud.get_user_by_phone(db, user_phone)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    success = crud.buy_shop_item(db, user.id, request.item_id, request.item_type, request.cost)
    if not success:
        raise HTTPException(status_code=400, detail="Insufficient coins or failed to buy")
    
    return {"success": True}

@app.post("/api/v1/chests/open", response_model=schemas.ChestResult)
def open_chest(chest_type: str, user_phone: str, db: Session = Depends(get_db)):
    user = crud.get_user_by_phone(db, user_phone)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    result = crud.open_chest_logic(db, user.id, chest_type)
    if not result:
         db.rollback()
         raise HTTPException(status_code=400, detail="Invalid chest open request (not purchased or wrong type)")

    db.commit()
    return result

@app.get("/api/v1/collection/{phone}", response_model=list[schemas.UserCollection])
def get_collection(phone: str, db: Session = Depends(get_db)):
    user = crud.get_user_by_phone(db, phone)
    if not user:
         raise HTTPException(status_code=404, detail="User not found")
    return crud.get_user_collection(db, user.id)

@app.post("/api/v1/collection/merge")
def merge_cards(request: schemas.MergeRequest, user_phone: str, db: Session = Depends(get_db)):
    user = crud.get_user_by_phone(db, user_phone)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    result = crud.merge_characters(db, user.id, request.character_id)
    if not result:
        raise HTTPException(status_code=400, detail="Not enough cards to merge")
        
    return {"success": True, "new_level": result.level, "quantity_left": result.quantity}

@app.post("/api/v1/user/equip")
def equip_card(request: schemas.EquipRequest, user_phone: str, db: Session = Depends(get_db)):
    user = crud.get_user_by_phone(db, user_phone)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    result = crud.equip_character(db, user.id, request.character_id, request.skin_id)
    if not result:
        raise HTTPException(status_code=400, detail="Equip failed (not owned?)")
        
    return {"success": True, "equipped_character_id": user.equipped_character_id}

@app.post("/api/v1/user/use_coupon")
def use_coupon(coupon_id: int, user_phone: str, db: Session = Depends(get_db)):
    user = crud.get_user_by_phone(db, user_phone)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    result = crud.use_coupon_logic(db, user.id, coupon_id)
    if not result:
        raise HTTPException(status_code=400, detail="Coupon use failed or not owned")
        
    return {"success": True}

@app.post("/api/v1/user/daily_reward")
def claim_daily_reward(user_phone: str, db: Session = Depends(get_db)):
    user = crud.get_user_by_phone(db, user_phone)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    success, reward, streak = crud.claim_daily_bonus(db, user.id)
    if not success:
         return {"success": False, "message": "Already claimed today", "streak": streak}

    return {
        "success": True, 
        "new_balance": user.coins, 
        "reward": reward,
        "streak": streak,
        "message": f"Daily reward claimed! +{reward} coins"
    }

@app.post("/api/v1/user/roadmap/advance")
def advance_roadmap(user_phone: str, db: Session = Depends(get_db)):
    user = crud.get_user_by_phone(db, user_phone)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    result = crud.advance_roadmap_logic(db, user.id)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to advance roadmap")
    return result

@app.post("/api/v1/user/quests/complete")
def complete_quest_shuboom(quest_id: str, user_phone: str, db: Session = Depends(get_db)):
    user = crud.get_user_by_phone(db, user_phone)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    result = crud.complete_shuboom_quest_logic(db, user.id, quest_id)
    if not result:
        raise HTTPException(status_code=400, detail="Quest completion failed")
    return result

@app.post("/api/v1/shop/buy_chest")
def buy_chest(chest_type: str, user_phone: str, db: Session = Depends(get_db)):
    user = crud.get_user_by_phone(db, user_phone)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    cost = 0
    if chest_type == "BRONZE": cost = 500
    elif chest_type == "SILVER": cost = 1000
    elif chest_type == "GOLD": cost = 2000
    elif chest_type == "LEGENDARY": cost = 5000
    
    if user.coins < cost:
        raise HTTPException(status_code=400, detail="Not enough coins")
    
    try:
        if crud.spend_coins(db, user.id, cost):
            crud.set_pending_chest(db, user.id, chest_type)
            db.commit()
            return {"success": True, "chest_type": chest_type, "coins_remaining": user.coins}
        else:
            db.rollback()
            raise HTTPException(status_code=400, detail="Transaction failed: Insufficient balance")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Transaction error: {str(e)}")

# --- ShuBank Together Endpoints (Tech Spec 1.0) ---

@app.get("/api/v1/shubank/state", response_model=schemas.ShuBankUserState)
def get_shubank_state(db: Session = Depends(get_db)):
    try:
        user = db.query(models_shubank.ShuBankUser).filter(
            models_shubank.ShuBankUser.bank_client_id == "demo_client_hash"
        ).with_for_update().first()
        
        if not user:
            user = models_shubank.ShuBankUser(bank_client_id="demo_client_hash", energy=50, coins=100)
            db.add(user)
            db.commit()
            db.refresh(user)
        
        # --- Passive Decay Logic (Tech Spec 1.1 Balancing) ---
        now = datetime.now(timezone.utc)
        if user.last_active_at:
            last_active = user.last_active_at
            if last_active.tzinfo is None:
                last_active = last_active.replace(tzinfo=timezone.utc)
            
            seconds_passed = (now - last_active).total_seconds()
            
            # Energy: -1 per 30 mins
            energy_decay = int(seconds_passed // 1800)
            if energy_decay > 0:
                user.energy = max(0, user.energy - energy_decay)
                
            # Calmness: -1 per 60 mins
            calmness_decay = int(seconds_passed // 3600)
            if calmness_decay > 0:
                user.calmness = max(0, user.calmness - calmness_decay)
                
            if energy_decay > 0 or calmness_decay > 0:
                user.energy = max(0, min(100, user.energy))
                user.calmness = max(0, min(100, user.calmness))
                db.commit()

        # Update last_active_at
        user.last_active_at = now
        db.commit()
        
        # Map inventory objects to list of item_ids
        inventory_ids = [item.item_id for item in user.inventory]
        
        return schemas.ShuBankUserState(
            energy=user.energy,
            calmness=user.calmness,
            coins=user.coins,
            home_level=user.home_level,
            shubank_name=user.shubank_name,
            deposit_balance=float(user.deposit_balance),
            inventory=inventory_ids,
            quests_completed=user.quests_completed or [],
            current_skin_id=user.current_skin_id
        )
    except Exception as e:
        db.rollback()
        print(f"Error in get_shubank_state: {e}")
        # Return default state if DB fails during demo to prevent app crash
        return schemas.ShuBankUserState(
            energy=50, calmness=0, coins=0, home_level=1, 
            shubank_name="ShuBank", deposit_balance=0.0, inventory=[], quests_completed=[]
        )

@app.post("/api/v1/shubank/shop/buy")
def buy_shubank_item(request: schemas.ShuBankShopBuyRequest, db: Session = Depends(get_db)):
    user = db.query(models_shubank.ShuBankUser).filter(models_shubank.ShuBankUser.bank_client_id == "demo_client_hash").first()
    # Tech Spec 1.0 Prices
    prices = {
        'skin_1': 1000, 'skin_2': 1500, 'skin_3': 2000,
        'skin_4': 2500, 'skin_5': 3000, 'skin_6': 3500,
        'skin_7': 4000, 'skin_8': 4500, 'skin_9': 5000,
        'item_mining_farm': 5000
    }
    cost = prices.get(request.item_id, 1000)

    try:
        # Use with_for_update() to prevent race conditions during purchase
        user = db.query(models_shubank.ShuBankUser).filter(
            models_shubank.ShuBankUser.bank_client_id == "demo_client_hash"
        ).with_for_update().first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if user.coins < cost:
            raise HTTPException(status_code=400, detail="Insufficient coins")
        
        if any(item.item_id == request.item_id for item in user.inventory):
            return {"success": True, "message": "Already owned"}

        user.coins -= cost
        new_item = models_shubank.ShuBankInventory(
            user_id=user.user_id,
            item_id=request.item_id,
            item_type="skin" if "skin" in request.item_id else "item"
        )
        db.add(new_item)
        db.commit()
        return {"success": True, "item_id": request.item_id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Transaction failed: {str(e)}")

@app.post("/api/v1/shubank/inventory/equip")
def equip_shubank_item(request: schemas.ShuBankShopBuyRequest, db: Session = Depends(get_db)):
    try:
        user = db.query(models_shubank.ShuBankUser).filter(
            models_shubank.ShuBankUser.bank_client_id == "demo_client_hash"
        ).with_for_update().first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        # Check if item exists in inventory
        item_exists = db.query(models_shubank.ShuBankInventory).filter(
            models_shubank.ShuBankInventory.user_id == user.user_id,
            models_shubank.ShuBankInventory.item_id == request.item_id
        ).first()
        
        if not item_exists:
            raise HTTPException(status_code=400, detail="Item not owned")
            
        user.current_skin_id = request.item_id
        db.commit()
        return {"success": True, "current_skin_id": user.current_skin_id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
def create_pride(request: schemas.ShuBankPrideCreateRequest, db: Session = Depends(get_db)):
    try:
        pride = models_shubank.ShuBankPride(
            name=request.name,
            type=request.type,
            goal_amount=request.goal_amount
        )
        db.add(pride)
        db.commit()
        return {"success": True}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/shubank/minigame/sync")
def sync_minigame_coins(request: schemas.ShuBankMinigameSyncRequest, db: Session = Depends(get_db)):
    try:
        # Prevent simultaneous coin updates
        user = db.query(models_shubank.ShuBankUser).filter(
            models_shubank.ShuBankUser.bank_client_id == "demo_client_hash"
        ).with_for_update().first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Tech Spec 1.0: +1 coin per click (lim 500/day simulated here)
        earned = min(request.coins, 500)
        user.coins += earned
        db.commit()
        return {"success": True, "earned": earned, "total_coins": user.coins}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/shubank/quest/complete")
def complete_quest(request: schemas.ShuBankQuestCompleteRequest, db: Session = Depends(get_db)):
    try:
        user = db.query(models_shubank.ShuBankUser).filter(
            models_shubank.ShuBankUser.bank_client_id == "demo_client_hash"
        ).with_for_update().first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Reward mapping matching frontend QUESTS_DATA
        quest_rewards = {
            'dance_kara': 50,
            'qr_pay': 100,
            'save_money': 150,
            'quiz_master': 200,
            'cashback_goal': 120,
            'mobile_topup': 80
        }
        reward = quest_rewards.get(request.quest_id, 0)

        current_quests = list(user.quests_completed or [])
        if request.quest_id not in current_quests:
            current_quests.append(request.quest_id)
            user.quests_completed = current_quests
            user.coins += reward # Atomic reward
            db.commit()
            return {"success": True, "reward_earned": reward}
        return {"success": True, "reward_earned": 0, "message": "Already completed"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# --- System & Demo Tools ---

@app.post("/api/v1/system/reset")
def hard_reset_demo(db: Session = Depends(get_db)):
    try:
        # Clear ShuBank Data
        db.query(models_shubank.ShuBankInventory).delete()
        db.query(models_shubank.ShuBankPride).delete()
        db.query(models_shubank.ShuBankUser).delete()
        
        # Clear ShuBoom Data
        db.query(models.UserCollection).delete()
        db.query(models.User).delete()
        db.query(models.Promotion).delete()
        
        db.commit()
        return {"success": True, "message": "Demo data cleared"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# --- Integration Webhooks (Bank -> Game) ---

@app.post("/api/v1/shubank/webhooks/bank/transaction")
def webhook_transaction(request: schemas.BankTransactionWebhook, db: Session = Depends(get_db)):
    try:
        user = db.query(models_shubank.ShuBankUser).filter(
            models_shubank.ShuBankUser.bank_client_id == request.client_hash
        ).with_for_update().first()
        
        if user:
            # Tech Spec 1.1: Boost Energy +20 (was +10), Coins +10
            user.energy = min(100, user.energy + 20)
            user.coins += 10
            user.transaction_count = (user.transaction_count or 0) + 1
            db.commit()
            return {"status": "ok", "user": user.bank_client_id, "energy": user.energy}
        return {"status": "user_not_found"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/shubank/webhooks/bank/deposit_update")
def webhook_deposit(request: schemas.BankDepositUpdateWebhook, db: Session = Depends(get_db)):
    try:
        user = db.query(models_shubank.ShuBankUser).filter(
            models_shubank.ShuBankUser.bank_client_id == request.client_hash
        ).with_for_update().first()
        
        if user:
            balance = float(request.total_balance)
            user.deposit_balance = balance
            
            # Tech Spec 1.1: Linear scaling for better feedback
            if balance >= 1000000:
                calmness = 100
            elif balance >= 200000:
                calmness = 80 + int((balance - 200000) / 800000 * 20)
            elif balance >= 50000:
                calmness = 50 + int((balance - 50000) / 150000 * 30)
            else:
                calmness = int(balance / 50000 * 50)
            
            user.calmness = max(0, min(100, calmness))
            
            # Tech Spec 1.0: Home upgrades based on thresholds
            if balance >= 1000000: user.home_level = 4
            elif balance >= 200000: user.home_level = 3
            elif balance >= 50000: user.home_level = 2
            else: user.home_level = 1
            
            db.commit()
            return {"status": "ok", "calmness": user.calmness, "level": user.home_level}
        return {"status": "user_not_found"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# --- ShuRun Endpoints ---

@app.get("/api/v1/shurun/runs", response_model=List[schemas.ShuRunRun])
def get_shurun_runs(user_phone: str, db: Session = Depends(get_db)):
    user = crud.get_user_by_phone(db, user_phone)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return crud.get_user_runs(db, user.id)

@app.post("/api/v1/shurun/runs", response_model=schemas.ShuRunRun)
def save_shurun_run(run: schemas.ShuRunRunBase, user_phone: str, db: Session = Depends(get_db)):
    user = crud.get_user_by_phone(db, user_phone)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return crud.create_user_run(db, user.id, run)

@app.get("/api/v1/shurun/orders", response_model=List[schemas.ShuRunOrder])
def get_shurun_orders(user_phone: str, db: Session = Depends(get_db)):
    user = crud.get_user_by_phone(db, user_phone)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return crud.get_user_orders(db, user.id)

@app.post("/api/v1/shurun/orders", response_model=schemas.ShuRunOrder)
def save_shurun_order(order: schemas.ShuRunOrderBase, user_phone: str, db: Session = Depends(get_db)):
    user = crud.get_user_by_phone(db, user_phone)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return crud.create_user_order(db, user.id, order)

