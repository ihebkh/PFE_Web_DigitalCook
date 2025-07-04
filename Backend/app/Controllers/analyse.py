from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import os
import tempfile
import json
import spacy
from spacy.matcher import PhraseMatcher
from skillNer.skill_extractor_class import SkillExtractor
import pytesseract
from pdf2image import convert_from_path
from datetime import datetime
from dateparser.search import search_dates
import re
from pymongo import MongoClient
from deep_translator import GoogleTranslator
from app.Databases.mongo import get_mongo_collections
import pandas as pd
import geonamescache
import warnings
import joblib
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.decomposition import PCA
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

router = APIRouter()

warnings.simplefilter(action='ignore', category=FutureWarning)
nlp = spacy.load('en_core_web_lg')
gc = geonamescache.GeonamesCache()
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
SKILL_DB_PATH = r"C:\Users\khmir\Desktop\PFE_Web_DigitalCook\Backend\app\file\skill_db_relax_20.json"

TOKEN_DIST_PATH = r"C:\Users\khmir\Desktop\PFE_Web_DigitalCook\Backend\app\file\token_dist.json"
with open(SKILL_DB_PATH, 'r', encoding='utf-8') as f:
    SKILL_DB = json.load(f)
skill_extractor = SkillExtractor(nlp, SKILL_DB, PhraseMatcher)

# NLP features

def count_verbs(sentence): return len([t for t in nlp(sentence) if t.pos_ == 'VERB'])
def count_adjectives(sentence): return len([t for t in nlp(sentence) if t.pos_ == 'ADJ'])
def count_stopwords(sentence): return len([t for t in nlp(sentence) if t.is_stop])
def count_nouns(sentence): return len([t for t in nlp(sentence) if t.pos_ == 'NOUN'])
def count_digits(sentence): return len([t for t in nlp(sentence) if t.is_digit])
def count_special_characters(sentence): return len([t for t in nlp(sentence) if not t.text.isalnum() and not t.is_punct])
def count_punctuation(sentence): return len([t for t in nlp(sentence) if t.is_punct])
def calculate_sentence_length(sentence): return len(nlp(sentence))

def extract_text_from_pdf(pdf_path):
    images = convert_from_path(pdf_path)
    all_text = ""
    for image in images:
        all_text += pytesseract.image_to_string(image, lang='eng+fra') + "\n"
    temp_txt_path = pdf_path.replace('.pdf', '.txt')
    with open(temp_txt_path, 'w', encoding='utf-8') as f:
        f.write(all_text)
    return temp_txt_path

def extract_skills(skill_extractor, sentence):
    try:
        annotations = skill_extractor.annotate(sentence)
        unique_values = set()
        for item in annotations['results']['full_matches']:
            unique_values.add(item['doc_node_value'].lower())
        for item in annotations['results']['ngram_scored']:
            unique_values.add(item['doc_node_value'].lower())
        return list(unique_values)
    except Exception as e:
        print(f"Erreur compétences: {e}")
        return []

def count_skills(skill_extractor, sentence):
    return len(extract_skills(skill_extractor, sentence))

def detectSkills(skill_extractor, file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        cc = f.read()
    annotations = skill_extractor.annotate(cc)
    unique_values = set()
    for item in annotations['results']['full_matches']:
        skill = item['doc_node_value'].lower()
        unique_values.add(' '.join(dict.fromkeys(skill.split())))
    for item in annotations['results']['ngram_scored']:
        skill = item['doc_node_value'].lower()
        unique_values.add(' '.join(dict.fromkeys(skill.split())))
    unique_values.discard('')
    return list(unique_values)

def calculate_total_years_experience(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    lines = content.splitlines()
    total_years = 0
    printed_lines = set()
    for line in lines:
        original_line = line
        line = line.lower()
        line = re.sub(r"\b(months?|years?|mos|yr|yrs|mois|an|ans)\b", "", line, flags=re.IGNORECASE)
        line = line.replace(".", "").replace("/", " ").replace("-", " ")
        for kw in ["present", "today", "now", "aujourd'hui"]:
            line = line.replace(kw, datetime.now().strftime("%b %d, %Y"))
        parsed_date = search_dates(line, languages=["fr", "en"])
        if parsed_date:
            parsed_dates = [date[1] for date in parsed_date]
            if len(parsed_dates) >= 2:
                parsed_dates.sort()
                date1, date2 = parsed_dates[:2]
                diff_years = (date2.year - date1.year) + (date2.month - date1.month) / 12.0
                total_years += diff_years
                printed_lines.add(original_line)
    return round(total_years, 2)

def detect_location(text, locations):
    return [loc for loc in locations if re.search(r'\b' + re.escape(loc) + r'\b', text, re.IGNORECASE)]

def detect_address(file_path):
    countries = [country['name'] for country in gc.get_countries().values()]
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    return detect_location(content, countries)

def clean_ref(ref):
    cleaned_ref = re.sub(r'\[|\]|\s+|DCE', '', ref, flags=re.IGNORECASE)
    match = re.search(r'Ref(\d+)', cleaned_ref, re.IGNORECASE)
    return f"ref{match.group(1)}" if match else "ref not found"

def train_dataset(excel_path):
    dataset = pd.read_excel(excel_path)
    dataset = dataset.drop(dataset[(dataset['IsExperience'] == 'YES') & ((dataset['Sentence length'] < 3) | (dataset['Sentence length'] > 28))].index)
    dataset = dataset.drop(dataset[(dataset['IsExperience'] == 'YES') & (dataset['experiences'].str.contains("\\?"))].index)
    numeric_features = ['Verbs number', 'Adjectives number', 'Stopwords number', 'Sentence length', 'Nouns number', 'Special chars number', 'Punctuation number', 'Digits number', 'Skills number']
    numeric_transformer = Pipeline([('scaler', StandardScaler()), ('pca', PCA(n_components=2))])
    categorical_transformer = Pipeline([('imputer', SimpleImputer(strategy='constant', fill_value='missing')), ('onehot', OneHotEncoder(handle_unknown='ignore'))])
    preprocessor = ColumnTransformer([
        ('num', numeric_transformer, numeric_features),
        ('cat', categorical_transformer, ['experiences'])
    ])
    X = dataset.drop('IsExperience', axis=1)
    y = LabelEncoder().fit_transform(dataset['IsExperience'])
    X_transformed = preprocessor.fit_transform(X)
    classifier = RandomForestClassifier()
    classifier.fit(X_transformed, y)
    joblib.dump(classifier, 'random_forest_model.pkl')
    joblib.dump(preprocessor, 'preprocessor.pkl')
    return True

def predict(filepath):
    classifier = joblib.load('random_forest_model.pkl')
    preprocessor = joblib.load('preprocessor.pkl')
    with open(filepath, 'r', encoding='utf-8') as file:
        sentences = file.readlines()
    data_list = []
    for sentence in sentences:
        data_list.append(pd.DataFrame({
            'experiences': [sentence],
            'Verbs number': [count_verbs(sentence)],
            'Adjectives number': [count_adjectives(sentence)],
            'Stopwords number': [count_stopwords(sentence)],
            'Sentence length': [calculate_sentence_length(sentence)],
            'Nouns number': [count_nouns(sentence)],
            'Special chars number': [count_special_characters(sentence)],
            'Punctuation number': [count_punctuation(sentence)],
            'Digits number': [count_digits(sentence)],
            'Skills number': [count_skills(skill_extractor, sentence)]
        }))
    input_df = pd.concat(data_list, ignore_index=True)
    X_input = preprocessor.transform(input_df)
    predictions = classifier.predict(X_input)
    predicted_as_experience = input_df[predictions == 1]
    return [s for s, pred in zip(sentences, predictions) if pred == 1]

def translate_to_french(text_list):
    return [GoogleTranslator(source='auto', target='fr').translate(text) for text in text_list]

def translate_experiences_to_french(text_list):
    return [GoogleTranslator(source='auto', target='fr').translate(text) for text in text_list]

def offre_to_text(offre):
    fields = [
        offre.get("titre", ""),
        offre.get("soustitre", ""),
        offre.get("description", ""),
        offre.get("responsabilites", ""),
        offre.get("competenceRequises", ""),
        offre.get("qualificationRequises", "")
    ]
    return " ".join(fields)

def compute_similarity(cv_text, offre_text):
    vectorizer = TfidfVectorizer()
    tfidf = vectorizer.fit_transform([cv_text, offre_text])
    sim = cosine_similarity(tfidf[0:1], tfidf[1:2])
    return float(sim[0][0])

def extract_skills_from_offre(offre):
    comp = offre.get('competenceRequises', '')
    skills = re.split(r'[;,\n]', comp)
    return set(s.strip().lower() for s in skills if s.strip())

def extract_languages_from_offre(offre):
    return set(l.lower().split(' ')[0] for l in offre.get('langue', []) if isinstance(l, str))

def normalize_langs(lang_list):
    return set(l.lower().split(' ')[0] for l in lang_list if isinstance(l, str))

def compute_global_score(cv_text, offre_text, cv_skills, offre_skills, cv_languages, offre_languages, has_experience, w_text=0.3, w_skills=0.3, w_langs=0.1, w_exp=0.1):
    text_score = compute_similarity(cv_text, offre_text)
    if cv_skills:
        skills_score = len(cv_skills & offre_skills) / len(cv_skills)
    else:
        skills_score = 0
    if cv_languages:
        langs_score = len(cv_languages & offre_languages) / len(cv_languages)
    else:
        langs_score = 0
    exp_score = 1 if has_experience else 0
    global_score = w_text * text_score + w_skills * skills_score + w_langs * langs_score + w_exp * exp_score
    return global_score, text_score, skills_score, langs_score, exp_score

def format_years_months(years_float):
    years = int(years_float)
    months = int(round((years_float - years) * 12))
    return f"{years} an{'s' if years > 1 else ''} {months} mois"

@router.post("/analyse-cv")
def analyse_cv(file: UploadFile = File(...)):
    # Chemin fixe pour le dataset d'entraînement
    EXCEL_PATH = r"C:\Users\khmir\Desktop\PFE_Web_DigitalCook\Backend\app\file\dataset_experiences.xlsx"
    MODEL_PATH = 'random_forest_model.pkl'
    PREPROCESSOR_PATH = 'preprocessor.pkl'
    filename = file.filename.lower()
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(filename)[1]) as tmp:
        tmp.write(file.file.read())
        tmp_path = tmp.name
    try:
        # Si le modèle n'existe pas, on l'entraîne automatiquement
        if not (os.path.exists(MODEL_PATH) and os.path.exists(PREPROCESSOR_PATH)):
            train_dataset(EXCEL_PATH)
        # Analyse de CV (PDF uniquement)
        if filename.endswith('.pdf'):
            txt_path = extract_text_from_pdf(tmp_path)
            skills = detectSkills(skill_extractor, txt_path)
            try:
                experiences = predict(txt_path)
            except Exception as e:
                experiences = []
            duration = calculate_total_years_experience(txt_path)
            countries = detect_address(txt_path)
            cv_langues = ["Français (C1)", "Anglais (B2)"]
            if experiences:
                experiences_fr = translate_experiences_to_french(experiences)
            else:
                experiences_fr = []
            _, _, offres_col, _, _ = get_mongo_collections()
            offres = list(offres_col.find({"status": "active"}))
            seuil = 0.28
            matches = []
            if experiences_fr and offres:
                cv_text = " ".join(experiences_fr)
                cv_skills = set(s.lower() for s in skills)
                cv_languages = normalize_langs(cv_langues)
                has_experience = len(experiences_fr) > 0
                for offre in offres:
                    offre_text = offre_to_text(offre)
                    offre_skills = extract_skills_from_offre(offre)
                    offre_languages = extract_languages_from_offre(offre)
                    global_score, text_score, skills_score, langs_score, exp_score = compute_global_score(
                        cv_text, offre_text, cv_skills, offre_skills, cv_languages, offre_languages, has_experience
                    )
                    matching_skills = list(cv_skills & offre_skills)
                    matching_languages = list(cv_languages & offre_languages)
                    if global_score > seuil:
                        matches.append({
                            "offre": {
                                "titre": offre.get("titre", "Sans titre"),
                                "societe": offre.get("societe", "N/A"),
                                "ville": offre.get("ville", "N/A"),
                                "lieuSociete": offre.get("lieuSociete", ""),
                                "minSalaire": offre.get("minSalaire"),
                                "maxSalaire": offre.get("maxSalaire"),
                                "deviseSalaire": offre.get("deviseSalaire"),
                                "salaireBrutPar": offre.get("salaireBrutPar"),
                            },
                            "global_score": global_score,
                            "matching_skills": matching_skills,
                            "matching_languages": matching_languages,
                            "detail": {
                                "texte": text_score,
                                "competences": skills_score,
                                "langues": langs_score,
                                "experience": exp_score
                            }
                        })
            result = {
                "competences": skills,
                "duree_experience": format_years_months(duration),
                "pays": countries,
                "experiences": experiences_fr,
                "matches": matches
            }
            return JSONResponse(content=result)
        else:
            raise HTTPException(status_code=400, detail="Type de fichier non supporté. Envoyez un PDF.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        os.remove(tmp_path) 