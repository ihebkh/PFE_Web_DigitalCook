from fastapi import APIRouter, HTTPException
from app.schemas.user import UserAuth
from app.crud.user import authenticate_user

router = APIRouter()

@router.post("/login")
def login(user: UserAuth):
    db_user = authenticate_user(user.email, user.password)
    if not db_user:
        return {"status": "invalide"}
    return {
        "status": "valide",
        "nom": db_user.get("last_name"),
        "prenom": db_user.get("name"),
        "email": db_user.get("email")
    }
