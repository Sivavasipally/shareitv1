import streamlit as st
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from threading import Thread
import time
import os

# Import route modules
from routes import (
    users_router,
    books_router,
    boardgames_router,
    requests_router,
    admin_router
)

# FastAPI app
app = FastAPI(
    title="Share-IT API",
    version="1.0.0",
    description="Book & Board Games Sharing Platform API"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users_router)
app.include_router(books_router)
app.include_router(boardgames_router)
app.include_router(requests_router)
app.include_router(admin_router)

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Share-IT API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "online"
    }

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": time.time()}

# Continue with the rest of your Streamlit UI code...