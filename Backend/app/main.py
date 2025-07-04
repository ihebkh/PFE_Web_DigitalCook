from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.Controllers import auth
from app.Controllers import analyse
from app.Databases.mongo import get_mongo_collections

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://192.168.1.12:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(analyse.router, prefix="/analyse", tags=["analyse"])
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

