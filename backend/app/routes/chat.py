from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.core.deps import get_current_user
from app.schemas.chat import ChatRequest, ChatResponse
from app.ml.chatbot_model import get_chatbot_response
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

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
