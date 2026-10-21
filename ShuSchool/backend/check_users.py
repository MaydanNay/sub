
import models
from database import SessionLocal

db = SessionLocal()
users = db.query(models.User).all()
print(f"Total users: {len(users)}")
for u in users:
    print(f"ID: {u.id}, Username: {u.username}, Role: {u.role}, Phone: {u.phone_number}, Approved: {u.is_approved}")
db.close()
