import pandas as pd
import json
import os
import ast

def clean_array_string(val):
    if pd.isna(val):
        return []
    try:
        # The Kaggle datasets store arrays as string literals e.g. "['Diet 1', 'Diet 2']"
        parsed = ast.literal_eval(val)
        if isinstance(parsed, list):
            return parsed
        return [str(parsed)]
    except:
        return [str(val)]

def train_recommendation_model():
    print("Loading Kaggle Recommendation CSV datasets...")
    
    # We will build a unified dictionary mapping Disease -> {diet: [], medication: [], workout: []}
    recommendations = {}
    
    # 1. Load Diets
    diets_df = pd.read_csv("app/ml/data/diets.csv")
    for _, row in diets_df.iterrows():
        disease = str(row['Disease']).strip()
        if disease not in recommendations:
            recommendations[disease] = {"diet": [], "medication": [], "workout": []}
        recommendations[disease]["diet"] = clean_array_string(row['Diet'])
        
    # 2. Load Medications
    meds_df = pd.read_csv("app/ml/data/medications.csv")
    for _, row in meds_df.iterrows():
        disease = str(row['Disease']).strip()
        if disease not in recommendations:
            recommendations[disease] = {"diet": [], "medication": [], "workout": []}
        recommendations[disease]["medication"] = clean_array_string(row['Medication'])
        
    # 3. Load Workouts
    workout_df = pd.read_csv("app/ml/data/workout_df.csv")
    # workout_df is slightly different: it has 'disease' and 'workout' per row, with multiple rows per disease
    for _, row in workout_df.iterrows():
        disease = str(row['disease']).strip()
        workout = str(row['workout']).strip()
        if disease not in recommendations:
            recommendations[disease] = {"diet": [], "medication": [], "workout": []}
        if workout not in recommendations[disease]["workout"]:
            recommendations[disease]["workout"].append(workout)

    # Convert keys to lowercase to ensure perfect matching with the Symptom Classifier Model
    unified_dict = {k.lower(): v for k, v in recommendations.items()}

    os.makedirs("app/ml/models", exist_ok=True)
    with open("app/ml/models/recommendation_mapping.json", "w") as f:
        json.dump(unified_dict, f, indent=4)
        
    print(f"Successfully generated Recommendation Engine mapping for {len(unified_dict)} diseases!")

if __name__ == "__main__":
    train_recommendation_model()
