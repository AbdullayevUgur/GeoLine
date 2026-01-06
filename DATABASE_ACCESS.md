# Database Access Guide

## Database Location

The SQLite database is located at:
```
/Users/ugur/IdeaProjects/builerz-master/backend/cms.db
```

## Method 1: Using SQLite Command Line

### Open SQLite Database
```bash
cd /Users/ugur/IdeaProjects/builerz-master/backend
sqlite3 cms.db
```

### Useful SQLite Commands

```sql
-- List all tables
.tables

-- View table structure
.schema users
.schema carousel_slides
.schema services
.schema portfolio_projects
.schema blog_posts
.schema faqs
.schema about_content
.schema contact_info
.schema contact_submissions
.schema statistics
.schema partners
.schema licenses

-- View all carousel slides
SELECT * FROM carousel_slides;

-- View all services
SELECT id, title, image_path, is_active FROM services;

-- View all portfolio projects
SELECT id, title, status, is_active FROM portfolio_projects;

-- View all users
SELECT id, username, email, is_active, is_superuser FROM users;

-- Exit SQLite
.quit
```

## Method 2: Using DB Browser for SQLite (GUI)

1. **Download DB Browser for SQLite:**
   - Visit: https://sqlitebrowser.org/
   - Download and install

2. **Open Database:**
   - Open DB Browser
   - Click "Open Database"
   - Navigate to: `/Users/ugur/IdeaProjects/builerz-master/backend/cms.db`
   - Click Open

3. **Browse Data:**
   - Click "Browse Data" tab
   - Select table from dropdown
   - View and edit data

## Method 3: Using VS Code Extension

1. **Install SQLite Extension:**
   - Open VS Code
   - Go to Extensions (Cmd+Shift+X)
   - Search for "SQLite" or "SQLite Viewer"
   - Install

2. **Open Database:**
   - Right-click on `backend/cms.db`
   - Select "Open Database"
   - View tables in sidebar

## Method 4: Using Python Script

Create a script to query the database:

```python
from app.database import SessionLocal
from app.models.carousel import CarouselSlide

db = SessionLocal()
slides = db.query(CarouselSlide).all()
for slide in slides:
    print(f"{slide.id}: {slide.title} - {slide.image_path}")
db.close()
```

## Import Existing Images to Database

Run the import script to add all existing images:

```bash
cd /Users/ugur/IdeaProjects/builerz-master
source venv/bin/activate
cd backend
PYTHONPATH=. python app/import_images.py
```

This will:
- Copy images from `img/` to `uploads/` directory
- Create database entries for:
  - Carousel slides
  - Services
  - Portfolio projects
  - Blog posts
  - Partners
  - Licenses
  - Statistics
  - Contact information
  - About content

## Database Tables

- **users** - Admin users
- **carousel_slides** - Homepage carousel
- **services** - Company services
- **portfolio_projects** - Portfolio projects
- **blog_posts** - Blog/news posts
- **faqs** - Frequently asked questions
- **about_content** - About page content
- **contact_info** - Contact information
- **contact_submissions** - Contact form submissions
- **statistics** - Homepage statistics
- **partners** - Partner logos
- **licenses** - Licenses/certifications

## Backup Database

```bash
cd /Users/ugur/IdeaProjects/builerz-master/backend
cp cms.db cms.db.backup
```

## Reset Database

```bash
cd /Users/ugur/IdeaProjects/builerz-master/backend
rm cms.db
PYTHONPATH=. python app/db_init.py
PYTHONPATH=. python app/import_images.py
```

