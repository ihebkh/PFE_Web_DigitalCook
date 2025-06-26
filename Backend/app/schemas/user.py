from pydantic import BaseModel, EmailStr
from typing import Optional

class UserAuth(BaseModel):
    email: str
    password: str

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None
    photo_url: Optional[str] = None

class AdminUserUpdate(BaseModel):
    name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    privilege: Optional[str] = None # Le label du privilège, ex: "TopAdmin"