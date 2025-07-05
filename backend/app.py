"""
Share-IT Backend API
A RESTful API for book and board game sharing platform
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import time
import logging
from contextlib import asynccontextmanager

# Import route modules
from routes import (
    users_router,
    books_router,
    boardgames_router,
    requests_router,
    admin_router,
    activity_router,
    notifications_router,
    search_router
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# Lifespan context manager for startup/shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Share-IT API...")
    
    # Initialize database
    try:
        from database import init_database
        init_database()
        logger.info("Database initialization completed")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise
    
    # Create admin user
    try:
        from auth import AuthService
        AuthService.create_admin_user()
        logger.info("Admin user check completed")
    except Exception as e:
        logger.error(f"Admin user creation failed: {e}")
    
    logger.info("API is ready to accept requests")
    yield
    # Shutdown
    logger.info("Shutting down Share-IT API...")


# Create FastAPI app
app = FastAPI(
    title="Share-IT API",
    description="Book & Board Games Sharing Platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite
        "http://localhost:3000",  # Create React App
        "http://localhost:8080",  # Vue CLI
        "http://localhost:4200",  # Angular
        "http://localhost:5000",  # Flask
        "http://localhost:8501",  # Streamlit
        "http://127.0.0.1:5173",  # Vite with 127.0.0.1
        "http://127.0.0.1:3000",  # Create React App with 127.0.0.1
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Custom exception handlers
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "detail": exc.detail,
            "status_code": exc.status_code
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors"""
    errors = []
    for error in exc.errors():
        errors.append({
            "loc": error["loc"],
            "msg": error["msg"],
            "type": error["type"]
        })

    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "detail": "Validation error",
            "errors": errors
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions"""
    logger.error(f"Unexpected error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "detail": "Internal server error",
            "message": "An unexpected error occurred"
        }
    )


# Middleware for request logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all incoming requests"""
    start_time = time.time()

    # Log request
    logger.info(f"Request: {request.method} {request.url.path}")

    # Process request
    response = await call_next(request)

    # Calculate process time
    process_time = time.time() - start_time

    # Log response
    logger.info(
        f"Response: {request.method} {request.url.path} "
        f"- Status: {response.status_code} - Time: {process_time:.3f}s"
    )

    # Add custom headers
    response.headers["X-Process-Time"] = str(process_time)
    response.headers["X-API-Version"] = "1.0.0"

    return response


# Include routers with proper prefixes
app.include_router(users_router, tags=["Authentication"])
app.include_router(books_router, tags=["Books"])
app.include_router(boardgames_router, tags=["Board Games"])
app.include_router(requests_router, tags=["Requests"])
app.include_router(admin_router, tags=["Admin"])
app.include_router(activity_router, tags=["Activity"])
app.include_router(notifications_router, tags=["Notifications"])
app.include_router(search_router, tags=["Search"])


# Root endpoint
@app.get("/", tags=["General"])
async def root():
    """
    Root endpoint - API information
    """
    return {
        "success": True,
        "message": "Welcome to Share-IT API",
        "version": "1.0.0",
        "documentation": {
            "swagger": "/docs",
            "redoc": "/redoc",
            "openapi": "/openapi.json"
        },
        "endpoints": {
            "auth": "/api/auth",
            "books": "/api/books",
            "boardgames": "/api/boardgames",
            "requests": "/api/requests",
            "admin": "/api/admin",
            "activity": "/api/activity",
            "notifications": "/api/notifications",
            "search": "/api/search"
        },
        "status": "online",
        "timestamp": time.time()
    }


# Health check endpoint
@app.get("/health", tags=["General"])
async def health_check():
    """
    Health check endpoint
    """
    return {
        "success": True,
        "status": "healthy",
        "service": "share-it-api",
        "version": "1.0.0",
        "timestamp": time.time()
    }


# API health check
@app.get("/api/health", tags=["General"])
async def api_health_check():
    """
    API health check endpoint
    """
    try:
        from database import execute_one
        db_check = execute_one("SELECT 1 as health_check")
        db_status = "connected" if db_check else "disconnected"
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        db_status = "error"

    return {
        "success": True,
        "status": "healthy",
        "database": db_status,
        "timestamp": time.time(),
        "uptime": time.process_time()
    }


# API info endpoint
@app.get("/api/info", tags=["General"])
async def api_info():
    """
    Get API information and statistics
    """
    return {
        "success": True,
        "api": {
            "name": "Share-IT API",
            "version": "1.0.0",
            "description": "Book & Board Games Sharing Platform API"
        },
        "features": [
            "User authentication with JWT",
            "Book management",
            "Board game management",
            "Borrow request system",
            "Admin dashboard",
            "Activity logging",
            "Email notifications (configured)",
            "SQLite/MySQL database support"
        ],
        "authentication": {
            "type": "Bearer",
            "format": "JWT",
            "header": "Authorization: Bearer <token>"
        },
        "rate_limiting": {
            "enabled": False,
            "requests_per_minute": 60
        },
        "contact": {
            "email": "support@shareit.com",
            "documentation": "https://github.com/yourusername/share-it"
        }
    }


# If running directly (not recommended for production)
if __name__ == "__main__":
    import uvicorn

    logger.info("Starting Share-IT API in development mode...")
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )