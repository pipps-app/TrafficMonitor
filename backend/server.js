require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const geoip = require('geoip-lite');

const app = express();
// Cloud Run sets PORT env variable, fallback to 3002 for local development
const PORT = process.env.PORT || 3002;

// CORS configuration - Allow requests from frontend and tracking script
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, curl, or same-origin)
    if (!origin) return callback(null, true);
    
    // Allow all origins for the tracker script to work
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Default: allow all origins for tracker functionality
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Serve static files (tracking script and test page)
app.use(express.static(path.join(__dirname, 'public')));

// In-memory data storage
// Structure: { pageCode: { visits: [], sessions: {}, metadata: {} } }
const analyticsData = {};

// Helper function to get date string
const getDateString = (date = new Date()) => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Helper function to parse user agent
const parseUserAgent = (userAgent) => {
  if (!userAgent) return 'Desktop';
  const ua = userAgent.toLowerCase();
  if (/mobile|android|iphone|ipad|ipod/.test(ua)) {
    return /ipad|tablet/.test(ua) ? 'Tablet' : 'Mobile';
  }
  return 'Desktop';
};

// Helper function to categorize traffic source
const categorizeSource = (referrer) => {
  if (!referrer || referrer === '') return 'Direct';
  
  const ref = referrer.toLowerCase();
  if (/google|bing|yahoo|duckduckgo|baidu/.test(ref)) return 'Organic Search';
  if (/facebook|twitter|instagram|linkedin|pinterest|reddit|tiktok/.test(ref)) return 'Social Media';
  return 'Referral';
};

// Helper function to get country from IP
const getCountryFromIP = (req) => {
  // Try to get IP from various headers (for proxies/load balancers)
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() ||
             req.headers['x-real-ip'] ||
             req.connection.remoteAddress ||
             req.socket.remoteAddress;
  
  if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('::ffff:127.')) {
    return 'Local'; // Local development
  }
  
  const geo = geoip.lookup(ip);
  return geo ? geo.country : 'Unknown';
};

// Initialize page data structure
const initializePageData = (pageCode) => {
  if (!analyticsData[pageCode]) {
    analyticsData[pageCode] = {
      visits: [],
      sessions: {},
      metadata: {
        firstVisit: new Date().toISOString(),
        lastVisit: new Date().toISOString()
      }
    };
  }
};

// POST /api/track - Receive tracking data
app.post('/api/track', (req, res) => {
  try {
    const { pageCode, referrer, sessionId, pageUrl } = req.body;
    
    if (!pageCode) {
      return res.status(400).json({ error: 'pageCode is required' });
    }

    const timestamp = new Date();
    const userAgent = req.headers['user-agent'] || '';
    const device = parseUserAgent(userAgent);
    const source = categorizeSource(referrer);
    const country = getCountryFromIP(req);
    const actualSessionId = sessionId || uuidv4();

    // Initialize page data if needed
    initializePageData(pageCode);

    // Record the visit
    analyticsData[pageCode].visits.push({
      timestamp: timestamp.toISOString(),
      sessionId: actualSessionId,
      device,
      source,
      country,
      referrer: referrer || '',
      pageUrl: pageUrl || '',
      userAgent
    });

    // Update session tracking
    if (!analyticsData[pageCode].sessions[actualSessionId]) {
      analyticsData[pageCode].sessions[actualSessionId] = {
        startTime: timestamp.toISOString(),
        lastActivity: timestamp.toISOString(),
        pageViews: 1,
        device,
        source,
        country
      };
    } else {
      analyticsData[pageCode].sessions[actualSessionId].lastActivity = timestamp.toISOString();
      analyticsData[pageCode].sessions[actualSessionId].pageViews += 1;
    }

    // Update metadata
    analyticsData[pageCode].metadata.lastVisit = timestamp.toISOString();

    console.log(`[TRACK] Received ping for ${pageCode} - Session: ${actualSessionId}`);

    res.json({ 
      success: true, 
      message: 'Tracking data received',
      sessionId: actualSessionId
    });
  } catch (error) {
    console.error('[TRACK] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/verify/:pageCode - Verify tracking installation
app.get('/api/verify/:pageCode', (req, res) => {
  try {
    const { pageCode } = req.params;
    
    const hasData = analyticsData[pageCode] && analyticsData[pageCode].visits.length > 0;
    
    console.log(`[VERIFY] Checking ${pageCode} - Data exists: ${hasData}`);

    if (hasData) {
      res.json({
        verified: true,
        message: 'Tracking code is installed and receiving data',
        dataPoints: analyticsData[pageCode].visits.length
      });
    } else {
      res.json({
        verified: false,
        message: 'No data received yet. Please ensure the tracking code is installed.'
      });
    }
  } catch (error) {
    console.error('[VERIFY] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/stats/:pageCode - Get aggregated statistics
app.get('/api/stats/:pageCode', (req, res) => {
  try {
    const { pageCode } = req.params;
    
    if (!analyticsData[pageCode] || analyticsData[pageCode].visits.length === 0) {
      return res.status(404).json({ 
        error: 'No data available for this page code' 
      });
    }

    const data = analyticsData[pageCode];
    const sessions = Object.values(data.sessions);
    const visits = data.visits;

    // Calculate metrics
    const totalVisitors = sessions.length;
    const pageViews = visits.length;

    // Calculate bounce rate (sessions with only 1 page view)
    const bouncedSessions = sessions.filter(s => s.pageViews === 1).length;
    const bounceRate = totalVisitors > 0 ? Number(((bouncedSessions / totalVisitors) * 100).toFixed(1)) : 0;

    // Calculate average session duration (in minutes)
    let totalDuration = 0;
    sessions.forEach(session => {
      const start = new Date(session.startTime);
      const end = new Date(session.lastActivity);
      totalDuration += (end - start) / 1000 / 60; // Convert to minutes
    });
    const avgSessionDuration = totalVisitors > 0 ? Number((totalDuration / totalVisitors).toFixed(2)) : 0;

    // Calculate pages per session
    const pagesPerSession = totalVisitors > 0 ? Number((pageViews / totalVisitors).toFixed(2)) : 0;

    // Generate visitor trend for last 30 days
    const visitorTrend = [];
    const today = new Date();
    const visitsByDay = {};

    // Initialize all 30 days with 0
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayKey = getDateString(date);
      visitsByDay[dayKey] = 0;
    }

    // Count visits by day
    visits.forEach(visit => {
      const visitDate = new Date(visit.timestamp);
      const dayKey = getDateString(visitDate);
      if (visitsByDay.hasOwnProperty(dayKey)) {
        visitsByDay[dayKey]++;
      }
    });

    // Convert to array format
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayKey = getDateString(date);
      visitorTrend.push({
        day: dayKey,
        visitors: visitsByDay[dayKey] || 0
      });
    }

    // Aggregate traffic sources
    const sourceCount = {};
    sessions.forEach(session => {
      sourceCount[session.source] = (sourceCount[session.source] || 0) + 1;
    });

    const totalSources = Object.values(sourceCount).reduce((sum, count) => sum + count, 0);
    const trafficSources = Object.entries(sourceCount).map(([name, count]) => ({
      name,
      value: totalSources > 0 ? Math.round((count / totalSources) * 100) : 0
    }));

    // Aggregate device types
    const deviceCount = {};
    sessions.forEach(session => {
      deviceCount[session.device] = (deviceCount[session.device] || 0) + 1;
    });

    const totalDevices = Object.values(deviceCount).reduce((sum, count) => sum + count, 0);
    const deviceTypes = Object.entries(deviceCount).map(([name, count]) => ({
      name,
      value: totalDevices > 0 ? Math.round((count / totalDevices) * 100) : 0
    }));

    // Calculate peak traffic hour
    const hourCount = {};
    visits.forEach(visit => {
      const hour = new Date(visit.timestamp).getHours();
      const hourLabel = `${hour.toString().padStart(2, '0')}:00`;
      hourCount[hourLabel] = (hourCount[hourLabel] || 0) + 1;
    });
    const peakTrafficHour = Object.entries(hourCount).length > 0
      ? Object.entries(hourCount).sort((a, b) => b[1] - a[1])[0][0]
      : undefined;

    // Aggregate top referrers (exclude empty/direct)
    const referrerCount = {};
    visits.forEach(visit => {
      if (visit.referrer && visit.referrer !== '') {
        referrerCount[visit.referrer] = (referrerCount[visit.referrer] || 0) + 1;
      }
    });
    const topReferrers = Object.entries(referrerCount)
      .map(([url, count]) => ({ url, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 referrers

    // Aggregate countries
    const countryCount = {};
    sessions.forEach(session => {
      const country = session.country || 'Unknown';
      countryCount[country] = (countryCount[country] || 0) + 1;
    });

    const countries = Object.entries(countryCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 countries

    const stats = {
      totalVisitors,
      pageViews,
      bounceRate,
      avgSessionDuration,
      pagesPerSession,
      peakTrafficHour,
      visitorTrend,
      trafficSources,
      deviceTypes,
      countries,
      topReferrers
    };

    console.log(`[STATS] Returning stats for ${pageCode} - ${totalVisitors} visitors, ${pageViews} views`);

    res.json(stats);
  } catch (error) {
    console.error('[STATS] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    trackedPages: Object.keys(analyticsData).length
  });
});

// Start server - Bind to 0.0.0.0 for Cloud Run
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Visitor Tracker Backend running on port ${PORT}`);
  console.log(`\nEndpoints:`);
  console.log(`  POST /api/track`);
  console.log(`  GET  /api/stats/:pageCode`);
  console.log(`  GET  /api/verify/:pageCode`);
  console.log(`  GET  /health`);
  console.log(`\nTracking Script:`);
  console.log(`  /tracker.js?id=YOUR_PAGE_CODE`);
  console.log(`\nTest Page:`);
  console.log(`  /test-page.html`);
  console.log(`\nEnvironment: ${process.env.NODE_ENV || 'development'}`);
});
