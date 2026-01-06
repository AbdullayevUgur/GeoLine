# Troubleshooting Guide - "Failed to fetch" Error

## ✅ FIXED: Authentication Issue
The backend authentication has been fixed. The login endpoint now works correctly.

## Steps to Access Admin Panel

### 1. Make sure backend is running
Open Terminal and run:
```bash
cd /Users/ugur/IdeaProjects/builerz-master
source venv/bin/activate
cd backend
uvicorn app.main:app --reload
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### 2. Start admin panel web server
Open a NEW Terminal window and run:
```bash
cd /Users/ugur/IdeaProjects/builerz-master/admin
python3 -m http.server 8080
```

### 3. Access admin panel
Open in your browser:
```
http://localhost:8080
```

**IMPORTANT:** Do NOT open the HTML file directly (file://). Always use http://localhost:8080

### 4. Login
- Username: `admin`
- Password: `admin123`

## Test API Connection

Open this test page to verify API is working:
```
http://localhost:8080/test-api.html
```

Click "Test API Connection" button. You should see successful responses.

## Common Issues

### Still getting "Failed to fetch"
1. **Check backend is running**: Open http://localhost:8000/docs - should show API docs
2. **Check admin server is running**: Open http://localhost:8080 - should show admin panel
3. **Clear browser cache**: Press Cmd+Shift+R (hard refresh)
4. **Check browser console**: Press F12 → Console tab → look for errors

### Backend not starting
```bash
# Kill any process on port 8000
lsof -ti:8000 | xargs kill -9

# Then start again
cd backend
uvicorn app.main:app --reload
```

### Admin server not starting
```bash
# Kill any process on port 8080
lsof -ti:8080 | xargs kill -9

# Then start again
cd admin
python3 -m http.server 8080
```

## Verify Everything Works

1. ✅ Backend: http://localhost:8000/docs (should show API docs)
2. ✅ Admin Panel: http://localhost:8080 (should show login page)
3. ✅ Test Page: http://localhost:8080/test-api.html (should test API)

If all three work, you're good to go!

