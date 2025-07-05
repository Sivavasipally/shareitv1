import os
import sqlite3
import mysql.connector
from mysql.connector import pooling
from dotenv import load_dotenv
import logging
from contextlib import contextmanager
import json
from datetime import datetime

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Determine database type
DB_TYPE = os.getenv('DB_TYPE', 'sqlite').lower()  # 'sqlite' or 'mysql'
SQLITE_DB_PATH = os.getenv('SQLITE_DB_PATH', 'share_it.db')

# MySQL configuration
mysql_config = {
    'host': os.getenv('MYSQL_HOST', 'localhost'),
    'user': os.getenv('MYSQL_USER', 'root'),
    'password': os.getenv('MYSQL_PASSWORD', ''),
    'database': os.getenv('MYSQL_DATABASE', 'share_it_db'),
    'auth_plugin': 'mysql_native_password',
    'autocommit': False,
    'use_unicode': True,
    'charset': 'utf8mb4'
}

# Global connection pool for MySQL
mysql_connection_pool = None


def init_mysql_pool():
    """Initialize MySQL connection pool"""
    global mysql_connection_pool
    try:
        mysql_connection_pool = pooling.MySQLConnectionPool(
            pool_name="share_it_pool",
            pool_size=5,
            pool_reset_session=True,
            **mysql_config
        )
        logger.info("MySQL connection pool initialized successfully")
    except mysql.connector.Error as err:
        logger.error(f"Error creating MySQL connection pool: {err}")
        raise


def get_db_connection():
    """Get a database connection based on DB_TYPE"""
    if DB_TYPE == 'sqlite':
        conn = sqlite3.connect(SQLITE_DB_PATH)
        conn.row_factory = sqlite3.Row  # Enable column access by name
        # Enable foreign keys for SQLite
        conn.execute("PRAGMA foreign_keys = ON")
        return conn
    else:
        global mysql_connection_pool
        if mysql_connection_pool is None:
            init_mysql_pool()
        return mysql_connection_pool.get_connection()


def execute_query(query, params=None, fetch=False):
    """Execute a database query

    Args:
        query: SQL query string
        params: Query parameters (tuple or list)
        fetch: If True, return fetched results

    Returns:
        If fetch=True: List of dictionaries
        If fetch=False: Last insert ID or affected rows
    """
    conn = None
    cursor = None

    try:
        conn = get_db_connection()

        if DB_TYPE == 'sqlite':
            cursor = conn.cursor()
            # Convert MySQL placeholders to SQLite style
            query_converted = query.replace('%s', '?')

            cursor.execute(query_converted, params or ())

            if fetch:
                # Convert Row objects to dictionaries
                rows = cursor.fetchall()
                if rows:
                    columns = [description[0] for description in cursor.description]
                    result = []
                    for row in rows:
                        result.append(dict(zip(columns, row)))
                    return result
                return []
            else:
                conn.commit()
                if query.strip().upper().startswith('INSERT'):
                    return cursor.lastrowid
                else:
                    return cursor.rowcount
        else:
            # MySQL
            cursor = conn.cursor(dictionary=True, buffered=True)
            cursor.execute(query, params or ())

            if fetch:
                result = cursor.fetchall()
                return result
            else:
                conn.commit()
                if query.strip().upper().startswith('INSERT'):
                    return cursor.lastrowid
                else:
                    return cursor.rowcount

    except (sqlite3.Error, mysql.connector.Error) as err:
        if conn:
            conn.rollback()
        logger.error(f"Database error: {err}")
        logger.error(f"Query: {query}")
        logger.error(f"Params: {params}")
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Unexpected error: {e}")
        raise
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


def execute_one(query, params=None):
    """Execute query and fetch one result

    Args:
        query: SQL query string
        params: Query parameters (tuple or list)

    Returns:
        Dictionary with result or None
    """
    conn = None
    cursor = None

    try:
        conn = get_db_connection()

        if DB_TYPE == 'sqlite':
            cursor = conn.cursor()
            # Convert MySQL placeholders to SQLite style
            query_converted = query.replace('%s', '?')

            cursor.execute(query_converted, params or ())
            row = cursor.fetchone()

            if row:
                columns = [description[0] for description in cursor.description]
                return dict(zip(columns, row))
            return None
        else:
            # MySQL
            cursor = conn.cursor(dictionary=True, buffered=True)
            cursor.execute(query, params or ())
            return cursor.fetchone()

    except (sqlite3.Error, mysql.connector.Error) as err:
        logger.error(f"Database error: {err}")
        logger.error(f"Query: {query}")
        logger.error(f"Params: {params}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


def execute_many(query, params_list):
    """Execute multiple queries with different parameters

    Args:
        query: SQL query string
        params_list: List of parameter tuples

    Returns:
        Number of affected rows
    """
    conn = None
    cursor = None

    try:
        conn = get_db_connection()

        if DB_TYPE == 'sqlite':
            cursor = conn.cursor()
            # Convert MySQL placeholders to SQLite style
            query_converted = query.replace('%s', '?')

            cursor.executemany(query_converted, params_list)
            conn.commit()
            return cursor.rowcount
        else:
            # MySQL
            cursor = conn.cursor()
            cursor.executemany(query, params_list)
            conn.commit()
            return cursor.rowcount

    except (sqlite3.Error, mysql.connector.Error) as err:
        if conn:
            conn.rollback()
        logger.error(f"Database error: {err}")
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Unexpected error: {e}")
        raise
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


def init_database():
    """Initialize database with tables if they don't exist"""
    conn = None
    cursor = None

    try:
        if DB_TYPE == 'sqlite':
            # SQLite setup
            conn = sqlite3.connect(SQLITE_DB_PATH)
            cursor = conn.cursor()

            # Enable foreign keys
            cursor.execute("PRAGMA foreign_keys = ON")

            # Create tables with SQLite-compatible syntax
            tables = [
                """CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    full_name VARCHAR(100),
                    flat_number VARCHAR(20),
                    phone_number VARCHAR(20),
                    preferred_contact VARCHAR(10) DEFAULT 'email' CHECK (preferred_contact IN ('email', 'phone', 'both')),
                    contact_times TEXT,
                    interests TEXT,
                    is_admin INTEGER DEFAULT 0,
                    is_active INTEGER DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )""",

                """CREATE TABLE IF NOT EXISTS communities (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name VARCHAR(100) NOT NULL,
                    description TEXT,
                    location VARCHAR(200),
                    created_by INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (created_by) REFERENCES users(id)
                )""",

                """CREATE TABLE IF NOT EXISTS community_members (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    community_id INTEGER,
                    user_id INTEGER,
                    role VARCHAR(10) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
                    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (community_id) REFERENCES communities(id),
                    FOREIGN KEY (user_id) REFERENCES users(id),
                    UNIQUE (community_id, user_id)
                )""",

                """CREATE TABLE IF NOT EXISTS books (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title VARCHAR(200) NOT NULL,
                    author VARCHAR(100) NOT NULL,
                    isbn VARCHAR(20),
                    genre VARCHAR(50),
                    publication_year INTEGER,
                    language VARCHAR(20),
                    description TEXT,
                    cover_url VARCHAR(500),
                    owner_id INTEGER,
                    community_id INTEGER,
                    is_available INTEGER DEFAULT 1,
                    tags TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (owner_id) REFERENCES users(id),
                    FOREIGN KEY (community_id) REFERENCES communities(id)
                )""",

                """CREATE TABLE IF NOT EXISTS board_games (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title VARCHAR(200) NOT NULL,
                    designer VARCHAR(100),
                    min_players INTEGER,
                    max_players INTEGER,
                    play_time VARCHAR(50),
                    complexity VARCHAR(10) CHECK (complexity IN ('Easy', 'Medium', 'Hard', NULL)),
                    description TEXT,
                    image_url VARCHAR(500),
                    owner_id INTEGER,
                    community_id INTEGER,
                    is_available INTEGER DEFAULT 1,
                    categories TEXT,
                    components TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (owner_id) REFERENCES users(id),
                    FOREIGN KEY (community_id) REFERENCES communities(id)
                )""",

                """CREATE TABLE IF NOT EXISTS requests (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    item_type VARCHAR(10) CHECK (item_type IN ('book', 'boardgame')),
                    item_id INTEGER,
                    requester_id INTEGER,
                    owner_id INTEGER,
                    status VARCHAR(10) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'returned')),
                    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    response_date TIMESTAMP,
                    pickup_date DATE,
                    return_date DATE,
                    notes TEXT,
                    FOREIGN KEY (requester_id) REFERENCES users(id),
                    FOREIGN KEY (owner_id) REFERENCES users(id)
                )""",

                """CREATE TABLE IF NOT EXISTS notifications (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    title VARCHAR(200),
                    message TEXT,
                    type VARCHAR(10) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
                    is_read INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )""",

                """CREATE TABLE IF NOT EXISTS activity_log (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    action VARCHAR(50),
                    item_type VARCHAR(50),
                    item_id INTEGER,
                    details TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )"""
            ]

            # Create indexes
            indexes = [
                "CREATE INDEX IF NOT EXISTS idx_books_title ON books(title)",
                "CREATE INDEX IF NOT EXISTS idx_books_author ON books(author)",
                "CREATE INDEX IF NOT EXISTS idx_books_available ON books(is_available)",
                "CREATE INDEX IF NOT EXISTS idx_boardgames_title ON board_games(title)",
                "CREATE INDEX IF NOT EXISTS idx_boardgames_complexity ON board_games(complexity)",
                "CREATE INDEX IF NOT EXISTS idx_boardgames_available ON board_games(is_available)",
                "CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status)",
                "CREATE INDEX IF NOT EXISTS idx_requests_requester ON requests(requester_id)",
                "CREATE INDEX IF NOT EXISTS idx_requests_owner ON requests(owner_id)",
                "CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read)",
                "CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_log(user_id)",
                "CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log(created_at)"
            ]

        else:
            # MySQL setup
            init_config = mysql_config.copy()
            init_config.pop('database', None)

            conn = mysql.connector.connect(**init_config)
            cursor = conn.cursor()

            # Create database if not exists
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {mysql_config['database']}")
            cursor.execute(f"USE {mysql_config['database']}")

            # MySQL tables (your existing MySQL table definitions)
            tables = [
                """CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    full_name VARCHAR(100),
                    flat_number VARCHAR(20),
                    phone_number VARCHAR(20),
                    preferred_contact ENUM('email', 'phone', 'both') DEFAULT 'email',
                    contact_times JSON,
                    interests JSON,
                    is_admin BOOLEAN DEFAULT FALSE,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )""",

                """CREATE TABLE IF NOT EXISTS communities (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    description TEXT,
                    location VARCHAR(200),
                    created_by INT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (created_by) REFERENCES users(id)
                )""",

                """CREATE TABLE IF NOT EXISTS community_members (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    community_id INT,
                    user_id INT,
                    role ENUM('admin', 'member') DEFAULT 'member',
                    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (community_id) REFERENCES communities(id),
                    FOREIGN KEY (user_id) REFERENCES users(id),
                    UNIQUE KEY unique_member (community_id, user_id)
                )""",

                """CREATE TABLE IF NOT EXISTS books (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(200) NOT NULL,
                    author VARCHAR(100) NOT NULL,
                    isbn VARCHAR(20),
                    genre VARCHAR(50),
                    publication_year INT,
                    language VARCHAR(20),
                    description TEXT,
                    cover_url VARCHAR(500),
                    owner_id INT,
                    community_id INT,
                    is_available BOOLEAN DEFAULT TRUE,
                    tags JSON,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (owner_id) REFERENCES users(id),
                    FOREIGN KEY (community_id) REFERENCES communities(id),
                    INDEX idx_title (title),
                    INDEX idx_author (author),
                    INDEX idx_available (is_available)
                )""",

                """CREATE TABLE IF NOT EXISTS board_games (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(200) NOT NULL,
                    designer VARCHAR(100),
                    min_players INT,
                    max_players INT,
                    play_time VARCHAR(50),
                    complexity ENUM('Easy', 'Medium', 'Hard'),
                    description TEXT,
                    image_url VARCHAR(500),
                    owner_id INT,
                    community_id INT,
                    is_available BOOLEAN DEFAULT TRUE,
                    categories JSON,
                    components JSON,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (owner_id) REFERENCES users(id),
                    FOREIGN KEY (community_id) REFERENCES communities(id),
                    INDEX idx_title (title),
                    INDEX idx_complexity (complexity),
                    INDEX idx_available (is_available)
                )""",

                """CREATE TABLE IF NOT EXISTS requests (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    item_type ENUM('book', 'boardgame'),
                    item_id INT,
                    requester_id INT,
                    owner_id INT,
                    status ENUM('pending', 'approved', 'rejected', 'returned') DEFAULT 'pending',
                    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    response_date TIMESTAMP NULL,
                    pickup_date DATE,
                    return_date DATE,
                    notes TEXT,
                    FOREIGN KEY (requester_id) REFERENCES users(id),
                    FOREIGN KEY (owner_id) REFERENCES users(id),
                    INDEX idx_status (status),
                    INDEX idx_requester (requester_id),
                    INDEX idx_owner (owner_id)
                )""",

                """CREATE TABLE IF NOT EXISTS notifications (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT,
                    title VARCHAR(200),
                    message TEXT,
                    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
                    is_read BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id),
                    INDEX idx_user_read (user_id, is_read)
                )""",

                """CREATE TABLE IF NOT EXISTS activity_log (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT,
                    action VARCHAR(50),
                    item_type VARCHAR(50),
                    item_id INT,
                    details JSON,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id),
                    INDEX idx_user (user_id),
                    INDEX idx_created (created_at)
                )"""
            ]

            indexes = []  # MySQL tables have indexes defined inline

        # Execute table creation
        for table_query in tables:
            cursor.execute(table_query)
            logger.info(f"Table created/verified")

        # Execute index creation
        for index_query in indexes:
            cursor.execute(index_query)

        conn.commit()
        logger.info(f"Database initialization completed successfully ({DB_TYPE})")

        # Initialize connection pool for MySQL after database is ready
        if DB_TYPE == 'mysql':
            init_mysql_pool()

    except (sqlite3.Error, mysql.connector.Error) as err:
        logger.error(f"Database initialization error: {err}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error during initialization: {e}")
        raise
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# Helper function to handle JSON fields
def json_serialize(data):
    """Serialize data to JSON string for storage"""
    if data is None:
        return None
    return json.dumps(data)


def json_deserialize(data):
    """Deserialize JSON string from storage"""
    if data is None or data == '':
        return None
    if isinstance(data, str):
        try:
            return json.loads(data)
        except:
            return None
    return data


# Initialize database on module load
try:
    init_database()
    logger.info(f"Using {DB_TYPE} database")
except Exception as e:
    logger.error(f"Failed to initialize database: {e}")
    # Don't raise here to allow the module to load even if DB is not ready