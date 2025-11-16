import React, { useState, useCallback, useEffect, useRef } from 'react';
import { fetchPageStats, verifyTrackingCode } from './services/apiService';
import { generateTrafficInsights, detectAnomalies } from './services/geminiService';
import type { TrafficData, AnalysisResult, LandingPage } from './types';
import Dashboard from './components/Dashboard';
import { AnalysisPanel } from './components/AnalysisPanel';
import ManagePagesModal from './components/ManagePagesModal';
import { ArrowPathIcon, Cog6ToothIcon, DocumentChartBarIcon, SignalIcon, PlusIcon, EyeIcon, CheckCircleIcon, XMarkIcon } from './components/IconComponents';

const App: React.FC = () => {
  const [activePageCode, setActivePageCode] = useState<string | null>(null);
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLiveMode, setIsLiveMode] = useState<boolean>(false);
  const [verifyingCode, setVerifyingCode] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [landingPages, setLandingPages] = useState<Record<string, LandingPage>>(() => {
    try {
      const savedPages = localStorage.getItem('landingPages');
      if (savedPages) {
        const parsed = JSON.parse(savedPages);
        // Basic validation
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && Object.keys(parsed).length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to parse landing pages from localStorage", e);
    }
    // Return empty object if no pages saved
    return {};
  });

  const liveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    localStorage.setItem('landingPages', JSON.stringify(landingPages));
  }, [landingPages]);

  useEffect(() => {
    // Cleanup interval on component unmount
    return () => {
      if (liveIntervalRef.current) {
        clearInterval(liveIntervalRef.current);
      }
    };
  }, []);

  const addPage = (code: string, page: Omit<LandingPage, 'status' | 'trackingCode'>) => {
    const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    const trackingCode = `<script async src="${backendUrl}/tracker.js?id=${code}"></script>`;
    setLandingPages(prev => ({ 
      ...prev, 
      [code]: { ...page, status: 'pending', trackingCode } 
    }));
  };

  const deletePage = (code: string) => {
    setLandingPages(prev => {
      const newPages = { ...prev };
      delete newPages[code];
      return newPages;
    });
    if (activePageCode === code) {
      setActivePageCode(null);
      setTrafficData(null);
      setAnalysis(null);
    }
  };

  const handleAnalyze = useCallback(async (code: string, isLiveUpdate = false) => {
    if (isLiveMode && !isLiveUpdate) return;
    const pageInfo = landingPages[code];
    if (!pageInfo) return;

    // For live updates, we don't need to show the main loading spinner or re-analyze with Gemini
    if (!isLiveUpdate) {
      setIsLoading(true);
      setError(null);
      setTrafficData(null);
      setAnalysis(null);
      setActivePageCode(code);
    }

    try {
      let data = await fetchPageStats(code);
      
      // Detect anomalies and add to data
      const anomalyAlert = await detectAnomalies(data);
      if (anomalyAlert) {
        data = { ...data, anomalyAlert };
      }
      
      setTrafficData(data);

      if (!isLiveUpdate) {
        const trafficInsights = await generateTrafficInsights(data);
        setAnalysis({ trafficInsights });
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while fetching data.');
      // Stop live mode on error
      if (isLiveMode) setIsLiveMode(false);
    } finally {
      if (!isLiveUpdate) {
        setIsLoading(false);
      }
    }
  }, [landingPages, isLiveMode]);

  const handleVerifyInstallation = async (code: string) => {
    setVerifyingCode(code);
    try {
      await verifyTrackingCode(code);
      setLandingPages(prev => ({
        ...prev,
        [code]: { ...prev[code], status: 'active' }
      }));
      await handleAnalyze(code);
    } catch (err) {
      console.error("Verification failed", err);
      setError('Verification failed. Please ensure the tracking code is installed correctly.');
    } finally {
      setVerifyingCode(null);
    }
  };

  const toggleLiveMode = () => {
    if (!activePageCode) return;

    const code = activePageCode; // Capture code for use in interval
    setIsLiveMode(prevIsLive => {
      if (!prevIsLive) {
        // Start live mode
        liveIntervalRef.current = setInterval(() => {
          handleAnalyze(code, true);
        }, 5000); // Poll every 5 seconds
        return true;
      } else {
        // Stop live mode
        if (liveIntervalRef.current) {
          clearInterval(liveIntervalRef.current);
          liveIntervalRef.current = null;
        }
        return false;
      }
    });
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <DocumentChartBarIcon className="h-8 w-8 text-blue-400" />
              <h1 className="text-xl font-bold">Gemini Insights Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
              >
                <Cog6ToothIcon className="h-5 w-5" />
                <span>Manage Pages</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-6 flex justify-between items-center">
                <span>{error}</span>
                <button onClick={() => setError(null)}><XMarkIcon className="h-5 w-5" /></button>
            </div>
        )}

        {activePageCode && trafficData ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold">{landingPages[activePageCode]?.name}</h2>
                    <p className="text-gray-400">{landingPages[activePageCode]?.url}</p>
                </div>
                <div className="flex items-center gap-4">
                  <button
                      onClick={() => handleAnalyze(activePageCode)}
                      disabled={isLoading || isLiveMode}
                      className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Refresh analysis"
                  >
                      <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                      onClick={toggleLiveMode}
                      className={`flex items-center gap-2 py-2 px-4 rounded-md font-semibold transition-colors ${
                          isLiveMode ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'
                      }`}
                  >
                      <SignalIcon className="h-5 w-5" />
                      <span>{isLiveMode ? 'Stop Live' : 'Go Live'}</span>
                  </button>
                </div>
              </div>
              <Dashboard data={trafficData} />
            </div>
            <div className="lg:col-span-1">
              <AnalysisPanel analysis={analysis} isLoading={isLoading} isLiveMode={isLiveMode} trafficData={trafficData} />
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-3xl font-bold mb-4">Welcome to Gemini Insights</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Add your landing page, install the tracking script, and get real-time, AI-powered insights to boost your conversions.
            </p>
            <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
                <h3 className="text-xl font-semibold mb-4 text-left">Your Landing Pages</h3>
                <div className="space-y-3">
                {Object.entries(landingPages).map(([code, page]) => {
                    const isVerifying = verifyingCode === code;
                    return (
                        <div key={code} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-md hover:bg-gray-700/50 transition-colors">
                            <div>
                                <p className="font-semibold text-white">{page.name}</p>
                                <a href={page.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline truncate">{page.url}</a>
                            </div>
                            {page.status === 'pending' ? (
                                <button
                                    onClick={() => handleVerifyInstallation(code)}
                                    disabled={isVerifying}
                                    className="flex items-center justify-center bg-yellow-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-yellow-500 transition-colors disabled:opacity-70 disabled:cursor-wait"
                                >
                                    {isVerifying ? (
                                        <>
                                            <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                                            Verifying...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircleIcon className="h-5 w-5 mr-2" />
                                            Verify Installation
                                        </>
                                    )}
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleAnalyze(code)}
                                    className="flex items-center justify-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-500 transition-colors"
                                >
                                    <EyeIcon className="h-5 w-5 mr-2" />
                                    View Dashboard
                                </button>
                            )}
                        </div>
                    )
                })}
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="mt-6 w-full flex items-center justify-center bg-blue-600/20 text-blue-300 border-2 border-dashed border-blue-500/50 font-semibold py-3 px-4 rounded-md hover:bg-blue-600/30 hover:border-blue-500/80 transition-colors"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add New Page
                </button>
            </div>
          </div>
        )}
      </main>

      <ManagePagesModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        pages={landingPages}
        onAddPage={addPage}
        onDeletePage={deletePage}
      />
    </div>
  );
};

export default App;
