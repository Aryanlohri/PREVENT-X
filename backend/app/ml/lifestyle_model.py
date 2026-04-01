import os
import joblib
import pandas as pd
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "lifestyle_rf_model.pkl")
ENCODER_PATH = os.path.join(BASE_DIR, "models", "lifestyle_label_encoders.pkl")
MAPPING_PATH = os.path.join(BASE_DIR, "models", "lifestyle_mapping.json")

def load_resources():
    model = joblib.load(MODEL_PATH)
    encoders = joblib.load(ENCODER_PATH)
    with open(MAPPING_PATH, 'r') as f:
        mapping = json.load(f)
    return model, encoders, mapping

def predict_lifestyle_plan(age, gender, height_cm, weight_kg, condition):
    try:
        model, encoders, mapping = load_resources()
    except Exception as e:
        raise Exception(f"Failed to load Lifestyle ML models. Did you run train_lifestyle_model.py? Error: {e}")

    # Process inputs based on LabelEncoders
    try:
        gender_encoded = encoders['gender'].transform([gender])[0]
    except:
        gender_encoded = encoders['gender'].transform(['Male'])[0] # fallback

    try:
        condition_encoded = encoders['condition'].transform([condition])[0]
    except:
        condition_encoded = encoders['condition'].transform(['None'])[0] # fallback

    # Prepare DataFrame exactly as trained
    input_data = pd.DataFrame([{
        'age': age,
        'gender': gender_encoded,
        'height_cm': height_cm,
        'weight_kg': weight_kg,
        'condition': condition_encoded
    }])

    # Predict
    predicted_encoded = model.predict(input_data)[0]

    # Inverse Transform
    cal_idx = predicted_encoded[0]
    macro_idx = predicted_encoded[1]
    workout_idx = predicted_encoded[2]
    intensity_idx = predicted_encoded[3]
    
    # We mapped 'target_calories', 'target_macros', 'target_workout', 'target_intensity'
    # Wait, the mapping json contains classes for each column.
    
    cal_category = encoders['target_calories'].inverse_transform([cal_idx])[0]
    macro_split = encoders['target_macros'].inverse_transform([macro_idx])[0]
    workout_type = encoders['target_workout'].inverse_transform([workout_idx])[0]
    intensity = encoders['target_intensity'].inverse_transform([intensity_idx])[0]
    
    return {
        "calories": cal_category,
        "macros": macro_split,
        "workout_type": workout_type,
        "intensity": intensity
    }

