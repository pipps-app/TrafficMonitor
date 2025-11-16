# Traffic Monitor App

A comprehensive visitor tracking and analytics application for monitoring website traffic.

## Project Structure

- **Frontend**: React + TypeScript + Vite application
- **Backend**: Node.js Express API server
- **Tracking Script**: Embeddable JavaScript for website tracking

## Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/pipps-app/TrafficMonitor.git
   cd TrafficMonitor
   ```

2. **Set up the backend:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm start
   ```

3. **Set up the frontend:**
   ```bash
   # In a new terminal, from the root directory
   npm install
   cp .env.example .env
   # Edit .env with your Gemini API key and backend URL
   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3002
   - Test page: http://localhost:3002/test-page.html

## Cloud Deployment

### Backend (Google Cloud Run)

1. **Build and push the Docker image:**
   ```bash
   cd backend
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/visitor-tracker-backend
   ```

2. **Deploy to Cloud Run:**
   ```bash
   gcloud run deploy visitor-tracker-backend \
     --image gcr.io/YOUR_PROJECT_ID/visitor-tracker-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars NODE_ENV=production,ALLOWED_ORIGINS=*
   ```

3. **Note the deployed URL** (e.g., https://visitor-tracker-backend-xxx.run.app)

### Frontend (Firebase Hosting, Netlify, or Vercel)

#### Option 1: Firebase Hosting

1. **Build the frontend:**
   ```bash
   # Update .env with your backend Cloud Run URL
   VITE_API_BASE_URL=https://your-backend-service.run.app
   npm run build
   ```

2. **Deploy to Firebase:**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init hosting
   firebase deploy
   ```

#### Option 2: Netlify

1. **Build and deploy:**
   ```bash
   npm run build
   netlify deploy --prod
   ```

   Set environment variable in Netlify dashboard:
   - `VITE_API_BASE_URL`: Your Cloud Run backend URL

#### Option 3: Vercel

1. **Deploy:**
   ```bash
   npm install -g vercel
   vercel
   ```

   Set environment variable in Vercel dashboard:
   - `VITE_API_BASE_URL`: Your Cloud Run backend URL

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

## Tracking Script Usage

Add this script to any website you want to track:

```html
<script src="https://your-backend-url.run.app/tracker.js?id=YOUR_PAGE_CODE"></script>
```

Replace:
- `your-backend-url.run.app` with your Cloud Run backend URL
- `YOUR_PAGE_CODE` with a unique identifier for your page (e.g., "my-landing-page")

## Features

- Real-time visitor tracking
- Traffic source analysis
- Device type breakdown
- Geographic visitor data
- AI-powered insights (powered by Google Gemini)
- Page performance metrics

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Recharts
- **Backend**: Node.js, Express, CORS
- **Deployment**: Google Cloud Run, Firebase/Netlify/Vercel
- **AI**: Google Gemini API

## License

ISC

## Support

For issues and questions, please open an issue on GitHub.
