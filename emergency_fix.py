import sqlite3

db_path = "sql_app.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("--- Resetting Inventory Data ---")

# 1. Clear existing promotions and characters to avoid conflicts
cursor.execute("DELETE FROM promotions")
cursor.execute("DELETE FROM characters")

# 2. Seed Promotions with EXPLICIT IDs matching ShuBoomShop.jsx logic
# promo1 -> 1, promo2 -> 2, promo3 -> 3
promotions = [
    (1, "1+1 Кофе", "Купи один товар, получи второй такой же бесплатно.", "https://images.unsplash.com/photo-1549463595-b44c09ed8370?auto=format&fit=crop&q=80&w=200"),
    (2, "Скидка 20%", "Скидка 20% на любой заказ в Shu-Coffe.", "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=200"),
    (3, "XP Буст", "Ускоренное получение опыта в ShuBoom.", "https://images.unsplash.com/photo-1516245834210-c4c142787335?auto=format&fit=crop&q=80&w=200")
]
cursor.executemany("INSERT INTO promotions (id, title, description, image_url) VALUES (?, ?, ?, ?)", promotions)

# 3. Seed Characters with EXPLICIT IDs
chars = [
    (1, "Искатель", "Начальный персонаж", "COMMON", 0.5, "https://api.dicebear.com/7.x/notionists/svg?seed=Seeker&backgroundColor=f59e0b", "https://modelviewer.dev/shared-assets/models/Astronaut.glb"),
    (2, "Романтик", "Любит приключения", "COMMON", 0.5, "https://api.dicebear.com/7.x/notionists/svg?seed=Romantic&backgroundColor=ec4899", "https://modelviewer.dev/shared-assets/models/RobotExpressive.glb"),
    (3, "Ценитель", "Ищет прекрасное", "RARE", 0.3, "https://api.dicebear.com/7.x/notionists/svg?seed=Connoisseur&backgroundColor=8b5cf6", "https://modelviewer.dev/shared-assets/models/Horse.glb"),
    (4, "Эстет", "Любит стиль", "RARE", 0.3, "https://api.dicebear.com/7.x/notionists/svg?seed=Aesthete&backgroundColor=06b6d4", "https://modelviewer.dev/shared-assets/models/NeilArmstrong.glb"),
    (5, "Мечтатель", "Видит сны наяву", "RARE", 0.2, "https://api.dicebear.com/7.x/notionists/svg?seed=Dreamer&backgroundColor=6366f1", "https://modelviewer.dev/shared-assets/models/Astronaut.glb"),
    (6, "Философ", "Ищет смысл", "LEGENDARY", 0.1, "https://api.dicebear.com/7.x/notionists/svg?seed=Philosopher&backgroundColor=10b981", "https://modelviewer.dev/shared-assets/models/AlphaBlendModeTest.glb"),
    (7, "Футурист", "Смотрит в будущее", "LEGENDARY", 0.05, "https://api.dicebear.com/7.x/notionists/svg?seed=Futurist&backgroundColor=eab308", "https://modelviewer.dev/shared-assets/models/NeilArmstrong.glb")
]
cursor.executemany("INSERT INTO characters (id, name, description, rarity, drop_weight, image_2d, model_3d) VALUES (?, ?, ?, ?, ?, ?, ?)", chars)

# 4. Ensure all users have a starter character
cursor.execute("SELECT id, phone FROM users")
users = cursor.fetchall()

for user_id, phone in users:
    cursor.execute("SELECT count(*) FROM user_collections WHERE user_id = ?", (user_id,))
    if cursor.fetchone()[0] == 0:
        print(f"Adding character to {phone}...")
        cursor.execute("INSERT INTO user_collections (user_id, character_id, quantity, level, characteristics) VALUES (?, 1, 1, 1, '{}')", (user_id,))
        cursor.execute("UPDATE users SET equipped_character_id = 1 WHERE id = ?", (user_id,))

# 5. Reset user coupons for testing if needed
# cursor.execute("UPDATE users SET coupons = '[1, 2, 3]'") # Optional: grant all to test

conn.commit()
conn.close()
print("Emergency fix applied successfully.")
