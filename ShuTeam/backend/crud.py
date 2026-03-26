from sqlalchemy.orm import Session
from sqlalchemy import or_
import models, schemas
from decimal import Decimal
import datetime

# --- Users ---
def get_user_by_phone(db: Session, phone: str):
    return db.query(models.User).filter(models.User.phone == phone).first()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- Communities ---
def create_community(db: Session, community: schemas.CommunityCreate):
    db_community = models.Community(**community.dict())
    db.add(db_community)
    db.commit()
    db.refresh(db_community)
    return db_community

def get_community(db: Session, community_id: int):
    return db.query(models.Community).filter(models.Community.id == community_id).first()

def get_communities(db: Session, skip: int = 0, limit: int = 100, search: str = None):
    query = db.query(models.Community)
    if search:
        query = query.filter(models.Community.name.ilike(f"%{search}%"))
    return query.offset(skip).limit(limit).all()

# --- Members ---
def add_member(db: Session, community_id: int, user_id: int, role: str = "MEMBER"):
    db_member = models.CommunityMember(
        community_id=community_id,
        user_id=user_id,
        role=role
    )
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member

def get_user_communities(db: Session, user_id: int):
    return db.query(models.Community).join(models.CommunityMember).filter(models.CommunityMember.user_id == user_id).all()

# --- Meetings ---
def create_meeting(db: Session, meeting: schemas.MeetingCreate):
    db_meeting = models.Meeting(**meeting.dict())
    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)
    return db_meeting

def get_meetings(db: Session, community_id: int = None, user_id: int = None, include_open: bool = False):
    query = db.query(models.Meeting)
    if community_id:
        query = query.filter(models.Meeting.community_id == community_id)
    elif user_id:
        if include_open:
            query = query.join(models.Community, isouter=True).join(models.CommunityMember, isouter=True).filter(
                or_(
                    models.CommunityMember.user_id == user_id,
                    models.Meeting.is_open == True
                )
            )
        else:
            query = query.join(models.Community).join(models.CommunityMember).filter(models.CommunityMember.user_id == user_id)
    
    meetings = query.order_by(models.Meeting.date_time.asc()).distinct().all()
    for m in meetings:
        m.registration_count = db.query(models.MeetingRegistration).filter(models.MeetingRegistration.meeting_id == m.id).count()
    return meetings

# --- Registrations ---
def register_user_for_meeting(db: Session, meeting_id: int, user_id: int):
    # Check existing
    existing = db.query(models.MeetingRegistration).filter(
        models.MeetingRegistration.meeting_id == meeting_id,
        models.MeetingRegistration.user_id == user_id
    ).first()
    if existing:
        return existing
        
    db_reg = models.MeetingRegistration(meeting_id=meeting_id, user_id=user_id)
    db.add(db_reg)
    db.commit()
    db.refresh(db_reg)
    return db_reg

def get_meeting_participants(db: Session, meeting_id: int):
    return db.query(models.MeetingRegistration).filter(models.MeetingRegistration.meeting_id == meeting_id).all()

def check_in_participant(db: Session, meeting_id: int, user_id: int):
    reg = db.query(models.MeetingRegistration).filter(
        models.MeetingRegistration.meeting_id == meeting_id,
        models.MeetingRegistration.user_id == user_id
    ).first()
    if reg:
        reg.is_attended = True
        db.commit()
        return True
    return False

# --- Finance & Wallets ---
def get_or_create_wallet(db: Session, user_id: int = None, community_id: int = None):
    if user_id:
        wallet = db.query(models.Wallet).filter(models.Wallet.user_id == user_id).first()
        if not wallet:
            wallet = models.Wallet(user_id=user_id, balance=10000) # Give 10k starting tokens for demo
            db.add(wallet)
            db.commit()
            db.refresh(wallet)
        return wallet
    if community_id:
        wallet = db.query(models.Wallet).filter(models.Wallet.community_id == community_id).first()
        if not wallet:
            wallet = models.Wallet(community_id=community_id, balance=0)
            db.add(wallet)
            db.commit()
            db.refresh(wallet)
        return wallet
    return None

def process_meeting_payment(db: Session, meeting_id: int, user_id: int):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting or meeting.cost <= 0:
        return True
        
    user_wallet = get_or_create_wallet(db, user_id=user_id)
    if not user_wallet or user_wallet.balance < meeting.cost:
        return False # Insufficient funds or wallet error
        
    # 1. Deduct from user
    user_wallet.balance -= meeting.cost
    db.add(models.Transaction(
        user_id=user_id,
        amount=-meeting.cost,
        type="DEBIT",
        description=f"Payment for meeting: {meeting.title}"
    ))
    
    # 2. Split 90/10
    cost_dec = Decimal(str(meeting.cost))
    leader_share = cost_dec * Decimal("0.9")
    platform_share = cost_dec * Decimal("0.1")
    
    # Community/Platform wallet (mocked as community wallet)
    comm_wallet = get_or_create_wallet(db, community_id=meeting.community_id)
    if comm_wallet:
        comm_wallet.balance += platform_share
    
    # Find leader (first member with LEADER role)
    leader_member = db.query(models.CommunityMember).filter(
        models.CommunityMember.community_id == meeting.community_id,
        models.CommunityMember.role == models.MemberRole.LEADER
    ).first()
    
    if leader_member:
        leader_wallet = get_or_create_wallet(db, user_id=leader_member.user_id)
        if leader_wallet:
            leader_wallet.balance += leader_share
            db.add(models.Transaction(
                user_id=leader_member.user_id,
                amount=leader_share,
                type="CREDIT",
                description=f"Leader payout (90%) for meeting: {meeting.title}"
            ))
        
    db.commit()
    return True

def get_transactions(db: Session, user_id: int):
    return db.query(models.Transaction).filter(models.Transaction.user_id == user_id).order_by(models.Transaction.created_at.desc()).all()

# --- Venues ---
def create_venue(db: Session, venue: schemas.VenueBase):
    db_venue = models.Venue(**venue.dict())
    db.add(db_venue)
    db.commit()
    db.refresh(db_venue)
    return db_venue

def get_venues(db: Session):
    return db.query(models.Venue).all()

# --- Goals ---
def create_goal(db: Session, goal: schemas.GoalCreate):
    db_goal = models.Goal(**goal.dict())
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

def get_community_goals(db: Session, community_id: int):
    return db.query(models.Goal).filter(models.Goal.community_id == community_id).all()

def update_goal_progress(db: Session, goal_id: int, user_id: int, increment: int = 1, proof_url: str = None):
    progress = db.query(models.GoalProgress).filter(
        models.GoalProgress.goal_id == goal_id,
        models.GoalProgress.user_id == user_id
    ).first()
    
    if not progress:
        goal = db.query(models.Goal).filter(models.Goal.id == goal_id).first()
        progress = models.GoalProgress(
            goal_id=goal_id,
            user_id=user_id,
            target_value=1 if goal.goal_type == "WEEKLY" else 10
        )
        db.add(progress)
    
    progress.current_value += increment
    if proof_url:
        progress.proof_url = proof_url
        
    if progress.current_value >= progress.target_value:
        progress.is_completed = True
        
    db.commit()
    db.refresh(progress)
    return progress
