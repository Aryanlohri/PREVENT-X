"""
# 🏥 PreventX: AI Patient Nutritionist & Lifestyle Coach
# Multi-Output Machine Learning for Personalized Health Recommendations

This script demonstrates the "AI Nutritionist" core from the PreventX project. 
It uses a Multi-Output Random Forest to predict:
1. Daily Caloric Goal
2. Macronutrient Ratio
3. Recommended Workout Type
4. Workout Intensity

Based on user features: Age, Gender, Height, Weight, and Pre-existing Conditions.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.multioutput import MultiOutputClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report

# --- 1. Synthesize Dataset ---
# We generate a synthetic dataset to demonstrate the relationships between 
# clinical features and lifestyle recommendations.
print("Generating Synthetic Health Dataset...")
np.random.seed(42)
num_samples = 2000

conditions = ['None', 'Diabetes', 'Hypertension', 'Asthma', 'Arthritis', 'Obesity', 'Heart Disease']
genders = ['Male', 'Female', 'Other']

data = {
    'age': np.random.randint(18, 80, num_samples),
    'gender': np.random.choice(genders, num_samples),
    'height_cm': np.random.randint(150, 200, num_samples),
    'weight_kg': np.random.randint(50, 130, num_samples),
    'condition': np.random.choice(conditions, num_samples, p=[0.4, 0.1, 0.15, 0.1, 0.05, 0.15, 0.05])
}

df = pd.DataFrame(data)
df['bmi'] = df['weight_kg'] / ((df['height_cm'] / 100) ** 2)

def generate_logic(row):
    """Internal logic to create ground-truth targets for the model to learn."""
    # Calories Goal
    base_cal = 2000 if row['gender'] == 'Female' else 2500
    if row['age'] > 50: base_cal -= 200
    if row['bmi'] > 25: base_cal -= 300
    cal_category = '1500-1800' if base_cal < 1800 else '1800-2200' if base_cal < 2200 else '2200-2600'
    
    # Macros
    if row['condition'] == 'Diabetes': macro = 'Low Carb (40c/30p/30f)'
    elif row['bmi'] > 30: macro = 'High Protein/Low Carb (30c/40p/30f)'
    else: macro = 'Balanced (50c/25p/25f)'
        
    # Workout Type
    if row['condition'] in ['Arthritis', 'Heart Disease']: w_type = 'Low-Impact Cardio & Swimming'
    elif row['condition'] == 'Asthma': w_type = 'Yoga & Light Resistance'
    else: w_type = 'HIIT & Weight Training'
        
    # Workout Intensity
    if row['age'] > 60 or row['condition'] in ['Arthritis', 'Heart Disease']: intensity = 'Low'
    elif row['condition'] != 'None': intensity = 'Moderate'
    else: intensity = 'High'
        
    return pd.Series([cal_category, macro, w_type, intensity])

df[['target_calories', 'target_macros', 'target_workout', 'target_intensity']] = df.apply(generate_logic, axis=1)

# --- 2. Preprocessing ---
label_encoders = {}
categorical_cols = ['gender', 'condition', 'target_calories', 'target_macros', 'target_workout', 'target_intensity']

for col in categorical_cols:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    label_encoders[col] = le

X = df[['age', 'gender', 'height_cm', 'weight_kg', 'condition']]
y = df[['target_calories', 'target_macros', 'target_workout', 'target_intensity']]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# --- 3. Model Training ---
print("Training Multi-Output Random Forest with Cross-Validation...")

base_rf = RandomForestClassifier(random_state=42, class_weight='balanced')
clf = MultiOutputClassifier(base_rf, n_jobs=-1)

# Tune hyperparameters to prevent overfitting
param_grid = {
    'estimator__n_estimators': [50, 100],
    'estimator__max_depth': [5, 10],
}

grid_search = GridSearchCV(clf, param_grid, cv=3)
grid_search.fit(X_train, y_train)
best_model = grid_search.best_estimator_

# --- 4. Evaluation ---
print("\n--- Model Evaluation ---")
y_pred = best_model.predict(X_test)
for i, target_col in enumerate(y.columns):
    print(f"\nMetric: {target_col}")
    unique_classes = np.unique(y_test.iloc[:, i])
    target_names = label_encoders[target_col].inverse_transform(unique_classes)
    print(classification_report(y_test.iloc[:, i], y_pred[:, i], target_names=target_names))

# --- 5. Real-World Prediction Demo ---
def predict_lifestyle(age, gender, height, weight, condition):
    # 1. Encode the categorical inputs (Gender and Condition) using the saved encoders
    g_enc = label_encoders['gender'].transform([gender])[0]
    c_enc = label_encoders['condition'].transform([condition])[0]
    
    # 2. Create a DataFrame for prediction so that feature names match exactly with the training set
    features_df = pd.DataFrame(
        [[age, g_enc, height, weight, c_enc]], 
        columns=['age', 'gender', 'height_cm', 'weight_kg', 'condition']
    )
    
    # 3. Predict all targets at once
    preds = best_model.predict(features_df)[0]
    
    return {
        "Calories": label_encoders['target_calories'].inverse_transform([preds[0]])[0],
        "Macros": label_encoders['target_macros'].inverse_transform([preds[1]])[0],
        "Workout": label_encoders['target_workout'].inverse_transform([preds[2]])[0],
        "Intensity": label_encoders['target_intensity'].inverse_transform([preds[3]])[0]
    }

print("\n--- Testing with Sample Patient ---")
patient_plan = predict_lifestyle(age=45, gender='Male', height=175, weight=95, condition='Hypertension')
for key, val in patient_plan.items():
    print(f"{key}: {val}")
