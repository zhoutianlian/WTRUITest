// src/pages/OnChainPage.tsx
import React from 'react';
import D3LineChart from '../components/charts/D3LineChart';
import D3BarChart from '../components/charts/D3BarChart';
import WidgetWrapper from '../components/dashboard/WidgetWrapper'; // For consistent card look
import './OnChainPage.css';

// Mock data generation (can be moved to a utils file later)
const generateMockTimeData = (numPoints: number, startVal: number, volatility: number, yMin?: number) => {
  const data: { date: Date; value: number }[] = [];
  let currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - numPoints); // Start from past
  let currentValue = startVal;

  for (let i = 0; i < numPoints; i++) {
    currentDate.setDate(currentDate.getDate() + 1);
    data.push({ date: new Date(currentDate), value: currentValue });
    currentValue += (Math.random() - 0.5) * volatility;
    if (yMin !== undefined && currentValue < yMin) { // Prevent going below a certain minimum if specified
        currentValue = yMin + Math.random() * volatility;
    } else if (startVal >=0 && currentValue < 0 && yMin === undefined) { // Prevent negative for some metrics unless yMin allows it
        currentValue = Math.random() * volatility;
    }
  }
  return data;
};

const generateMockFlowData = (numPoints: number, maxFlow: number) => {
  const data: { date: Date; value: number }[] = [];
  let currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - numPoints); // Start from past

  for (let i = 0; i < numPoints; i++) {
    currentDate.setDate(currentDate.getDate() + 1);
    data.push({ date: new Date(currentDate), value: parseFloat(((Math.random() - 0.5) * 2 * maxFlow).toFixed(2)) });
  }
  return data;
};

const mockNvtsData = generateMockTimeData(90, 1.5, 0.3, 0.5); // NVTS usually > 0
const mockMvrvData = generateMockTimeData(90, 2.0, 0.4, 0.8); // MVRV usually > 0
const mockExchangeFlowData = generateMockFlowData(90, 2000); // Can be positive or negative


const OnChainPage: React.FC = () => {
  // Define common chart dimensions or get from a config/context later
  const chartWidth = 800; // Example width
  const chartHeight = 350; // Example height

  return (
    <div className="onchain-page">
      <h1 className="page-title">On-chain Analysis</h1>

      <div className="onchain-charts-grid">
        <WidgetWrapper title="NVTS Ratio (Network Value to Transactions Signal)">
          <div className="chart-container"> {/* Ensure this class is styled in OnChainPage.css */}
            <D3LineChart
              data={mockNvtsData}
              width={chartWidth}
              height={chartHeight}
              yAxisLabel="NVTS Ratio"
              lineColor="var(--color-accent-secondary-purple, #8A63D2)"
            />
          </div>
        </WidgetWrapper>

        <WidgetWrapper title="MVRV Ratio (Market Value to Realized Value)">
          <div className="chart-container">
            <D3LineChart
              data={mockMvrvData}
              width={chartWidth}
              height={chartHeight}
              yAxisLabel="MVRV Ratio"
              lineColor="var(--color-accent-secondary-blue, #3078C0)"
            />
          </div>
        </WidgetWrapper>

        <WidgetWrapper title="Exchange Net Flow (BTC)">
          <div className="chart-container">
            <D3BarChart
              data={mockExchangeFlowData}
              width={chartWidth}
              height={chartHeight}
              yAxisLabel="Net Flow (BTC)"
              positiveColor="var(--color-accent-secondary-teal, #2AA092)"
              negativeColor="var(--color-accent-secondary-red, #E54D42)" // Assuming you add this to theme.css
            />
          </div>
        </WidgetWrapper>

        {/* Add more sections for other on-chain metrics later */}
        {/* Example:
        <WidgetWrapper title="Another On-chain Metric">
          <div className="chart-container">
            // Placeholder or another chart
          </div>
        </WidgetWrapper>
        */}
      </div>
    </div>
  );
};
export default OnChainPage;
