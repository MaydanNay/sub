from fastapi import FastAPI, Depends, HTTPException, status, Header, UploadFile, File
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import crud, models, schemas, security
from database import SessionLocal, engine
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import datetime
import shutil
from typing import List, Optional

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="ShuTeam CRM API")

os.makedirs("/app/uploads", exist_ok=True)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = security.decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
    
    phone = payload.get("sub")
    if not phone:
        raise HTTPException(status_code=401, detail="Token invalid")
        
    user = crud.get_user_by_phone(db, phone)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def get_current_user_optional(token: Optional[str] = Depends(oauth2_scheme_optional), db: Session = Depends(get_db)):
    if not token:
        return None
    try:
        payload = security.decode_access_token(token)
        if not payload:
            return None
        phone = payload.get("sub")
        if not phone:
            return None
        return crud.get_user_by_phone(db, phone)
    except:
        return None

@app.post("/api/v1/media/upload", response_model=schemas.MediaResponse)
def upload_files(files: List[UploadFile] = File(...)):
    urls = []
    for file in files:
        filename = f"{datetime.datetime.now().timestamp()}_{file.filename.replace(' ', '_')}"
        file_path = os.path.join("/app/uploads", filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        urls.append(f"/api/v1/media/{filename}")
    return schemas.MediaResponse(urls=urls)

@app.post("/api/v1/auth/me/avatar")
def update_avatar(file: UploadFile = File(...), current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    filename = f"avatar_{current_user.id}_{datetime.datetime.now().timestamp()}_{file.filename.replace(' ', '_')}"
    file_path = os.path.join("/app/uploads", filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    avatar_url = f"/api/v1/media/{filename}"
    crud.update_profile(db, current_user.id, schemas.ProfileUpdate(avatar_url=avatar_url))
    return {"status": "success", "avatar_url": avatar_url}

app.mount("/api/v1/media", StaticFiles(directory="/app/uploads"), name="media")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── AUTH ─────────────────────────────────────────────────────────────────────

@app.post("/api/v1/auth/register", response_model=schemas.AuthResponse)
def register(data: schemas.RegisterRequest, db: Session = Depends(get_db)):
    if crud.get_user_by_phone(db, data.phone):
        raise HTTPException(status_code=409, detail="Этот номер телефона уже зарегистрирован. Попробуйте войти.")
    
    user = crud.register_user(db, data)
    if not user:
        raise HTTPException(status_code=400, detail="Ошибка при регистрации. Проверьте данные.")
    
    token = security.create_access_token({"sub": user.phone})
    return schemas.AuthResponse(user=user, token=token)

@app.post("/api/v1/auth/login", response_model=schemas.AuthResponse)
def login(data: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = crud.get_user_by_phone(db, data.phone)
    if not user:
        raise HTTPException(status_code=401, detail="Пользователь с таким номером не найден.")
    
    if not security.verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Неверный пароль. Попробуйте еще раз.")
    
    token = security.create_access_token({"sub": user.phone})
    return schemas.AuthResponse(user=user, token=token)

@app.get("/api/v1/auth/me", response_model=schemas.UserPublic)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.patch("/api/v1/auth/me", response_model=schemas.UserPublic)
def update_me(data: schemas.ProfileUpdate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    updated = crud.update_profile(db, current_user.id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return updated

@app.on_event("startup")
def startup_event():
    import time
    from sqlalchemy import text
    # Wait for Postgres to be ready (healthcheck should handle this, but extra safety)
    for attempt in range(10):
        try:
            db = SessionLocal()
            db.execute(text("SELECT 1"))
            break
        except Exception:
            db.close()
            time.sleep(2)
    else:
        return  # Give up seeding, app will still serve requests

    try:
        if db.query(models.Community).count() == 0:
            # Create a default user for seed communities if none
            seed_user = db.query(models.User).first()
            if not seed_user:
                seed_user = crud.register_user(db, schemas.RegisterRequest(
                    phone="77777777777",
                    name="Admin",
                    password="admin",
                    city="Астана"
                ))
            
            comm1 = crud.create_community(db, schemas.CommunityCreate(
                name="Художники Астаны",
                description="Сообщество творческих людей, пленэры и мастер-классы.",
                city="Астана",
                category="Художники",
                privacy_type=schemas.PrivacyType.PARTIAL
            ), leader_id=seed_user.id)
            
            comm2 = crud.create_community(db, schemas.CommunityCreate(
                name="Книжный Клуб",
                description="Обсуждаем классику и новинки за чашкой кофе.",
                city="Алматы",
                category="Чтение",
                privacy_type=schemas.PrivacyType.OPEN
            ), leader_id=seed_user.id)

            crud.create_venue(db, schemas.VenueBase(
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
                cost=2000,
                is_open=True
            ))

            crud.create_meeting(db, schemas.MeetingCreate(
                community_id=comm2.id,
                title="Обсуждение 'Сто лет одиночества'",
                description="Разбираем магический реализм Маркеса.",
                date_time=datetime.datetime.now() + datetime.timedelta(days=3),
                location_address="LofWork, зал 2",
                materials=["Книга", "Блокнот", "Ручка"],
                cost=0,
                is_open=True
            ))
    except Exception as e:
        print(f"[startup] Seed error (non-fatal): {e}")
    finally:
        db.close()


@app.get("/api/v1/crm/communities", response_model=List[schemas.Community])
def list_communities(search: str = None, category: str = None, city: str = None, skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    return crud.get_communities(db, skip=skip, limit=limit, search=search, category=category, city=city)

@app.post("/api/v1/crm/communities", response_model=schemas.Community)
def create_community(community: schemas.CommunityCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.create_community(db, community, leader_id=current_user.id)

@app.get("/api/v1/crm/communities/{community_id}", response_model=schemas.Community)
def get_community_detail(community_id: int, current_user: Optional[models.User] = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    user_id = current_user.id if current_user else None
    comm = crud.get_community(db, community_id, user_id=user_id)
    if not comm:
        raise HTTPException(status_code=404, detail="Community not found")
    return comm

@app.patch("/api/v1/crm/communities/{community_id}", response_model=schemas.Community)
def update_community_endpoint(community_id: int, community_update: schemas.CommunityUpdate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check permissions: only community leader or moderator can update community
    membership = db.query(models.CommunityMember).filter(
        models.CommunityMember.community_id == community_id,
        models.CommunityMember.user_id == current_user.id
    ).first()
    
    if not membership or membership.role not in [models.MemberRole.LEADER, models.MemberRole.MODERATOR]:
        raise HTTPException(status_code=403, detail="У вас нет прав для редактирования этого сообщества")
        
    updated = crud.update_community(db, community_id, community_update)
    if not updated:
        raise HTTPException(status_code=404, detail="Community not found")
    return updated

@app.delete("/api/v1/crm/communities/{community_id}")
def delete_community_endpoint(community_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    membership = db.query(models.CommunityMember).filter(
        models.CommunityMember.community_id == community_id,
        models.CommunityMember.user_id == current_user.id
    ).first()
    
    if not membership or membership.role != models.MemberRole.LEADER:
        raise HTTPException(status_code=403, detail="Только владелец сообщества может его удалить")
        
    success = crud.delete_community(db, community_id)
    if not success:
        raise HTTPException(status_code=404, detail="Сообщество не найдено")
    return {"status": "ok", "message": "Сообщество удалено"}

@app.get("/api/v1/crm/communities/{community_id}/members")
def get_community_members(community_id: int, db: Session = Depends(get_db)):
    return crud.get_community_members(db, community_id)

@app.get("/api/v1/crm/user/communities", response_model=List[schemas.Community])
def get_user_joined_communities(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.get_user_communities(db, current_user.id)

@app.get("/api/v1/crm/meetings", response_model=List[schemas.Meeting])
def list_meetings(community_id: int = None, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # TZ Requirement 2.1: Open meetings are visible to everyone
    return crud.get_meetings(db, community_id=community_id, user_id=current_user.id, include_open=True)

@app.post("/api/v1/crm/meetings", response_model=schemas.Meeting)
def create_meeting(meeting: schemas.MeetingCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check permissions: only community leader or moderator can create meetings
    membership = db.query(models.CommunityMember).filter(
        models.CommunityMember.community_id == meeting.community_id,
        models.CommunityMember.user_id == current_user.id
    ).first()
    
    if not membership or membership.role not in [models.MemberRole.LEADER, models.MemberRole.MODERATOR]:
        raise HTTPException(status_code=403, detail="У вас нет прав для создания встреч в этом сообществе")
        
    return crud.create_meeting(db, meeting)

@app.get("/api/v1/crm/wallet", response_model=schemas.Wallet)
def get_user_wallet(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.get_or_create_wallet(db, user_id=current_user.id)

@app.get("/api/v1/crm/transactions", response_model=List[schemas.Transaction])
def list_transactions(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.get_transactions(db, user_id=current_user.id)

@app.post("/api/v1/crm/meetings/participate")
def participate_meeting(meeting_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Process payment (90/10 split)
    if not crud.process_meeting_payment(db, meeting_id, current_user.id):
        raise HTTPException(status_code=400, detail="Insufficient funds in wallet")
        
    return crud.register_user_for_meeting(db, meeting_id, current_user.id)

@app.get("/api/v1/crm/meetings/{meeting_id}/participants", response_model=List[schemas.MeetingRegistration])
def list_meeting_participants(meeting_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.get_meeting_participants(db, meeting_id)

@app.post("/api/v1/crm/meetings/check-in")
def check_in_participant(meeting_id: int, user_phone: str, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Typically only a leader/moderator should check people in
    user = crud.get_user_by_phone(db, user_phone)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not crud.check_in_participant(db, meeting_id, user.id):
        raise HTTPException(status_code=400, detail="Registration not found or error")
    return {"status": "success", "message": "Participant checked in"}
@app.get("/api/v1/crm/communities/{community_id}/stats")
def get_community_analytics(community_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Verify permission: only leader/admin/moderator of this community
    membership = db.query(models.CommunityMember).filter(
        models.CommunityMember.community_id == community_id,
        models.CommunityMember.user_id == current_user.id
    ).first()
    
    if not membership or membership.role not in [models.MemberRole.LEADER, models.MemberRole.MODERATOR]:
        raise HTTPException(status_code=403, detail="У вас нет прав для просмотра статистики этого сообщества")
        
    return crud.get_community_stats(db, community_id)

@app.get("/api/v1/crm/venues", response_model=List[schemas.Venue])
def list_venues(db: Session = Depends(get_db)):
    return crud.get_venues(db)

@app.post("/api/v1/crm/communities/join")
def join_community(community_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.add_member(db, community_id, current_user.id)

@app.get("/api/v1/crm/communities/{community_id}/requests")
def get_community_requests(community_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Verify permission: only leader/admin/moderator
    membership = db.query(models.CommunityMember).filter(
        models.CommunityMember.community_id == community_id,
        models.CommunityMember.user_id == current_user.id
    ).first()
    
    if not membership or membership.role not in [models.MemberRole.LEADER, models.MemberRole.MODERATOR]:
        raise HTTPException(status_code=403, detail="Permission denied")
        
    return crud.get_pending_members(db, community_id)

@app.post("/api/v1/crm/memberships/{membership_id}/approve")
def approve_membership(membership_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    membership = db.query(models.CommunityMember).filter(models.CommunityMember.id == membership_id).first()
    if not membership:
        raise HTTPException(status_code=404, detail="Membership not found")
        
    # Check permissions of current_user in that community
    admin_membership = db.query(models.CommunityMember).filter(
        models.CommunityMember.community_id == membership.community_id,
        models.CommunityMember.user_id == current_user.id
    ).first()
    
    if not admin_membership or admin_membership.role not in [models.MemberRole.LEADER, models.MemberRole.MODERATOR]:
        raise HTTPException(status_code=403, detail="Permission denied")
        
    return crud.update_membership_status(db, membership_id, models.MemberStatus.APPROVED)

@app.post("/api/v1/crm/memberships/{membership_id}/reject")
def reject_membership(membership_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    membership = db.query(models.CommunityMember).filter(models.CommunityMember.id == membership_id).first()
    if not membership:
        raise HTTPException(status_code=404, detail="Membership not found")
        
    # Check permissions
    admin_membership = db.query(models.CommunityMember).filter(
        models.CommunityMember.community_id == membership.community_id,
        models.CommunityMember.user_id == current_user.id
    ).first()
    
    if not admin_membership or admin_membership.role not in [models.MemberRole.LEADER, models.MemberRole.MODERATOR]:
        raise HTTPException(status_code=403, detail="Permission denied")
        
    return crud.update_membership_status(db, membership_id, models.MemberStatus.REJECTED)

@app.get("/api/v1/crm/communities/{community_id}/pending-proofs")
def get_pending_proofs(community_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Verify permission: only leader/admin/moderator of this community
    membership = db.query(models.CommunityMember).filter(
        models.CommunityMember.community_id == community_id,
        models.CommunityMember.user_id == current_user.id
    ).first()
    
    if not membership or membership.role not in [models.MemberRole.LEADER, models.MemberRole.MODERATOR]:
        raise HTTPException(status_code=403, detail="Только лидеры могут модерировать достижения")
        
    return crud.get_pending_proofs(db, community_id)

@app.post("/api/v1/crm/goals/approve/{progress_id}")
def approve_proof(progress_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    progress = db.query(models.GoalProgress).filter(models.GoalProgress.id == progress_id).first()
    if not progress:
        raise HTTPException(status_code=404, detail="Progress not found")
        
    goal = db.query(models.Goal).filter(models.Goal.id == progress.goal_id).first()
    membership = db.query(models.CommunityMember).filter(
        models.CommunityMember.community_id == goal.community_id,
        models.CommunityMember.user_id == current_user.id
    ).first()
    
    if not membership or membership.role not in [models.MemberRole.LEADER, models.MemberRole.MODERATOR]:
        raise HTTPException(status_code=403, detail="Permission denied")
        
    return crud.approve_goal_progress(db, progress_id)

@app.post("/api/v1/crm/goals/reject/{progress_id}")
def reject_proof(progress_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    progress = db.query(models.GoalProgress).filter(models.GoalProgress.id == progress_id).first()
    if not progress:
        raise HTTPException(status_code=404, detail="Progress not found")
        
    goal = db.query(models.Goal).filter(models.Goal.id == progress.goal_id).first()
    membership = db.query(models.CommunityMember).filter(
        models.CommunityMember.community_id == goal.community_id,
        models.CommunityMember.user_id == current_user.id
    ).first()
    
    if not membership or membership.role not in [models.MemberRole.LEADER, models.MemberRole.MODERATOR]:
        raise HTTPException(status_code=403, detail="Permission denied")
        
    return crud.reject_goal_progress(db, progress_id)

@app.get("/api/v1/crm/communities/{community_id}/goals", response_model=List[schemas.Goal])
def get_community_goals(community_id: int, db: Session = Depends(get_db)):
    return crud.get_community_goals(db, community_id)

@app.post("/api/v1/crm/goals", response_model=schemas.Goal)
def create_community_goal(goal: schemas.GoalCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    membership = db.query(models.CommunityMember).filter(
        models.CommunityMember.community_id == goal.community_id,
        models.CommunityMember.user_id == current_user.id
    ).first()
    
    if not membership or membership.role not in [models.MemberRole.LEADER, models.MemberRole.MODERATOR]:
        raise HTTPException(status_code=403, detail="У вас нет прав для создания целей в этом сообществе")
        
    return crud.create_goal(db, goal)

@app.post("/api/v1/crm/goals/{goal_id}/progress")
def update_goal_progress(goal_id: int, data: schemas.ProgressUpdateRequest, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.update_goal_progress(db, goal_id, current_user.id, data.increment, data.proof_urls)

@app.get("/api/v1/crm/user/badges", response_model=List[schemas.Badge])
def get_user_badges(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.get_user_badges_list(db, current_user.id)

# --- Gallery ---
@app.get("/api/v1/crm/communities/{community_id}/gallery", response_model=List[schemas.GalleryItem])
def get_community_gallery(community_id: int, db: Session = Depends(get_db)):
    return crud.get_community_gallery(db, community_id)

@app.post("/api/v1/crm/communities/{community_id}/gallery", response_model=schemas.GalleryItem)
def add_gallery_item(community_id: int, item: schemas.GalleryItemCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Verify permission: only leader/admin/moderator
    membership = db.query(models.CommunityMember).filter(
        models.CommunityMember.community_id == community_id,
        models.CommunityMember.user_id == current_user.id
    ).first()
    
    if not membership or membership.role not in [models.MemberRole.LEADER, models.MemberRole.MODERATOR]:
        raise HTTPException(status_code=403, detail="Only leaders and moderators can add to gallery")
        
    return crud.create_gallery_item(db, community_id, item)
