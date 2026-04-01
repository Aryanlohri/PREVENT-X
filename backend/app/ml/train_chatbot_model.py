import json
import numpy as np
import os
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import classification_report

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, "data", "intents.json")
MODELS_DIR = os.path.join(BASE_DIR, "models")

def train_chatbot():
    print("Loading medical NLP dataset...")
    with open(DATA_FILE, "r") as f:
        data = json.load(f)

    # 1. Prepare Data
    patterns = []
    tags = []
    for intent in data["intents"]:
        for pattern in intent["patterns"]:
            patterns.append(pattern)
            tags.append(intent["tag"])

    # 2. Vectorization (TF-IDF)
    # Using TF-IDF instead of simple Bag of Words preserves the importance of rare medical terms.
    vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words="english", lowercase=True)
    X = vectorizer.fit_transform(patterns)
    y = np.array(tags)

    print(f"Extracted {X.shape[1]} features from {len(patterns)} question patterns.")

    # 3. Train/Test Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)
    
    # 4. Model Definition & Grid Search for Overfitting Prevention
    print("Training Support Vector Machine Intent Classifier...")
    svm = SVC(probability=True, random_state=42)
    
    param_grid = {
        'C': [0.1, 1, 10], # Regularization parameter (controls over/under fitting)
        'kernel': ['linear', 'rbf']
    }
    
    grid = GridSearchCV(svm, param_grid, cv=3, verbose=1)
    grid.fit(X_train, y_train)
    
    best_model = grid.best_estimator_
    print(f"Best parameters found: {grid.best_params_}")

    # 5. Evaluation
    y_pred = best_model.predict(X_test)
    print("\n--- Test Set Evaluation ---")
    
    # Filtering out unseen labels for a clean report
    unique_pred = np.unique(y_pred)
    unique_test = np.unique(y_test)
    union_classes = np.union1d(unique_pred, unique_test)
    
    print(classification_report(y_test, y_pred, labels=union_classes, zero_division=0))

    # 6. Save Artifacts
    os.makedirs(MODELS_DIR, exist_ok=True)
    joblib.dump(best_model, os.path.join(MODELS_DIR, "chatbot_model.pkl"))
    joblib.dump(vectorizer, os.path.join(MODELS_DIR, "chatbot_vectorizer.pkl"))
    
    print(f"✅ Trained NLP model saved successfully in {MODELS_DIR}")

if __name__ == "__main__":
    train_chatbot()
