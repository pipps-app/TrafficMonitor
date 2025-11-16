# Quick Commands Reference

## GitHub Setup

### First Time Setup
```powershell
# Install Git from: https://git-scm.com/download/win
# Then run these commands:

cd "c:\Applications and programs\Visitor tracker app"
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"
git add .
git commit -m "Initial commit: Visitor Tracker App"
git remote add origin https://github.com/pipps-app/TrafficMonitor.git
git branch -M main
git push -u origin main
```

### Regular Updates
```powershell
git add .
git commit -m "Description of changes"
git push
```

## Local Development

### Start Backend
```powershell
cd "c:\Applications and programs\Visitor tracker app\backend"
npm install  # First time only
npm start
```

### Start Frontend
```powershell
cd "c:\Applications and programs\Visitor tracker app"
npm install  # First time only
npm run dev
```

## Cloud Deployment

### Deploy Backend to Google Cloud Run
```powershell
# First time: Install Google Cloud SDK
# https://cloud.google.com/sdk/docs/install

# Login and setup
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud services enable cloudbuild.googleapis.com run.googleapis.com

# Deploy
cd "c:\Applications and programs\Visitor tracker app"
.\deploy-backend.ps1 -ProjectId "YOUR_PROJECT_ID" -Region "us-central1"

# Get backend URL
gcloud run services describe visitor-tracker-backend --region us-central1 --format='value(status.url)'
```

### Deploy Frontend to Firebase
```powershell
# Install Firebase CLI
npm install -g firebase-tools

# Setup
firebase login
firebase init hosting

# Update .env with backend URL
# VITE_API_BASE_URL=https://your-backend.run.app

# Build and deploy
npm run build
firebase deploy --only hosting
```

### Deploy Frontend to Netlify
```powershell
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

### Deploy Frontend to Vercel
```powershell
npm install -g vercel
vercel
```

## Testing

### Test Backend Health
```
https://your-backend.run.app/health
```

### Test Tracking Script
```
https://your-backend.run.app/test-page.html
```

### View Logs (Cloud Run)
```powershell
gcloud run logs read visitor-tracker-backend --region us-central1 --limit 50
```

## Update Tracking Script on Your Websites

Replace localhost URLs with your deployed backend:
```html
<!-- Before -->
<script src="http://localhost:3002/tracker.js?id=JCE"></script>

<!-- After -->
<script src="https://your-backend.run.app/tracker.js?id=JCE"></script>
```

## Troubleshooting

### CORS Errors
```powershell
# Check backend logs
gcloud run logs read visitor-tracker-backend --region us-central1

# Verify environment variables
gcloud run services describe visitor-tracker-backend --region us-central1
```

### Frontend Not Connecting
1. Check `.env` file has correct `VITE_API_BASE_URL`
2. Rebuild after changing .env: `npm run build`
3. Check browser console Network tab

### Git Push Fails
```powershell
# If repo already has commits
git pull origin main --allow-unrelated-histories
git push -u origin main

# If authentication fails, use Personal Access Token from:
# https://github.com/settings/tokens
```

## Environment Variables

### Backend (.env)
```env
PORT=3002
ALLOWED_ORIGINS=*
NODE_ENV=production
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3002
API_KEY=your_gemini_api_key_here
```

For production, update `VITE_API_BASE_URL` to your Cloud Run URL.

## Cost Estimates

### Google Cloud Run
- Free tier: 2 million requests/month
- 360,000 GB-seconds/month
- Typically $0-5/month for small traffic

### Firebase Hosting
- Free tier: 10 GB storage, 360 MB/day transfer
- Typically free for most use cases

### Netlify/Vercel
- Free tier: 100 GB bandwidth/month
- Typically free for most use cases

## Need Help?

See detailed guides:
- `GITHUB_CLOUD_SETUP.md` - Complete setup guide
- `DEPLOYMENT.md` - Deployment documentation
- `DEPLOYMENT_SUMMARY.md` - Summary of changes
