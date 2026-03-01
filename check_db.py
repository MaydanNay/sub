import sqlite3

db_path = "sql_app.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

def check(query, title):
    print(f"\n--- {title} ---")
    try:
        cursor.execute(query)
        cols = [description[0] for description in cursor.description]
        print(cols)
        rows = cursor.fetchall()
        for row in rows:
            print(row)
        print(f"Total: {len(rows)}")
    except Exception as e:
        print(f"Error: {e}")

check("SELECT count(*) FROM users", "User Count")
check("SELECT phone, coins, skins, coupons FROM users WHERE skins != '[]' OR coupons != '[]'", "Users with Items")
check("SELECT * FROM user_collections", "Collection Entries")
check("SELECT * FROM promotions", "Promotions")

conn.close()
