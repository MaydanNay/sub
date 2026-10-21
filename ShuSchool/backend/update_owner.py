
import models, auth, os
from database import SessionLocal
from dotenv import load_dotenv
load_dotenv()

db = SessionLocal()
owner_phone = os.getenv("OWNER_PHONE", "+77024383624")
owner_password = os.getenv("OWNER_PASSWORD", "Maydan2000223")

owner = db.query(models.User).filter(models.User.phone_number == owner_phone).first()
if owner:
    print(f"Updating owner {owner.username} password to match current environment...")
    owner.hashed_password = auth.get_password_hash(owner_password)
    db.commit()
    print("Owner password updated!")
else:
    print("Owner not found in database.")
db.close()
