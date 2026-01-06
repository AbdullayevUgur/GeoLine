# GeoLine CMS Backend

FastAPI-based Content Management System for GeoLine Engineering website.

## Setup Instructions

1. **Create virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Configure environment:**
```bash
cp .env.example .env
# Edit .env file with your settings
```

4. **Initialize database:**
```bash
python app/db_init.py
```

5. **Run the server:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: http://localhost:8000

API documentation: http://localhost:8000/docs

## Default Admin Credentials

- Username: `admin`
- Password: `admin123`

**⚠️ IMPORTANT:** Change the default password after first login!

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Configuration settings
│   ├── database.py          # Database setup
│   ├── db_init.py           # Database initialization
│   └── models/              # Database models
│       ├── __init__.py
│       ├── user.py
│       ├── carousel.py
│       ├── service.py
│       ├── portfolio.py
│       ├── blog.py
│       ├── faq.py
│       ├── about.py
│       ├── contact.py
│       ├── statistic.py
│       ├── partner.py
│       └── license.py
├── requirements.txt
├── .env.example
└── README.md
```

## Database Models

- **User**: Admin authentication
- **CarouselSlide**: Homepage carousel slides
- **Service**: Company services
- **PortfolioProject**: Project portfolio items
- **BlogPost**: Blog/news posts
- **FAQ**: Frequently asked questions
- **AboutContent**: About page content
- **ContactInfo**: Contact information (phone, email, etc.)
- **ContactSubmission**: Contact form submissions
- **Statistic**: Homepage statistics/facts
- **Partner**: Partner logos
- **License**: Licenses/certifications

