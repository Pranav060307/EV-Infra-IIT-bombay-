import React, { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';

// Pages
import OverviewPage from './pages/OverviewPage';
import NationalMapPage from './pages/NationalMapPage';
import MaharashtraPage from './pages/MaharashtraPage';
import PuneAnalysisPage from './pages/PuneAnalysisPage';
import SamruddhiPage from './pages/SamruddhiPage';
import ForecastingPage from './pages/ForecastingPage';
import SiteRecommendationsPage from './pages/SiteRecommendationsPage';
import DataManagementPage from './pages/DataManagementPage';
import MethodologyPage from './pages/MethodologyPage';

import { checkHealth } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [backendStatus, setBackendStatus] = useState(null);

  useEffect(() => {
    // Probe backend API health on startup
    const verifyBackend = async () => {
      const status = await checkHealth();
      setBackendStatus(status);
    };
    verifyBackend();
  }, []);

  const renderActivePage = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewPage setActiveTab={setActiveTab} backendStatus={backendStatus} />;
      case 'national-map':
        return <NationalMapPage />;
      case 'maharashtra':
        return <MaharashtraPage />;
      case 'pune':
        return <PuneAnalysisPage />;
      case 'samruddhi':
        return <SamruddhiPage />;
      case 'forecasting':
        return <ForecastingPage />;
      case 'recommendations':
        return <SiteRecommendationsPage />;
      case 'data-management':
        return <DataManagementPage />;
      case 'methodology':
        return <MethodologyPage />;
      default:
        return <OverviewPage setActiveTab={setActiveTab} backendStatus={backendStatus} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      {/* Top Navigation */}
      <Navbar backendStatus={backendStatus} isSynthetic={true} />

      {/* Main Workspace: Sidebar + Dynamic Content Page */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 overflow-y-auto bg-slate-950/50">
          {renderActivePage()}
        </main>
      </div>

      {/* Status Bar / Footer */}
      <Footer />
    </div>
  );
}

export default App;

