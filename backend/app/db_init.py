"""
Database initialization script.
Creates all tables and initial admin user.
"""
import sqlite3
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import bcrypt
from app.database import Base, engine, SessionLocal
from app.models.user import User
from app.config import settings
from pathlib import Path

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)


def migrate_add_images_column():
    """Add images column to services table if it doesn't exist."""
    try:
        # Get database path from DATABASE_URL
        db_url = settings.DATABASE_URL
        if db_url.startswith('sqlite:///'):
            db_path = db_url.replace('sqlite:///', '')
            # Handle relative paths
            if not Path(db_path).is_absolute():
                db_path = Path(__file__).parent.parent / db_path
            db_path = str(db_path)
        else:
            return  # Only support SQLite for now
        
        if not Path(db_path).exists():
            return  # Database doesn't exist yet, will be created by create_all
        
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if column already exists
        cursor.execute("PRAGMA table_info(services)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'images' not in columns:
            # Add the column
            cursor.execute("ALTER TABLE services ADD COLUMN images TEXT")
            conn.commit()
            print("✓ Added 'images' column to services table")
        
        conn.close()
    except Exception as e:
        print(f"⚠ Warning: Could not migrate images column: {e}")


def init_db():
    """Initialize database: create tables and default admin user."""
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Run migrations for existing databases
    migrate_add_images_column()
    
    # Create default admin user
    db = SessionLocal()
    try:
        # Check if admin user already exists
        admin_user = db.query(User).filter(User.username == settings.ADMIN_USERNAME).first()
        
        if not admin_user:
            # Create admin user
            password_bytes = settings.ADMIN_PASSWORD.encode('utf-8')
            hashed_password = bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode('utf-8')
            admin_user = User(
                username=settings.ADMIN_USERNAME,
                email=settings.ADMIN_EMAIL,
                hashed_password=hashed_password,
                is_active=True,
                is_superuser=True
            )
            db.add(admin_user)
            db.commit()
            print(f"✓ Admin user created: {settings.ADMIN_USERNAME}")
        else:
            print(f"✓ Admin user already exists: {settings.ADMIN_USERNAME}")
    except Exception as e:
        print(f"✗ Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("Initializing database...")
    init_db()
    print("Database initialization complete!")

