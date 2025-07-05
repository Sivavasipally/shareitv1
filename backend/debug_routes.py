#!/usr/bin/env python3
"""
Debug script to list all registered routes in the FastAPI app
"""

import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app
from fastapi.routing import APIRoute

def list_endpoints():
    """List all endpoints in the FastAPI app"""
    endpoints = []
    
    for route in app.routes:
        if isinstance(route, APIRoute):
            methods = ", ".join(route.methods)
            endpoints.append({
                "path": route.path,
                "methods": methods,
                "name": route.name,
                "tags": route.tags
            })
    
    # Sort by path
    endpoints.sort(key=lambda x: x["path"])
    
    print("\n" + "="*80)
    print("REGISTERED API ENDPOINTS")
    print("="*80)
    
    current_tag = None
    for endpoint in endpoints:
        # Group by tags
        tags = endpoint["tags"][0] if endpoint["tags"] else "General"
        if tags != current_tag:
            current_tag = tags
            print(f"\n[{tags}]")
            print("-" * 40)
        
        print(f"{endpoint['methods']:20} {endpoint['path']:40} {endpoint['name']}")
    
    print("\n" + "="*80)
    print(f"Total endpoints: {len(endpoints)}")
    print("="*80 + "\n")
    
    # Check for specific problematic endpoints
    print("Checking specific endpoints:")
    print("-" * 40)
    
    check_paths = ["/api/books", "/api/boardgames", "/api/auth/me", "/api/admin/stats"]
    
    for path in check_paths:
        found = False
        for endpoint in endpoints:
            if endpoint["path"] == path:
                print(f"✅ {path:30} - Methods: {endpoint['methods']}")
                found = True
                break
        if not found:
            print(f"❌ {path:30} - NOT FOUND")
    
    print("\n")
    
    # List all paths that start with /api
    print("All /api paths:")
    print("-" * 40)
    api_paths = [e for e in endpoints if e["path"].startswith("/api")]
    for endpoint in api_paths:
        print(f"{endpoint['methods']:20} {endpoint['path']}")


if __name__ == "__main__":
    list_endpoints()