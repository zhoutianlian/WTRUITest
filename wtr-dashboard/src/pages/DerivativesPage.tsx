// src/pages/DerivativesPage.tsx
import React from 'react';
import D3LineChart from '../components/charts/D3LineChart';
import WidgetWrapper from '../components/dashboard/WidgetWrapper';
import './DerivativesPage.css'; // Create this CSS

// Mock data generation functions
const generateDerivativeTimeSeries = (
  numPoints: number,
  startVal: number,
  volatility: number,
  canBeNegative: boolean = false,
  minVal?: number,
  maxVal?: number
) => {
  const data: { date: Date; value: number }[] = [];
  let currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - numPoints);
  let currentValue = startVal;

  for (let i = 0; i < numPoints; i++) {
    currentDate.setDate(currentDate.getDate() + 1);
    data.push({ date: new Date(currentDate), value: parseFloat(currentValue.toFixed(canBeNegative ? 4 : 2)) }); // More precision for rates

    let change = (Math.random() - 0.49) * volatility; // Slight bias for more realistic movements
    currentValue += change;

    if (!canBeNegative && minVal === undefined) {
      currentValue = Math.max(0.00001, currentValue);
    }
    if (minVal !== undefined) {
      currentValue = Math.max(minVal, currentValue);
    }
    if (maxVal !== undefined) {
      currentValue = Math.min(maxVal, currentValue);
    }
  }
  return data;
};

const generateIVSmileData = (numStrikes: number, atmStrike: number, atmIV: number, smileFactor: number, skewFactor: number) => {
  const data: { date: Date; value: number }[] = []; // Using 'date' to hold strike for now
  const strikeStep = atmStrike * 0.05; // 5% of ATM strike as step

  for (let i = 0; i < numStrikes; i++) {
    const strike = atmStrike - Math.floor(numStrikes / 2) * strikeStep + i * strikeStep;
    const moneyness = Math.log(strike / atmStrike);
    let iv = atmIV + (skewFactor * moneyness) + (smileFactor * Math.pow(moneyness, 2));
    iv = Math.max(0.05, iv); // Floor IV at 5%

    // Workaround: Pass strike as the time value of a Date object.
    // D3LineChart needs modification for proper numerical X-axis formatting.
    data.push({ date: new Date(strike), value: parseFloat(iv.toFixed(4)) });
  }
  data.sort((a, b) => a.date.getTime() - b.date.getTime());
  return data;
};

const mockOpenInterestData = generateDerivativeTimeSeries(90, 1500000000, 80000000, false, 500000000); // OI in USD
const mockFundingRatesData = generateDerivativeTimeSeries(90, 0.0001, 0.00025, true, -0.0025, 0.0025); // Funding Rate as %
const mockIVSmileData = generateIVSmileData(21, 65000, 0.60, 0.7, -0.15);


const DerivativesPage: React.FC = () => {
  const chartWidth = undefined; // Let chart take container width
  const chartHeight = 320;    // Fixed height for consistency

  // TODO: Ideally, D3LineChart would accept an xTickFormat prop.
  // For IV Smile, the x-axis ticks will currently show numerical date values
  // (milliseconds since epoch, because we store strikes in Date objects as a workaround).
  // A proper solution requires enhancing D3LineChart to handle linear scales and custom tick formatting.

  return (
    <div className="derivatives-page">
      <h1 className="page-title">Derivatives Analysis</h1>

      <div className="chart-grid">
        <WidgetWrapper title="Open Interest (BTC Perpetuals)">
          <div className="chart-container">
            <D3LineChart
              data={mockOpenInterestData}
              width={chartWidth} height={chartHeight}
              yAxisLabel="Open Interest (USD)"
              lineColor="var(--color-accent-secondary-teal, #2AA092)"
            />
          </div>
        </WidgetWrapper>

        <WidgetWrapper title="Funding Rates (BTC Perpetuals)">
          <div className="chart-container">
            <D3LineChart
              data={mockFundingRatesData}
              width={chartWidth} height={chartHeight}
              yAxisLabel="Funding Rate (%)"
              lineColor="var(--color-accent-secondary-blue, #3078C0)"
              // Y-axis tick formatting for percentages could be added to D3LineChart
            />
          </div>
        </WidgetWrapper>

        <WidgetWrapper title="Implied Volatility Smile (BTC Options)">
          <div className="chart-container">
            <D3LineChart
              data={mockIVSmileData}
              width={chartWidth} height={chartHeight}
              yAxisLabel="Implied Volatility"
              lineColor="var(--color-accent-gold, #B08D57)"
              // Note: X-axis will show strikes as numerical date values due to D3LineChart limitation
            />
          </div>
        </WidgetWrapper>
      </div>
    </div>
  );
};
export default DerivativesPage;
