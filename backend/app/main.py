import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, vitals, medication, daily_log, chat, ml, user
from app.database.session import engine
from app.models import user as user_model, vitals as vitals_model, medication as medication_model, daily_log as daily_log_model
from app.database.base import Base

app = FastAPI()

# Create DB tables (including the new ones)
Base.metadata.create_all(bind=engine)

# Configure CORS dynamically for production
allowed_origins_env = os.getenv("VITE_ALLOWED_ORIGINS", "")
allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]

if not allowed_origins:
    allowed_origins = [
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:8081",
        "http://127.0.0.1:8081",
        "http://localhost:8082",
        "http://127.0.0.1:8082"
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(vitals.router, prefix="/api/vitals", tags=["Vitals"])
app.include_router(medication.router, prefix="/api/medications", tags=["Medications"])
app.include_router(daily_log.router, prefix="/api/daily-logs", tags=["Daily Logs"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat AI"])
app.include_router(ml.router, prefix="/api/ml", tags=["Machine Learning"])
app.include_router(user.router, prefix="/api/users", tags=["Users"])

@app.get("/")
def root():
    return {"message": "PreventX Backend Running 🚀"}

from fastapi import WebSocket, WebSocketDisconnect
from app.core.sockets import manager

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep the connection open and wait for messages from the client
            # (In this app, the client mostly just receives broadcasts, but we need to await receive)
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)