import bcrypt
import jwt
from datetime import datetime, timedelta
import os
from database import execute_query, execute_one
import json
import logging

# Configure logging
logger = logging.getLogger(__name__)


class AuthService:
    @staticmethod
    def hash_password(password):
        """Hash a password using bcrypt"""
        try:
            # Generate salt and hash password
            salt = bcrypt.gensalt()
            hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
            return hashed.decode('utf-8')
        except Exception as e:
            logger.error(f"Error hashing password: {e}")
            raise

    @staticmethod
    def verify_password(password, hashed):
        """Verify a password against its hash"""
        try:
            return bcrypt.checkpw(
                password.encode('utf-8'),
                hashed.encode('utf-8')
            )
        except Exception as e:
            logger.error(f"Error verifying password: {e}")
            return False

    @staticmethod
    def generate_token(user_id):
        """Generate JWT token"""
        try:
            # Token payload
            payload = {
                'user_id': user_id,
                'exp': datetime.utcnow() + timedelta(
                    hours=int(os.getenv('JWT_EXPIRATION_HOURS', 24))
                ),
                'iat': datetime.utcnow(),
                'type': 'access'
            }

            # Generate token
            token = jwt.encode(
                payload,
                os.getenv('JWT_SECRET_KEY', 'default-secret-key'),
                algorithm=os.getenv('JWT_ALGORITHM', 'HS256')
            )

            return token

        except Exception as e:
            logger.error(f"Error generating token: {e}")
            raise

    @staticmethod
    def verify_token(token):
        """Verify JWT token"""
        try:
            # Decode and verify token
            payload = jwt.decode(
                token,
                os.getenv('JWT_SECRET_KEY', 'default-secret-key'),
                algorithms=[os.getenv('JWT_ALGORITHM', 'HS256')]
            )

            # Check token type
            if payload.get('type') != 'access':
                return None

            return payload

        except jwt.ExpiredSignatureError:
            logger.warning("Token has expired")
            return None
        except jwt.InvalidTokenError as e:
            logger.warning(f"Invalid token: {e}")
            return None
        except Exception as e:
            logger.error(f"Error verifying token: {e}")
            return None

    @staticmethod
    def register_user(username, email, password, **kwargs):
        """Register a new user"""
        try:
            # Validate input
            if not username or not email or not password:
                return None, "Username, email, and password are required"

            if len(password) < 6:
                return None, "Password must be at least 6 characters long"

            # Check if user exists
            existing_user = execute_one(
                """SELECT id FROM users 
                   WHERE username = %s OR email = %s""",
                (username, email)
            )

            if existing_user:
                return None, "Username or email already exists"

            # Hash password
            password_hash = AuthService.hash_password(password)

            # Prepare user data
            contact_times = kwargs.get('contact_times', [])
            interests = kwargs.get('interests', [])

            # Insert user
            user_id = execute_query(
                """INSERT INTO users (
                    username, email, password_hash, full_name, 
                    flat_number, phone_number, preferred_contact,
                    contact_times, interests
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                (
                    username,
                    email,
                    password_hash,
                    kwargs.get('full_name'),
                    kwargs.get('flat_number'),
                    kwargs.get('phone_number'),
                    kwargs.get('preferred_contact', 'email'),
                    contact_times if isinstance(contact_times, str) else json.dumps(
                        contact_times) if contact_times else None,
                    interests if isinstance(interests, str) else json.dumps(interests) if interests else None
                )
            )

            # Generate token
            token = AuthService.generate_token(user_id)

            # Log registration
            execute_query(
                """INSERT INTO activity_log (user_id, action, item_type)
                   VALUES (%s, %s, %s)""",
                (user_id, 'registered', 'user')
            )

            logger.info(f"User registered successfully: {username}")

            return {
                'user_id': user_id,
                'username': username,
                'email': email,
                'token': token,
                'is_admin': False
            }, None

        except Exception as e:
            logger.error(f"Error registering user: {e}")
            return None, "Registration failed. Please try again."

    @staticmethod
    def login_user(email, password):
        """Login a user"""
        try:
            # Validate input
            if not email or not password:
                return None, "Email and password are required"

            # Get user by email
            user = execute_one(
                """SELECT id, username, email, password_hash, 
                          is_admin, is_active, full_name,
                          flat_number, phone_number, preferred_contact,
                          contact_times, interests
                   FROM users 
                   WHERE email = %s""",
                (email,)
            )

            if not user:
                return None, "Invalid email or password"

            # Check if user is active
            if not user['is_active']:
                return None, "Account is deactivated. Please contact support."

            # Verify password
            if not AuthService.verify_password(password, user['password_hash']):
                return None, "Invalid email or password"

            # Generate token
            token = AuthService.generate_token(user['id'])

            # Log login
            execute_query(
                """INSERT INTO activity_log (user_id, action, item_type)
                   VALUES (%s, %s, %s)""",
                (user['id'], 'login', 'user')
            )

            logger.info(f"User logged in successfully: {user['username']}")

            # Parse JSON fields
            contact_times = []
            interests = []

            if user['contact_times']:
                try:
                    contact_times = json.loads(user['contact_times'])
                except:
                    pass

            if user['interests']:
                try:
                    interests = json.loads(user['interests'])
                except:
                    pass

            return {
                'user_id': user['id'],
                'username': user['username'],
                'email': user['email'],
                'full_name': user['full_name'],
                'flat_number': user['flat_number'],
                'phone_number': user['phone_number'],
                'preferred_contact': user['preferred_contact'],
                'contact_times': contact_times,
                'interests': interests,
                'is_admin': bool(user['is_admin']),
                'token': token
            }, None

        except Exception as e:
            logger.error(f"Error logging in user: {e}")
            return None, "Login failed. Please try again."

    @staticmethod
    def get_user_by_id(user_id):
        """Get user details by ID"""
        try:
            user = execute_one(
                """SELECT id, username, email, full_name,
                          flat_number, phone_number, preferred_contact,
                          contact_times, interests, is_admin, is_active,
                          created_at, updated_at
                   FROM users 
                   WHERE id = %s""",
                (user_id,)
            )

            if not user:
                return None

            # Parse JSON fields
            if user['contact_times']:
                try:
                    user['contact_times'] = json.loads(user['contact_times'])
                except:
                    user['contact_times'] = []
            else:
                user['contact_times'] = []

            if user['interests']:
                try:
                    user['interests'] = json.loads(user['interests'])
                except:
                    user['interests'] = []
            else:
                user['interests'] = []

            # Remove sensitive data
            user.pop('password_hash', None)

            return user

        except Exception as e:
            logger.error(f"Error getting user by ID: {e}")
            return None

    @staticmethod
    def update_password(user_id, old_password, new_password):
        """Update user password"""
        try:
            # Get current password hash
            user = execute_one(
                "SELECT password_hash FROM users WHERE id = %s",
                (user_id,)
            )

            if not user:
                return False, "User not found"

            # Verify old password
            if not AuthService.verify_password(old_password, user['password_hash']):
                return False, "Current password is incorrect"

            # Validate new password
            if len(new_password) < 6:
                return False, "New password must be at least 6 characters long"

            # Hash new password
            new_password_hash = AuthService.hash_password(new_password)

            # Update password
            execute_query(
                "UPDATE users SET password_hash = %s WHERE id = %s",
                (new_password_hash, user_id)
            )

            # Log password change
            execute_query(
                """INSERT INTO activity_log (user_id, action, item_type)
                   VALUES (%s, %s, %s)""",
                (user_id, 'password_changed', 'user')
            )

            logger.info(f"Password updated for user ID: {user_id}")

            return True, "Password updated successfully"

        except Exception as e:
            logger.error(f"Error updating password: {e}")
            return False, "Failed to update password"

    @staticmethod
    def create_admin_user():
        """Create default admin user if none exists"""
        try:
            # Check if admin exists
            admin = execute_one(
                "SELECT id FROM users WHERE is_admin = TRUE LIMIT 1"
            )

            if admin:
                logger.info("Admin user already exists")
                return

            # Create admin user
            result, error = AuthService.register_user(
                username="admin",
                email="admin@shareit.com",
                password="admin123",  # Change this in production!
                full_name="System Administrator",
                is_admin=True
            )

            if error:
                logger.error(f"Failed to create admin user: {error}")
            else:
                # Update is_admin flag
                execute_query(
                    "UPDATE users SET is_admin = TRUE WHERE id = %s",
                    (result['user_id'],)
                )
                logger.info("Admin user created successfully")

        except Exception as e:
            logger.error(f"Error creating admin user: {e}")


# Create admin user on module load
try:
    AuthService.create_admin_user()
except Exception as e:
    logger.error(f"Failed to create admin user on startup: {e}")