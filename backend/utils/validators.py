import re
from datetime import datetime, date
from typing import Optional, Tuple
import html


def validate_email(email: str) -> bool:
    """
    Validate email format.

    Args:
        email: Email address to validate

    Returns:
        bool: True if valid email format
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_phone(phone: str) -> bool:
    """
    Validate phone number format.
    Accepts various formats including international.

    Args:
        phone: Phone number to validate

    Returns:
        bool: True if valid phone format
    """
    # Remove common separators
    cleaned = re.sub(r'[\s\-\.\(\)]', '', phone)

    # Check if it's a valid phone number (7-15 digits, optionally starting with +)
    pattern = r'^\+?[1-9]\d{6,14}$'
    return bool(re.match(pattern, cleaned))


def validate_isbn(isbn: str) -> bool:
    """
    Validate ISBN-10 or ISBN-13 format.

    Args:
        isbn: ISBN to validate

    Returns:
        bool: True if valid ISBN format
    """
    # Remove hyphens and spaces
    isbn = re.sub(r'[\-\s]', '', isbn)

    # Check ISBN-10
    if len(isbn) == 10:
        if not isbn[:-1].isdigit() or (not isbn[-1].isdigit() and isbn[-1] != 'X'):
            return False

        # Calculate check digit
        total = sum((i + 1) * int(digit) for i, digit in enumerate(isbn[:-1]))
        check = (11 - (total % 11)) % 11
        check_char = 'X' if check == 10 else str(check)

        return isbn[-1] == check_char

    # Check ISBN-13
    elif len(isbn) == 13:
        if not isbn.isdigit():
            return False

        # Calculate check digit
        total = sum(int(isbn[i]) * (3 if i % 2 else 1) for i in range(12))
        check = (10 - (total % 10)) % 10

        return int(isbn[-1]) == check

    return False


def validate_date_range(start_date: str, end_date: str) -> bool:
    """
    Validate that end date is after start date.

    Args:
        start_date: Start date in YYYY-MM-DD format
        end_date: End date in YYYY-MM-DD format

    Returns:
        bool: True if valid date range
    """
    try:
        start = datetime.strptime(start_date, "%Y-%m-%d").date()
        end = datetime.strptime(end_date, "%Y-%m-%d").date()
        return end > start
    except ValueError:
        return False


def validate_date_format(date_str: str) -> bool:
    """
    Validate date format (YYYY-MM-DD).

    Args:
        date_str: Date string to validate

    Returns:
        bool: True if valid format
    """
    try:
        datetime.strptime(date_str, "%Y-%m-%d")
        return True
    except ValueError:
        return False


def sanitize_html(text: str) -> str:
    """
    Sanitize HTML to prevent XSS attacks.
    Converts HTML entities and removes potentially dangerous content.

    Args:
        text: Text to sanitize

    Returns:
        str: Sanitized text
    """
    if not text:
        return text

    # Escape HTML entities
    text = html.escape(text)

    # Remove any script tags or javascript: URLs (extra safety)
    text = re.sub(r'<script[^>]*>.*?</script>', '', text, flags=re.IGNORECASE | re.DOTALL)
    text = re.sub(r'javascript:', '', text, flags=re.IGNORECASE)

    return text


def validate_username(username: str) -> Tuple[bool, Optional[str]]:
    """
    Validate username format.

    Args:
        username: Username to validate

    Returns:
        Tuple[bool, Optional[str]]: (is_valid, error_message)
    """
    if not username:
        return False, "Username is required"

    if len(username) < 3:
        return False, "Username must be at least 3 characters long"

    if len(username) > 50:
        return False, "Username must not exceed 50 characters"

    if not re.match(r'^[a-zA-Z0-9_]+$', username):
        return False, "Username can only contain letters, numbers, and underscores"

    if username.startswith('_') or username.endswith('_'):
        return False, "Username cannot start or end with underscore"

    return True, None


def validate_password_strength(password: str) -> Tuple[bool, Optional[str]]:
    """
    Validate password strength.

    Args:
        password: Password to validate

    Returns:
        Tuple[bool, Optional[str]]: (is_valid, error_message)
    """
    if not password:
        return False, "Password is required"

    if len(password) < 6:
        return False, "Password must be at least 6 characters long"

    # Optional: Add more password strength requirements
    # if not re.search(r'[A-Z]', password):
    #     return False, "Password must contain at least one uppercase letter"

    # if not re.search(r'[a-z]', password):
    #     return False, "Password must contain at least one lowercase letter"

    # if not re.search(r'[0-9]', password):
    #     return False, "Password must contain at least one number"

    # if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
    #     return False, "Password must contain at least one special character"

    return True, None


def validate_year(year: Optional[int]) -> bool:
    """
    Validate publication year.

    Args:
        year: Year to validate

    Returns:
        bool: True if valid year
    """
    if year is None:
        return True

    current_year = datetime.now().year
    return 1000 <= year <= current_year + 1  # Allow next year for pre-orders


def validate_complexity(complexity: Optional[str]) -> bool:
    """
    Validate board game complexity.

    Args:
        complexity: Complexity level to validate

    Returns:
        bool: True if valid complexity
    """
    if complexity is None:
        return True

    valid_complexities = ['Easy', 'Medium', 'Hard']
    return complexity in valid_complexities


def validate_preferred_contact(contact_method: Optional[str]) -> bool:
    """
    Validate preferred contact method.

    Args:
        contact_method: Contact method to validate

    Returns:
        bool: True if valid contact method
    """
    if contact_method is None:
        return True

    valid_methods = ['email', 'phone', 'both']
    return contact_method in valid_methods