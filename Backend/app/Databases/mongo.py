"""
Gestion de la connexion à la base MongoDB et accès aux collections principales.
"""
from pymongo import MongoClient

def get_mongo_collections():
    client = MongoClient("mongodb+srv://iheb:Kt7oZ4zOW4Fg554q@cluster0.5zmaqup.mongodb.net/")
    db = client["PowerBi"]
    return client, db["users"], db["offredemplois"], db["secteurdactivities"], db["privileges"]

