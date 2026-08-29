"""Bulletproof Runner script for Vision Max Intelligence Backend."""
import sys
import os

# Add both current directory and parent directory to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)

if current_dir not in sys.path:
    sys.path.insert(0, current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

import uvicorn

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    print(f"🚀 Starting Vision Max Intelligence Neural Studio on http://{host}:{port}")
    print(f"📖 Interactive API Documentation: http://localhost:{port}/docs")

    # Check whether we are running from root or backend directory
    try:
        import backend.main
        app_target = "backend.main:app"
    except ImportError:
        app_target = "main:app"

    uvicorn.run(app_target, host=host, port=port, reload=True)
