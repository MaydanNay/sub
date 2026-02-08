from sqlalchemy.orm import Session
from . import models, schemas
import random

def get_random_promotion(db: Session):
    promotions = db.query(models.Promotion).all()
    if not promotions:
        return None
    return random.choice(promotions)

def create_promotion(db: Session, promotion: schemas.PromotionCreate):
    db_promotion = models.Promotion(**promotion.dict())
    db.add(db_promotion)
    db.commit()
    db.refresh(db_promotion)
    return db_promotion

def get_promotions(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Promotion).offset(skip).limit(limit).all()
