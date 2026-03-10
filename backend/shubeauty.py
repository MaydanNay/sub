# SHU Beauty minigame router
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from pydantic import BaseModel
import random

router = APIRouter()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class ScoreSubmission(BaseModel):
    score: int
    character: str
    user_phone: str = "7770000000" # Default for demo

class GameReward(BaseModel):
    success: bool
    score: int
    reward_title: str
    coupon_value: int
    message: str

@router.post("/api/v1/shubeauty/submit_score", response_model=GameReward)
def submit_score(submission: ScoreSubmission, db: Session = Depends(get_db)):
    # Logic for rewards
    reward_title = "Нет приза"
    coupon_value = 0
    message = "Попробуй еще раз!"

    if submission.score >= 8000:
        reward_title = "Купон 10 000 ₸"
        coupon_value = 10000
        message = "Невероятно! Ты супер-мастер красоты!"
    elif submission.score >= 5000:
        reward_title = "Купон 5 000 ₸"
        coupon_value = 5000
        message = "Отличный результат! Твоя косметичка полна!"
    elif submission.score >= 1000:
        reward_title = "Купон 500 ₸"
        coupon_value = 500
        message = "Хорошее начало! Продолжай в том же духе."
    else:
        message = "Не сдавайся! Собери больше предметов в следующий раз."

    return {
        "success": True,
        "score": submission.score,
        "reward_title": reward_title,
        "coupon_value": coupon_value,
        "message": message
    }
