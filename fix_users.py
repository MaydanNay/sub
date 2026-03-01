import sqlite3

db_path = "sql_app.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# 1. Ensure promotions are committed (redundant but safe)
# (Done in main.py fix)

# 2. Find all users
cursor.execute("SELECT id, phone FROM users")
users = cursor.fetchall()

# 3. Get starter character ID
cursor.execute("SELECT id FROM characters WHERE name = 'Искатель'")
starter_char_row = cursor.fetchone()

if starter_char_row:
    starter_id = starter_char_row[0]
    for user_id, phone in users:
        # Check if user has any character
        cursor.execute("SELECT count(*) FROM user_collections WHERE user_id = ?", (user_id,))
        count = cursor.fetchone()[0]
        
        if count == 0:
            print(f"Granting starter character to user {phone}...")
            cursor.execute("INSERT INTO user_collections (user_id, character_id, quantity, level, characteristics) VALUES (?, ?, 1, 1, '{}')", (user_id, starter_id))
            cursor.execute("UPDATE users SET equipped_character_id = ? WHERE id = ?", (starter_id, user_id))

conn.commit()
conn.close()
print("Migration complete.")
