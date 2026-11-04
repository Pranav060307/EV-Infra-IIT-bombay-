import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';

// Pages
import OverviewPage from './pages/OverviewPage';
import NationalMapPage from './pages/NationalMapPage';
import MaharashtraPage from './pages/MaharashtraPage';
import DistrictDetailPage from './pages/DistrictDetailPage';
import PuneAnalysisPage from './pages/PuneAnalysisPage';
import SamruddhiPage from './pages/SamruddhiPage';
import ForecastingPage from './pages/ForecastingPage';
import SiteRecommendationsPage from './pages/SiteRecommendationsPage';
import DataManagementPage from './pages/DataManagementPage';
import MethodologyPage from './pages/MethodologyPage';
import NotFoundPage from './pages/NotFoundPage';

import ErrorBoundary from './components/common/ErrorBoundary';
import { checkHealth } from './services/api';

export function App() {
  const [backendStatus, setBackendStatus] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Probe backend API health on startup
    const verifyBackend = async () => {
      try {
        const status = await checkHealth();
        setBackendStatus(status);
      } catch (err) {
        console.warn("Backend health check warning:", err);
      }
    };
    verifyBackend();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-navy-950 text-slate-100">
      {/* Top Navigation */}
      <Navbar 
        backendStatus={backendStatus} 
        isSynthetic={backendStatus?.data_mode?.is_synthetic_demo ?? false} 
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      {/* Main Workspace: Sidebar + Dynamic Routed Page */}
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar 
          mobileMenuOpen={mobileMenuOpen} 
          onCloseMobileMenu={() => setMobileMenuOpen(false)} 
        />
        <main className="flex-1 overflow-y-auto bg-navy-950/60">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<OverviewPage backendStatus={backendStatus} />} />
              <Route path="/national-map" element={<NationalMapPage />} />
              <Route path="/maharashtra" element={<MaharashtraPage />} />
              <Route path="/districts" element={<MaharashtraPage />} />
              <Route path="/districts/:districtName" element={<DistrictDetailPage />} />
              <Route path="/maharashtra/districts/:districtName" element={<DistrictDetailPage />} />
              <Route path="/pune-grid" element={<PuneAnalysisPage />} />
              <Route path="/pune" element={<PuneAnalysisPage />} />
              <Route path="/samruddhi-corridor" element={<SamruddhiPage />} />
              <Route path="/samruddhi" element={<SamruddhiPage />} />
              <Route path="/forecasting" element={<ForecastingPage />} />
              <Route path="/site-recommendations" element={<SiteRecommendationsPage />} />
              <Route path="/recommendations" element={<SiteRecommendationsPage />} />
              <Route path="/data-management" element={<DataManagementPage />} />
              <Route path="/methodology" element={<MethodologyPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </ErrorBoundary>
        </main>
      </div>

      {/* Status Bar / Footer */}
      <Footer />
    </div>
  );
}

export default App;
