from fastapi import APIRouter, UploadFile, File
from typing import List
from pymongo import MongoClient
from PIL import Image
import pytesseract
import fitz
import io
import re

router = APIRouter()

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def get_mongodb_connection():
    MONGO_URI = "mongodb+srv://iheb:Kt7oZ4zOW4Fg554q@cluster0.5zmaqup.mongodb.net/"
    client = MongoClient(MONGO_URI)
    db = client["PowerBi"]
    return client, db["offredemplois"]

def extract_text_from_pdf_file(file_bytes: bytes) -> str:
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    full_text = ""
    for page in doc:
        pix = page.get_pixmap(dpi=300)
        img = Image.open(io.BytesIO(pix.tobytes()))
        text = pytesseract.image_to_string(img, lang="fra+eng")
        full_text += text + "\n"
    return full_text

def match_items(text, items):
    return [item for item in items if re.search(rf"\b{re.escape(item)}\b", text, re.IGNORECASE)]

def extract_keywords_from_text_block(block):
    if not block:
        return []
    return [item.strip() for item in re.split(r",|;|\n", block) if item.strip()]

def clean_langues(langues):
    return [re.sub(r"\s*\(.*?\)", "", l).strip() for l in langues]

@router.post("/match-offres/")
async def match_offres_from_cvs(cv_files: List[UploadFile] = File(...)):
    client, collection = get_mongodb_connection()
    offres = list(collection.find(
        {"status": "active"},
        {
            "_id": 1,
            "titre": 1,
            "tagsRefernencement": 1,
            "langue": 1,
            "competenceRequises": 1,
            "minSalaire": 1,
            "maxSalaire": 1,
            "deviseSalaire": 1,
            "pays": 1,
            "ville": 1,
            "typeContrat": 1,
            "tempsDeTravail": 1,
            "onSiteOrRemote": 1,
            "societe": 1,
            "lieuSociete": 1
        }
    ))

    all_cv_texts = {}
    for file in cv_files:
        file_bytes = await file.read()
        text = extract_text_from_pdf_file(file_bytes)
        all_cv_texts[file.filename] = text

    offre_best_match = []

    for offre in offres:
        best_score = 0
        best_cv = None

        offre_id = str(offre.get("_id"))
        titre = offre.get("titre", "")
        tags = offre.get("tagsRefernencement", [])
        langues_raw = offre.get("langue", [])
        langues = clean_langues(langues_raw)
        competences = extract_keywords_from_text_block(offre.get("competenceRequises", ""))

        nb_tags = len(tags)
        nb_langues = len(langues)
        nb_comp = len(competences)

        for filename, texte_cv in all_cv_texts.items():
            tags_matches = match_items(texte_cv, tags)
            langues_matches = match_items(texte_cv, langues)
            competences_matches = match_items(texte_cv, competences)

            score_tags = len(tags_matches) / nb_tags if nb_tags else 0
            score_langues = len(langues_matches) / nb_langues if nb_langues else 0
            score_comp = len(competences_matches) / nb_comp if nb_comp else 0

            score_total = round(score_comp * 0.8 + score_tags * 0.1 + score_langues * 0.1, 3)

            if score_total > best_score:
                best_score = score_total
                best_cv = filename

        if best_score > 0:
            min_salaire = offre.get("minSalaire", "")
            max_salaire = offre.get("maxSalaire", "")
            devise = offre.get("deviseSalaire", "")
            min_salaire_format = f"{min_salaire} {devise}" if min_salaire and devise else ""
            max_salaire_format = f"{max_salaire} {devise}" if max_salaire and devise else ""

            offre_best_match.append({
                "offre_id": offre_id,
                "titre": titre,
                "matched_cv": best_cv,
                "score": best_score,
                "minSalaireFormat": min_salaire_format,
                "maxSalaireFormat": max_salaire_format,
                "pays": offre.get("pays", ""),
                "ville": offre.get("ville", ""),
                "typeContrat": offre.get("typeContrat", ""),
                "tempsDeTravail": offre.get("tempsDeTravail", ""),
                "onSiteOrRemote": offre.get("onSiteOrRemote", ""),
                "societe": offre.get("societe", ""),
                "lieuSociete": offre.get("lieuSociete", "")
            })

    offre_best_match = sorted(offre_best_match, key=lambda x: x["score"], reverse=True)[:4]
    return {"offres_matchees": offre_best_match}
