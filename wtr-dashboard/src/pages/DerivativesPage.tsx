import React from 'react';
import './DerivativesPage.css'; // Ensure this CSS file is created/updated
import D3LineChart from '../components/charts/D3LineChart'; // Example chart

// Mock data for the line chart
const generateMockMetricData = (numPoints = 30, initialValue = 1000, volatility = 50) => {
  const data = [];
  let value = initialValue;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - numPoints);

  for (let i = 0; i < numPoints; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    value += (Math.random() - 0.5) * volatility;
    data.push({ date, value: Math.max(0, value) }); // Ensure value doesn't go below 0
  }
  return data;
};

const mockOpenInterestData = generateMockMetricData(60, 50000, 2000);
const mockFundingRateData = generateMockMetricData(60, 0.01, 0.005);

const DerivativesPage: React.FC = () => {
  return (
    <div className="derivatives-page page-content">
      <header className="page-header">
        <h1>Derivatives Analysis</h1>
      </header>

      <section className="data-section">
        <h2>Futures Market Overview</h2>
        <p>Insights into futures contracts, open interest, and trading volumes across major exchanges. Understanding these trends can provide leading indicators for market sentiment and potential price movements.</p>
        <div className="chart-container">
          <h3>Open Interest Over Time</h3>
          <D3LineChart data={mockOpenInterestData} yAxisLabel="Open Interest (USD)" lineColor="var(--color-accent-blue)" />
        </div>
      </section>

      <section className="data-section">
        <h2>Options Market Overview</h2>
        <p>Analysis of options contracts, including put/call ratios, implied volatility, and options flow. These metrics help gauge market expectations and risk appetite.</p>
        <div className="chart-container">
          <h3>Implied Volatility Index</h3>
          {/* Placeholder for another chart or data display */}
          <p><em>Options data chart coming soon.</em></p>
        </div>
      </section>

      <section className="data-section">
        <h2>Key Derivatives Metrics</h2>
        <p>Tracking critical metrics such as funding rates, liquidations, and basis spread to understand the health and dynamics of the derivatives market.</p>
        <div className="chart-container">
          <h3>Funding Rate (Illustrative)</h3>
          <D3LineChart data={mockFundingRateData} yAxisLabel="Funding Rate (%)" lineColor="var(--color-accent-green)" />
        </div>
      </section>

      <footer className="page-footer">
        <p>Note: Data shown is illustrative and for demonstration purposes only.</p>
      </footer>
    </div>
  );
};

export default DerivativesPage;
