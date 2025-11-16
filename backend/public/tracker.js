(function() {
  'use strict';
  
  // Get the page code from the script URL
  const currentScript = document.currentScript || document.querySelector('script[src*="tracker.js"]');
  const scriptUrl = currentScript ? currentScript.src : '';
  const urlParams = new URLSearchParams(scriptUrl.split('?')[1] || '');
  const pageCode = urlParams.get('id');
  
  if (!pageCode) {
    console.error('[Visitor Tracker] Error: Page code (id) not found in script URL');
    return;
  }

  // Backend API URL - UPDATE THIS WITH YOUR BACKEND URL
  const API_URL = 'https://visitor-tracker-backend-380679260090.us-central1.run.app/api/track';
  
  // Get or create session ID
  function getSessionId() {
    const sessionKey = 'visitor_tracker_session_' + pageCode;
    let sessionId = sessionStorage.getItem(sessionKey);
    
    if (!sessionId) {
      sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem(sessionKey, sessionId);
    }
    
    return sessionId;
  }

  // Send tracking data
  function sendTrackingData() {
    const data = {
      pageCode: pageCode,
      referrer: document.referrer,
      sessionId: getSessionId(),
      pageUrl: window.location.href,
      timestamp: new Date().toISOString()
    };

    // Always use fetch with explicit credentials mode
    fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'omit',
      mode: 'cors',
      keepalive: true
    }).catch(function(error) {
      console.error('[Visitor Tracker] Error sending data:', error);
    });
    
    console.log('[Visitor Tracker] Data sent for page:', pageCode);
  }

  // Send initial page view
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', sendTrackingData);
  } else {
    sendTrackingData();
  }

  // Track page visibility changes (user returning to tab)
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
      sendTrackingData();
    }
  });

  // Track before page unload
  window.addEventListener('beforeunload', function() {
    sendTrackingData();
  });

})();
