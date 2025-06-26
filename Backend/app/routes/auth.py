from fastapi import APIRouter, HTTPException, Response, Cookie, Depends, Request, UploadFile, File
from app.db.mongo import get_mongo_collections
from typing import Optional
from app.schemas.user import UserAuth, UserProfileUpdate, AdminUserUpdate
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

@router.get("/users")
def get_all_users():
    _, users_col, _, _, privileges_col = get_mongo_collections()
    
    users_list = []
    for user_doc in users_col.find():
        privilege_label = "N/A"
        privilege_id = user_doc.get("privilege")
        
        if privilege_id:
            # Assurez-vous que l'ID est bien un ObjectId
            if not isinstance(privilege_id, ObjectId):
                try:
                    privilege_id = ObjectId(privilege_id)
                except Exception:
                    privilege_id = None
            
            if privilege_id:
                privilege_doc = privileges_col.find_one({"_id": privilege_id})
                if privilege_doc:
                    privilege_label = privilege_doc.get("label", "N/A")

        users_list.append({
            "id": str(user_doc["_id"]),
            "name": user_doc.get("name"),
            "last_name": user_doc.get("last_name"),
            "email": user_doc.get("email"),
            "photo_url": user_doc.get("photo_url"),
            "privilege": privilege_label
        })
    return users_list

@router.delete("/users/{user_id}")
def delete_user(user_id: str):
    _, users_col, _, _, _ = get_mongo_collections()
    
    try:
        object_id_to_delete = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Format de l'ID utilisateur invalide")

    delete_result = users_col.delete_one({"_id": object_id_to_delete})

    if delete_result.deleted_count == 0:
        raise HTTPException(status_code=404, detail=f"Utilisateur avec l'id {user_id} non trouvé")

    return {"status": "success", "message": f"Utilisateur {user_id} supprimé avec succès"}

@router.get("/privileges")
def get_all_privileges():
    _, _, _, _, privileges_col = get_mongo_collections()
    privileges = []
    for priv in privileges_col.find({}, {"_id": 1, "label": 1}):
        privileges.append({
            "id": str(priv["_id"]),
            "label": priv["label"]
        })
    return privileges

@router.put("/users/{user_id}")
def update_user_by_admin(user_id: str, user_update: AdminUserUpdate):
    _, users_col, _, _, privileges_col = get_mongo_collections()
    
    try:
        object_id_to_update = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Format de l'ID utilisateur invalide")

    update_data = user_update.dict(exclude_unset=True)
    
    # Si le privilège est mis à jour, il faut trouver son ObjectId
    if 'privilege' in update_data and update_data['privilege']:
        privilege_label = update_data.pop('privilege')
        privilege_doc = privileges_col.find_one({"label": privilege_label})
        if not privilege_doc:
            raise HTTPException(status_code=404, detail=f"Privilège '{privilege_label}' non trouvé")
        update_data['privilege'] = privilege_doc['_id']

    if not update_data:
        raise HTTPException(status_code=400, detail="Aucune donnée à mettre à jour")

    result = users_col.update_one(
        {"_id": object_id_to_update},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail=f"Utilisateur avec l'id {user_id} non trouvé")

    # Retourner l'utilisateur mis à jour avec les détails
    updated_user = users_col.find_one({"_id": object_id_to_update})
    # Joindre le label du privilège pour le retour
    privilege_doc = privileges_col.find_one({"_id": updated_user.get('privilege')})
    
    return {
        "id": str(updated_user["_id"]),
        "name": updated_user.get("name"),
        "last_name": updated_user.get("last_name"),
        "email": updated_user.get("email"),
        "photo_url": updated_user.get("photo_url"),
        "privilege": privilege_doc.get("label") if privilege_doc else "N/A"
    }

@router.post("/users/{user_id}/upload_photo")
def upload_user_photo_by_admin(user_id: str, file: UploadFile = File(...)):
    _, users_col, _, _, _ = get_mongo_collections()
    
    try:
        object_id_to_update = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Format de l'ID utilisateur invalide")

    # Vérifier si l'utilisateur existe
    if not users_col.find_one({"_id": object_id_to_update}):
        raise HTTPException(status_code=404, detail=f"Utilisateur avec l'id {user_id} non trouvé")

    # Enregistrer le fichier
    filename = f"user_{user_id}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())
    
    # Mettre à jour l'URL de la photo dans la BD
    photo_url = f"/uploads/{filename}"
    users_col.update_one({"_id": object_id_to_update}, {"$set": {"photo_url": photo_url}})
    
    return {"photo_url": photo_url}
