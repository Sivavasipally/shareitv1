#!/usr/bin/env python3
"""
Share-IT Backend Server Runner
This script runs the FastAPI backend server with proper configuration
"""

import uvicorn
import sys
import os
import logging
from pathlib import Path

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def check_dependencies():
    """Check if all required dependencies are installed"""
    try:
        import fastapi
        import jwt
        import bcrypt
        import dotenv
        logger.info("✅ All core dependencies are installed")
        return True
    except ImportError as e:
        logger.error(f"❌ Missing dependency: {e}")
        logger.error("Please run: pip install -r requirements.txt")
        return False


def check_environment():
    """Check and setup environment"""
    env_file = Path(".env")
    env_example = Path(".env.example")

    if not env_file.exists() and env_example.exists():
        logger.warning("⚠️  .env file not found, copying from .env.example")
        import shutil
        shutil.copy(env_example, env_file)
        logger.info("✅ Created .env file from template")

    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()

    # Check critical environment variables
    jwt_secret = os.getenv("JWT_SECRET_KEY", "").strip()
    if jwt_secret == "" or jwt_secret == "your-very-secret-key-change-this-in-production":
        logger.warning("⚠️  JWT_SECRET_KEY is not set or using default value!")
        logger.warning("⚠️  Please update JWT_SECRET_KEY in .env file for production")


def create_initial_data():
    """Create initial data if needed"""
    try:
        from database import init_database
        from auth import AuthService

        # Initialize database
        init_database()
        logger.info("✅ Database initialized successfully")

        # Create admin user if not exists
        AuthService.create_admin_user()

    except Exception as e:
        logger.error(f"❌ Error during initialization: {e}")
        raise


def print_startup_info():
    """Print startup information"""
    print("\n" + "="*60)
    print("🚀 Share-IT API Server")
    print("="*60)
    print(f"📄 API Documentation: http://localhost:8000/docs")
    print(f"📄 Alternative Docs: http://localhost:8000/redoc")
    print(f"🔗 API Base URL: http://localhost:8000/api")
    print(f"💓 Health Check: http://localhost:8000/health")
    print("="*60)
    print("📝 Default Admin Credentials:")
    print("   Email: admin@shareit.com")
    print("   Password: admin123")
    print("   ⚠️  IMPORTANT: Change these in production!")
    print("="*60)
    print("🔧 Configuration:")

    db_type = os.getenv("DB_TYPE", "sqlite")
    print(f"   Database: {db_type.upper()}")

    if db_type == "sqlite":
        db_path = os.getenv("SQLITE_DB_PATH", "share_it.db")
        print(f"   DB Path: {db_path}")
    else:
        print(f"   Host: {os.getenv('MYSQL_HOST', 'localhost')}")
        print(f"   Database: {os.getenv('MYSQL_DATABASE', 'share_it_db')}")

    print("="*60)
    print("Press CTRL+C to stop the server")
    print("="*60 + "\n")


def run_server():
    """Run the FastAPI server"""
    # Check dependencies
    if not check_dependencies():
        logger.error("Please install all required dependencies")
        sys.exit(1)

    # Check environment
    check_environment()

    # Create initial data
    try:
        create_initial_data()
    except Exception as e:
        logger.error(f"Failed to initialize: {e}")
        sys.exit(1)

    # Print startup info
    print_startup_info()

    # Get configuration from environment
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    reload = os.getenv("RELOAD", "true").lower() == "true"
    log_level = os.getenv("LOG_LEVEL", "info").lower()

    # Determine if we're in development or production
    environment = os.getenv("ENVIRONMENT", "development")

    if environment == "production":
        # Production configuration
        logger.info("🏭 Running in PRODUCTION mode")
        uvicorn.run(
            "app:app",
            host=host,
            port=port,
            log_level=log_level,
            reload=False,  # No reload in production
            workers=4,     # Multiple workers for production
            access_log=True
        )
    else:
        # Development configuration
        logger.info("🔧 Running in DEVELOPMENT mode (auto-reload enabled)")
        uvicorn.run(
            "app:app",
            host=host,
            port=port,
            log_level=log_level,
            reload=reload,  # Auto-reload for development
            reload_dirs=[".", "routes", "utils"],  # Watch these directories
            access_log=True
        )


def run_with_streamlit():
    """Run the server alongside Streamlit (if needed)"""
    from threading import Thread
    import time

    # Start FastAPI in a separate thread
    api_thread = Thread(target=run_server, daemon=True)
    api_thread.start()

    # Give the API time to start
    time.sleep(2)

    # Run Streamlit UI if needed
    try:
        import streamlit
        os.system("streamlit run app_ui.py")
    except ImportError:
        logger.info("Streamlit not installed, running API only")
        api_thread.join()


if __name__ == "__main__":
    # Parse command line arguments
    if len(sys.argv) > 1:
        if sys.argv[1] == "--with-ui":
            run_with_streamlit()
        elif sys.argv[1] == "--help":
            print("Share-IT Backend Server")
            print("\nUsage:")
            print("  python run_backend.py           # Run API server only")
            print("  python run_backend.py --with-ui # Run with Streamlit UI")
            print("  python run_backend.py --help    # Show this help")
            print("\nEnvironment Variables:")
            print("  PORT=8000                      # Server port")
            print("  HOST=0.0.0.0                   # Server host")
            print("  ENVIRONMENT=development        # Environment (development/production)")
            print("  LOG_LEVEL=info                 # Log level")
            print("  RELOAD=true                    # Auto-reload (development only)")
            sys.exit(0)
        else:
            print(f"Unknown argument: {sys.argv[1]}")
            print("Run 'python run_backend.py --help' for usage information")
            sys.exit(1)
    else:
        # Default: run server only
        run_server()