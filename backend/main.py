from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from . import crud, models, schemas
from .database import SessionLocal, engine
from fastapi.middleware.cors import CORSMiddleware

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    if db.query(models.Promotion).count() == 0:
        # Seed logic
        promotions = [
            {"title": "Скидка 10%", "description": "Получите скидку 10% на следующую покупку.", "image_url": "https://placehold.co/150/purple/white?text=10%"},
            {"title": "Бесплатная доставка", "description": "Бесплатная доставка при заказе от 3000 руб.", "image_url": "https://placehold.co/150/blue/white?text=Доставка"},
            {"title": "1+1", "description": "Купи один товар, получи второй такой же или дешевле бесплатно.", "image_url": "https://placehold.co/150/orange/white?text=1+1"},
            {"title": "Скидка 20%", "description": "Скидка 20% на избранные товары.", "image_url": "https://placehold.co/150/red/white?text=20%"},
            {"title": "Десерт в подарок", "description": "Бесплатный десерт при заказе основного блюда.", "image_url": "https://placehold.co/150/pink/white?text=Десерт"},
             {"title": "Кэшбэк 5%", "description": "Вернем 5% баллами на карту лояльности.", "image_url": "https://placehold.co/150/green/white?text=Cashback"},
            {"title": "Тайный подарок", "description": "Получите секретный подарок к вашему заказу.", "image_url": "https://placehold.co/150/indigo/white?text=Подарок"},
            {"title": "Купон 500₽", "description": "Скидка 500 рублей на следующую покупку от 2000 рублей.", "image_url": "https://placehold.co/150/yellow/black?text=500₽"},
            {"title": "Двойные баллы", "description": "Получите двойные баллы лояльности за эту покупку.", "image_url": "https://placehold.co/150/teal/white?text=X2"},
            {"title": "Напиток в подарок", "description": "Бесплатный напиток при любом заказе.", "image_url": "https://placehold.co/150/cyan/white?text=Напиток"},
        ]
        for p in promotions:
            crud.create_promotion(db, schemas.PromotionCreate(**p))
    db.close()

@app.get("/promotions/random", response_model=schemas.Promotion)
def read_random_promotion(db: Session = Depends(get_db)):
    promotion = crud.get_random_promotion(db)
    if promotion is None:
        raise HTTPException(status_code=404, detail="No promotions found")
    return promotion

@app.get("/promotions", response_model=list[schemas.Promotion])
def read_promotions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    promotions = crud.get_promotions(db, skip=skip, limit=limit)
    return promotions
