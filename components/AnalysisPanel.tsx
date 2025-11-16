import React, { useState } from 'react';
import { marked } from 'marked';
import type { AnalysisResult, TrafficData } from '../types';
import { 
  analyzeConversionFunnel, 
  forecastTraffic, 
  segmentVisitors, 
  scoreContentPerformance, 
  benchmarkPerformance,
  analyzeSEO,
  predictUserBehavior,
  generateWeeklySummary,
  analyzeGoalProgress,
  queryAnalytics,
  recommendABTests
} from '../services/geminiService';

interface AnalysisPanelProps {
  analysis: AnalysisResult | null;
  isLoading: boolean;
  isLiveMode: boolean;
  trafficData?: TrafficData | null;
}

type AIFeature = 
  | 'overview' 
  | 'conversion' 
  | 'forecast' 
  | 'segments' 
  | 'content' 
  | 'benchmark' 
  | 'seo' 
  | 'behavior' 
  | 'weekly' 
  | 'goals' 
  | 'query' 
  | 'abtest';

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ analysis, isLoading, isLiveMode, trafficData }) => {
  const [activeTab, setActiveTab] = useState<AIFeature>('overview');
  const [featureInsights, setFeatureInsights] = useState<Record<string, string>>({});
  const [loadingFeature, setLoadingFeature] = useState<AIFeature | null>(null);
  const [queryInput, setQueryInput] = useState('');

  const renderMarkdown = (markdown: string) => {
    const html = marked(markdown);
    return { __html: html };
  };

  const loadFeatureInsight = async (feature: AIFeature) => {
    if (!trafficData || loadingFeature || featureInsights[feature]) return;
    
    setLoadingFeature(feature);
    try {
      let insight = '';
      switch (feature) {
        case 'conversion':
          insight = await analyzeConversionFunnel(trafficData);
          break;
        case 'forecast':
          insight = await forecastTraffic(trafficData);
          break;
        case 'segments':
          insight = await segmentVisitors(trafficData);
          break;
        case 'content':
          insight = await scoreContentPerformance(trafficData);
          break;
        case 'benchmark':
          insight = await benchmarkPerformance(trafficData);
          break;
        case 'seo':
          insight = await analyzeSEO(trafficData);
          break;
        case 'behavior':
          insight = await predictUserBehavior(trafficData);
          break;
        case 'weekly':
          insight = await generateWeeklySummary(trafficData);
          break;
        case 'goals':
          insight = await analyzeGoalProgress(trafficData);
          break;
        case 'abtest':
          insight = await recommendABTests(trafficData);
          break;
      }
      setFeatureInsights(prev => ({ ...prev, [feature]: insight }));
    } catch (error) {
      console.error('Error loading feature insight:', error);
      setFeatureInsights(prev => ({ ...prev, [feature]: 'Error loading insights. Please try again.' }));
    } finally {
      setLoadingFeature(null);
    }
  };

  const handleTabChange = (feature: AIFeature) => {
    setActiveTab(feature);
    if (feature !== 'overview' && feature !== 'query' && !featureInsights[feature]) {
      loadFeatureInsight(feature);
    }
  };

  const handleQuerySubmit = async () => {
    if (!trafficData || !queryInput.trim()) return;
    
    setLoadingFeature('query');
    try {
      const answer = await queryAnalytics(trafficData, queryInput);
      setFeatureInsights(prev => ({ ...prev, [`query_${Date.now()}`]: `**Q: ${queryInput}**\n\n${answer}` }));
      setQueryInput('');
    } catch (error) {
      console.error('Error processing query:', error);
    } finally {
      setLoadingFeature(null);
    }
  };

  const tabs: { id: AIFeature; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'conversion', label: 'Conversion', icon: '🎯' },
    { id: 'forecast', label: 'Forecast', icon: '📈' },
    { id: 'segments', label: 'Segments', icon: '👥' },
    { id: 'content', label: 'Content Score', icon: '⭐' },
    { id: 'benchmark', label: 'Benchmark', icon: '📏' },
    { id: 'seo', label: 'SEO', icon: '🔍' },
    { id: 'behavior', label: 'Behavior', icon: '🎨' },
    { id: 'weekly', label: 'Weekly Report', icon: '📅' },
    { id: 'goals', label: 'Goals', icon: '🎪' },
    { id: 'query', label: 'Ask AI', icon: '💬' },
    { id: 'abtest', label: 'A/B Tests', icon: '🧪' },
  ];

  if (isLoading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-100">AI Insights</h2>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        </div>
      </div>
    );
  }

  if (!analysis && !trafficData) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-100">AI Insights</h2>
        <p className="text-gray-400">Insights will appear here once you analyze a page.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 overflow-hidden">
      <div className="p-6 pb-0">
        <h2 className="text-xl font-bold mb-4 text-gray-100">AI Insights</h2>
        
        {isLiveMode && (
          <div className="mb-4 p-3 bg-green-900/30 border border-green-700/50 rounded-md text-green-300 text-sm">
            <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
            Live mode active - data updates every 5 seconds
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="px-6 pb-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6 pt-0 max-h-[600px] overflow-y-auto">
        {activeTab === 'overview' && analysis?.trafficInsights && (
          <div 
            className="prose prose-invert prose-sm max-w-none
              prose-headings:font-bold prose-headings:text-blue-400 prose-headings:mb-2
              prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base
              prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-3
              prose-strong:text-white prose-strong:font-semibold
              prose-ul:text-gray-300 prose-ul:list-disc prose-ul:ml-4 prose-ul:mb-3
              prose-ol:text-gray-300 prose-ol:list-decimal prose-ol:ml-4 prose-ol:mb-3
              prose-li:mb-1 prose-li:leading-relaxed
              prose-code:text-blue-300 prose-code:bg-gray-900/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
              prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-400
              prose-a:text-blue-400 prose-a:underline hover:prose-a:text-blue-300"
            dangerouslySetInnerHTML={renderMarkdown(analysis.trafficInsights)}
          />
        )}

        {activeTab === 'query' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleQuerySubmit()}
                placeholder="Ask anything about your analytics..."
                className="flex-1 bg-gray-900/50 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loadingFeature === 'query'}
              />
              <button
                onClick={handleQuerySubmit}
                disabled={!queryInput.trim() || loadingFeature === 'query'}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-md font-semibold transition-colors"
              >
                {loadingFeature === 'query' ? '...' : 'Ask'}
              </button>
            </div>
            
            <div className="space-y-4">
              {Object.entries(featureInsights)
                .filter(([key]) => key.startsWith('query_'))
                .reverse()
                .map(([key, insight]) => (
                  <div 
                    key={key}
                    className="prose prose-invert prose-sm max-w-none
                      prose-headings:font-bold prose-headings:text-blue-400 prose-headings:mb-2
                      prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-3
                      prose-strong:text-white prose-strong:font-semibold
                      bg-gray-900/30 p-4 rounded-md border border-gray-700"
                    dangerouslySetInnerHTML={renderMarkdown(String(insight))}
                  />
                ))}
            </div>
            
            {Object.keys(featureInsights).filter(k => k.startsWith('query_')).length === 0 && (
              <p className="text-gray-400 text-center py-8">Ask a question to get AI-powered answers about your analytics data.</p>
            )}
          </div>
        )}

        {activeTab !== 'overview' && activeTab !== 'query' && (
          <div>
            {loadingFeature === activeTab ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400"></div>
              </div>
            ) : featureInsights[activeTab] ? (
              <div 
                className="prose prose-invert prose-sm max-w-none
                  prose-headings:font-bold prose-headings:text-blue-400 prose-headings:mb-2
                  prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base
                  prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-3
                  prose-strong:text-white prose-strong:font-semibold
                  prose-ul:text-gray-300 prose-ul:list-disc prose-ul:ml-4 prose-ul:mb-3
                  prose-ol:text-gray-300 prose-ol:list-decimal prose-ol:ml-4 prose-ol:mb-3
                  prose-li:mb-1 prose-li:leading-relaxed
                  prose-code:text-blue-300 prose-code:bg-gray-900/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                  prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-400
                  prose-a:text-blue-400 prose-a:underline hover:prose-a:text-blue-300"
                dangerouslySetInnerHTML={renderMarkdown(featureInsights[activeTab])}
              />
            ) : (
              <p className="text-gray-400 text-center py-8">Click to load insights for this feature.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
