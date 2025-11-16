import type { TrafficData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

/**
 * Fetches aggregated traffic statistics for a given landing page from your backend.
 * @param pageCode The unique code for the landing page.
 * @returns A Promise that resolves with the traffic data.
 * @throws Error if the request fails or returns invalid data.
 */
export const fetchPageStats = async (pageCode: string): Promise<TrafficData> => {
  console.log(`[API] Fetching stats for ${pageCode}...`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/stats/${pageCode}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`No tracking data found for "${pageCode}". Make sure the tracking script is installed on your page and that the page has been visited at least once.`);
      }
      throw new Error(`Failed to fetch stats: ${response.status} ${response.statusText}`);
    }

    const data: TrafficData = await response.json();
    console.log(`[API] Successfully fetched stats for ${pageCode}`);
    return data;
  } catch (error) {
    console.error(`[API] Error fetching stats for ${pageCode}:`, error);
    if (error instanceof Error && error.message.includes('tracking data found')) {
      throw error;
    }
    throw new Error(`Unable to connect to backend. Please check your connection and try again.`);
  }
};

/**
 * Verifies that the tracking script has been installed and is sending data.
 * @param pageCode The unique code for the landing page.
 * @returns A Promise that resolves to true if the script is detected.
 * @throws Error if verification fails.
 */
export const verifyTrackingCode = async (pageCode: string): Promise<boolean> => {
  console.log(`[API] Verifying tracking code for ${pageCode}...`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/verify/${pageCode}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Verification failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const isVerified = result.verified === true;
    
    console.log(`[API] Verification ${isVerified ? 'successful' : 'failed'} for ${pageCode}`);
    return isVerified;
  } catch (error) {
    console.error(`[API] Error verifying tracking code for ${pageCode}:`, error);
    throw new Error(`Unable to verify tracking code. Please ensure the script is installed on your page and your backend is running.`);
  }
};
