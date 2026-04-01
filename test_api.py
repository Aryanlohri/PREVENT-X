import requests
import json

url = "http://127.0.0.1:8000/api/chat/"
payload = {
    "messages": [
        {"role": "user", "content": "hello"}
    ]
}

try:
    auth_resp = requests.post("http://127.0.0.1:8000/auth/login", data={"username": "lohri@example.com", "password": "password"})
    token = auth_resp.json().get("access_token")
    if not token:
        # Fallback fake token if auth is bypassed for testing
        token = "test"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }

    res = requests.post(url, json=payload, headers=headers)
    print("STATUS CODE:", res.status_code)
    print("RESPONSE BODY:")
    print(res.text)
except Exception as e:
    print(f"Error making request: {e}")
