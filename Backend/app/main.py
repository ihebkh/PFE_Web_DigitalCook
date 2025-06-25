from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, cv_ocr
from fastapi.staticfiles import StaticFiles

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
app.include_router(cv_ocr.router, prefix="/cv", tags=["cv"])
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

