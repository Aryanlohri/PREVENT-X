from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.core.deps import get_current_user
from app.schemas.chat import ChatRequest, ChatResponse
from app.ml.chatbot_model import get_chatbot_response
from pydantic import BaseModel
from typing import List
import logging
import json
import os
import random

router = APIRouter()
logger = logging.getLogger(__name__)

# Path to intents data for quick questions
INTENTS_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "ml", "data", "intents.json")

# Curated categories for quick questions — these are the 4 categories
# that have the highest clinical value and guaranteed correct NLP responses.
# Each maps to a specific intent tag and a pool of user-friendly question texts.
CURATED_QUICK_CATEGORIES = [
    {
        "tag": "diet_diabetes",
        "questions": [
            "What should I eat for diabetes?",
            "How to manage blood sugar with food?",
        ]
    },
    {
        "tag": "mental_stress",
        "questions": [
            "How to relieve stress?",
            "I am stressed",
        ]
    },
    {
        "tag": "app_vitals",
        "questions": [
            "How do I log my vitals?",
            "How to use the dashboard?",
        ]
    },
    {
        "tag": "general_bp",
        "questions": [
            "What is normal blood pressure?",
            "Blood pressure ranges",
        ]
    },
]


class QuickQuestionsResponse(BaseModel):
    questions: List[str]


@router.post("/", response_model=ChatResponse)
def chat_with_ai(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # Extract the latest user message from the list
        latest_message = ""
        for msg in reversed(request.messages):
            if msg.role == "user":
                latest_message = msg.content
                break
                
        if not latest_message:
            return ChatResponse(response="Please provide a valid question.")

        response_text = get_chatbot_response(latest_message)
        return ChatResponse(response=response_text)
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error communicating with AI service: {str(e)}"
        )


@router.get("/quick-questions", response_model=QuickQuestionsResponse)
def get_quick_questions(current_user: User = Depends(get_current_user)):
    """
    Returns exactly 4 curated quick questions, one from each high-value category.
    Each question is guaranteed to produce a correct, relevant NLP response because
    the questions are drawn from the exact patterns in the training data.
    """
    try:
        selected = []
        for category in CURATED_QUICK_CATEGORIES:
            # Pick one random question from each category's pool
            question = random.choice(category["questions"])
            selected.append(question)
        
        return QuickQuestionsResponse(questions=selected)
    except Exception as e:
        logger.error(f"Error generating quick questions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate quick questions"
        )
