#!/usr/bin/env python3
"""
Simple script to view database contents.
Usage: python view_database.py [table_name]
"""
import sys
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import *

def view_table(db: Session, model_class, table_name):
    """View all records from a table."""
    items = db.query(model_class).all()
    print(f"\n{'='*60}")
    print(f"Table: {table_name} ({len(items)} records)")
    print('='*60)
    
    if not items:
        print("No records found.")
        return
    
    for item in items:
        print(f"\nID: {item.id}")
        if hasattr(item, 'title'):
            print(f"Title: {item.title}")
        if hasattr(item, 'name'):
            print(f"Name: {item.name}")
        if hasattr(item, 'username'):
            print(f"Username: {item.username}")
        if hasattr(item, 'question'):
            print(f"Question: {item.question}")
        if hasattr(item, 'label'):
            print(f"Label: {item.label}")
        if hasattr(item, 'image_path'):
            print(f"Image: {item.image_path}")
        if hasattr(item, 'is_active'):
            print(f"Active: {item.is_active}")
        if hasattr(item, 'is_published'):
            print(f"Published: {item.is_published}")
        print("-" * 60)


def main():
    db = SessionLocal()
    
    tables = {
        'carousel': (CarouselSlide, 'carousel_slides'),
        'services': (Service, 'services'),
        'portfolio': (PortfolioProject, 'portfolio_projects'),
        'blog': (BlogPost, 'blog_posts'),
        'faqs': (FAQ, 'faqs'),
        'about': (AboutContent, 'about_content'),
        'contact': (ContactInfo, 'contact_info'),
        'submissions': (ContactSubmission, 'contact_submissions'),
        'statistics': (Statistic, 'statistics'),
        'partners': (Partner, 'partners'),
        'licenses': (License, 'licenses'),
        'users': (User, 'users'),
    }
    
    if len(sys.argv) > 1:
        table_name = sys.argv[1].lower()
        if table_name in tables:
            model_class, name = tables[table_name]
            view_table(db, model_class, name)
        else:
            print(f"Unknown table: {table_name}")
            print(f"Available tables: {', '.join(tables.keys())}")
    else:
        print("Database Contents Overview")
        print("="*60)
        for key, (model_class, name) in tables.items():
            count = db.query(model_class).count()
            print(f"{name:30} {count:>5} records")
        
        print("\nUsage: python view_database.py [table_name]")
        print("Example: python view_database.py carousel")
        print(f"\nAvailable tables: {', '.join(tables.keys())}")
    
    db.close()


if __name__ == "__main__":
    main()

