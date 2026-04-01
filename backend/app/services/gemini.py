import google.generativeai as genai
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.user import User
from app.models.vitals import Vital
from app.models.medication import Medication
from app.models.daily_log import DailyLog
from app.schemas.chat import ChatMessage
import json

# Configure Gemini API
genai.configure(api_key=settings.GEMINI_API_KEY)

# Use the recommended model for chat
model = genai.GenerativeModel('gemini-pro')

def get_user_context(db: Session, user: User) -> str:
    # Fetch recent vitals, meds, and logs to provide context to the AI
    vitals = db.query(Vital).filter(Vital.user_id == user.id).order_by(Vital.timestamp.desc()).limit(5).all()
    meds = db.query(Medication).filter(Medication.user_id == user.id).all()
    logs = db.query(DailyLog).filter(DailyLog.user_id == user.id).order_by(DailyLog.date.desc()).limit(5).all()

    context = f"User Profile: Name: {user.full_name}\n\n"
    
    if vitals:
        context += "Recent Vitals:\n"
        for v in vitals:
            context += f"- Date: {v.timestamp.strftime('%Y-%m-%d %H:%M')}, BP: {v.blood_pressure_sys}/{v.blood_pressure_dia}, HR: {v.heart_rate}, Sugar: {v.blood_sugar}, BMI: {v.bmi}\n"
    
    if meds:
        context += "\nCurrent Medications:\n"
        for m in meds:
            context += f"- {m.name} at {m.time} (Taken today: {m.taken})\n"
            
    if logs:
        context += "\nRecent Daily Logs (Diet/Exercise/Sleep):\n"
        for l in logs:
            context += f"- Date: {l.date.strftime('%Y-%m-%d')}, Sleep: {l.sleep_quality}/10, Activity: {l.physical_activity} mins, Diet: {l.diet_quality}/10, Stress: {l.stress_level}/10\n"

    return context

def generate_chat_response(messages: list[ChatMessage], db: Session, user: User) -> str:
    user_context = get_user_context(db, user)
    
    system_prompt = f"""
    You are PreventX AI, a helpful, empathetic, and highly knowledgeable health and wellness companion.
    Your goal is to help the user understand their health data, provide personalized advice based on their logged vitals, medications, and lifestyle, and encourage them to build healthy habits.
    Always be supportive. If they ask a medical question, remind them that you are an AI and they should consult a doctor for diagnosis, but you can provide general wellness information.
    
    Here is the current context and health data for the user you are speaking to:
    {user_context}
    
    Use this data to personalize your responses. If their blood pressure is high, gently suggest lifestyle changes. If they haven't logged activity, encourage them.
    Keep your answers concise, formatted cleanly, and easy to read.
    """
    
    # Format messages for Gemini (Gemini uses 'user' and 'model' roles)
    gemini_messages = []
    
    # Add system prompt as the first message from the user, and an acknowledgment from the model
    # (Since Gemini 1.5 Flash supports system instructions, we can use that if we instantiate it differently,
    # but for simplicity passing it in the history works too)
    
    for msg in messages:
        role = "user" if msg.role == "user" else "model"
        gemini_messages.append({"role": role, "parts": [msg.content]})
        
    # Inject system instruction
    chat = model.start_chat(history=[
        {"role": "user", "parts": [system_prompt]},
        {"role": "model", "parts": ["Understood. I am PreventX AI, and I will use this context to help the user."]}
    ] + gemini_messages[:-1]) # add history up to the last message
    
    # The actual prompt is the last message
    last_message = messages[-1].content
    
    response = chat.send_message(last_message)
    return response.text
