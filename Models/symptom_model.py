import os
import json
import joblib
import numpy as np

import pandas as pd

# Load models and mappings once at startup
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
DATA_DIR = os.path.join(BASE_DIR, "data")

try:
    symptom_model = joblib.load(os.path.join(MODELS_DIR, "symptom_rf_model.pkl"))
    with open(os.path.join(MODELS_DIR, "symptom_list.json"), "r") as f:
        symptom_list = json.load(f)
    with open(os.path.join(MODELS_DIR, "disease_mapping.json"), "r") as f:
        disease_mapping = json.load(f)
    with open(os.path.join(MODELS_DIR, "recommendation_mapping.json"), "r") as f:
        recommendation_mapping = json.load(f)
    # Load Symptom Severities for Triage
    severity_df = pd.read_csv(os.path.join(DATA_DIR, "Symptom-severity.csv"))
    # Clean severity keys
    severity_df['Symptom'] = severity_df['Symptom'].str.replace('_', ' ').str.strip().str.lower()
    severity_dict = dict(zip(severity_df['Symptom'], severity_df['weight']))
except Exception as e:
    print(f"Warning: Symptom models could not be loaded -> {e}")
    symptom_model = None
    symptom_list = []
    disease_mapping = {}
    recommendation_mapping = {}
    severity_dict = {}

def predict_disease_from_symptoms(user_symptoms: list[str]) -> dict:
    """
    Takes a list of symptoms string and outputs a V2 ML payload including Top 3 predictions, Urgency, and Diet/Meds.
    """
    if not symptom_model or not symptom_list:
        return {
            "urgency_level": "Routine",
            "predictions": [{
                "probable_disease": "Model Not Trained",
                "confidence": 0.0,
                "prevention_steps": ["Please consult an administrator."],
                "recommended_doctors": ["General Physician"],
                "diet_advice": [],
                "medication_advice": []
            }]
        }
        
    X = np.zeros((1, len(symptom_list)))
    user_symptoms_clean = [s.strip().lower() for s in user_symptoms]
    
    matched_symptoms = 0
    max_urgency_weight = 0
    
    for i, symptom in enumerate(symptom_list):
        if symptom.lower() in user_symptoms_clean:
            X[0, i] = 1
            matched_symptoms += 1
            
            # Calculate Urgency
            weight = severity_dict.get(symptom.lower(), 1)
            if weight > max_urgency_weight:
                max_urgency_weight = weight
                
    urgency_level = "Routine"
    if max_urgency_weight >= 5:
        urgency_level = "Emergency"
    elif max_urgency_weight >= 4:
        urgency_level = "Urgent"

    if matched_symptoms == 0:
        return {
            "urgency_level": "Routine",
            "predictions": [{
                "probable_disease": "Unknown Condition",
                "confidence": 0.0,
                "prevention_steps": ["Please provide more specific symptoms", "Consult a doctor if you feel unwell"],
                "recommended_doctors": ["General Physician"],
                "diet_advice": [],
                "medication_advice": []
            }]
        }
        
    # V2: Probabilities for Top 3
    probabilities = symptom_model.predict_proba(X)[0]
    classes = symptom_model.classes_
    
    # Sort by probability descending
    top_indices = np.argsort(probabilities)[::-1]
    
    predictions = []
    for idx in top_indices[:3]: # Take Top 3
        confidence = float(probabilities[idx])
        if confidence < 0.01: # Skip completely unlikely ones
            continue
            
        predicted_disease = str(classes[idx])
        disease_key = predicted_disease.lower().strip()
        
        # Original mapping for doctors/prevention
        mapping = disease_mapping.get(predicted_disease, {})
        prevention_steps = mapping.get("prevention", ["Maintain a healthy lifestyle", "Consult a doctor"])
        doctors = mapping.get("doctors", ["Primary Care Physician"])
        
        # New Kaggle mapping for diet/meds
        kaggle_mapping = recommendation_mapping.get(disease_key, {})
        diet_advice = kaggle_mapping.get("diet", ["Balanced diet recommended"])
        med_advice = kaggle_mapping.get("medication", ["Consult physician before taking medication"])
        
        predictions.append({
            "probable_disease": predicted_disease,
            "confidence": round(confidence * 100, 1),
            "prevention_steps": prevention_steps,
            "recommended_doctors": doctors,
            "diet_advice": diet_advice,
            "medication_advice": med_advice
        })
        
    return {
        "urgency_level": urgency_level,
        "predictions": predictions
    }
