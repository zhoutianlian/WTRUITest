// src/pages/DashboardPage.tsx
import React, { useEffect, useRef } from 'react';
import { GridStack } from 'gridstack';
import 'gridstack/dist/gridstack.min.css';

import './DashboardPage.css';
import ThreeInteractiveObjectDashboard from '../components/common/ThreeInteractiveObjectDashboard';
import D3CandlestickChart from '../components/charts/D3CandlestickChart'; // Import the D3 chart
import WTRCoreInsights from '../components/homepage/WTRCoreInsights';
import FeaturedCapabilities from '../components/homepage/FeaturedCapabilities';
import LatestResearchSnippets from '../components/homepage/LatestResearchSnippets';
import WTRVision from '../components/homepage/WTRVision';
import WTRNexusOrb from '../components/homepage/WTRNexusOrb'; // Import the new Orb component

// Mock Data for D3 Candlestick Chart
const generateMockCandlestickData = (numPoints = 60) => {
  const data = [];
  let lastClose = 100 + Math.random() * 50;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - numPoints);

  for (let i = 0; i < numPoints; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    const open = lastClose;
    const close = open + (Math.random() - 0.48) * 10; // Slight bias for variation
    const high = Math.max(open, close) + Math.random() * 5;
    const low = Math.min(open, close) - Math.random() * 5;
    const volume = Math.random() * 1000 + 500;

    data.push({ date, open, high, low, close, volume });
    lastClose = close;
  }
  return data;
};

const mockCandlestickData = generateMockCandlestickData();

const DashboardPage: React.FC = () => {
  const gridRef = useRef<GridStack | null>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gridContainerRef.current && !gridRef.current) {
      gridRef.current = GridStack.init({
        column: 12,
        cellHeight: 80,
        minRow: 1,
        margin: 10,
        float: true,
        disableOneColumnMode: true,
      }, gridContainerRef.current);
    }
    // No return cleanup needed for this simplified Gridstack version for now
  }, []);

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero-section">
        <div className="three-object-container">
          <ThreeInteractiveObjectDashboard />
        </div>
        <div className="dashboard-hero-overlay-text">
          <h1>WTR Crypto Intelligence</h1>
          <p>Navigate the future of digital assets.</p>
        </div>
      </section>

      <section className="dashboard-grid-section px-4 sm:px-6 lg:px-8"> {/* Added padding here */}
        <h2 className="dashboard-section-title">My Workspace</h2>
        <div className="grid-stack-container">
          <div ref={gridContainerRef} className="grid-stack">
            <div className="grid-stack-item" gs-x="0" gs-y="0" gs-w="4" gs-h="2">
              <div className="grid-stack-item-content"> {/* This content div is kept by GridStack for structure */}
                <div className="dashboard-card"> {/* Applied new style */}
                  <div className="dashboard-card-header"><h3>Welcome to WTR</h3></div>
                  <div className="dashboard-card-content">
                     <p>Your advanced crypto intelligence hub. Explore market data, on-chain analytics, and cutting-edge research.</p>
                     <p>Customize your workspace by dragging and resizing widgets.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid-stack-item" gs-x="4" gs-y="0" gs-w="8" gs-h="5"> {/* Wider for D3 chart */}
              <div className="grid-stack-item-content">
                 {/* Chart widget likely needs its own specific wrapper if dashboard-card isn't suitable for it directly,
                     or D3CandlestickChart itself should handle its internal padding/background if needed.
                     For now, keeping its existing structure. If it needs card styling, it will be a separate task.
                 */}
                 <div className="widget-wrapper-manual">
                   <div className="widget-header-manual"><h3>Market Overview (BTC/USD)</h3></div>
                   <div className="widget-content-manual d3-chart-widget-content">
                     <D3CandlestickChart data={mockCandlestickData} />
                   </div>
                </div>
              </div>
            </div>
             <div className="grid-stack-item" gs-x="0" gs-y="2" gs-w="4" gs-h="3"> {/* Adjusted Y and H */}
              <div className="grid-stack-item-content">
                <div className="dashboard-card"> {/* Applied new style */}
                  <div className="dashboard-card-header"><h3>Quick Access</h3></div>
                  <div className="dashboard-card-content">
                    <ul>
                      {/* Using <a> for now as react-router-dom Link might require router context not available here depending on setup */}
                      <li><a href="/on-chain">On-Chain Analysis Dashboard</a></li>
                      <li><a href="/derivatives">Derivatives Market Overview</a></li>
                      <li><a href="/signals">Latest Trading Signals</a></li>
                      <li><a href="/research">WTR Research Portal</a></li>
                      <li><a href="/about">About WTR Platform</a></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WTR Orb Nexus Section */}
      <section className="wtr-nexus-orb-section px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="dashboard-section-title">The WTR Nexus</h2>
        <WTRNexusOrb />
      </section>

      {/* Other Content Sections */}
      <WTRCoreInsights />
      <FeaturedCapabilities />
      <LatestResearchSnippets />
      <WTRVision />

    </div>
  );
};
export default DashboardPage;
