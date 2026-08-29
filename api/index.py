"""Vercel Serverless ASGI Entrypoint for Vision Max Intelligence."""
import sys
import os

# Add parent directory to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.main import app

# Vercel ASGI Application Handler
# The 'app' object is automatically recognized by @vercel/python
handler = app
