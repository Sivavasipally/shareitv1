"""
Configuration settings for Share-IT backend
"""

import os
from typing import List
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class Settings:
    """Application settings"""

    # API Settings
    API_TITLE: str = "Share-IT API"
    API_VERSION: str = "1.0.0"
    API_DESCRIPTION: str = "Book & Board Games Sharing Platform API"

    # Server Settings
    HOST: str = "0.0.0.0"
    PORT: int = int(os.getenv("PORT", 8000))
    RELOAD: bool = True  # Auto-reload on code changes (development only)

    # Database Settings
    DB_TYPE: str = os.getenv("DB_TYPE", "sqlite").lower()

    # SQLite Settings
    SQLITE_DB_PATH: str = os.getenv("SQLITE_DB_PATH", "share_it.db")

    # MySQL Settings
    MYSQL_HOST: str = os.getenv("MYSQL_HOST", "localhost")
    MYSQL_USER: str = os.getenv("MYSQL_USER", "root")
    MYSQL_PASSWORD: str = os.getenv("MYSQL_PASSWORD", "")
    MYSQL_DATABASE: str = os.getenv("MYSQL_DATABASE", "share_it_db")
    MYSQL_POOL_SIZE: int = 5

    # JWT Settings
    JWT_SECRET_KEY: str = os.getenv(
        "JWT_SECRET_KEY",
        "your-very-secret-key-change-this-in-production"
    )
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRATION_HOURS: int = int(os.getenv("JWT_EXPIRATION_HOURS", 24))

    # CORS Settings
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",  # Vite default
        "http://localhost:3000",  # Create React App default
        "http://localhost:8080",  # Vue CLI default
        "http://localhost:4200",  # Angular default
    ]

    # File Upload Settings (for future use)
    MAX_UPLOAD_SIZE: int = 5 * 1024 * 1024  # 5 MB
    ALLOWED_EXTENSIONS: List[str] = ["jpg", "jpeg", "png", "gif", "webp"]

    # Pagination Settings
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100

    # Security Settings
    PASSWORD_MIN_LENGTH: int = 6
    PASSWORD_MAX_LENGTH: int = 100

    # Rate Limiting (for future implementation)
    RATE_LIMIT_ENABLED: bool = False
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW: int = 60  # seconds

    # Email Settings (for future implementation)
    EMAIL_ENABLED: bool = False
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", 587))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    EMAIL_FROM: str = os.getenv("EMAIL_FROM", "noreply@shareit.com")

    # Default Admin Account
    DEFAULT_ADMIN_EMAIL: str = "admin@shareit.com"
    DEFAULT_ADMIN_PASSWORD: str = "admin123"  # CHANGE THIS IN PRODUCTION!
    DEFAULT_ADMIN_USERNAME: str = "admin"

    # Logging Settings
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    # Feature Flags
    ENABLE_COMMUNITIES: bool = False  # Community feature (future)
    ENABLE_NOTIFICATIONS: bool = True
    ENABLE_ACTIVITY_LOG: bool = True

    @property
    def database_url(self) -> str:
        """Get database URL based on DB_TYPE"""
        if self.DB_TYPE == "sqlite":
            return f"sqlite:///{self.SQLITE_DB_PATH}"
        else:
            return (
                f"mysql://{self.MYSQL_USER}:{self.MYSQL_PASSWORD}@"
                f"{self.MYSQL_HOST}/{self.MYSQL_DATABASE}"
            )

    def is_development(self) -> bool:
        """Check if running in development mode"""
        return os.getenv("ENVIRONMENT", "development") == "development"

    def is_production(self) -> bool:
        """Check if running in production mode"""
        return os.getenv("ENVIRONMENT", "development") == "production"


# Create settings instance
settings = Settings()

# Validation messages
VALIDATION_MESSAGES = {
    "email_invalid": "Invalid email format",
    "password_short": f"Password must be at least {settings.PASSWORD_MIN_LENGTH} characters",
    "password_long": f"Password must not exceed {settings.PASSWORD_MAX_LENGTH} characters",
    "username_invalid": "Username can only contain letters, numbers, and underscores",
    "phone_invalid": "Invalid phone number format",
    "isbn_invalid": "Invalid ISBN format",
    "date_invalid": "Invalid date format. Use YYYY-MM-DD",
    "date_range_invalid": "End date must be after start date",
    "unauthorized": "Invalid or expired token",
    "forbidden": "You don't have permission to perform this action",
    "not_found": "Resource not found",
    "already_exists": "Resource already exists",
}

# Item categories
BOOK_GENRES = [
    "Fiction",
    "Non-Fiction",
    "Science Fiction",
    "Fantasy",
    "Mystery",
    "Thriller",
    "Romance",
    "Biography",
    "History",
    "Science",
    "Self-Help",
    "Children",
    "Young Adult",
    "Classic",
    "Poetry",
    "Drama",
    "Horror",
    "Adventure",
    "Philosophy",
    "Religion",
    "Art",
    "Travel",
    "Cooking",
    "Health",
    "Business",
    "Technology",
    "Other"
]

BOARD_GAME_CATEGORIES = [
    "Strategy",
    "Family",
    "Party",
    "Abstract",
    "Thematic",
    "War",
    "Economic",
    "Card Game",
    "Dice",
    "Miniatures",
    "Cooperative",
    "Deck Building",
    "Area Control",
    "Worker Placement",
    "Tile Placement",
    "Roll and Write",
    "Trivia",
    "Word Game",
    "Dexterity",
    "Children",
    "Educational",
    "Other"
]

COMPLEXITY_LEVELS = ["Easy", "Medium", "Hard"]
CONTACT_PREFERENCES = ["email", "phone", "both"]
REQUEST_STATUSES = ["pending", "approved", "rejected", "returned"]