# Backend API Specification

This document describes the required backend API endpoints that your Visitor Tracker App needs to function with real data.

## Base URL

Set your backend API base URL via the `API_BASE_URL` environment variable.

Example: `https://your-backend-api.com`

---

## Endpoints

### 1. Get Page Statistics

**Endpoint:** `GET /api/stats/:pageCode`

**Description:** Fetches aggregated traffic statistics for a specific landing page.

**Parameters:**
- `pageCode` (path parameter): The unique identifier for the landing page

**Response:** `200 OK`

```json
{
  "totalVisitors": 1234,
  "pageViews": 2456,
  "bounceRate": 45.5,
  "avgSessionDuration": 3.25,
  "visitorTrend": [
    {
      "day": "Oct 15",
      "visitors": 45
    },
    {
      "day": "Oct 16",
      "visitors": 52
    }
    // ... 30 days of data
  ],
  "trafficSources": [
    {
      "name": "Organic Search",
      "value": 55
    },
    {
      "name": "Direct",
      "value": 25
    },
    {
      "name": "Referral",
      "value": 12
    },
    {
      "name": "Social Media",
      "value": 8
    }
  ],
  "deviceTypes": [
    {
      "name": "Desktop",
      "value": 60
    },
    {
      "name": "Mobile",
      "value": 35
    },
    {
      "name": "Tablet",
      "value": 5
    }
  ]
}
```

**Error Responses:**
- `404 Not Found`: Page code doesn't exist or no data available
- `500 Internal Server Error`: Server error

---

### 2. Verify Tracking Code Installation

**Endpoint:** `GET /api/verify/:pageCode`

**Description:** Verifies that the tracking script has been installed and is sending data.

**Parameters:**
- `pageCode` (path parameter): The unique identifier for the landing page

**Response:** `200 OK`

```json
{
  "verified": true,
  "message": "Tracking code is installed and receiving data"
}
```

or

```json
{
  "verified": false,
  "message": "No data received yet. Please ensure the tracking code is installed."
}
```

**Error Responses:**
- `404 Not Found`: Page code doesn't exist
- `500 Internal Server Error`: Server error

---

## Data Collection Endpoint

Your backend should also provide an endpoint to receive data from the tracking script installed on landing pages.

**Endpoint:** `POST /api/track` (or similar)

**Description:** Receives visitor tracking data from the JavaScript snippet.

**Request Body:**
```json
{
  "pageCode": "PIPPS_APP",
  "timestamp": 1699999999999,
  "userAgent": "Mozilla/5.0...",
  "referrer": "https://google.com",
  "sessionId": "unique-session-id",
  "pageUrl": "https://pipps.app"
}
```

---

## TypeScript Interfaces

The app expects the following data structure (defined in `types.ts`):

```typescript
export interface TrafficData {
  totalVisitors: number;
  pageViews: number;
  bounceRate: number; // Percentage (0-100)
  avgSessionDuration: number; // In minutes
  visitorTrend: DailyVisitor[];
  trafficSources: TrafficSource[];
  deviceTypes: DeviceType[];
}

export interface DailyVisitor {
  day: string; // Format: "Oct 15"
  visitors: number;
}

export interface TrafficSource {
  name: string; // e.g., "Organic Search", "Direct", "Referral", "Social Media"
  value: number; // Percentage (0-100)
}

export interface DeviceType {
  name: string; // e.g., "Desktop", "Mobile", "Tablet"
  value: number; // Percentage (0-100)
}
```

---

## Implementation Notes

1. **Authentication**: Consider adding API key authentication to secure your endpoints
2. **CORS**: Configure CORS headers to allow requests from your frontend domain
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **Data Aggregation**: Aggregate tracking data by day, source, device, etc.
5. **Session Tracking**: Use cookies or session IDs to track unique visitors vs. page views
6. **Bounce Rate Calculation**: Track single-page sessions to calculate bounce rate
7. **Session Duration**: Calculate from first to last interaction in a session

---

## Example Backend Technologies

You can implement this backend using:
- **Node.js/Express** with PostgreSQL or MongoDB
- **Python/Flask/Django** with any database
- **Go** with any database
- **Serverless** (AWS Lambda, Vercel Functions, etc.)

---

## Testing

Until your backend is ready, the app will throw errors when trying to fetch data. Make sure to:

1. Set the `API_BASE_URL` environment variable
2. Implement all required endpoints
3. Test with tools like Postman or curl
4. Verify CORS is properly configured
