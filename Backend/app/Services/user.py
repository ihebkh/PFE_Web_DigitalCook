from app.Databases.mongo import get_mongo_collections

def authenticate_user(email: str, password: str):
    """Tente d'authentifier un utilisateur par email et mot de passe (en clair)."""
    _, users_col, _, _, _ = get_mongo_collections()
    user = users_col.find_one({"email": email, "password": password})
    return user