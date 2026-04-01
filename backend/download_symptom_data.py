import urllib.request
import os

repo_url = "https://raw.githubusercontent.com/itachi9604/healthcare-chatbot/master/Data/"
files = [
    "dataset.csv",
    "symptom_Description.csv",
    "symptom_precaution.csv"
]

os.makedirs("app/ml/data", exist_ok=True)

for file in files:
    url = repo_url + file
    out_path = f"app/ml/data/{file}"
    print(f"Downloading {file}...")
    try:
        urllib.request.urlretrieve(url, out_path)
        print(f"Saved to {out_path}")
    except Exception as e:
        print(f"Failed to download {file}: {e}")

repo_url_2 = "https://raw.githubusercontent.com/Bhawnagoyal18/AI-Doctor-A-Symptom-Checker-Disease-Predictor/main/"
files_2 = [
    "diets.csv",
    "medications.csv",
    "workout_df.csv",
    "Symptom-severity.csv"
]

for file in files_2:
    url = repo_url_2 + file
    out_path = f"app/ml/data/{file}"
    print(f"Downloading {file}...")
    try:
        urllib.request.urlretrieve(url, out_path)
        print(f"Saved to {out_path}")
    except Exception as e:
        print(f"Failed to download {file}: {e}")
