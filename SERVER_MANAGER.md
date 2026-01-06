# Server Management Guide

## 🚀 Easiest Method: Double-Click `.command` Files (macOS)

**Recommended for macOS users:**

1. **Start Servers**: Double-click `start_servers.command`
   - Runs servers in background (no terminal windows)
   - Backend API: http://localhost:8000
   - Admin Panel: http://localhost:8080

2. **Stop Servers**: Double-click `stop_servers.command`
   - Stops both servers

3. **Check Status**: Double-click `check_status.command`
   - Shows if servers are running

### First Time Setup:
If double-clicking doesn't work:
1. Right-click the `.command` file
2. Select "Open With" → "Terminal"
3. Or open Terminal and drag the file into it

---

## Alternative Methods

### Method 1: Background Scripts (No Terminal Windows)
- `START_SERVERS_BACKGROUND.sh` - Start servers silently
- `STOP_SERVERS_BACKGROUND.sh` - Stop servers
- Logs saved to `backend.log` and `admin.log`

### Method 2: Terminal Window Scripts
- `START_SERVERS.sh` - Opens Terminal windows (good for debugging)
- `STOP_SERVERS.sh` - Stops servers
- `CHECK_STATUS.sh` - Check server status

### Create Desktop Shortcuts:
1. Right-click any `.command` file → "Make Alias"
2. Move alias to Desktop
3. Double-click from Desktop anytime!

## Manual Terminal Method

If you prefer using Terminal:

```bash
# Start servers
./START_SERVERS.sh

# Stop servers
./STOP_SERVERS.sh

# Check status
./CHECK_STATUS.sh
```

## Server URLs

- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Admin Panel**: http://localhost:8080

## Troubleshooting

### If scripts don't run:
1. Open Terminal
2. Navigate to project: `cd /Users/ugur/IdeaProjects/builerz-master`
3. Make executable: `chmod +x *.sh`
4. Run: `./START_SERVERS.sh`

### If ports are already in use:
- Run `STOP_SERVERS.sh` first
- Then run `START_SERVERS.sh` again

### To check what's using ports:
```bash
lsof -i :8000
lsof -i :8080
```

