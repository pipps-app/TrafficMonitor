# Deploy Visitor Tracker Backend to Google Cloud Run
# Usage: .\deploy-backend.ps1 -ProjectId "your-project-id" -Region "us-central1"

param(
    [Parameter(Mandatory=$false)]
    [string]$ProjectId = "your-project-id",
    
    [Parameter(Mandatory=$false)]
    [string]$Region = "us-central1"
)

$ServiceName = "visitor-tracker-backend"

Write-Host "🚀 Deploying Visitor Tracker Backend to Cloud Run..." -ForegroundColor Green
Write-Host "Project ID: $ProjectId"
Write-Host "Region: $Region"
Write-Host ""

# Navigate to backend directory
Set-Location backend

# Build and submit to Cloud Build
Write-Host "📦 Building Docker image..." -ForegroundColor Yellow
gcloud builds submit --tag gcr.io/$ProjectId/$ServiceName --project=$ProjectId

# Deploy to Cloud Run
Write-Host "☁️  Deploying to Cloud Run..." -ForegroundColor Yellow
gcloud run deploy $ServiceName `
  --image gcr.io/$ProjectId/$ServiceName `
  --platform managed `
  --region $Region `
  --allow-unauthenticated `
  --set-env-vars NODE_ENV=production,ALLOWED_ORIGINS=* `
  --memory 512Mi `
  --cpu 1 `
  --max-instances 10 `
  --project=$ProjectId

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Get your backend URL with:"
Write-Host "gcloud run services describe $ServiceName --region=$Region --project=$ProjectId --format='value(status.url)'" -ForegroundColor Cyan

# Return to root directory
Set-Location ..
