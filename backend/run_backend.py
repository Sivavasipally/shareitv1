#!/usr/bin/env python3
"""
Alternative runner for the backend API server.
This can be run directly with Python: python run_backend.py
"""

import uvicorn
import sys
import os
from threading import Thread
import time

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import the FastAPI app
from app import app


def run_server():
    """Run the FastAPI server"""
    print("🚀 Starting Share-IT API Server...")
    print("=" * 50)
    print("📄 API Documentation: http://localhost:8000/docs")
    print("🔗 API Base URL: http://localhost:8000/api")
    print("=" * 50)

    # Get port from environment or use default
    port = int(os.getenv('PORT', 8000))

    # Run the server
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        log_level="info",
        reload=True  # Enable auto-reload for development
    )


if __name__ == "__main__":
    run_server()