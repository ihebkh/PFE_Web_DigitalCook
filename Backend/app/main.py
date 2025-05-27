from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import offreemplois, auth, cv_ocr

app = FastAPI()

# Configuration CORS
origins = [
    "http://localhost:3000",  # ton frontend React en dev
    # ajoute d'autres origines si besoin, ex : production
    # "https://ton-domaine.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # autorise toutes les origines (à ne pas laisser en prod)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusion des routes
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(cv_ocr.router, prefix="/cv", tags=["cv"])
app.include_router(offreemplois.router, prefix="/api", tags=["offres"])
