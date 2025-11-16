#!/bin/bash

# Deploy Visitor Tracker Backend to Google Cloud Run
# Usage: ./deploy-backend.sh PROJECT_ID REGION

PROJECT_ID=${1:-"your-project-id"}
REGION=${2:-"us-central1"}
SERVICE_NAME="visitor-tracker-backend"

echo "🚀 Deploying Visitor Tracker Backend to Cloud Run..."
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"
echo ""

# Navigate to backend directory
cd backend

# Build and submit to Cloud Build
echo "📦 Building Docker image..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME --project=$PROJECT_ID

# Deploy to Cloud Run
echo "☁️  Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,ALLOWED_ORIGINS=* \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --project=$PROJECT_ID

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Get your backend URL with:"
echo "gcloud run services describe $SERVICE_NAME --region=$REGION --project=$PROJECT_ID --format='value(status.url)'"
