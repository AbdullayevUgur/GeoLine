"""
Migration script to add video_url column to services table.
Run this script to update existing databases.
"""
import sqlite3
from pathlib import Path
from app.database import engine
from app.config import settings


def migrate_add_video_url():
    """Add video_url column to services table if it doesn't exist."""
    # Get database path from DATABASE_URL
    db_url = settings.DATABASE_URL
    if db_url.startswith('sqlite:///'):
        db_path = db_url.replace('sqlite:///', '')
        # Handle relative paths
        if not Path(db_path).is_absolute():
            db_path = Path(__file__).parent.parent / db_path
        db_path = str(db_path)
    else:
        print("This migration script only supports SQLite databases.")
        return
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if column already exists
        cursor.execute("PRAGMA table_info(services)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'video_url' in columns:
            print("✓ Column 'video_url' already exists in services table")
        else:
            # Add the column
            cursor.execute("ALTER TABLE services ADD COLUMN video_url VARCHAR(500)")
            conn.commit()
            print("✓ Successfully added 'video_url' column to services table")
        
        conn.close()
        print("Migration completed successfully!")
        
    except sqlite3.Error as e:
        print(f"✗ Database error: {e}")
    except Exception as e:
        print(f"✗ Error: {e}")


if __name__ == "__main__":
    print("Running migration: Add video_url to services table...")
    migrate_add_video_url()

