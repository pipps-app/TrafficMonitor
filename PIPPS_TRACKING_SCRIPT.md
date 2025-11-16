# 📋 Tracking Script for pipps.app

## Installation Instructions

Add this code to **pipps.app** just before the closing `</body>` tag:

### Local Development
```html
<script async src="http://localhost:3001/tracker.js?id=PIPPS_APP"></script>
```

### Production (after deploying backend)
```html
<script async src="https://your-backend-domain.com/tracker.js?id=PIPPS_APP"></script>
```

---

## Complete HTML Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pipps App</title>
</head>
<body>
    <!-- Your page content here -->
    <h1>Welcome to Pipps App</h1>
    
    <!-- Add tracking script here, before closing body tag -->
    <script async src="http://localhost:3001/tracker.js?id=PIPPS_APP"></script>
</body>
</html>
```

---

## What This Script Does

✅ Tracks page views automatically  
✅ Identifies unique visitors (via session)  
✅ Records traffic sources (referrer)  
✅ Detects device types (Desktop/Mobile/Tablet)  
✅ Calculates session duration  
✅ Zero impact on page performance (async loading)  
✅ No personal data collected (privacy-friendly)

---

## Verification Steps

1. Add the script to pipps.app
2. Visit pipps.app in your browser
3. Go to your Visitor Tracker dashboard
4. Click "Verify Installation" for Pipps App
5. Once verified, click "View Dashboard" to see stats

---

## Testing Before Adding to pipps.app

Test with the sample page first:
1. Open http://localhost:3001/test-page.html
2. Refresh a few times
3. Check dashboard for TEST_PAGE to see data
4. If data appears, your setup is working correctly!

---

## Multiple Pages/Sections

To track different sections of pipps.app separately, use different page codes:

**Homepage:**
```html
<script async src="http://localhost:3001/tracker.js?id=PIPPS_HOME"></script>
```

**Pricing Page:**
```html
<script async src="http://localhost:3001/tracker.js?id=PIPPS_PRICING"></script>
```

**Dashboard:**
```html
<script async src="http://localhost:3001/tracker.js?id=PIPPS_DASHBOARD"></script>
```

Then add each page code separately in the Visitor Tracker app to track them independently.

---

## 🔒 Privacy & Security

- No cookies are used
- Only anonymous session IDs stored in sessionStorage
- No personal information collected
- GDPR & privacy-friendly
- All data stays on your server

---

## Need Help?

1. Ensure backend is running: http://localhost:3001/health
2. Check browser console for errors
3. View backend logs in the terminal
4. Test with http://localhost:3001/test-page.html first
