import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
import pickle
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), "risk_model.pkl")
SCALER_PATH = os.path.join(os.path.dirname(__file__), "scaler.pkl")
CSV_PATH = os.path.join(os.path.dirname(__file__), "../../diabetes_data_upload.csv")

def get_or_train_model():
    # If model exists, load it
    if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
        try:
            with open(MODEL_PATH, "rb") as f:
                model = pickle.load(f)
            with open(SCALER_PATH, "rb") as f:
                scaler = pickle.load(f)
            return model, scaler
        except EOFError:
            # File might be empty/corrupted during dev, force retrain
            pass
            
    # Load Real Data
    if not os.path.exists(CSV_PATH):
        raise FileNotFoundError(f"Missing training data at {CSV_PATH}")
        
    df = pd.read_csv(CSV_PATH)
    
    # Preprocessing
    # Features: Age,Gender,Polyuria,Polydipsia,sudden weight loss,weakness,Polyphagia,Genital thrush,visual blurring,Itching,Irritability,delayed healing,partial paresis,muscle stiffness,Alopecia,Obesity
    # Label: class (Positive/Negative)
    
    X = df.drop('class', axis=1)
    y_raw = df['class']
    
    # Map Target
    y = y_raw.map({'Positive': 1, 'Negative': 0}).values
    
    # Map Features
    # Age is already numeric. The rest are categorical strings.
    # Convert Yes/No strings to 1/0
    binary_cols = ['Polyuria', 'Polydipsia', 'sudden weight loss', 'weakness', 
                  'Polyphagia', 'Genital thrush', 'visual blurring', 'Itching', 
                  'Irritability', 'delayed healing', 'partial paresis', 
                  'muscle stiffness', 'Alopecia', 'Obesity']
                  
    for col in binary_cols:
        if col in X.columns:
            X[col] = X[col].map({'Yes': 1, 'No': 0})
            
    # Map Gender
    if 'Gender' in X.columns:
        X['Gender'] = X['Gender'].map({'Male': 1, 'Female': 0})
        
    # Standardize
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Train
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_scaled, y)
    
    # Save for future use
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)
    with open(SCALER_PATH, "wb") as f:
        pickle.dump(scaler, f)
        
    return model, scaler

# Initialize model on module load
model, scaler = get_or_train_model()

def predict_health_risk(
    age: int, 
    gender: int, 
    polyuria: int, 
    polydipsia: int, 
    weight_loss: int, 
    weakness: int, 
    polyphagia: int, 
    genital_thrush: int, 
    blurring: int, 
    itching: int, 
    irritability: int, 
    healing: int, 
    paresis: int, 
    stiffness: int, 
    alopecia: int, 
    obesity: int
) -> dict:
    """Predicts early stage diabetes risk based on user symptoms."""
    # Build input array
    X_input = np.array([[
        age, gender, polyuria, polydipsia, weight_loss, weakness, 
        polyphagia, genital_thrush, blurring, itching, irritability, 
        healing, paresis, stiffness, alopecia, obesity
    ]])
    
    # Scale features
    X_scaled = scaler.transform(X_input)
    
    # Get probabilities
    probs = model.predict_proba(X_scaled)[0]
    
    # Determine predicted class
    pred_class = model.predict(X_scaled)[0]
    
    # Map to strings
    risk_labels = ["Low Risk", "High Risk"]
    
    # Calculate an overall risk score out of 100 based on the probability of 'Positive' (class 1)
    # The dataset is binary (Positive/Negative for Diabetes). 
    risk_score = int(probs[1] * 100)
    
    # Determine level string based on score
    level = "Low Risk"
    if risk_score > 40:
        level = "Moderate Risk"
    if risk_score > 70:
        level = "High Risk"
    
    return {
        "risk_level": level,
        "risk_score": risk_score, # 0-100 score
        "probabilities": {
            "low": float(probs[0]),
            "moderate": 0.0, # Not applicable for this binary model directly, but schema requires it
            "high": float(probs[1])
        }
    }
