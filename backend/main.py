from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from . import crud, models, schemas, models_shubank, shubeauty
from .database import SessionLocal, engine
from fastapi.middleware.cors import CORSMiddleware
import random

models.Base.metadata.create_all(bind=engine)
models_shubank.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(shubeauty.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "http://localhost:3000",
        # TODO: add production domain, e.g. "https://yourdomain.com"
    ],
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
            {"title": "Скидка 10%", "description": "Получите скидку 10% на следующую покупку.", "image_url": "https://placehold.co/150/purple/white?text=10%"},
            {"title": "Бесплатная доставка", "description": "Бесплатная доставка при заказе от 3000 руб.", "image_url": "https://placehold.co/150/blue/white?text=Доставка"},
            {"title": "1+1", "description": "Купи один товар, получи второй такой же или дешевле бесплатно.", "image_url": "https://placehold.co/150/orange/white?text=1+1"},
             # ... (keep existing if needed, or focused on game)
        ]
        for p in promotions:
            crud.create_promotion(db, schemas.PromotionCreate(**p))

    # Seed Characters (ShuBoom) - 7 Status-based characters
    if db.query(models.Character).count() != 7: # Reset or initial seed
        db.query(models.Character).delete()
        chars = [
            {"name": "Искатель", "rarity": "COMMON", "drop_weight": 0.5, "image_2d": "https://api.dicebear.com/7.x/notionists/svg?seed=Seeker&backgroundColor=f59e0b", "model_3d": "https://modelviewer.dev/shared-assets/models/Astronaut.glb"},
            {"name": "Романтик", "rarity": "COMMON", "drop_weight": 0.5, "image_2d": "https://api.dicebear.com/7.x/notionists/svg?seed=Romantic&backgroundColor=ec4899", "model_3d": "https://modelviewer.dev/shared-assets/models/RobotExpressive.glb"},
            {"name": "Ценитель", "rarity": "RARE", "drop_weight": 0.3, "image_2d": "https://api.dicebear.com/7.x/notionists/svg?seed=Connoisseur&backgroundColor=8b5cf6", "model_3d": "https://modelviewer.dev/shared-assets/models/Horse.glb"},
            {"name": "Эстет", "rarity": "RARE", "drop_weight": 0.3, "image_2d": "https://api.dicebear.com/7.x/notionists/svg?seed=Aesthete&backgroundColor=06b6d4", "model_3d": "https://modelviewer.dev/shared-assets/models/NeilArmstrong.glb"},
            {"name": "Мечтатель", "rarity": "RARE", "drop_weight": 0.2, "image_2d": "https://api.dicebear.com/7.x/notionists/svg?seed=Dreamer&backgroundColor=6366f1", "model_3d": "https://modelviewer.dev/shared-assets/models/Astronaut.glb"},
            {"name": "Философ", "rarity": "LEGENDARY", "drop_weight": 0.1, "image_2d": "https://api.dicebear.com/7.x/notionists/svg?seed=Philosopher&backgroundColor=10b981", "model_3d": "https://modelviewer.dev/shared-assets/models/AlphaBlendModeTest.glb"},
            {"name": "Футурист", "rarity": "LEGENDARY", "drop_weight": 0.05, "image_2d": "https://api.dicebear.com/7.x/notionists/svg?seed=Futurist&backgroundColor=eab308", "model_3d": "https://modelviewer.dev/shared-assets/models/NeilArmstrong.glb"},
        ]
        for c in chars:
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

@app.post("/api/v1/chests/open", response_model=schemas.ChestResult)
def open_chest(chest_type: str, user_phone: str, db: Session = Depends(get_db)):
    user = crud.get_user_by_phone(db, user_phone)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    result = crud.open_chest_logic(db, user.id, chest_type)
    if not result:
         raise HTTPException(status_code=400, detail="Invalid chest open request (not purchased or wrong type)")

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
    
    if crud.spend_coins(db, user.id, cost):
        crud.set_pending_chest(db, user.id, chest_type)
        return {"success": True, "chest_type": chest_type, "coins_remaining": user.coins}
    else:
        raise HTTPException(status_code=400, detail="Transaction failed")

# --- ShuBank Together Endpoints (Tech Spec 1.0) ---

@app.get("/api/v1/shubank/state", response_model=schemas.ShuBankUserState)
def get_shubank_state(db: Session = Depends(get_db)):
    # Mock: get first user or create if not exists
    user = db.query(models_shubank.ShuBankUser).first()
    if not user:
        user = models_shubank.ShuBankUser(bank_client_id="demo_client_hash", energy=50, coins=100)
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@app.post("/api/v1/shubank/shop/buy")
def buy_shubank_item(request: schemas.ShuBankShopBuyRequest, db: Session = Depends(get_db)):
    user = db.query(models_shubank.ShuBankUser).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Simple logic for demo
    return {"success": True, "item_id": request.item_id}

@app.post("/api/v1/shubank/pride/create")
def create_pride(request: schemas.ShuBankPrideCreateRequest, db: Session = Depends(get_db)):
    pride = models_shubank.ShuBankPride(
        name=request.name,
        type=request.type,
        goal_amount=request.goal_amount
    )
    db.add(pride)
    db.commit()
    return {"success": True}

@app.post("/api/v1/shubank/minigame/sync")
def sync_minigame_coins(request: schemas.ShuBankMinigameSyncRequest, db: Session = Depends(get_db)):
    user = db.query(models_shubank.ShuBankUser).first()
    if user:
        # Tech Spec 1.0: +1 coin per click (lim 500/day simulated here)
        earned = min(request.coins, 500)
        user.coins += earned
        db.commit()
    return {"success": True, "earned": earned}

# --- Integration Webhooks (Bank -> Game) ---

@app.post("/webhooks/bank/transaction")
def webhook_transaction(request: schemas.BankTransactionWebhook, db: Session = Depends(get_db)):
    user = db.query(models_shubank.ShuBankUser).filter(models_shubank.ShuBankUser.bank_client_id == request.client_hash).first()
    if user:
        # Tech Spec 1.0: Energy +10, Coins +10
        user.energy = min(100, user.energy + 10)
        user.coins += 10
        user.transaction_count = (user.transaction_count or 0) + 1
        db.commit()
        return {"status": "ok", "user": user.bank_client_id, "energy": user.energy}
    return {"status": "user_not_found"}

@app.post("/webhooks/bank/deposit_update")
def webhook_deposit(request: schemas.BankDepositUpdateWebhook, db: Session = Depends(get_db)):
    user = db.query(models_shubank.ShuBankUser).filter(models_shubank.ShuBankUser.bank_client_id == request.client_hash).first()
    if user:
        # Tech Spec 1.0 Thresholds: 0->0, 50k->50, 200k->80, 1M->100
        balance = request.total_balance
        calmness = 0
        if balance >= 1000000: calmness = 100
        elif balance >= 200000: calmness = 80
        elif balance >= 50000: calmness = 50
        
        user.calmness = calmness
        
        # Check for home upgrade
        if balance >= 1000000: user.home_level = 4
        elif balance >= 200000: user.home_level = 3
        elif balance >= 50000: user.home_level = 2
        
        db.commit()
        return {"status": "ok", "calmness": calmness, "level": user.home_level}
    return {"status": "user_not_found"}
