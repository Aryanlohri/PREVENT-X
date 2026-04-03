import pandas as pd
import numpy as np
import os
import joblib
import json
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.multioutput import MultiOutputClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report

# Ensure output directory exists
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODELS_DIR, exist_ok=True)

# 1. Synthesize Dataset
print("Synthesizing Lifestyle Dataset...")
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

# Derive features and targets based on rules (to give the ML model something logical to learn)
df['bmi'] = df['weight_kg'] / ((df['height_cm'] / 100) ** 2)

def generate_targets(row):
    # Calories
    base_cal = 2000 if row['gender'] == 'Female' else 2500
    if row['age'] > 50: base_cal -= 200
    if row['bmi'] > 25: base_cal -= 300
    if row['weight_kg'] > 100: base_cal -= 400
    
    cal_category = '1500-1800' if base_cal < 1800 else '1800-2200' if base_cal < 2200 else '2200-2600'
    
    # Macros
    if row['condition'] == 'Diabetes': macro = 'Low Carb (40c/30p/30f)'
    elif row['bmi'] > 30: macro = 'High Protein/Low Carb (30c/40p/30f)'
    else: macro = 'Balanced (50c/25p/25f)'
        
    # Workout Type
    if row['condition'] in ['Arthritis', 'Heart Disease']: w_type = 'Low-Impact Cardio & Swimming'
    elif row['condition'] == 'Asthma': w_type = 'Yoga & Light Resistance'
    elif row['bmi'] > 30: w_type = 'Walking & Water Aerobics'
    else: w_type = 'HIIT & Weight Training'
        
    # Workout Intensity
    if row['age'] > 60 or row['condition'] in ['Arthritis', 'Heart Disease']: intensity = 'Low'
    elif row['condition'] != 'None': intensity = 'Moderate'
    elif row['bmi'] < 25 and row['age'] < 40: intensity = 'High'
    else: intensity = 'Moderate'
        
    return pd.Series([cal_category, macro, w_type, intensity])

df[['target_calories', 'target_macros', 'target_workout', 'target_intensity']] = df.apply(generate_targets, axis=1)

# Introduce some noise to make model training realistic
noise_indices = np.random.choice(df.index, size=int(num_samples * 0.1), replace=False)
df.loc[noise_indices, 'target_intensity'] = np.random.choice(['Low', 'Moderate', 'High'], size=len(noise_indices))

# 2. Preprocessing
label_encoders = {}
categorical_cols = ['gender', 'condition', 'target_calories', 'target_macros', 'target_workout', 'target_intensity']

for col in categorical_cols:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    label_encoders[col] = le

X = df[['age', 'gender', 'height_cm', 'weight_kg', 'condition']]
y = df[['target_calories', 'target_macros', 'target_workout', 'target_intensity']]

# 3. Model Training Strategy: Train/Test Split & Over-fitting Prevention via GridSearchCV
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("Training Multi-Output Random Forest Classifier...")

# MultiOutputClassifier wraps a base estimator (RandomForest) to handle multiple target outputs independently.
base_rf = RandomForestClassifier(random_state=42, class_weight='balanced')
clf = MultiOutputClassifier(base_rf, n_jobs=-1)

# Hyperparameter Tuning using GridSearchCV to prevent under/over fitting
param_grid = {
    'estimator__n_estimators': [50, 100],
    'estimator__max_depth': [5, 10, None],
    'estimator__min_samples_split': [2, 5]
}

grid_search = GridSearchCV(clf, param_grid, cv=3, verbose=1)
grid_search.fit(X_train, y_train)

best_model = grid_search.best_estimator_
print(f"Best Hyperparameters found: {grid_search.best_params_}")

# 4. Evaluation
y_pred = best_model.predict(X_test)
print("\nEvaluation Report (Test Set):")
for i, target_col in enumerate(y.columns):
    print(f"\n--- {target_col} ---")
    
    # Check if there are unpredicted classes in the test set. Classification report will crash if target_names differ in length
    unique_pred = np.unique(y_pred[:, i])
    unique_test = np.unique(y_test.iloc[:, i])
    union_classes = np.union1d(unique_pred, unique_test)
    
    labels = label_encoders[target_col].inverse_transform(union_classes)
    
    # We pass the union_classes as labels to classification_report to ignore classes that never appear
    print(classification_report(y_test.iloc[:, i], y_pred[:, i], labels=union_classes, target_names=labels, zero_division=0))

# 5. Saving Artifacts
print("Saving Model and Label Encoders...")
joblib.dump(best_model, os.path.join(MODELS_DIR, 'lifestyle_rf_model.pkl'))
joblib.dump(label_encoders, os.path.join(MODELS_DIR, 'lifestyle_label_encoders.pkl'))

# Save a reference mapping for the API
with open(os.path.join(MODELS_DIR, 'lifestyle_mapping.json'), 'w') as f:
    mapping = {col: list(le.classes_) for col, le in label_encoders.items()}
    json.dump(mapping, f, indent=4)

print("✅ Lifestyle Model trained and exported successfully.")
