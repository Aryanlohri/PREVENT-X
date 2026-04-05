import os
import sys

# Fix import paths for Vercel serverless
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware
from app.routes import auth, vitals, medication, daily_log, chat, ml, user
from app.database.session import engine
from app.models import user as user_model, vitals as vitals_model, medication as medication_model, daily_log as daily_log_model
from app.database.base import Base

app = FastAPI()

# Create DB tables — wrapped to prevent crash if DB is unreachable
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Warning: Could not create tables: {e}")

# Configure CORS
allowed_origins = [
    "https://prevent-x.vercel.app",
    "https://prevent-x-production.up.railway.app",
    "http://localhost:5173",
    "http://localhost:8080",
    "http://localhost:3000",
]

# Add any environment-specific origins
allowed_origins_env = os.getenv("VITE_ALLOWED_ORIGINS", "")
if allowed_origins_env:
    allowed_origins.extend([origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()])

from fastapi import Request, Response

@app.middleware("http")
async def force_cors_middleware(request: Request, call_next):
    # Log the incoming origin for debugging
    origin = request.headers.get("origin")
    
    # Preflight (OPTIONS) request handling
    if request.method == "OPTIONS":
        response = Response()
        response.headers["Access-Control-Allow-Origin"] = origin or "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response

    response = await call_next(request)
    
    # Inject CORS headers into every response
    response.headers["Access-Control-Allow-Origin"] = origin or "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, x-requested-with"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    
    return response

# Standard CORSMiddleware as a backup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trust Proxy Headers (Required for Railway/Vercel HTTPS)
app.add_middleware(ProxyHeadersMiddleware, trusted_hosts="*")

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

# WebSocket — will not work on Vercel (serverless), kept for local dev only
from fastapi import WebSocket, WebSocketDisconnect
from app.core.sockets import manager

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Mangum handler — required for Vercel serverless
from mangum import Mangum
handler = Mangum(app, lifespan="off")