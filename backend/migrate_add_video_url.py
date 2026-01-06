"""
Migration script to add video_url column to services table.
Run this script to update existing databases.
"""
import sqlite3
import os
from pathlib import Path

def migrate_add_video_url():
    """Add video_url column to services table if it doesn't exist."""
    # Database path
    db_path = os.path.join(os.path.dirname(__file__), 'cms.db')
    
    if not os.path.exists(db_path):
        print(f"✗ Database file not found at: {db_path}")
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

