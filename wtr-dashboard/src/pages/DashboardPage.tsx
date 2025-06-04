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
              <div className="grid-stack-item-content">
                <div className="widget-wrapper-manual">
                   <div className="widget-header-manual"><h3>Welcome Note</h3></div>
                   <div className="widget-content-manual"><p>WTR dashboard. Drag & resize!</p></div>
                </div>
              </div>
            </div>
            <div className="grid-stack-item" gs-x="4" gs-y="0" gs-w="8" gs-h="5"> {/* Wider for D3 chart */}
              <div className="grid-stack-item-content">
                 <div className="widget-wrapper-manual">
                   <div className="widget-header-manual"><h3>Price Chart (D3 Example)</h3></div>
                   <div className="widget-content-manual d3-chart-widget-content"> {/* Added class for specific styling */}
                     <D3CandlestickChart data={mockCandlestickData} /> {/* Default width/height will be used and scaled by container */}
                   </div>
                </div>
              </div>
            </div>
             <div className="grid-stack-item" gs-x="0" gs-y="2" gs-w="4" gs-h="3"> {/* Adjusted Y and H */}
              <div className="grid-stack-item-content">
                <div className="widget-wrapper-manual">
                   <div className="widget-header-manual"><h3>Quick Links</h3></div>
                   <div className="widget-content-manual"><p>Link 1, Link 2...</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Content Sections */}
      <WTRCoreInsights />
      <FeaturedCapabilities />
      <LatestResearchSnippets />
      <WTRVision />

    </div>
  );
};
export default DashboardPage;
