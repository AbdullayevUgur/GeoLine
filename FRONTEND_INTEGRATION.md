# Frontend Integration Guide

This document explains how the frontend website integrates with the CMS backend API.

## Overview

The website now dynamically loads content from the FastAPI backend instead of using static HTML. This allows content to be managed through the admin panel and automatically displayed on the website.

## Files Added

### JavaScript Files

1. **`js/api-client.js`**
   - Frontend API client for public endpoints
   - Handles all API communication
   - Provides helper methods for image URLs

2. **`js/frontend.js`**
   - Main frontend JavaScript
   - Loads and renders dynamic content
   - Handles page-specific content loading

## Integration Points

### Homepage (index.html)

Dynamically loads:
- **Carousel slides** - Replaces static carousel items
- **Services** - Loads active services
- **Blog posts** - Shows latest published posts
- **Statistics** - Displays homepage statistics
- **About preview** - Shows about content preview
- **FAQs** - Loads frequently asked questions

### Portfolio Page (portfolio.html)

- **Portfolio projects** - Loads all active projects
- Filters by status (completed, in_progress, future)
- Maintains existing filter functionality

### Services Page (service.html)

- **Services list** - Loads all active services
- Displays with images and descriptions

### About Page (about.html)

- **About content** - Loads about page content
- Updates title, subtitle, description, and image

### Contact Page (contact.html)

- **Contact information** - Loads contact info from API
- **Contact form** - Submits to API endpoint
- Form validation and submission handling

### Licenses Page (team.html)

- **Licenses** - Loads all active licenses
- Displays license images

## API Configuration

Update the API base URL in `js/api-client.js`:

```javascript
const API_BASE_URL = 'http://localhost:8000';
```

For production, change to your production API URL.

## How It Works

1. **Page Load**: When a page loads, `frontend.js` detects the current page
2. **API Calls**: Makes appropriate API calls to fetch content
3. **Dynamic Rendering**: Replaces static HTML with dynamic content
4. **Fallback**: If API fails, static content remains visible

## Error Handling

- API errors are logged to console
- Failed API calls return empty arrays
- Static HTML serves as fallback content
- User experience is not disrupted by API failures

## Testing

1. **Start Backend**:
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

2. **Open Website**:
   - Open `index.html` in a browser
   - Or serve via a web server

3. **Verify**:
   - Content loads from API
   - Images display correctly
   - Forms submit successfully

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Uses Fetch API (no jQuery dependency for API calls)

## Notes

- Static HTML remains as fallback
- Existing CSS and styling preserved
- Bootstrap carousel and other plugins still work
- Image paths are automatically converted to full URLs

