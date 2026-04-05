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

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

app = FastAPI()

# ---------------------------------------------------------
# SECURITY: BULLETPROOF CORS GATEWAY
# ---------------------------------------------------------
# We use a custom middleware to ensure CORS headers are ALWAYS present,
# even during redirects (307/308) and internal errors (500).
@app.middleware("http")
async def cors_handler(request: Request, call_next):
    # Log origin for debugging if needed
    origin = request.headers.get("origin", "*")
    
    # Preflight OPTIONS requests
    if request.method == "OPTIONS":
        response = Response()
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With, Accept"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response

    response = await call_next(request)
    
    # Inject headers into every outgoing response
    response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With, Accept"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    
    return response

# Standard Proxy Middleware (required for HTTPS on Cloud/Railway)
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