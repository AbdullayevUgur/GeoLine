# Quick Start Guide - GeoLine CMS

## Step 1: Start Backend Server

Open Terminal and run:

```bash
cd /Users/ugur/IdeaProjects/builerz-master
source venv/bin/activate
cd backend
uvicorn app.main:app --reload
```

**Keep this terminal window open!** The server must be running.

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

## Step 2: Open Admin Panel

### Option A: Direct File Access
1. Open Finder
2. Navigate to: `/Users/ugur/IdeaProjects/builerz-master/admin/`
3. Double-click `index.html`
4. It will open in your default browser

### Option B: Using Browser Address Bar
1. Open your browser (Chrome, Safari, Firefox)
2. Press `Cmd + O` (or File → Open)
3. Navigate to: `/Users/ugur/IdeaProjects/builerz-master/admin/index.html`
4. Click Open

### Option C: Drag and Drop
1. Open Finder
2. Navigate to `admin` folder
3. Drag `index.html` into your browser window

## Step 3: Login

- **Username:** `admin`
- **Password:** `admin123`

## Troubleshooting

### "Failed to fetch" or "Network Error"
- Make sure backend server is running (Step 1)
- Check terminal for errors
- Try refreshing the page

### Admin panel opens but shows blank page
- Open browser Developer Tools (F12 or Cmd+Option+I)
- Check Console tab for errors
- Make sure backend is running on http://localhost:8000

### Can't find the file
- Full path: `/Users/ugur/IdeaProjects/builerz-master/admin/index.html`
- Make sure you're in the correct project directory

## Verify Backend is Running

Open in browser: http://localhost:8000/docs

You should see API documentation. If you see this, backend is working!

## Need Help?

1. Check backend terminal for error messages
2. Verify backend is running: http://localhost:8000/docs
3. Check browser console for JavaScript errors (F12)

