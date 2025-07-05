@echo off
echo Share-IT Quick Setup Script for Windows
echo ======================================

REM Check Python
echo Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python not found. Please install Python 3.8 or higher.
    pause
    exit /b 1
)
echo OK: Python found

REM Check Node.js
echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Please install Node.js 16 or higher.
    pause
    exit /b 1
)
echo OK: Node.js found

REM Backend Setup
echo.
echo Setting up Backend...
cd backend

REM Create virtual environment
echo Creating Python virtual environment...
python -m venv venv

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing Python dependencies...
pip install -r requirements.txt

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating backend .env file...
    (
        echo # Database Configuration - SQLite
        echo DB_TYPE=sqlite
        echo SQLITE_DB_PATH=share_it.db
        echo.
        echo # JWT Configuration
        echo JWT_SECRET_KEY=dev-secret-key-change-in-production
        echo JWT_ALGORITHM=HS256
        echo JWT_EXPIRATION_HOURS=24
    ) > .env
    echo OK: Backend .env created
) else (
    echo OK: Backend .env already exists
)

REM Frontend Setup
echo.
echo Setting up Frontend...
cd ..\frontend

REM Install dependencies
echo Installing Node.js dependencies...
npm install

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating frontend .env file...
    echo REACT_APP_API_URL=http://localhost:8000/api > .env
    echo OK: Frontend .env created
) else (
    echo OK: Frontend .env already exists
)

echo.
echo ======================================
echo Setup Complete!
echo.
echo To start the application:
echo 1. Backend: cd backend ^&^& venv\Scripts\activate ^&^& streamlit run app.py
echo 2. Frontend: cd frontend ^&^& npm run dev
echo.
echo Default admin credentials:
echo Email: admin@shareit.com
echo Password: admin123
echo ======================================
pause