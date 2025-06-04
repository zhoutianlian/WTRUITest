import React from 'react';
import './OnChainPage.css'; // Ensure this CSS file is created/updated
// Assuming D3BarChart exists, otherwise use D3LineChart as fallback
// import D3BarChart from '../components/charts/D3BarChart';
import D3LineChart from '../components/charts/D3LineChart'; // Using D3LineChart as a safe default

// Mock data for a line chart (e.g., Active Addresses)
const generateActiveAddressesData = (numPoints = 30, initialValue = 100000, volatility = 5000) => {
  const data = [];
  let value = initialValue;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - numPoints);

  for (let i = 0; i < numPoints; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    value += (Math.random() - 0.48) * volatility; // Slight positive bias
    data.push({ date, value: Math.max(50000, value) }); // Min active addresses
  }
  return data;
};

const mockActiveAddresses = generateActiveAddressesData(60, 750000, 15000);

// Mock data for another line chart (e.g., Transaction Count)
const mockTransactionCount = generateActiveAddressesData(60, 1200000, 50000);

const OnChainPage: React.FC = () => {
  return (
    <div className="onchain-page page-content">
      <header className="page-header">
        <h1>On-chain Analysis</h1>
      </header>

      <section className="data-section">
        <h2>Network Activity Overview</h2>
        <p>Monitoring overall blockchain network health, including metrics like active addresses, transaction counts, and network fees. These indicators reflect user adoption and network congestion.</p>
        <div className="chart-container">
          <h3>Active Addresses Over Time</h3>
          <D3LineChart data={mockActiveAddresses} yAxisLabel="Active Addresses" lineColor="var(--color-accent-purple)"/>
        </div>
      </section>

      <section className="data-section">
        <h2>Exchange Flow Analysis</h2>
        <p>Tracking the movement of assets into and out of exchanges. Significant inflows can indicate selling pressure, while outflows might suggest accumulation.</p>
         <div className="chart-container">
          <h3>Net Exchange Flows (Illustrative)</h3>
          {/* Placeholder for another chart - perhaps a bar chart if available */}
          <D3LineChart data={mockTransactionCount} yAxisLabel="Transaction Count" lineColor="var(--color-accent-orange)"/>
        </div>
      </section>

      <section className="data-section">
        <h2>Whale Watching</h2>
        <p>Observing the activities of large holders (whales). Their transactions can significantly impact market prices and provide clues about potential future movements.</p>
        <p><em>Whale activity tracker coming soon.</em></p>
      </section>

      <footer className="page-footer">
        <p>Note: Data shown is illustrative and for demonstration purposes only.</p>
      </footer>
    </div>
  );
};

export default OnChainPage;
