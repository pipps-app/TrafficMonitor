# GitHub Sync & Cloud Deployment Guide

This guide will help you sync your project with GitHub and deploy to Google Cloud.

## Part 1: Setting Up Git and GitHub

### Step 1: Install Git (if not installed)

Download and install Git for Windows from: https://git-scm.com/download/win

After installation, restart VS Code.

### Step 2: Initialize Git Repository

Open a new PowerShell terminal in VS Code and run:

```powershell
# Navigate to your project
cd "c:\Applications and programs\Visitor tracker app"

# Initialize git repository
git init

# Configure your identity (replace with your info)
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Visitor Tracker App"
```

### Step 3: Connect to GitHub

```powershell
# Add the remote repository
git remote add origin https://github.com/pipps-app/TrafficMonitor.git

# Push to GitHub
git branch -M main
git push -u origin main
```

If prompted for credentials, use your GitHub username and a Personal Access Token (PAT):
1. Go to GitHub.com → Settings → Developer settings → Personal access tokens
2. Generate new token with `repo` scope
3. Use the token as your password

## Part 2: Deploying Backend to Google Cloud Run

### Prerequisites

1. **Install Google Cloud SDK**: https://cloud.google.com/sdk/docs/install
2. **Create a Google Cloud Project**: https://console.cloud.google.com/

### Step 1: Set Up Google Cloud

```powershell
# Login to Google Cloud
gcloud auth login

# Set your project ID (replace with your actual project ID)
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
```

### Step 2: Deploy Backend

```powershell
# Navigate to project root
cd "c:\Applications and programs\Visitor tracker app"

# Run the deployment script
.\deploy-backend.ps1 -ProjectId "YOUR_PROJECT_ID" -Region "us-central1"
```

Or deploy manually:

```powershell
cd backend

# Build Docker image
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/visitor-tracker-backend

# Deploy to Cloud Run
gcloud run deploy visitor-tracker-backend `
  --image gcr.io/YOUR_PROJECT_ID/visitor-tracker-backend `
  --platform managed `
  --region us-central1 `
  --allow-unauthenticated `
  --set-env-vars NODE_ENV=production,ALLOWED_ORIGINS=*
```

### Step 3: Get Your Backend URL

```powershell
gcloud run services describe visitor-tracker-backend `
  --region us-central1 `
  --format='value(status.url)'
```

Copy this URL - you'll need it for the frontend!

## Part 3: Deploying Frontend

### Option A: Firebase Hosting (Recommended)

```powershell
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init hosting

# When prompted:
# - Select your Firebase project or create a new one
# - Set public directory to: dist
# - Configure as single-page app: Yes
# - Set up automatic builds with GitHub: No (for now)

# Update .env with your backend URL
# Edit .env and set:
# VITE_API_BASE_URL=https://your-backend-url.run.app

# Build the frontend
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

### Option B: Netlify

```powershell
# Install Netlify CLI
npm install -g netlify-cli

# Update .env with backend URL
# VITE_API_BASE_URL=https://your-backend-url.run.app

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

When prompted, you'll need to set the environment variable in Netlify dashboard:
- Go to Site settings → Environment variables
- Add: `VITE_API_BASE_URL` = `https://your-backend-url.run.app`

### Option C: Vercel

```powershell
# Install Vercel CLI
npm install -g vercel

# Update .env with backend URL
# VITE_API_BASE_URL=https://your-backend-url.run.app

# Deploy
vercel
```

Set environment variable in Vercel dashboard:
- Go to Project Settings → Environment Variables
- Add: `VITE_API_BASE_URL` = `https://your-backend-url.run.app`

## Part 4: Update Tracking Script

Once deployed, update your tracking script URL on your websites:

```html
<!-- Replace localhost with your Cloud Run backend URL -->
<script src="https://your-backend-url.run.app/tracker.js?id=YOUR_PAGE_CODE"></script>
```

## Part 5: Testing

1. **Test Backend**:
   ```
   https://your-backend-url.run.app/health
   ```

2. **Test Frontend**:
   Open your deployed frontend URL and try to view analytics

3. **Test Tracking**:
   Visit the test page:
   ```
   https://your-backend-url.run.app/test-page.html
   ```

## Fixing CORS Issues

The backend has been configured to allow CORS from all origins, which should fix the fetch errors you were experiencing.

**What changed:**
1. ✅ Backend now accepts requests from any origin (for tracker script)
2. ✅ Proper CORS headers for credentials and allowed methods
3. ✅ Cloud Run binding to 0.0.0.0 for external access
4. ✅ Environment variable support for custom allowed origins

**If you still have issues:**
1. Check browser console for specific CORS errors
2. Verify the backend URL in your `.env` file
3. Make sure the backend is deployed and running
4. Check Cloud Run logs: `gcloud run logs read visitor-tracker-backend --region us-central1`

## Continuous Deployment

### GitHub Actions (Automated Deployment)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Cloud SDK
      uses: google-github-actions/setup-gcloud@v1
      with:
        project_id: ${{ secrets.GCP_PROJECT_ID }}
        service_account_key: ${{ secrets.GCP_SA_KEY }}
    
    - name: Build and Push
      run: |
        cd backend
        gcloud builds submit --tag gcr.io/${{ secrets.GCP_PROJECT_ID }}/visitor-tracker-backend
    
    - name: Deploy to Cloud Run
      run: |
        gcloud run deploy visitor-tracker-backend \
          --image gcr.io/${{ secrets.GCP_PROJECT_ID }}/visitor-tracker-backend \
          --platform managed \
          --region us-central1 \
          --allow-unauthenticated
```

Add secrets to GitHub:
1. Go to your repo → Settings → Secrets and variables → Actions
2. Add `GCP_PROJECT_ID` and `GCP_SA_KEY`

## Summary

✅ **What we've done:**
1. Fixed CORS configuration in backend
2. Added environment variable support
3. Created deployment scripts for Google Cloud Run
4. Added `.gitignore` for proper Git management
5. Created comprehensive deployment documentation

✅ **What this fixes:**
- Your CORS/fetch issues (backend now properly configured)
- Access from anywhere (deployed to cloud instead of localhost)
- Easy updates via Git/GitHub

✅ **Next steps:**
1. Install Git (if not already installed)
2. Push code to GitHub
3. Deploy backend to Google Cloud Run
4. Deploy frontend to Firebase/Netlify/Vercel
5. Update tracking script URLs on your websites

Need help with any step? Let me know!
