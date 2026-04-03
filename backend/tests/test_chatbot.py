import sys
import os

# Add backend to path so imports work
sys.path.append(os.path.abspath("backend"))

from app.ml.chatbot_model import get_chatbot_response

print("Testing chatbot directly...")
try:
    response = get_chatbot_response("I have a headache")
    print("RESPONSE:", response)
except Exception as e:
    import traceback
    traceback.print_exc()
