from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
import crud, models, schemas
from database import SessionLocal, engine
from fastapi.middleware.cors import CORSMiddleware
import os
import datetime
from typing import List

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="ShuTeam CRM API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    if db.query(models.Community).count() == 0:
        comm1 = crud.create_community(db, schemas.CommunityCreate(
            name="Художники Астаны",
            description="Сообщество творческих людей, пленэры и мастер-классы.",
            privacy_type=schemas.PrivacyType.PARTIAL
        ))
        comm2 = crud.create_community(db, schemas.CommunityCreate(
            name="Книжный Клуб",
            description="Обсуждаем классику и новинки за чашкой кофе.",
            privacy_type=schemas.PrivacyType.OPEN
        ))
        
        venue1 = crud.create_venue(db, schemas.VenueBase(
            name="Art Coffee",
            description="Уютная кофейня с мольбертами.",
            address="ул. Достык, 12",
            capacity=20,
            amenities=["Wi-Fi", "Sockets", "Art supplies"],
            discount_info="10% скидка участникам ShuTeam",
            image_urls=["https://images.unsplash.com/photo-1554118811-1e0d58224f24"]
        ))
        
        crud.create_goal(db, schemas.GoalCreate(
            community_id=comm1.id,
            title="Закат недели",
            description="Нарисовать закат в любой технике.",
            goal_type="WEEKLY",
            duration_days=7
        ))

        crud.create_meeting(db, schemas.MeetingCreate(
            community_id=comm1.id,
            title="Пленэр на набережной",
            description="Рисуем закатное солнце и воду.",
            date_time=datetime.datetime.now() + datetime.timedelta(days=1),
            location_address="Набережная, 5",
            materials=["Акварель", "Кисти", "Бумага А4", "Складной стул"],
            cost=2000
        ))

        crud.create_meeting(db, schemas.MeetingCreate(
            community_id=comm2.id,
            title="Обсуждение 'Сто лет одиночества'",
            description="Разбираем магический реализм Маркеса.",
            date_time=datetime.datetime.now() + datetime.timedelta(days=3),
            location_address="LofWork, зал 2",
            materials=["Книга", "Блокнот", "Ручка"],
            cost=0
        ))
    db.close()

@app.get("/api/v1/crm/communities", response_model=List[schemas.Community])
def list_communities(search: str = None, skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    return crud.get_communities(db, skip=skip, limit=limit, search=search)

@app.get("/api/v1/crm/communities/{community_id}", response_model=schemas.Community)
def get_community_detail(community_id: int, db: Session = Depends(get_db)):
    comm = crud.get_community(db, community_id)
    if not comm:
        raise HTTPException(status_code=404, detail="Community not found")
    return comm

@app.get("/api/v1/crm/user/communities", response_model=List[schemas.Community])
def get_user_joined_communities(user_phone: str, db: Session = Depends(get_db)):
    user = crud.get_user_by_phone(db, user_phone)
    if not user:
        # For standalone demo, auto-create user
        user = crud.create_user(db, schemas.UserCreate(phone=user_phone))
    return crud.get_user_communities(db, user.id)

@app.get("/api/v1/crm/meetings", response_model=List[schemas.Meeting])
def list_meetings(community_id: int = None, user_phone: str = None, db: Session = Depends(get_db)):
    user_id = None
    if user_phone:
        user = crud.get_user_by_phone(db, user_phone)
        if user:
            user_id = user.id
    # TZ Requirement 2.1: Open meetings are visible to everyone
    return crud.get_meetings(db, community_id=community_id, user_id=user_id, include_open=True)

@app.post("/api/v1/crm/meetings", response_model=schemas.Meeting)
def create_meeting(meeting: schemas.MeetingCreate, db: Session = Depends(get_db)):
    return crud.create_meeting(db, meeting)

@app.get("/api/v1/crm/wallet", response_model=schemas.Wallet)
def get_user_wallet(user_phone: str, db: Session = Depends(get_db)):
    user = crud.get_user_by_phone(db, user_phone)
    if not user:
        user = crud.create_user(db, schemas.UserCreate(phone=user_phone))
    return crud.get_or_create_wallet(db, user_id=user.id)

@app.get("/api/v1/crm/transactions", response_model=List[schemas.Transaction])
def list_transactions(user_phone: str, db: Session = Depends(get_db)):
    user = crud.get_user_by_phone(db, user_phone)
    if not user:
        return []
    return crud.get_transactions(db, user_id=user.id)

@app.post("/api/v1/crm/meetings/participate")
def participate_meeting(meeting_id: int, user_phone: str, db: Session = Depends(get_db)):
    user = crud.get_user_by_phone(db, user_phone)
    if not user:
        user = crud.create_user(db, schemas.UserCreate(phone=user_phone))
    
    # Process payment (90/10 split)
    if not crud.process_meeting_payment(db, meeting_id, user.id):
        raise HTTPException(status_code=400, detail="Insufficient funds in wallet")
        
    return crud.register_user_for_meeting(db, meeting_id, user.id)

@app.get("/api/v1/crm/meetings/{meeting_id}/participants", response_model=List[schemas.MeetingRegistration])
def list_meeting_participants(meeting_id: int, db: Session = Depends(get_db)):
    return crud.get_meeting_participants(db, meeting_id)

@app.post("/api/v1/crm/meetings/check-in")
def check_in_participant(meeting_id: int, user_phone: str, db: Session = Depends(get_db)):
    user = crud.get_user_by_phone(db, user_phone)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not crud.check_in_participant(db, meeting_id, user.id):
        raise HTTPException(status_code=400, detail="Registration not found or error")
    return {"status": "success", "message": "Participant checked in"}

@app.get("/api/v1/crm/venues", response_model=List[schemas.Venue])
def list_venues(db: Session = Depends(get_db)):
    return crud.get_venues(db)

@app.post("/api/v1/crm/communities/join")
def join_community(community_id: int, user_phone: str, db: Session = Depends(get_db)):
    user = crud.get_user_by_phone(db, user_phone)
    if not user:
        user = crud.create_user(db, schemas.UserCreate(phone=user_phone))
    return crud.add_member(db, community_id, user.id)
