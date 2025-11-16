
import React from 'react';
import type { TrafficData } from '../types';
import StatCard from './StatCard';
import VisitorTrendChart from './VisitorTrendChart';
import TrafficSourceChart from './TrafficSourceChart';
import DeviceChart from './DeviceChart';
import { UsersIcon, EyeIcon, ArrowTrendingDownIcon, ClockIcon, DocumentTextIcon, ExclamationTriangleIcon } from './IconComponents';

interface DashboardProps {
  data: TrafficData;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  return (
    <div className="space-y-8">
      {/* Anomaly Alert Banner */}
      {data.anomalyAlert && (
        <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-300 mb-2">⚠️ Anomaly Detected</h3>
              <div className="text-sm text-gray-300 prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: data.anomalyAlert }} />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          title="Total Visitors" 
          value={data.totalVisitors.toLocaleString()} 
          icon={<UsersIcon className="h-8 w-8 text-blue-400" />} 
        />
        <StatCard 
          title="Page Views" 
          value={data.pageViews.toLocaleString()} 
          icon={<EyeIcon className="h-8 w-8 text-green-400" />} 
        />
        <StatCard 
          title="Bounce Rate" 
          value={`${data.bounceRate}%`} 
          icon={<ArrowTrendingDownIcon className="h-8 w-8 text-red-400" />} 
        />
        <StatCard 
          title="Avg. Session" 
          value={`${data.avgSessionDuration} min`} 
          icon={<ClockIcon className="h-8 w-8 text-yellow-400" />} 
        />
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <StatCard 
          title="Pages/Session" 
          value={data.pagesPerSession.toFixed(2)} 
          icon={<DocumentTextIcon className="h-8 w-8 text-purple-400" />} 
        />
        {data.peakTrafficHour && (
          <StatCard 
            title="Peak Hour" 
            value={data.peakTrafficHour} 
            icon={<ClockIcon className="h-8 w-8 text-orange-400" />} 
          />
        )}
        {data.topReferrers && data.topReferrers.length > 0 && (
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
            <h4 className="text-sm font-semibold text-gray-400 mb-3">Top Referrers</h4>
            <div className="space-y-2">
              {data.topReferrers.slice(0, 5).map((referrer, index) => {
                let hostname;
                try {
                  hostname = new URL(referrer.url).hostname;
                } catch {
                  hostname = referrer.url;
                }
                return (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-0">
                    <span className="text-sm text-gray-300 truncate max-w-[70%]" title={referrer.url}>
                      {index + 1}. {hostname}
                    </span>
                    <span className="text-sm font-bold text-white bg-blue-900/50 px-2 py-1 rounded">
                      {referrer.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Visitor Trend (Last 30 Days)</h3>
        <VisitorTrendChart data={data.visitorTrend} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        <div className="md:col-span-3 bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Traffic Sources</h3>
          <TrafficSourceChart data={data.trafficSources} />
        </div>
        <div className="md:col-span-2 bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Device Breakdown</h3>
          <DeviceChart data={data.deviceTypes} />
        </div>
      </div>

      {data.countries && data.countries.length > 0 && (
        <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Top Countries</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {data.countries.map((country, index) => (
              <div key={country.name} className="bg-gray-700 p-3 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">#{index + 1}</div>
                <div className="text-sm text-gray-300 mt-1">{country.name}</div>
                <div className="text-lg font-semibold text-white mt-1">{country.count} visitors</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.topReferrers && data.topReferrers.length > 0 && (
        <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">All Referrers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.topReferrers.map((referrer, index) => {
              let hostname;
              try {
                hostname = new URL(referrer.url).hostname;
              } catch {
                hostname = referrer.url || 'Direct';
              }
              return (
                <div key={index} className="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
                  <div className="flex-1 min-w-0">
                    <div className="text-lg font-bold text-blue-400">#{index + 1}</div>
                    <div className="text-sm text-gray-300 mt-1 truncate" title={referrer.url}>{hostname}</div>
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-white">{referrer.count}</div>
                    <div className="text-xs text-gray-400">visits</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
