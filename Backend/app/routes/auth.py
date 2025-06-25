from fastapi import APIRouter, HTTPException, Response, Cookie, Depends, Request, UploadFile, File
from app.db.mongo import get_mongo_collections
from typing import Optional
from app.schemas.user import UserAuth, UserProfileUpdate
from app.crud.user import authenticate_user
from bson import ObjectId
from fastapi.responses import JSONResponse, FileResponse
import os

router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../uploads')
os.makedirs(UPLOAD_DIR, exist_ok=True)

def create_session_cookie(response: Response, email: str):
    response.set_cookie(
        key="session_id",
        value=email,
        httponly=True,
        secure=False,
        samesite="Lax",
        max_age=3600,
    )

# Dependency to get current user (reusable)
def get_current_active_user(session_id: Optional[str] = Cookie(None)):
    if not session_id:
        raise HTTPException(status_code=401, detail="Non authentifié")
    _, users_col, _, _, _ = get_mongo_collections()
    user = users_col.find_one({"email": session_id})
    if not user:
        raise HTTPException(status_code=401, detail="Utilisateur invalide")
    return user

@router.post("/login")
def login(user: UserAuth, response: Response):
    _, users_col, _, _, privileges_col = get_mongo_collections()
    
    db_user = authenticate_user(user.email, user.password)
    if not db_user:
        raise HTTPException(status_code=401, detail="Email ou mot de passe invalide")
    
    privilege_id = db_user.get("privilege")
    role_label = None
    if privilege_id:
        privilege_doc = privileges_col.find_one({"_id": ObjectId(privilege_id)})
        if privilege_doc:
            role_label = privilege_doc.get("label")
    
    create_session_cookie(response, db_user["email"])
    return {
        "status": "valide",
        "nom": db_user.get("last_name"),
        "prenom": db_user.get("name"),
        "email": db_user.get("email"),
        "role": role_label,
        "photo_url": db_user.get("photo_url")
    }
    
@router.get("/current_user")
def get_current_user(current_user: dict = Depends(get_current_active_user)):
    return {
        "nom": current_user.get("last_name"),
        "prenom": current_user.get("name"),
        "email": current_user.get("email"),
        "photo_url": current_user.get("photo_url")
    }
    
@router.get("/logout")
def logout(response: Response):
    response.delete_cookie("session_id")
    return {"message": "Déconnexion réussie"}

@router.put("/profile")
def update_profile(user_update: UserProfileUpdate, current_user: dict = Depends(get_current_active_user)):
    _, users_col, _, _, _ = get_mongo_collections()
    
    user_id = current_user["_id"]
    update_fields = {}

    # Update name and last_name
    if user_update.name is not None: 
        update_fields["name"] = user_update.name
    if user_update.last_name is not None: 
        update_fields["last_name"] = user_update.last_name
    
    # Update email
    if user_update.email is not None and user_update.email != current_user["email"]:
        # Check if new email already exists
        if users_col.find_one({"email": user_update.email}):
            raise HTTPException(status_code=400, detail="Cet email est déjà utilisé.")
        update_fields["email"] = user_update.email
    
    # Update photo_url
    if user_update.photo_url is not None:
        update_fields["photo_url"] = user_update.photo_url
    
    # Password change logic (reverted to plain text)
    if user_update.new_password:
        if not user_update.current_password:
            raise HTTPException(status_code=400, detail="Le mot de passe actuel est requis pour changer le mot de passe.")
        
        # Direct plain-text comparison of current password
        stored_password = current_user.get("password")
        if stored_password is None:
            raise HTTPException(status_code=500, detail="Erreur serveur: Le mot de passe de l'utilisateur n'a pas pu être récupéré.")
            
        if user_update.current_password != stored_password:
            raise HTTPException(status_code=401, detail="Mot de passe actuel incorrect.")
        
        update_fields["password"] = user_update.new_password # Store new password in plain text

    if not update_fields:
        raise HTTPException(status_code=400, detail="Aucune information à mettre à jour.")

    print('update_fields:', update_fields)  # DEBUG
    users_col.update_one({"_id": user_id}, {"$set": update_fields})
    
    # Fetch updated user to return latest data (especially if email changed for session cookie)
    updated_user_doc = users_col.find_one({"_id": user_id})
    
    if updated_user_doc:
        return {
            "nom": updated_user_doc.get("last_name"),
            "prenom": updated_user_doc.get("name"),
            "email": updated_user_doc.get("email"),
            "photo_url": updated_user_doc.get("photo_url")
        }
    raise HTTPException(status_code=500, detail="Échec de la récupération de l'utilisateur mis à jour.")

@router.post("/upload_photo")
def upload_photo(file: UploadFile = File(...), current_user: dict = Depends(get_current_active_user)):
    _, users_col, _, _, _ = get_mongo_collections()
    user_id = current_user["_id"]
    filename = f"user_{str(user_id)}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())
    # Construire l'URL d'accès à la photo
    photo_url = f"/uploads/{filename}"
    users_col.update_one({"_id": user_id}, {"$set": {"photo_url": photo_url}})
    return {"photo_url": photo_url}
