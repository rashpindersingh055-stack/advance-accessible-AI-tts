"""Routers package."""
from .tts import router as tts_router
from .dialogue import router as dialogue_router
from .effects import router as effects_router
from .auth import router as auth_router
from .agent import router as agent_router

__all__ = ["tts_router", "dialogue_router", "effects_router", "auth_router", "agent_router"]
