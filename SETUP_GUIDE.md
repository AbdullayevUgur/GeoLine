# Setup Guide - GeoLine CMS

Complete setup instructions for running the CMS backend and admin panel.

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

## Step-by-Step Setup

### 1. Navigate to Project Directory

```bash
cd /Users/ugur/IdeaProjects/builerz-master
```

### 2. Create Python Virtual Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
# venv\Scripts\activate
```

You should see `(venv)` in your terminal prompt.

### 3. Install Backend Dependencies

```bash
# Navigate to backend directory
cd backend

# Install all required packages
pip install -r requirements.txt
```

This will install:
- FastAPI
- Uvicorn (ASGI server)
- SQLAlchemy (database)
- And all other dependencies

### 4. Create Environment File

```bash
# Create .env file (if it doesn't exist)
cat > .env << EOF
DATABASE_URL=sqlite:///./cms.db
SECRET_KEY=your-secret-key-change-in-production-$(openssl rand -hex 32)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE=10485760
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@geoline.com
ADMIN_PASSWORD=admin123
EOF
```

Or manually create `.env` file in the `backend` directory with the content above.

### 5. Initialize Database

```bash
# Still in backend directory
python app/db_init.py
```

This creates the database and default admin user.

### 6. Start Backend Server

```bash
# Still in backend directory
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

### 7. Verify Backend is Running

Open in browser: http://localhost:8000/docs

You should see the API documentation.

### 8. Open Admin Panel

In a new terminal window (keep backend running):

```bash
# Navigate to project root
cd /Users/ugur/IdeaProjects/builerz-master

# Open admin panel
open admin/index.html
```

Or manually open: `/Users/ugur/IdeaProjects/builerz-master/admin/index.html`

### 9. Login to Admin Panel

- Username: `admin`
- Password: `admin123`

## Quick Start Commands

```bash
# Terminal 1: Start Backend
cd /Users/ugur/IdeaProjects/builerz-master
source venv/bin/activate
cd backend
uvicorn app.main:app --reload

# Terminal 2: Open Admin Panel (or just open the HTML file)
open admin/index.html
```

## Troubleshooting

### "python3: command not found"
- Use `python` instead of `python3`
- Or install Python from python.org

### "pip: command not found"
- Use `python -m pip` instead
- Or install pip

### "uvicorn: command not found"
- Make sure virtual environment is activated
- Run `pip install -r requirements.txt` again

### Port 8000 already in use
- Change port: `uvicorn app.main:app --reload --port 8001`
- Update API URL in `admin/js/api.js` and `js/api-client.js`

### Database errors
- Delete `cms.db` file in backend directory
- Run `python app/db_init.py` again

## File Structure

```
builerz-master/
├── backend/          # FastAPI backend
│   ├── app/          # Application code
│   ├── requirements.txt
│   └── .env          # Configuration (create this)
├── admin/            # Admin panel
│   └── index.html    # Admin interface
└── js/               # Frontend scripts
```

## Next Steps

1. ✅ Backend running on http://localhost:8000
2. ✅ Admin panel accessible
3. ✅ Login successful
4. Start managing content!

