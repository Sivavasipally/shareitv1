#!/usr/bin/env python3
"""
Quick test script to verify API endpoints are working
"""

import requests
import json
import sys

BASE_URL = "http://localhost:8000"


def test_endpoint(method, path, data=None, token=None):
    """Test a single endpoint"""
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}

    if token:
        headers["Authorization"] = f"Bearer {token}"

    try:
        if method == "GET":
            response = requests.get(url, headers=headers)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers)
        else:
            response = requests.request(method, url, json=data, headers=headers)

        status_symbol = "✅" if response.status_code < 400 else "❌"
        print(f"{status_symbol} {method:6} {path:40} - Status: {response.status_code}")

        if response.status_code >= 400:
            print(f"   Error: {response.text[:100]}...")

        return response

    except requests.exceptions.ConnectionError:
        print(f"❌ {method:6} {path:40} - Connection Error")
        print("   Make sure the server is running: python run_backend.py")
        return None
    except Exception as e:
        print(f"❌ {method:6} {path:40} - Error: {str(e)}")
        return None


def main():
    print("\n" + "=" * 70)
    print("SHARE-IT API QUICK TEST")
    print("=" * 70 + "\n")

    # Test 1: Server health
    print("1. Testing server health...")
    print("-" * 40)
    test_endpoint("GET", "/")
    test_endpoint("GET", "/health")
    test_endpoint("GET", "/api/health")

    # Test 2: Auth endpoints
    print("\n2. Testing authentication endpoints...")
    print("-" * 40)

    # Register a test user
    test_user = {
        "username": f"quicktest_{int(sys.argv[1]) if len(sys.argv) > 1 else 1}",
        "email": f"quicktest{sys.argv[1] if len(sys.argv) > 1 else ''}@example.com",
        "password": "testpass123"
    }

    reg_response = test_endpoint("POST", "/api/auth/register", test_user)

    # Login
    login_data = {
        "email": test_user["email"],
        "password": test_user["password"]
    }

    login_response = test_endpoint("POST", "/api/auth/login", login_data)

    # Extract token
    token = None
    if login_response and login_response.status_code == 200:
        token = login_response.json()["data"]["token"]
        print(f"\n   ✅ Got auth token: {token[:20]}...")

    # Test authenticated endpoint
    test_endpoint("GET", "/api/auth/me", token=token)

    # Test 3: Books endpoints
    print("\n3. Testing books endpoints...")
    print("-" * 40)
    test_endpoint("GET", "/api/books", token=token)

    book_data = {
        "title": "Quick Test Book",
        "author": "Test Author",
        "genre": "Fiction"
    }
    book_response = test_endpoint("POST", "/api/books", book_data, token=token)

    # Test 4: Board games endpoints
    print("\n4. Testing board games endpoints...")
    print("-" * 40)
    test_endpoint("GET", "/api/boardgames", token=token)

    game_data = {
        "title": "Quick Test Game",
        "designer": "Test Designer",
        "min_players": 2,
        "max_players": 4,
        "complexity": "Medium"
    }
    game_response = test_endpoint("POST", "/api/boardgames", game_data, token=token)

    # Test 5: Admin endpoints (login as admin first)
    print("\n5. Testing admin endpoints...")
    print("-" * 40)

    admin_login = {
        "email": "admin@shareit.com",
        "password": "admin123"
    }

    admin_response = test_endpoint("POST", "/api/auth/login", admin_login)

    if admin_response and admin_response.status_code == 200:
        admin_token = admin_response.json()["data"]["token"]
        test_endpoint("GET", "/api/admin/stats", token=admin_token)
        test_endpoint("GET", "/api/admin/users", token=admin_token)

    # Test 6: Check OpenAPI docs
    print("\n6. Testing API documentation...")
    print("-" * 40)
    test_endpoint("GET", "/docs")
    test_endpoint("GET", "/openapi.json")

    print("\n" + "=" * 70)
    print("TEST COMPLETE")
    print("=" * 70 + "\n")

    print("📝 Notes:")
    print("- If you see 401 errors, the endpoint requires authentication")
    print("- If you see 403 errors, the endpoint requires admin privileges")
    print("- If you see 404 errors, the route is not registered properly")
    print("- If you see 405 errors, the HTTP method is not allowed")
    print("- If you see 422 errors, the request data validation failed")
    print("- If you see 500 errors, check the server logs for details")
    print("\n")


if __name__ == "__main__":
    main()