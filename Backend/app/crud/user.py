from app.db.mongo import get_mongo_collections

def authenticate_user(email: str, password: str):
    _, users_col, _, _, _ = get_mongo_collections()
    print(f"Trying to authenticate: {email} / {password}")
    user = users_col.find_one({"email": email, "password": password})
    print(f"User found: {user}")
    return user