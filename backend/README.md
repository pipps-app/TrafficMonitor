# Visitor Tracker Backend API

This is the backend server for the Visitor Tracker application. It collects tracking data from landing pages and serves aggregated analytics.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment (edit `.env` file if needed):
   - `PORT`: Server port (default: 3001)
   - `ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins

3. Start the server:
```bash
npm start
```

The server will start at `http://localhost:3001`

## API Endpoints

- `POST /api/track` - Receives tracking pings from landing pages
- `GET /api/stats/:pageCode` - Returns aggregated statistics for a page
- `GET /api/verify/:pageCode` - Verifies if tracking data has been received
- `GET /health` - Health check endpoint

## Data Storage

Currently uses in-memory storage. For production, implement persistent storage (database).
