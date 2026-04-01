import os
import joblib
import json
import random
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
DATA_FILE = os.path.join(BASE_DIR, "data", "intents.json")

# Lazy load models to save memory at startup
_model = None
_vectorizer = None
_intents = None

def get_chatbot_response(user_input: str) -> str:
    """Classifies the intent of the user's message and returns an appropriate response."""
    global _model, _vectorizer, _intents
    if _model is None or _vectorizer is None or _intents is None:
        try:
            temp_model = joblib.load(os.path.join(MODELS_DIR, "chatbot_model.pkl"))
            temp_vectorizer = joblib.load(os.path.join(MODELS_DIR, "chatbot_vectorizer.pkl"))
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                temp_intents = json.load(f)["intents"]
            
            # Atomic assignment
            _model = temp_model
            _vectorizer = temp_vectorizer
            _intents = temp_intents
            
        except Exception as e:
            return "Error initializing local NLP engine. Ensure you've run train_chatbot_model.py. Details: " + str(e)

    # 1. Process Input
    X = _vectorizer.transform([user_input])
    
    # 2. Predict Intent Probabilities
    probs = _model.predict_proba(X)[0]
    best_match_idx = np.argmax(probs)
    confidence = probs[best_match_idx]
    
    tag = _model.classes_[best_match_idx]
    
    # Check Confidence Threshold to prevent hallucination on unknown topics
    if confidence < 0.08:
        return "I'm not quite sure how to help with that. Try asking me about your diet, workouts, or general health symptoms."

    # 3. Fetch matched intent responses
    for intent in _intents:
        if intent["tag"] == tag:
            return random.choice(intent["responses"])

    return "I understood your question, but I don't have a response programmed for that yet."
