from bson import ObjectId

def convert_objectid_to_str(obj):
    """
    Convertit récursivement tous les ObjectId en str dans une structure dict/list.
    """
    if isinstance(obj, list):
        return [convert_objectid_to_str(i) for i in obj]
    elif isinstance(obj, dict):
        return {k: convert_objectid_to_str(v) for k, v in obj.items()}
    elif isinstance(obj, ObjectId):
        return str(obj)
    else:
        return obj

def enrich_offres_with_labels(offres_col, secteur_col):
    offres = list(offres_col.find({"isDeleted": False}))

    for offre in offres:
        secteur_id = offre.get("secteur")
        metier_ids = offre.get("metier", [])
        if not isinstance(metier_ids, list):
            metier_ids = [metier_ids]

        secteur_label = None
        metier_label = None

        if secteur_id and ObjectId.is_valid(secteur_id):
            secteur_doc = secteur_col.find_one({"_id": ObjectId(secteur_id)})
            if secteur_doc:
                secteur_label = secteur_doc.get("label")
                offre["secteur"] = secteur_label

                # Cherche métier correspondant dans jobs
                for job in secteur_doc.get("jobs", []):
                    if str(job.get("_id")) in metier_ids:
                        metier_label = job.get("label")
                        break
                offre["metier"] = metier_label or (metier_ids[0] if metier_ids else None)
            else:
                offre["secteur"] = secteur_id
                offre["metier"] = metier_ids[0] if metier_ids else None
        else:
            offre["secteur"] = None
            offre["metier"] = metier_ids[0] if metier_ids else None

    # Convertir tous les ObjectId en string
    offres = convert_objectid_to_str(offres)

    # Supprimer _id interne
    for offre in offres:
        if "_id" in offre:
            del offre["_id"]

    return offres
