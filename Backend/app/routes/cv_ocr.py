from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import fitz
import pytesseract
from PIL import Image
import io
import spacy
import re

# Configuration du chemin Tesseract (à adapter si besoin)
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# Charger le modèle spaCy français
nlp = spacy.load("fr_core_news_md")

router = APIRouter()

def pdf_to_text_with_ocr(file_bytes: bytes) -> str:
    """Extraction texte OCR à partir d'un PDF en bytes."""
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    full_text = ""
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        pix = page.get_pixmap(dpi=300)
        img = Image.open(io.BytesIO(pix.tobytes()))
        text = pytesseract.image_to_string(img, lang='fra')
        full_text += text + "\n"
    return full_text

def extract_clean_name(text: str) -> str | None:
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    if not lines:
        return None
    first_line = lines[0]
    keywords = ["EXPERIENCE", "PROFESSIONNELLE", "FORMATION", "COMPETENCES",
                "LANGUES", "CENTRES", "INTERET", "OBJECTIF", "PROFIL"]
    for kw in keywords:
        pattern = re.compile(r'\b' + kw + r'\b', re.IGNORECASE)
        first_line = pattern.sub('', first_line)
    cleaned = re.findall(r'[A-Za-zÀ-ÿ\-]+', first_line)
    name = " ".join(cleaned).strip()
    return name if name else None

def remove_name_from_text(text: str, name: str | None) -> str:
    if not name:
        return text
    return re.sub(re.escape(name), '', text, flags=re.IGNORECASE, count=1)

def extract_sections(text: str) -> dict:
    sections_titles = [
        "EXPERIENCE PROFESSIONNELLE",
        "FORMATION",
        "COMPETENCES",
        "LANGUES",
        "CENTRES D'INTERET",
        "PROFIL",
        "OBJECTIF",
        "INFORMATIONS COMPLEMENTAIRES"
    ]
    pattern = re.compile(r'^\s*(' + '|'.join(sections_titles) + r')\s*$', re.IGNORECASE | re.MULTILINE)
    matches = list(pattern.finditer(text))
    sections = {}
    for i, match in enumerate(matches):
        start = match.end()
        end = matches[i+1].start() if i+1 < len(matches) else len(text)
        section_name = match.group(1).upper()
        section_text = text[start:end].strip()
        sections[section_name] = section_text
    return sections

def clean_experience_description(experience_text: str) -> str:
    lines = experience_text.splitlines()
    cleaned_lines = [line for line in lines if not line.strip().startswith("•")]
    return "\n".join(cleaned_lines).strip()

def clean_plus_phrases(text: str) -> str:
    cleaned_lines = []
    for line in text.splitlines():
        if '+' in line:
            line = line.split('+')[0].strip()
        if line:
            cleaned_lines.append(line)
    return "\n".join(cleaned_lines)

def extract_emails(text: str) -> list[str]:
    return list(set(re.findall(r'\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b', text)))

def extract_phones(text: str) -> list[str]:
    return list(set(re.findall(r'(\+33|0)[\s\-]?\d{1}[\s\-]?\d{2}[\s\-]?\d{2}[\s\-]?\d{2}[\s\-]?\d{2}', text)))

def extract_named_entities(text: str) -> dict:
    doc = nlp(text)
    persons = list(set([ent.text for ent in doc.ents if ent.label_ in ("PER", "PERSON")]))
    dates = list(set([ent.text for ent in doc.ents if ent.label_ == "DATE"]))
    orgs = list(set([ent.text for ent in doc.ents if ent.label_ == "ORG"]))
    return {"PERSONS": persons, "DATES": dates, "ORGS": orgs}

@router.post("/extract-cv")
async def extract_cv(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Veuillez uploader un fichier PDF.")
    file_bytes = await file.read()
    try:
        text = pdf_to_text_with_ocr(file_bytes)
        nom_prenom = extract_clean_name(text)
        text_modifie = remove_name_from_text(text, nom_prenom)
        sections = extract_sections(text_modifie)
        if "EXPERIENCE PROFESSIONNELLE" in sections:
            exp = sections["EXPERIENCE PROFESSIONNELLE"]
            exp = clean_experience_description(exp)
            exp = clean_plus_phrases(exp)
            sections["EXPERIENCE PROFESSIONNELLE"] = exp
        named_entities = extract_named_entities(text_modifie)
        emails = extract_emails(text_modifie)
        phones = extract_phones(text_modifie)
        return {
            "nom_prenom": nom_prenom,
            "sections": sections,
            "named_entities": named_entities,
            "emails": emails,
            "phones": phones,
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
