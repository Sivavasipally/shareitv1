#!/usr/bin/env python3
"""
Test script to demonstrate API usage
Run this after starting the backend server
"""

import requests
import json
from datetime import datetime, timedelta

# Base URL for the API
BASE_URL = "http://localhost:8000/api"

# Test user data
TEST_USER = {
    "username": "testuser123",
    "email": "testuser123@example.com",
    "password": "password123",
    "full_name": "Test User",
    "flat_number": "101",
    "phone_number": "+1234567890",
    "preferred_contact": "email",
    "contact_times": ["morning", "evening"],
    "interests": ["fiction", "strategy games"]
}

# Global variable to store auth token
auth_token = None


def print_response(response, title="Response"):
    """Pretty print API response"""
    print(f"\n{'=' * 50}")
    print(f"{title}")
    print(f"{'=' * 50}")
    print(f"Status Code: {response.status_code}")
    if response.headers.get('content-type') == 'application/json':
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    else:
        print(f"Response: {response.text}")


def test_register():
    """Test user registration"""
    print("\n🔐 Testing User Registration...")
    response = requests.post(
        f"{BASE_URL}/auth/register",
        json=TEST_USER
    )
    print_response(response, "Registration Response")
    return response.status_code == 201


def test_login():
    """Test user login"""
    global auth_token
    print("\n🔑 Testing User Login...")
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "email": TEST_USER["email"],
            "password": TEST_USER["password"]
        }
    )
    print_response(response, "Login Response")

    if response.status_code == 200:
        auth_token = response.json()["data"]["token"]
        print(f"\n✅ Auth token obtained: {auth_token[:20]}...")
        return True
    return False


def test_get_profile():
    """Test getting user profile"""
    print("\n👤 Testing Get Profile...")
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    print_response(response, "Profile Response")
    return response.status_code == 200


def test_create_book():
    """Test creating a book"""
    print("\n📚 Testing Create Book...")
    headers = {"Authorization": f"Bearer {auth_token}"}
    book_data = {
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald",
        "isbn": "9780743273565",
        "genre": "Classic",
        "publication_year": 1925,
        "language": "English",
        "description": "A classic American novel",
        "tags": ["classic", "american literature"]
    }
    response = requests.post(
        f"{BASE_URL}/books",
        json=book_data,
        headers=headers
    )
    print_response(response, "Create Book Response")
    return response.json()["data"]["id"] if response.status_code == 201 else None


def test_list_books():
    """Test listing books"""
    print("\n📖 Testing List Books...")
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = requests.get(
        f"{BASE_URL}/books?limit=10",
        headers=headers
    )
    print_response(response, "List Books Response")
    return response.status_code == 200


def test_create_board_game():
    """Test creating a board game"""
    print("\n🎲 Testing Create Board Game...")
    headers = {"Authorization": f"Bearer {auth_token}"}
    game_data = {
        "title": "Ticket to Ride",
        "designer": "Alan R. Moon",
        "min_players": 2,
        "max_players": 5,
        "play_time": "30-60 min",
        "complexity": "Easy",
        "description": "Collect train cards and claim railway routes",
        "categories": ["Strategy", "Trains", "Family"],
        "components": ["Board", "Train cars", "Route cards"]
    }
    response = requests.post(
        f"{BASE_URL}/boardgames",
        json=game_data,
        headers=headers
    )
    print_response(response, "Create Board Game Response")
    return response.json()["data"]["id"] if response.status_code == 201 else None


def test_create_request(item_id, item_type="book"):
    """Test creating a borrow request"""
    print(f"\n📋 Testing Create Request for {item_type}...")
    headers = {"Authorization": f"Bearer {auth_token}"}

    # Set dates for pickup and return
    pickup_date = (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d")
    return_date = (datetime.now() + timedelta(days=9)).strftime("%Y-%m-%d")

    request_data = {
        "item_type": item_type,
        "item_id": item_id,
        "pickup_date": pickup_date,
        "return_date": return_date,
        "notes": "I'll take good care of it!"
    }
    response = requests.post(
        f"{BASE_URL}/requests",
        json=request_data,
        headers=headers
    )
    print_response(response, "Create Request Response")
    return response.status_code == 201


def test_admin_login():
    """Test admin login"""
    global auth_token
    print("\n👑 Testing Admin Login...")
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "email": "admin@shareit.com",
            "password": "admin123"
        }
    )
    print_response(response, "Admin Login Response")

    if response.status_code == 200:
        auth_token = response.json()["data"]["token"]
        return True
    return False


def test_admin_stats():
    """Test admin statistics endpoint"""
    print("\n📊 Testing Admin Statistics...")
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = requests.get(f"{BASE_URL}/admin/stats", headers=headers)
    print_response(response, "Admin Stats Response")
    return response.status_code == 200


def run_all_tests():
    """Run all API tests"""
    print("\n🚀 Starting Share-IT API Tests")
    print("=" * 70)

    # Test user registration and login
    if not test_register():
        print("\n❌ Registration failed. User might already exist.")

    if not test_login():
        print("\n❌ Login failed. Cannot continue tests.")
        return

    # Test authenticated endpoints
    test_get_profile()

    # Create items
    book_id = test_create_book()
    if book_id:
        print(f"\n✅ Book created with ID: {book_id}")

    game_id = test_create_board_game()
    if game_id:
        print(f"\n✅ Board game created with ID: {game_id}")

    # List items
    test_list_books()

    # Note: Creating a request for your own item will fail
    # In a real scenario, you'd need another user to request your items

    # Test admin endpoints
    if test_admin_login():
        test_admin_stats()

    print("\n" + "=" * 70)
    print("✅ API tests completed!")
    print("=" * 70)


if __name__ == "__main__":
    run_all_tests()