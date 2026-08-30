"""Main FastAPI Application for Vision Max Intelligence Neural Studio."""
import sys
import os
import time

# Ensure proper path resolution
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from fastapi import FastAPI, Request, Response
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Universal Import Resolution
try:
    from backend.routers.tts import router as tts_router
    from backend.routers.dialogue import router as dialogue_router
    from backend.routers.effects import router as effects_router
    from backend.routers.auth import router as auth_router
    from backend.middleware.firewall import SecurityFirewallMiddleware
    from backend.services.gemini_tts import GeminiTTSService
except (ImportError, ModuleNotFoundError):
    from routers.tts import router as tts_router
    from routers.dialogue import router as dialogue_router
    from routers.effects import router as effects_router
    from routers.auth import router as auth_router
    from middleware.firewall import SecurityFirewallMiddleware
    from services.gemini_tts import GeminiTTSService

load_dotenv()

app = FastAPI(
    title="Vision Max Intelligence — Neural TTS Studio API",
    description="Enterprise-Grade Multi-modal Voice Synthesis, User Onboarding Database, and Audio DSP Engine protected with WAF & Firewall.",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# 1. Attach Web Application Firewall (WAF) & Rate Limiter Middleware
app.add_middleware(SecurityFirewallMiddleware, max_requests_per_minute=120)

# 2. Performance Tracking Latency Middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.perf_counter()
    response: Response = await call_next(request)
    process_time_ms = round((time.perf_counter() - start_time) * 1000, 2)
    response.headers["X-Process-Time-Ms"] = str(process_time_ms)
    response.headers["X-Powered-By"] = "Vision-Max-Neural-Studio-v2.0"
    return response

# 3. CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Include API Routers
app.include_router(auth_router)
app.include_router(tts_router)
app.include_router(dialogue_router)
app.include_router(effects_router)

# 5. Mount Static Assets if built frontend exists
dist_dir = os.path.join(parent_dir, "frontend", "dist")
assets_dir = os.path.join(dist_dir, "assets")
if os.path.exists(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

@app.get("/", tags=["Health & System"])
async def root(request: Request):
    accept = request.headers.get("accept", "")
    dist_html = os.path.join(parent_dir, "frontend", "dist", "index.html")
    
    # If accessed by a browser, serve the compiled React SPA directly
    if ("text/html" in accept or "*/*" in accept) and os.path.exists(dist_html):
        return FileResponse(dist_html)

    tts_service = GeminiTTSService()
    return {
        "service": "Vision Max Intelligence Neural TTS Studio",
        "version": "2.0.0",
        "status": "online",
        "firewall_status": "active & protecting",
        "docs": "/docs",
        "database": "SQLite / SQLAlchemy Pro Ready",
        "notification_recipient": "rashpindertechwith@gmail.com",
        "supported_engines": [
            "gemini-2.5-flash-preview-tts",
            "gemini-3.1-flash-tts",
            "gemini-3-pro-tts",
            "gemini-2.5-pro-tts"
        ],
        "voices_count": 30,
        "emotion_styles_count": 10,
        "cache": tts_service.cache.stats()
    }

@app.get("/health", tags=["Health & System"])
async def health_check():
    return {
        "status": "healthy",
        "firewall": "protected",
        "engine": "ready",
        "database": "connected",
        "timestamp": time.time()
    }
