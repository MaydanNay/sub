import requests
import json

BASE_URL = "http://localhost:8001/api/v1"
user_phone = "guest_1772038105032_706bu6652" # The test user from my DB search

def test_api():
    print(f"--- Testing user profile for {user_phone} ---")
    try:
        user_res = requests.get(f"{BASE_URL}/user/{user_phone}")
        print(f"Status: {user_res.status_code}")
        print(json.dumps(user_res.json(), indent=2, ensure_ascii=False))
    except Exception as e:
        print(f"Error fetching user: {e}")

    print("\n--- Testing collection ---")
    try:
        coll_res = requests.get(f"{BASE_URL}/collection/{user_phone}")
        print(f"Status: {coll_res.status_code}")
        print(json.dumps(coll_res.json(), indent=2, ensure_ascii=False))
    except Exception as e:
        print(f"Error fetching collection: {e}")

    print("\n--- Testing promotions ---")
    try:
        promo_res = requests.get(f"{BASE_URL}/promotions")
        print(f"Status: {promo_res.status_code}")
        print(f"Found {len(promo_res.json())} promotions")
    except Exception as e:
        print(f"Error fetching promotions: {e}")

if __name__ == "__main__":
    test_api()
