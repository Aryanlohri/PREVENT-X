import pandas as pd
import numpy as np
import json
import joblib
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import classification_report

def train_symptom_model():
    print("Loading raw symptom dataset...")
    # Dataset has no header. Col 0 is Disease, Cols 1..17 are symptoms.
    df = pd.read_csv("app/ml/data/dataset.csv", header=None)
    df = df.dropna(subset=[0])
    
    # Clean up whitespace across the whole dataframe just in case
    df = df.map(lambda x: str(x).strip() if pd.notna(x) else x)
    
    print("Extracting features...")
    symptoms_matrix = df.iloc[:, 1:].values.flatten()
    unique_symptoms = list(set([str(s).strip() for s in pd.Series(symptoms_matrix).dropna().unique() if str(s).strip()]))
    unique_symptoms = sorted(unique_symptoms)
    
    print(f"Found {len(unique_symptoms)} unique symptoms.")
    
    # Create the binary feature matrix
    X = np.zeros((len(df), len(unique_symptoms)))
    
    # One-hot encode the symptoms for each record
    for i in range(len(df)):
        row_symptoms = df.iloc[i, 1:].dropna().values
        row_symptoms = [str(s).strip() for s in row_symptoms if str(s).strip()]
        for symptom in row_symptoms:
            if symptom in unique_symptoms:
                idx = unique_symptoms.index(symptom)
                X[i, idx] = 1
                
    y = df.iloc[:, 0].values # Disease
    unique_diseases = np.unique(y)
    
    print(f"Splitting data and tuning RandomForest on {len(unique_diseases)} diseases...")
    
    # 1. Train/Test Split (80/20)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # 2. Hyperparameter Grid Search to prevent overfitting
    param_grid = {
        'n_estimators': [50, 100],
        'max_depth': [10, 20, None],
        'min_samples_split': [2, 5, 10]
    }
    
    rf = RandomForestClassifier(random_state=42)
    grid_search = GridSearchCV(estimator=rf, param_grid=param_grid, cv=3, n_jobs=-1, verbose=1)
    grid_search.fit(X_train, y_train)
    
    model = grid_search.best_estimator_
    print(f"Best parameters found: {grid_search.best_params_}")
    
    # 3. Model Evaluation
    train_score = model.score(X_train, y_train)
    test_score = model.score(X_test, y_test)
    print(f"Training Accuracy: {train_score:.4f}")
    print(f"Test Accuracy: {test_score:.4f}")
    
    # Detailed classification report
    y_pred = model.predict(X_test)
    print("\nClassification Report (Test Set):")
    print(classification_report(y_test, y_pred))
    
    # Save the model
    os.makedirs("app/ml/models", exist_ok=True)
    joblib.dump(model, "app/ml/models/symptom_rf_model.pkl")
    
    # Save the feature list so the FastAPI endpoint knows how to construct the input vector
    with open("app/ml/models/symptom_list.json", "w") as f:
        json.dump(unique_symptoms, f, indent=4)
        
    print("Saved model and symptom list.")
    
    # Generate the initial dictionary template for diseases
    disease_mapping = {}
    doctors_map = {
        "Fungal infection": ["Dermatologist"],
        "Allergy": ["Allergist", "Immunologist"],
        "GERD": ["Gastroenterologist"],
        "Chronic cholestasis": ["Hepatologist", "Gastroenterologist"],
        "Drug Reaction": ["Allergist", "Dermatologist"],
        "Peptic ulcer diseae": ["Gastroenterologist"],
        "AIDS": ["Infectious Disease Specialist"],
        "Diabetes": ["Endocrinologist"],
        "Gastroenteritis": ["Gastroenterologist"],
        "Bronchial Asthma": ["Pulmonologist"],
        "Hypertension": ["Cardiologist"],
        "Migraine": ["Neurologist"],
        "Cervical spondylosis": ["Orthopedist"],
        "Paralysis (brain hemorrhage)": ["Neurologist"],
        "Jaundice": ["Hepatologist", "Gastroenterologist"],
        "Malaria": ["Infectious Disease Specialist", "General Physician"],
        "Chicken pox": ["Pediatrician", "General Physician"],
        "Dengue": ["Infectious Disease Specialist", "General Physician"],
        "Typhoid": ["Infectious Disease Specialist", "General Physician"],
        "hepatitis A": ["Hepatologist", "Gastroenterologist"],
        "Hepatitis B": ["Hepatologist", "Gastroenterologist"],
        "Hepatitis C": ["Hepatologist", "Gastroenterologist"],
        "Hepatitis D": ["Hepatologist", "Gastroenterologist"],
        "Hepatitis E": ["Hepatologist", "Gastroenterologist"],
        "Alcoholic hepatitis": ["Hepatologist", "Gastroenterologist"],
        "Tuberculosis": ["Pulmonologist", "Infectious Disease Specialist"],
        "Common Cold": ["General Physician"],
        "Pneumonia": ["Pulmonologist", "General Physician"],
        "Dimorphic hemmorhoids(piles)": ["Proctologist", "Gastroenterologist"],
        "Heart attack": ["Cardiologist", "Emergency Medicine"],
        "Varicose veins": ["Vascular Surgeon"],
        "Hypothyroidism": ["Endocrinologist"],
        "Hyperthyroidism": ["Endocrinologist"],
        "Hypoglycemia": ["Endocrinologist"],
        "Osteoarthristis": ["Rheumatologist", "Orthopedist"],
        "Arthritis": ["Rheumatologist"],
        "(vertigo) Paroymsal  Positional Vertigo": ["ENT Specialist", "Neurologist"],
        "Acne": ["Dermatologist"],
        "Urinary tract infection": ["Urologist", "Gynecologist"],
        "Psoriasis": ["Dermatologist"],
        "Impetigo": ["Dermatologist", "Pediatrician"]
    }
    
    for disease in unique_diseases:
        # Give some generic precautions if we don't have them yet, user can edit this file later
        disease_mapping[disease] = {
            "prevention": [
                f"Consult a {doctors_map.get(disease, ['Primary Care Physician'])[0].lower()} immediately.",
                "Maintain a healthy lifestyle and diet.",
                "Track your symptoms and report changes to your doctor."
            ],
            "doctors": doctors_map.get(disease, ["General Physician", "Primary Care Physician"])
        }
        
    with open("app/ml/models/disease_mapping.json", "w") as f:
        json.dump(disease_mapping, f, indent=4)
        
    print("Saved disease mapping dictionary.")

if __name__ == "__main__":
    train_symptom_model()
