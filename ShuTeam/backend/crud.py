from typing import List
from sqlalchemy.orm import Session

from sqlalchemy import or_, func
import models, schemas, security
from decimal import Decimal
import datetime

# --- Auth / Users ---
def hash_password(password: str) -> str:
    return security.get_password_hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return security.verify_password(plain, hashed)

def get_user_by_phone(db: Session, phone: str):
    return db.query(models.User).filter(models.User.phone == phone).first()

def get_user_by_id(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def register_user(db: Session, data: schemas.RegisterRequest):
    """Create user with hashed password. Returns None if phone already exists."""
    if get_user_by_phone(db, data.phone):
        return None
    db_user = models.User(
        phone=data.phone,
        name=data.name,
        city=getattr(data, 'city', None),
        password_hash=hash_password(data.password),
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_profile(db: Session, user_id: int, data: schemas.ProfileUpdate):
    user = get_user_by_id(db, user_id)
    if not user:
        return None
    if data.name is not None:
        user.name = data.name
    if data.bio is not None:
        user.bio = data.bio
    if data.city is not None:
        user.city = data.city
    if data.avatar_url is not None:
        user.avatar_url = data.avatar_url
    db.commit()
    db.refresh(user)
    return user

def create_user(db: Session, user: schemas.UserCreate):
    """Legacy helper used by other endpoints for phone-only auto-create."""
    existing = get_user_by_phone(db, user.phone)
    if existing:
        return existing
    db_user = models.User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- Communities ---
def create_community(db: Session, community: schemas.CommunityCreate, leader_id: int = None):
    db_community = models.Community(**community.dict())
    db.add(db_community)
    db.commit()
    db.refresh(db_community)
    
    if leader_id:
        add_member(db, db_community.id, leader_id, role="LEADER")
        
    return db_community

def update_community(db: Session, community_id: int, community_update: schemas.CommunityUpdate):
    db_community = db.query(models.Community).filter(models.Community.id == community_id).first()
    if not db_community:
        return None
    
    update_data = community_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_community, key, value)
    
    db.commit()
    db.refresh(db_community)
    return db_community

def delete_community(db: Session, community_id: int):
    db_community = db.query(models.Community).filter(models.Community.id == community_id).first()
    if db_community:
        db.delete(db_community)
        db.commit()
        return True
    return False

def get_community(db: Session, community_id: int, user_id: int = None):
    comm = db.query(models.Community).filter(models.Community.id == community_id).first()
    if comm:
        comm.members_count = db.query(models.CommunityMember).filter(
            models.CommunityMember.community_id == comm.id,
            models.CommunityMember.status == models.MemberStatus.APPROVED
        ).count()
        if user_id:
            member = db.query(models.CommunityMember).filter(
                models.CommunityMember.community_id == community_id,
                models.CommunityMember.user_id == user_id
            ).first()
            if member:
                comm.user_role = member.role
                comm.user_status = member.status
    return comm

def get_communities(db: Session, skip: int = 0, limit: int = 100, search: str = None, category: str = None, city: str = None):
    # Use subquery to count approved members to avoid N+1
    member_count_sub = db.query(
        models.CommunityMember.community_id,
        func.count(models.CommunityMember.id).label('count')
    ).filter(models.CommunityMember.status == models.MemberStatus.APPROVED)\
     .group_by(models.CommunityMember.community_id).subquery()

    query = db.query(
        models.Community,
        func.coalesce(member_count_sub.c.count, 0).label('members_count')
    ).outerjoin(member_count_sub, models.Community.id == member_count_sub.c.community_id)

    if search and search.strip():
        query = query.filter(models.Community.name.ilike(f"%{search.strip()}%"))
    if category and category.strip():
        query = query.filter(models.Community.category.ilike(category.strip()))
    if city and city.strip():
        query = query.filter(models.Community.city.ilike(city.strip()))
    
    results = query.order_by(models.Community.id.desc()).offset(skip).limit(limit).all()
    
    final_results = []
    for comm, members_count in results:
        comm.members_count = members_count
        final_results.append(comm)
    return final_results

# --- Members ---
def add_member(db: Session, community_id: int, user_id: int, role: str = "MEMBER"):
    existing = db.query(models.CommunityMember).filter(
        models.CommunityMember.community_id == community_id,
        models.CommunityMember.user_id == user_id
    ).first()
    if existing:
        return existing

    comm = db.query(models.Community).filter(models.Community.id == community_id).first()
    status = models.MemberStatus.APPROVED
    if role == "MEMBER" and comm and comm.privacy_type != models.PrivacyType.OPEN:
        status = models.MemberStatus.PENDING

    db_member = models.CommunityMember(
        community_id=community_id,
        user_id=user_id,
        role=role,
        status=status
    )
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member

def get_user_communities(db: Session, user_id: int):
    results = db.query(models.Community, models.CommunityMember.role)\
        .join(models.CommunityMember)\
        .filter(
            models.CommunityMember.user_id == user_id,
            models.CommunityMember.status == models.MemberStatus.APPROVED
        )\
        .order_by(models.Community.id.desc()).all()
    
    final = []
    for comm, role in results:
        comm.user_role = role
        comm.members_count = db.query(models.CommunityMember)\
            .filter(
                models.CommunityMember.community_id == comm.id,
                models.CommunityMember.status == models.MemberStatus.APPROVED
            ).count()
        final.append(comm)
    return final

def get_community_members(db: Session, community_id: int):
    # Returns the list of joined users for a community (APPROVED only)
    memberships = db.query(models.CommunityMember).filter(
        models.CommunityMember.community_id == community_id,
        models.CommunityMember.status == models.MemberStatus.APPROVED
    ).all()
    
    if not memberships:
        return []

    user_ids = [m.user_id for m in memberships]
    users = db.query(models.User).filter(models.User.id.in_(user_ids)).all()
    user_dict = {u.id: u for u in users}

    # Pre-fetch goal counts to avoid N+1 problem
    goal_counts = db.query(models.GoalProgress.user_id, func.count(models.GoalProgress.id))\
        .join(models.Goal)\
        .filter(
            models.GoalProgress.user_id.in_(user_ids),
            models.Goal.community_id == community_id,
            models.GoalProgress.is_completed == True
        ).group_by(models.GoalProgress.user_id).all()
    goal_dict = {uid: count for uid, count in goal_counts}

    # Pre-fetch meeting attendances to avoid N+1 problem
    meeting_counts = db.query(models.MeetingRegistration.user_id, func.count(models.MeetingRegistration.id))\
        .join(models.Meeting)\
        .filter(
            models.MeetingRegistration.user_id.in_(user_ids),
            models.Meeting.community_id == community_id,
            models.MeetingRegistration.is_attended == True
        ).group_by(models.MeetingRegistration.user_id).all()
    meeting_dict = {uid: count for uid, count in meeting_counts}

    results = []
    for m in memberships:
        user = user_dict.get(m.user_id)
        if user:
            completed_goals = goal_dict.get(user.id, 0)
            attended_meetings = meeting_dict.get(user.id, 0)
            
            points = (completed_goals * 50) + (attended_meetings * 10)
            
            results.append({
                "id": user.id,
                "name": user.name or user.phone,
                "phone": user.phone,
                "avatar_url": user.avatar_url,
                "role": m.role,
                "points": points
            })
            
    # Sort results by points descending
    results.sort(key=lambda x: x["points"], reverse=True)
    return results

def get_pending_members(db: Session, community_id: int):
    # Returns the list of users with PENDING status
    memberships = db.query(models.CommunityMember).filter(
        models.CommunityMember.community_id == community_id,
        models.CommunityMember.status == models.MemberStatus.PENDING
    ).all()
    results = []
    for m in memberships:
        user = get_user_by_id(db, m.user_id)
        if user:
            results.append({
                "id": user.id,
                "membership_id": m.id,
                "name": user.name or user.phone,
                "phone": user.phone,
                "avatar_url": user.avatar_url,
                "role": m.role
            })
    return results

def update_membership_status(db: Session, membership_id: int, status: str):
    membership = db.query(models.CommunityMember).filter(models.CommunityMember.id == membership_id).first()
    if membership:
        membership.status = status
        db.commit()
        db.refresh(membership)
        return membership
    return None

# --- Meetings ---
def create_meeting(db: Session, meeting: schemas.MeetingCreate):
    meeting_data = meeting.dict(exclude={"community_name", "community_category"})
    db_meeting = models.Meeting(**meeting_data)
    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)
    return db_meeting

def get_meetings(db: Session, community_id: int = None, user_id: int = None, include_open: bool = False):
    from sqlalchemy.orm import joinedload
    
    # Pre-fetch registration counts to avoid N+1
    reg_count_sub = db.query(
        models.MeetingRegistration.meeting_id,
        func.count(models.MeetingRegistration.id).label('count')
    ).group_by(models.MeetingRegistration.meeting_id).subquery()

    query = db.query(
        models.Meeting,
        func.coalesce(reg_count_sub.c.count, 0).label('reg_count')
    ).outerjoin(reg_count_sub, models.Meeting.id == reg_count_sub.c.meeting_id)\
     .options(joinedload(models.Meeting.community))

    if community_id:
        query = query.filter(models.Meeting.community_id == community_id)
    elif user_id:
        from sqlalchemy import exists
        membership_subquery = exists().where(
            models.CommunityMember.community_id == models.Meeting.community_id
        ).where(
            models.CommunityMember.user_id == user_id
        )
        if include_open:
            query = query.filter(or_(membership_subquery, models.Meeting.is_open == True))
        else:
            query = query.filter(membership_subquery)
    
    meetings = query.order_by(models.Meeting.date_time.asc()).all()
    
    final_meetings = []
    for m, reg_count in meetings:
        m.registration_count = reg_count
        if m.community:
            m.community_name = m.community.name
            m.community_category = m.community.category
        final_meetings.append(m)
    return final_meetings

# --- Registrations ---
def get_meeting_registration(db: Session, meeting_id: int, user_id: int):
    return db.query(models.MeetingRegistration).filter(
        models.MeetingRegistration.meeting_id == meeting_id,
        models.MeetingRegistration.user_id == user_id
    ).first()

def register_user_for_meeting(db: Session, meeting_id: int, user_id: int, commit: bool = True):
    existing = get_meeting_registration(db, meeting_id, user_id)
    if existing:
        return existing

    db_reg = models.MeetingRegistration(meeting_id=meeting_id, user_id=user_id)
    db.add(db_reg)
    if commit:
        db.commit()
        db.refresh(db_reg)
    else:
        db.flush()
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
def get_or_create_wallet(db: Session, user_id: int = None, community_id: int = None, commit: bool = True):
    if user_id:
        query = db.query(models.Wallet).filter(models.Wallet.user_id == user_id)
        defaults = {"user_id": user_id, "balance": 10000}  # 10k starting tokens for demo
    elif community_id:
        query = db.query(models.Wallet).filter(models.Wallet.community_id == community_id)
        defaults = {"community_id": community_id, "balance": 0}
    else:
        raise ValueError("user_id or community_id is required")

    wallet = query.with_for_update().first()
    if not wallet:
        wallet = models.Wallet(**defaults)
        db.add(wallet)
        if commit:
            db.commit()
            db.refresh(wallet)
        else:
            db.flush()
    return wallet

def process_meeting_payment(db: Session, meeting: models.Meeting, user_id: int):
    """Stages the payment in the current transaction; the caller commits."""
    if not meeting.cost or meeting.cost <= 0:
        return True

    user_wallet = get_or_create_wallet(db, user_id=user_id, commit=False)
    if user_wallet.balance < meeting.cost:
        return False
        
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
    comm_wallet = get_or_create_wallet(db, community_id=meeting.community_id, commit=False)
    comm_wallet.balance += platform_share
    
    # Find leader (first member with LEADER role)
    leader_member = db.query(models.CommunityMember).filter(
        models.CommunityMember.community_id == meeting.community_id,
        models.CommunityMember.role == models.MemberRole.LEADER
    ).first()
    
    if leader_member:
        leader_wallet = get_or_create_wallet(db, user_id=leader_member.user_id, commit=False)
        leader_wallet.balance += leader_share
        db.add(models.Transaction(
            user_id=leader_member.user_id,
            amount=leader_share,
            type="CREDIT",
            description=f"Leader payout (90%) for meeting: {meeting.title}"
        ))

    db.flush()
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

def update_goal_progress(db: Session, goal: models.Goal, user_id: int, increment: int = 1, proof_urls: List[str] = None):
    goal_id = goal.id
    progress = db.query(models.GoalProgress).filter(
        models.GoalProgress.goal_id == goal_id,
        models.GoalProgress.user_id == user_id
    ).first()

    if not progress:
        progress = models.GoalProgress(
            goal_id=goal_id,
            user_id=user_id,
            current_value=0,
            target_value=1 if goal.goal_type == "WEEKLY" else 10
        )
        db.add(progress)
    
    progress.current_value += increment
    if proof_urls:
        if not progress.proof_urls:
            progress.proof_urls = []
        # Append new proof urls if list or replace if single string
        if isinstance(proof_urls, list):
            progress.proof_urls = list(set(progress.proof_urls + proof_urls))
        else:
            progress.proof_urls = list(set(progress.proof_urls + [proof_urls]))


    if progress.current_value >= progress.target_value:
        if goal and goal.requires_moderation:
            if progress.status != models.GoalStatus.APPROVED:
                progress.status = models.GoalStatus.PENDING
        else:
            # Auto-approve if no moderation required
            progress.status = models.GoalStatus.APPROVED
            if not progress.is_completed:
                award_badge_internal(db, user_id, goal)
                progress.is_completed = True
        
    db.commit()
    db.refresh(progress)
    return progress

def award_badge_internal(db: Session, user_id: int, goal: models.Goal):
    if goal and goal.reward_badge_id:
        existing_badge = db.query(models.UserBadge).filter(
            models.UserBadge.user_id == user_id,
            models.UserBadge.badge_id == goal.reward_badge_id
        ).first()
        if not existing_badge:
            db_ub = models.UserBadge(user_id=user_id, badge_id=goal.reward_badge_id)
            db.add(db_ub)

def approve_goal_progress(db: Session, progress_id: int):
    progress = db.query(models.GoalProgress).filter(models.GoalProgress.id == progress_id).first()
    if not progress: return None
    
    progress.status = models.GoalStatus.APPROVED
    progress.is_completed = True
    
    goal = db.query(models.Goal).filter(models.Goal.id == progress.goal_id).first()
    award_badge_internal(db, progress.user_id, goal)
    
    db.commit()
    db.refresh(progress)
    return progress

def get_user_badges_list(db: Session, user_id: int):
    return db.query(models.Badge).join(models.UserBadge).filter(models.UserBadge.user_id == user_id).all()

def reject_goal_progress(db: Session, progress_id: int):
    progress = db.query(models.GoalProgress).filter(models.GoalProgress.id == progress_id).first()
    if not progress: return None
    
    progress.status = models.GoalStatus.REJECTED
    # Optionally reset progress or just leave it for user to fix proof
    db.commit()
    db.refresh(progress)
    return progress

def get_pending_proofs(db: Session, community_id: int):
    return db.query(models.GoalProgress).join(models.Goal).filter(
        models.Goal.community_id == community_id,
        models.GoalProgress.status == models.GoalStatus.PENDING
    ).all()
# --- Analytics ---
def get_community_stats(db: Session, community_id: int):
    # 1. Member Growth (Last 6 months)
    today = datetime.datetime.utcnow()
    growth = []
    months = []
    month_names = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек']
    
    for i in range(5, -1, -1):
        # Calculate start of month accurately
        target_month = today.month - i
        target_year = today.year
        while target_month <= 0:
            target_month += 12
            target_year -= 1
        
        start_date = datetime.datetime(target_year, target_month, 1)
        
        # Calculate end of month (start of next)
        if target_month == 12:
            end_date = datetime.datetime(target_year + 1, 1, 1)
        else:
            end_date = datetime.datetime(target_year, target_month + 1, 1)
            
        count = db.query(models.CommunityMember).filter(
            models.CommunityMember.community_id == community_id,
            models.CommunityMember.joined_at >= start_date,
            models.CommunityMember.joined_at < end_date
        ).count()
        
        growth.append(count)
        months.append(month_names[start_date.month - 1])
        
    # 2. Activity Summary
    meetings = db.query(models.Meeting).filter(models.Meeting.community_id == community_id).all()
    meeting_ids = [m.id for m in meetings]
    
    total_meetings = len(meetings)
    total_regs = db.query(models.MeetingRegistration).filter(models.MeetingRegistration.meeting_id.in_(meeting_ids)).count() if meeting_ids else 0
    total_attended = db.query(models.MeetingRegistration).filter(
        models.MeetingRegistration.meeting_id.in_(meeting_ids),
        models.MeetingRegistration.is_attended == True
    ).count() if meeting_ids else 0
    
    # 3. Revenue (Leader payout)
    # We find the leader first to check their transactions, or just calculate from meetings
    revenue = db.query(models.Transaction).join(models.User).join(models.CommunityMember).filter(
        models.CommunityMember.community_id == community_id,
        models.CommunityMember.role == models.MemberRole.LEADER,
        models.Transaction.type == "CREDIT"
    ).all()
    total_revenue = sum(t.amount for t in revenue)
    
    return {
        "months": months,
        "growth": growth,
        "total_meetings": total_meetings,
        "total_registrations": total_regs,
        "total_attended": total_attended,
        "total_revenue": float(total_revenue),
        "active_members_count": db.query(models.CommunityMember).filter(models.CommunityMember.community_id == community_id).count() # Simple version
    }

# --- Gallery ---
def create_gallery_item(db: Session, community_id: int, item: schemas.GalleryItemCreate):
    # We use community_id from the URL to be safe, though it should match the body
    db_item = models.GalleryItem(
        community_id=community_id,
        image_urls=item.image_urls,
        caption=item.caption
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def get_community_gallery(db: Session, community_id: int):
    return db.query(models.GalleryItem).filter(models.GalleryItem.community_id == community_id).order_by(models.GalleryItem.created_at.desc()).all()
