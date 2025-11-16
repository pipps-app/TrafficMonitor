# 🚀 Complete Setup Guide - Visitor Tracker App

This guide will walk you through setting up the complete Visitor Tracker system with real data tracking for pipps.app.

## ✅ What's Been Set Up

1. **Backend API Server** - Running on `http://localhost:3001`
2. **Tracking Script** - Available at `http://localhost:3001/tracker.js`
3. **Environment Configuration** - `.env` file configured
4. **Frontend Integration** - App configured to use backend API

---

## 📋 Step-by-Step Setup

### 1. Backend is Already Running ✓

The backend server is running on `http://localhost:3001` with these endpoints:
- `POST /api/track` - Receives tracking data
- `GET /api/stats/:pageCode` - Returns analytics
- `GET /api/verify/:pageCode` - Verifies installation
- `GET /tracker.js?id=YOUR_CODE` - Tracking script

### 2. Configure Your Gemini API Key

Edit the `.env` file in the root directory:

```env
VITE_API_KEY=your_actual_gemini_api_key_here
VITE_API_BASE_URL=http://localhost:3001
```

Replace `your_actual_gemini_api_key_here` with your real Gemini API key from https://ai.google.dev/

### 3. Install Tracking Script on pipps.app

Add this code just before the closing `</body>` tag on pipps.app:

```html
<script async src="http://localhost:3001/tracker.js?id=PIPPS_APP"></script>
```

**For Production:** Replace `http://localhost:3001` with your deployed backend URL.

### 4. Start the Frontend

In a new terminal, run:

```bash
cd "c:\Applications and programs\Visitor tracker app"
npm run dev
```

Then open http://localhost:5173 in your browser.

### 5. Verify Installation

1. Open your frontend dashboard
2. Click "Verify Installation" for the Pipps App page
3. Once verified, click "View Dashboard" to see real-time stats

---

## 🧪 Testing Locally

### Test with the Included Test Page

1. Open http://localhost:3001/test-page.html in your browser
2. Navigate around, refresh, open in different browsers
3. Go to your frontend dashboard and view stats for TEST_PAGE

### Test the API Directly

**Check Health:**
```bash
curl http://localhost:3001/health
```

**Get Stats:**
```bash
curl http://localhost:3001/api/stats/TEST_PAGE
```

**Verify Tracking:**
```bash
curl http://localhost:3001/api/verify/TEST_PAGE
```

---

## 🌐 Deploying to Production

### Backend Deployment Options

**Option 1: Railway**
1. Go to https://railway.app
2. Create new project from GitHub repo
3. Deploy the `backend` folder
4. Note your production URL

**Option 2: Render**
1. Go to https://render.com
2. Create new Web Service
3. Point to your backend folder
4. Deploy

**Option 3: Vercel/Netlify Functions**
Convert the Express app to serverless functions

**Option 4: VPS (DigitalOcean, AWS, etc.)**
1. Set up a server
2. Install Node.js
3. Clone your repo
4. Run `npm install && npm start`
5. Use PM2 or similar for process management

### Update Frontend for Production

Once your backend is deployed, update `.env`:

```env
VITE_API_BASE_URL=https://your-backend-domain.com
```

### Update Tracking Script on pipps.app

Replace localhost with your production backend URL:

```html
<script async src="https://your-backend-domain.com/tracker.js?id=PIPPS_APP"></script>
```

---

## 📊 Installing on pipps.app

### Where to Add the Tracking Code

The tracking script should be added to **every page** you want to track on pipps.app.

**Best Location:** Just before the closing `</body>` tag:

```html
<!DOCTYPE html>
<html>
<head>
    <!-- Your head content -->
</head>
<body>
    <!-- Your page content -->
    
    <!-- Visitor Tracker - Add this before closing body tag -->
    <script async src="http://localhost:3001/tracker.js?id=PIPPS_APP"></script>
</body>
</html>
```

### If Using a Framework

**React/Next.js:**
Add to your root layout or `_app.js`:
```jsx
<Script src="http://localhost:3001/tracker.js?id=PIPPS_APP" strategy="afterInteractive" />
```

**WordPress:**
Add to your theme's `footer.php` or use a plugin like "Insert Headers and Footers"

**Webflow/Wix/Squarespace:**
Add via custom code injection in site settings

---

## 🔍 What Data is Tracked

The tracking script collects:
- **Page Views:** Every time the page loads
- **Unique Visitors:** Tracked via session IDs
- **Traffic Source:** Where visitors came from (referrer)
- **Device Type:** Desktop, Mobile, or Tablet
- **Session Duration:** Time spent on the site
- **Bounce Rate:** Single-page sessions

**Privacy Note:** No personal information is collected. Only anonymous analytics data.

---

## 🛠️ Troubleshooting

### Backend Not Starting
```bash
cd backend
npm install
npm start
```

### No Data Appearing
1. Check backend is running: http://localhost:3001/health
2. Verify tracking script is on the page (View Source)
3. Check browser console for errors
4. Test with the test page first: http://localhost:3001/test-page.html

### CORS Errors
The backend is configured to allow all origins. If you still see CORS errors, check your browser console and backend logs.

### Frontend Connection Issues
Verify `.env` file has the correct `VITE_API_BASE_URL` setting.

---

## 📁 Project Structure

```
Visitor tracker app/
├── backend/                    # Backend API Server
│   ├── server.js              # Main server file
│   ├── public/
│   │   ├── tracker.js         # Tracking script for landing pages
│   │   └── test-page.html     # Test page for testing
│   ├── package.json
│   └── .env
├── services/                   # Frontend services
│   ├── apiService.ts          # API calls to backend
│   └── geminiService.ts       # Gemini AI integration
├── .env                       # Frontend environment variables
└── ...                        # Other frontend files
```

---

## 🎯 Next Steps

1. ✓ Backend is running
2. ⚠️ Add your Gemini API key to `.env`
3. ⚠️ Start the frontend with `npm run dev`
4. ⚠️ Add tracking script to pipps.app
5. ⚠️ Verify installation in the dashboard
6. 📊 Watch real-time stats come in!

---

## 💡 Tips

- **Use unique page codes** for different pages (e.g., PIPPS_HOME, PIPPS_PRICING)
- **Live Mode** polls every 5 seconds - use it to watch real-time updates
- **AI Insights** require a Gemini API key and analyze your real traffic data
- **Session tracking** uses sessionStorage - data resets when browser closes
- **For production**, implement a real database instead of in-memory storage

---

## 📞 Support

If you run into issues:
1. Check the backend logs in the terminal
2. Check browser console for errors
3. Verify all environment variables are set
4. Test with the included test page first

Happy tracking! 🎉
