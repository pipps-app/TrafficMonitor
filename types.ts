export interface DailyVisitor {
  day: string;
  visitors: number;
}

export interface TrafficSource {
  name: string;
  value: number;
}

export interface DeviceType {
  name: string;
  value: number;
  // FIX: Add an index signature to satisfy the type expected by the recharts Pie component.
  [key:string]: any;
}

export interface Country {
  name: string;
  count: number;
}

export interface Referrer {
  url: string;
  count: number;
}

export interface TrafficData {
  totalVisitors: number;
  pageViews: number;
  bounceRate: number;
  avgSessionDuration: number; // in minutes
  pagesPerSession: number;
  peakTrafficHour?: string;
  visitorTrend: DailyVisitor[];
  trafficSources: TrafficSource[];
  deviceTypes: DeviceType[];
  countries: Country[];
  topReferrers: Referrer[];
  anomalyAlert?: string;
}

export interface AnalysisResult {
  trafficInsights: string;
}

export interface LandingPage {
  name: string;
  url: string;
  status: 'pending' | 'active';
  trackingCode: string;
}
