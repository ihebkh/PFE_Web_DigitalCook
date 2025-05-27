from fastapi import APIRouter
from app.db.mongo import get_mongo_collections
from app.crud.offresemplois import enrich_offres_with_labels

router = APIRouter()

@router.get("/offres")
def read_offres():
    _, _, offres_col, secteur_col = get_mongo_collections()
    offres = enrich_offres_with_labels(offres_col, secteur_col)
    return offres
