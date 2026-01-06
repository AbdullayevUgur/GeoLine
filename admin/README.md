# GeoLine CMS Admin Panel

Modern, responsive admin panel for managing GeoLine Engineering website content.

## Features

- 🔐 Secure authentication with JWT tokens
- 📊 Dashboard with statistics overview
- 🎨 Content management for all content types:
  - Carousel slides
  - Services
  - Portfolio projects
  - Blog posts
  - FAQs
  - About content
  - Contact information
  - Statistics
  - Partners
  - Licenses
- 📤 Image upload with preview
- 📱 Responsive design
- 🎯 Modern UI/UX

## Setup

1. **Ensure backend is running:**
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

2. **Open admin panel:**
   - Open `admin/index.html` in a web browser
   - Or serve via a web server (recommended)

3. **Login:**
   - Username: `admin`
   - Password: `admin123`

## File Structure

```
admin/
├── index.html          # Main admin panel HTML
├── css/
│   └── admin.css       # Admin panel styles
├── js/
│   ├── api.js          # API client for backend communication
│   └── admin.js        # Main admin panel logic
└── README.md           # This file
```

## API Configuration

The admin panel connects to the backend API. Update the API base URL in `js/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:8000';
```

Change this to your production API URL when deploying.

## Usage

### Navigation
- Use the sidebar menu to navigate between different content sections
- Each section displays a list of items with edit/delete actions

### Managing Content
- Click "Add" button to create new content
- Click "Edit" button to modify existing content
- Click "Delete" button to remove content (with confirmation)

### Image Uploads
- When creating/editing content with images, use the file upload interface
- Images are automatically optimized and stored
- Preview is shown before submission

## Security Notes

- ⚠️ Change default admin password after first login
- ⚠️ Use HTTPS in production
- ⚠️ Configure CORS properly in production
- ⚠️ Store JWT tokens securely

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Development Notes

The admin panel uses:
- Bootstrap 5 for UI components
- Font Awesome for icons
- Vanilla JavaScript (no frameworks)
- Fetch API for HTTP requests

## Next Steps

To complete the admin panel, implement:
1. Modal forms for creating/editing content
2. Image upload preview functionality
3. Form validation
4. Better error handling UI
5. Loading states
6. Success notifications

