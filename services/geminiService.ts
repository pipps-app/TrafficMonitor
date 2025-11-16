import { GoogleGenAI, Type } from "@google/genai";
import type { TrafficData } from '../types';

const apiKey = import.meta.env.VITE_API_KEY || 'AIzaSyDummy-Key-For-Testing';
const ai = new GoogleGenAI({ apiKey: apiKey as string });

export const generateTrafficInsights = async (data: TrafficData): Promise<string> => {
    const topSource = data.trafficSources.sort((a,b) => b.value - a.value)[0];
    const topDevice = data.deviceTypes.sort((a,b) => b.value - a.value)[0];
    const topCountry = data.countries.length > 0 ? data.countries[0].name : 'N/A';
    
    // Calculate trend (comparing first 15 days vs last 15 days)
    const midPoint = Math.floor(data.visitorTrend.length / 2);
    const firstHalf = data.visitorTrend.slice(0, midPoint).reduce((sum, d) => sum + d.visitors, 0);
    const secondHalf = data.visitorTrend.slice(midPoint).reduce((sum, d) => sum + d.visitors, 0);
    const trendDirection = secondHalf > firstHalf ? 'increasing' : secondHalf < firstHalf ? 'decreasing' : 'stable';
    const trendPercent = firstHalf > 0 ? Math.abs(((secondHalf - firstHalf) / firstHalf) * 100).toFixed(1) : '0';
    
    const dataSummary = `
    - Total Visitors (30 days): ${data.totalVisitors.toLocaleString()}
    - Total Page Views: ${data.pageViews.toLocaleString()}
    - Pages Per Session: ${data.pagesPerSession}
    - Bounce Rate: ${data.bounceRate}%
    - Average Session Duration: ${data.avgSessionDuration} minutes
    - Traffic Trend: ${trendDirection} by ${trendPercent}% (last 15 days vs first 15 days)
    ${data.peakTrafficHour ? `- Peak Traffic Hour: ${data.peakTrafficHour}` : ''}
    - Top Traffic Source: ${topSource.name} (${topSource.value}%)
    - Dominant Device: ${topDevice.name} (${topDevice.value}%)
    - Top Country: ${topCountry}
    ${data.topReferrers && data.topReferrers.length > 0 ? `- Top Referrer: ${data.topReferrers[0].url} (${data.topReferrers[0].count} visits)` : ''}
  `;

  const prompt = `
    You are a senior data analyst specializing in web traffic analytics. Analyze the following 30-day traffic data and provide actionable insights.

    **Traffic Data:**
    ${dataSummary}

    **Your Analysis Should Include:**
    1.  **Performance Assessment:** Evaluate overall performance. Are these metrics healthy? What stands out?
    2.  **Key Insights:** Identify 2-3 significant patterns from the data (e.g., bounce rate implications, trend analysis, engagement levels).
    3.  **Actionable Recommendations:** Provide 3 specific, prioritized recommendations to improve performance.
    4.  **Growth Opportunity:** Identify the single biggest opportunity for growth based on the data.

    Keep your response concise, data-driven, and actionable. Format in markdown with clear sections.
  `;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text;
};

export const detectAnomalies = async (data: TrafficData): Promise<string | null> => {
  const anomalies: string[] = [];
  
  // Check for traffic spikes or drops
  if (data.visitorTrend.length >= 7) {
    const lastDay = data.visitorTrend[data.visitorTrend.length - 1].visitors;
    const avgLast7Days = data.visitorTrend.slice(-7).reduce((sum, d) => sum + d.visitors, 0) / 7;
    
    if (lastDay > avgLast7Days * 2 && avgLast7Days > 0) {
      anomalies.push(`🚀 Traffic spike: ${lastDay} visitors yesterday vs ${avgLast7Days.toFixed(0)} avg`);
    } else if (lastDay < avgLast7Days * 0.5 && avgLast7Days > 5) {
      anomalies.push(`📉 Traffic drop: ${lastDay} visitors yesterday vs ${avgLast7Days.toFixed(0)} avg`);
    }
  }
  
  // Check for concerning bounce rate
  if (data.bounceRate > 80 && data.totalVisitors > 10) {
    anomalies.push(`⚠️ High bounce rate: ${data.bounceRate}% (above 80%)`);
  }
  
  // Check for unusually low session duration
  if (data.avgSessionDuration < 0.5 && data.totalVisitors > 10) {
    anomalies.push(`⏱️ Very short sessions: ${data.avgSessionDuration} min average`);
  }
  
  // Check for low pages per session
  if (data.pagesPerSession < 1.5 && data.totalVisitors > 10) {
    anomalies.push(`📄 Low engagement: ${data.pagesPerSession} pages per session`);
  }
  
  if (anomalies.length === 0) {
    return null;
  }
  
  const prompt = `
    You are a web analytics assistant. The following anomalies were detected:

    ${anomalies.map((a, i) => `${i + 1}. ${a}`).join('\n')}

    Provide a brief alert explaining:
    - What these anomalies mean
    - Potential causes
    - Immediate actions to take

    Keep it under 150 words, professional, and format in markdown.
  `;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text;
};

// 1. Conversion Funnel Analysis
export const analyzeConversionFunnel = async (data: TrafficData): Promise<string> => {
  const prompt = `
    You are a conversion rate optimization expert. Analyze the following 30-day traffic data and provide conversion funnel insights:

    **Traffic Metrics:**
    - Total Visitors: ${data.totalVisitors.toLocaleString()}
    - Total Page Views: ${data.pageViews.toLocaleString()}
    - Pages Per Session: ${data.pagesPerSession}
    - Bounce Rate: ${data.bounceRate}%
    - Average Session Duration: ${data.avgSessionDuration} minutes

    **Your Analysis Should Include:**
    1. **Funnel Health Assessment:** Evaluate the typical user journey based on these metrics
    2. **Drop-off Points:** Identify where users are likely leaving based on bounce rate and engagement
    3. **Conversion Optimization:** Provide 3 specific recommendations to improve conversion rates
    4. **Benchmark Comparison:** How do these metrics compare to industry standards?

    Format in markdown with clear sections and actionable insights.
  `;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text;
};

// 2. Traffic Forecasting
export const forecastTraffic = async (data: TrafficData): Promise<string> => {
  const recentTrend = data.visitorTrend.slice(-14); // Last 2 weeks
  const avgVisitors = recentTrend.reduce((sum, d) => sum + d.visitors, 0) / recentTrend.length;
  
  const prompt = `
    You are a data forecasting specialist. Based on the following 30-day traffic trend, predict future traffic patterns:

    **Recent Trend (Last 14 Days):**
    ${recentTrend.map(d => `${d.date}: ${d.visitors} visitors`).join('\n')}

    **Average Daily Visitors (Last 14 Days):** ${avgVisitors.toFixed(0)}
    **Total Visitors (30 Days):** ${data.totalVisitors}

    **Provide:**
    1. **7-Day Forecast:** Predict visitor numbers for the next week with reasoning
    2. **30-Day Forecast:** Project monthly totals with confidence level
    3. **Growth Trajectory:** Analyze if traffic is growing, stable, or declining
    4. **Seasonal Patterns:** Identify any day-of-week or temporal patterns
    5. **Recommendations:** How to capitalize on or mitigate predicted trends

    Format in markdown with data-driven predictions.
  `;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text;
};

// 3. Visitor Segmentation
export const segmentVisitors = async (data: TrafficData): Promise<string> => {
  const topSources = data.trafficSources.sort((a,b) => b.value - a.value).slice(0, 5);
  const topCountries = data.countries.slice(0, 5);
  const topDevices = data.deviceTypes.sort((a,b) => b.value - a.value).slice(0, 3);
  
  const prompt = `
    You are a visitor segmentation expert. Analyze these traffic segments and provide strategic insights:

    **Traffic Sources:**
    ${topSources.map(s => `- ${s.name}: ${s.value}%`).join('\n')}

    **Geographic Distribution:**
    ${topCountries.map(c => `- ${c.name}: ${c.count} visitors`).join('\n')}

    **Device Types:**
    ${topDevices.map(d => `- ${d.name}: ${d.value}%`).join('\n')}

    **Overall Metrics:**
    - Bounce Rate: ${data.bounceRate}%
    - Pages Per Session: ${data.pagesPerSession}
    - Avg Session Duration: ${data.avgSessionDuration} min

    **Provide:**
    1. **Segment Profiles:** Create 3-4 distinct visitor personas based on this data
    2. **Behavioral Patterns:** Describe how each segment likely behaves
    3. **Segment-Specific Strategies:** Tailored recommendations for each segment
    4. **Priority Segment:** Which segment offers the most growth potential?

    Format in markdown with clear segment definitions.
  `;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text;
};

// 4. Content Performance Scoring
export const scoreContentPerformance = async (data: TrafficData): Promise<string> => {
  const prompt = `
    You are a content performance analyst. Score and analyze content effectiveness based on:

    **Engagement Metrics:**
    - Pages Per Session: ${data.pagesPerSession}
    - Bounce Rate: ${data.bounceRate}%
    - Avg Session Duration: ${data.avgSessionDuration} minutes
    - Total Page Views: ${data.pageViews.toLocaleString()}
    - Total Visitors: ${data.totalVisitors.toLocaleString()}

    **Traffic Quality:**
    ${data.topReferrers && data.topReferrers.length > 0 ? `- Top Referrer: ${data.topReferrers[0].url}` : ''}
    ${data.peakTrafficHour ? `- Peak Traffic Hour: ${data.peakTrafficHour}` : ''}

    **Provide:**
    1. **Content Score (0-100):** Calculate an overall content performance score
    2. **Score Breakdown:** Explain what contributes to the score
    3. **Strengths:** What content/engagement aspects are working well?
    4. **Weaknesses:** What areas need immediate improvement?
    5. **Content Recommendations:** 3 specific content strategy improvements
    6. **Best Practices:** Benchmark against industry standards

    Format in markdown with clear scoring criteria.
  `;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text;
};

// 5. Competitive Benchmarking
export const benchmarkPerformance = async (data: TrafficData): Promise<string> => {
  const prompt = `
    You are a competitive intelligence analyst. Benchmark the following metrics against industry standards:

    **Current Performance:**
    - Total Visitors (30 days): ${data.totalVisitors.toLocaleString()}
    - Page Views: ${data.pageViews.toLocaleString()}
    - Bounce Rate: ${data.bounceRate}%
    - Avg Session Duration: ${data.avgSessionDuration} minutes
    - Pages Per Session: ${data.pagesPerSession}

    **Traffic Distribution:**
    - Top Sources: ${data.trafficSources.slice(0, 3).map(s => `${s.name} (${s.value}%)`).join(', ')}
    - Top Device: ${data.deviceTypes.sort((a,b) => b.value - a.value)[0].name}

    **Provide:**
    1. **Industry Benchmarks:** Compare each metric to web analytics industry standards
    2. **Competitive Position:** Rate performance as "Above Average", "Average", or "Below Average"
    3. **Gap Analysis:** Identify metrics that are significantly above/below benchmarks
    4. **Competitive Advantages:** What are your strengths vs competitors?
    5. **Areas for Improvement:** Where do you fall short?
    6. **Action Plan:** Top 3 priorities to reach/exceed benchmarks

    Format in markdown with clear benchmark comparisons.
  `;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text;
};

// 6. SEO Performance Insights
export const analyzeSEO = async (data: TrafficData): Promise<string> => {
  const organicSource = data.trafficSources.find(s => s.name.toLowerCase().includes('organic') || s.name.toLowerCase().includes('search'));
  const topReferrers = data.topReferrers?.slice(0, 5) || [];
  
  const prompt = `
    You are an SEO specialist. Analyze the SEO performance based on traffic data:

    **Organic Traffic:**
    ${organicSource ? `- Organic Search: ${organicSource.value}% of total traffic` : '- No organic search data available'}

    **Referral Sources:**
    ${topReferrers.length > 0 ? topReferrers.map(r => `- ${r.url}: ${r.count} visits`).join('\n') : '- No referrer data available'}

    **Engagement Metrics:**
    - Bounce Rate: ${data.bounceRate}%
    - Pages Per Session: ${data.pagesPerSession}
    - Avg Session Duration: ${data.avgSessionDuration} minutes

    **Geographic Reach:**
    ${data.countries.slice(0, 5).map(c => `- ${c.name}: ${c.count} visitors`).join('\n')}

    **Provide:**
    1. **SEO Health Score (0-100):** Overall SEO effectiveness rating
    2. **Organic Visibility:** Analyze organic traffic percentage and quality
    3. **Keyword Opportunities:** Infer potential keyword strategies from engagement patterns
    4. **Technical SEO Indicators:** What do bounce rate and session duration suggest about site health?
    5. **Backlink Strategy:** Recommendations based on referral traffic patterns
    6. **Action Plan:** Top 5 SEO improvements to implement immediately

    Format in markdown with actionable SEO recommendations.
  `;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text;
};

// 7. Heatmap Prediction (User Behavior Patterns)
export const predictUserBehavior = async (data: TrafficData): Promise<string> => {
  const prompt = `
    You are a UX analyst specializing in user behavior prediction. Based on traffic patterns, predict user interaction hotspots:

    **Engagement Data:**
    - Pages Per Session: ${data.pagesPerSession}
    - Bounce Rate: ${data.bounceRate}%
    - Avg Session Duration: ${data.avgSessionDuration} minutes
    ${data.peakTrafficHour ? `- Peak Traffic Hour: ${data.peakTrafficHour}` : ''}

    **User Origins:**
    - Top Device: ${data.deviceTypes.sort((a,b) => b.value - a.value)[0].name} (${data.deviceTypes.sort((a,b) => b.value - a.value)[0].value}%)
    - Top Traffic Source: ${data.trafficSources.sort((a,b) => b.value - a.value)[0].name}

    **Provide:**
    1. **Behavior Patterns:** Predict where users are most likely clicking and engaging
    2. **Navigation Analysis:** How are users likely moving through the site?
    3. **Attention Hotspots:** Which page elements are probably getting most attention?
    4. **Dead Zones:** Areas users might be ignoring based on bounce/session data
    5. **Device-Specific Behavior:** How behavior differs across device types
    6. **UX Recommendations:** 4 specific improvements to optimize user flow

    Format in markdown with visual descriptions of predicted behavior.
  `;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text;
};

// 8. Weekly Summary Report
export const generateWeeklySummary = async (data: TrafficData): Promise<string> => {
  const lastWeek = data.visitorTrend.slice(-7);
  const prevWeek = data.visitorTrend.slice(-14, -7);
  
  const lastWeekTotal = lastWeek.reduce((sum, d) => sum + d.visitors, 0);
  const prevWeekTotal = prevWeek.reduce((sum, d) => sum + d.visitors, 0);
  const weekOverWeekChange = prevWeekTotal > 0 ? (((lastWeekTotal - prevWeekTotal) / prevWeekTotal) * 100).toFixed(1) : '0';
  
  const prompt = `
    You are an executive analytics reporter. Create a comprehensive weekly summary for stakeholders:

    **This Week vs Last Week:**
    - This Week Traffic: ${lastWeekTotal} visitors
    - Last Week Traffic: ${prevWeekTotal} visitors
    - Week-over-Week Change: ${weekOverWeekChange}%

    **Current Metrics (30-Day):**
    - Total Visitors: ${data.totalVisitors.toLocaleString()}
    - Bounce Rate: ${data.bounceRate}%
    - Pages Per Session: ${data.pagesPerSession}
    - Avg Session Duration: ${data.avgSessionDuration} minutes

    **Traffic Breakdown:**
    - Top Source: ${data.trafficSources.sort((a,b) => b.value - a.value)[0].name}
    - Top Country: ${data.countries[0]?.name || 'N/A'}
    ${data.peakTrafficHour ? `- Peak Hour: ${data.peakTrafficHour}` : ''}

    **Provide:**
    1. **Executive Summary:** 2-3 sentence overview of the week
    2. **Key Wins:** Top 3 positive developments
    3. **Concerns:** Top 2 issues requiring attention
    4. **Trend Analysis:** What's the overall trajectory?
    5. **Next Week Outlook:** Predictions and focus areas
    6. **Action Items:** 3 priorities for the coming week

    Format in markdown as a professional executive report.
  `;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text;
};

// 9. Goal Tracking & Progress (Simulate goal analysis)
export const analyzeGoalProgress = async (data: TrafficData, targetVisitors?: number): Promise<string> => {
  const target = targetVisitors || Math.round(data.totalVisitors * 1.3); // Default: 30% growth goal
  const progress = (data.totalVisitors / target) * 100;
  const remaining = target - data.totalVisitors;
  
  const prompt = `
    You are a goal tracking analyst. Analyze progress toward traffic goals:

    **Goal Status:**
    - Target Visitors (30 days): ${target.toLocaleString()}
    - Current Visitors: ${data.totalVisitors.toLocaleString()}
    - Progress: ${progress.toFixed(1)}%
    - Remaining: ${remaining.toLocaleString()} visitors needed

    **Performance Indicators:**
    - Bounce Rate: ${data.bounceRate}%
    - Pages Per Session: ${data.pagesPerSession}
    - Traffic Trend: ${data.visitorTrend.slice(-7).reduce((sum, d) => sum + d.visitors, 0)} visitors (last 7 days)

    **Provide:**
    1. **Goal Assessment:** On track, ahead, or behind pace?
    2. **Daily Target:** How many visitors needed per day to hit goal?
    3. **Trend Projection:** Will you reach the goal at current pace?
    4. **Risk Analysis:** What could derail goal achievement?
    5. **Acceleration Strategy:** 3 tactics to accelerate progress
    6. **Milestone Tracking:** Break down remaining goal into weekly milestones

    Format in markdown with clear goal tracking metrics.
  `;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text;
};

// 10. Natural Language Query Handler
export const queryAnalytics = async (data: TrafficData, question: string): Promise<string> => {
  const dataSummary = `
    **Available Analytics Data:**
    - Total Visitors (30 days): ${data.totalVisitors.toLocaleString()}
    - Page Views: ${data.pageViews.toLocaleString()}
    - Bounce Rate: ${data.bounceRate}%
    - Pages Per Session: ${data.pagesPerSession}
    - Avg Session Duration: ${data.avgSessionDuration} minutes
    ${data.peakTrafficHour ? `- Peak Traffic Hour: ${data.peakTrafficHour}` : ''}
    
    **Traffic Sources:**
    ${data.trafficSources.map(s => `- ${s.name}: ${s.value}%`).join('\n')}
    
    **Top Countries:**
    ${data.countries.slice(0, 5).map(c => `- ${c.name}: ${c.count} visitors`).join('\n')}
    
    **Devices:**
    ${data.deviceTypes.map(d => `- ${d.name}: ${d.value}%`).join('\n')}
    
    **Recent Trend (Last 7 Days):**
    ${data.visitorTrend.slice(-7).map(d => `- ${d.date}: ${d.visitors} visitors`).join('\n')}
  `;
  
  const prompt = `
    You are an analytics assistant. Answer the following question using ONLY the provided data:

    **User Question:** "${question}"

    ${dataSummary}

    **Instructions:**
    - Answer directly and concisely based on the available data
    - If the data doesn't contain information to answer, say so explicitly
    - Include specific numbers and percentages from the data
    - Provide brief context or insights if helpful
    - Format in markdown for readability

    Answer the question now:
  `;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text;
};

// 11. A/B Test Recommendation Engine
export const recommendABTests = async (data: TrafficData): Promise<string> => {
  const prompt = `
    You are a conversion optimization expert specializing in A/B testing. Recommend experiments based on this data:

    **Current Performance:**
    - Bounce Rate: ${data.bounceRate}%
    - Pages Per Session: ${data.pagesPerSession}
    - Avg Session Duration: ${data.avgSessionDuration} minutes
    - Total Visitors (30 days): ${data.totalVisitors.toLocaleString()}

    **Traffic Composition:**
    - Top Source: ${data.trafficSources.sort((a,b) => b.value - a.value)[0].name} (${data.trafficSources.sort((a,b) => b.value - a.value)[0].value}%)
    - Top Device: ${data.deviceTypes.sort((a,b) => b.value - a.value)[0].name} (${data.deviceTypes.sort((a,b) => b.value - a.value)[0].value}%)
    ${data.peakTrafficHour ? `- Peak Hour: ${data.peakTrafficHour}` : ''}

    **Provide:**
    1. **Test Priority Matrix:** Rank 5 A/B tests by potential impact (High/Medium/Low)
    2. **Test Specifications:** For each test, provide:
       - Hypothesis (what you expect to happen)
       - Variation ideas (Control vs Treatment)
       - Success metrics
       - Required sample size estimate
       - Expected duration
    3. **Quick Wins:** 2 tests that could show results fastest
    4. **High-Impact Tests:** 2 tests with highest revenue/engagement potential
    5. **Testing Roadmap:** Recommended sequence for running tests
    6. **Risk Assessment:** What could go wrong with each test?

    Format in markdown with clear test specifications.
  `;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text;
};
