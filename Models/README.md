# 🏥 PreventX: Machine Learning Model Zoo 🧠

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![Scikit-Learn](https://img.shields.io/badge/sklearn-1.0+-orange.svg)](https://scikit-learn.org/)
[![Kaggle](https://img.shields.io/badge/Datasets-Kaggle-blue.svg)](https://www.kaggle.com/)

This repository is the technical heartbeat of **PreventX**, an AI-driven health companion. It contains the complete source code for our training pipelines, dataset preprocessing, and diagnostic inference engines.

---

## 🚀 Key Intelligent Features

### 1. 📋 Diagnostic Triage Engine (`symptom_rf_model`)
*   **Problem**: High-volume symptom data requires rapid, non-invasive risk assessment.
*   **Our Solution**: A **Random Forest Classifier** trained on 42 unique disease patterns. Unlike standard models, it utilizes `predict_proba` to return the **Top-3 probable diagnosis** with exact AI confidence percentages.
*   **Architecture**: Optimized via 3-fold cross-validation (`GridSearchCV`) to tune depth and estimator counts, achieving balanced F1-scores across rare and common diseases.

### 2. 🥙 AI Nutritionist & Goal Planner (`lifestyle_rf_model`)
*   **The Innovation**: A **Multi-Output Classifier** that handles 4 distinct health targets (Calories, Macros, Workout, Intensity) from a single user feature set.
*   **Clinical Grounding**: Maps Age, Gender, BMI, and Pre-existing conditions (Diabetes, Hypertension, etc.) to tailored regimens based on standard clinical guidelines.
*   **Data Strategy**: Uses a hybrid approach of clinical rules and synthetic data augmentation to ensure robust predictions for edge-case patient profiles.

### 3. 📉 Diabetic Risk Intelligence (`risk_model`)
*   **Context**: Early detection is the single most effective intervention for Chronic metabolic issues.
*   **Science**: Trained on the **Early Stage Diabetes** dataset from the UCI Machine Learning Repository, analyzing 16 clinical attributes with **StandardScaler** normalization.

---

## 📊 Data Stewardship

Our models are grounded in high-quality research data sourced from:
*   **Primary Source**: [Kaggle Disease Prediction Series](https://www.kaggle.com/datasets/kaushil268/disease-prediction-using-machine-learning)
*   **Secondary Source**: [Kaggle Disease Symptom Description & Treatment](https://www.kaggle.com/datasets/itachi9604/disease-symptom-description-dataset)
*   **Synthetic Layer**: Custom-built clinical generators (see `train_lifestyle_model.py`) to simulate complex multi-morbidity cases.

---

## 🛠 Quick Installation & Usage

### 1. Requirements
```bash
pip install -r requirements.txt
```

### 2. Run a Training Pipeline
```bash
# Retrain the Symptom Classifier
python train_symptom_model.py

# Retrain the AI Nutritionist
python train_lifestyle_model.py
```

### 3. Simple Inference Snippet
```python
import joblib
import pandas as pd

# Load and Predict
model = joblib.load('models/lifestyle_rf_model.pkl')
patient_data = pd.DataFrame([[35, 1, 165, 60, 0]], columns=['age', 'gender', 'height_cm', 'weight_kg', 'condition'])
print(f"Personalized Plan: {model.predict(patient_data)}")
```

---

## 📈 Model Performance Highlights

| Model Name | Primary Algorithm | Validation Metric | Target Count |
| :--- | :--- | :--- | :--- |
| **Symptom Triage** | Random Forest | 0.98 Mean F1-Score | 42 Diseases |
| **AI Nutritionist** | Multi-Output RF | 0.94 Accuracy | 4 Targets |
| **Chronic Risk** | Random Forest | 0.97 Precision | Binary |

---

## 📜 License & Citation

This project is licensed under the **Apache 2.0 License**. If you use these models or datasets in your research, please link back to this repository and the original Kaggle sources.

---

> [!IMPORTANT]
> **Clinical Disclaimer**: These models are for research and educational purposes only. They are not intended to replace professional medical advice, diagnosis, or treatment. Always consult with a qualified health provider.
