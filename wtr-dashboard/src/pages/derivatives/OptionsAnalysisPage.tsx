import React from 'react';
import './DerivativesPages.css'; // Import shared CSS
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

// Data Structures
interface ChartDataPoint {
  date?: string; // For time series data
  strike?: number; // For strike-based data
  value?: number;
  impliedVolatility?: number;
  historicalVolatility?: number;
  putCallRatio?: number;
  volume?: number;
}

interface OptionsIndicator {
  id: string;
  title: string;
  chartType: 'line' | 'bar' | 'placeholder'; // 'placeholder' for non-chart cards
  data?: ChartDataPoint[]; // Optional for placeholder
  description: string;
  yAxisLabel?: string;
  xAxisKey: string; // 'date' or 'strike'
  dataKeys: string[];
  colors: string[];
}

// Custom Tooltip (reusable from other pages or defined here)
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip-recharts" style={{
        backgroundColor: 'var(--color-background-tertiary)',
        border: '1px solid var(--color-border-secondary)',
        color: 'var(--color-text-primary)',
        padding: 'var(--spacing-unit)',
        borderRadius: 'var(--border-radius-medium)',
        boxShadow: '0 3px 10px rgba(0,0,0,0.3)',
      }}>
        <p className="label" style={{color: 'var(--color-accent-gold-luminous)', marginBottom: 'var(--spacing-unit)'}}>
          {`${payload[0].payload.date ? 'Date' : 'Strike'}: ${label}`}
        </p>
        {payload.map((pld: any, index: number) => (
          <p key={index} className="desc" style={{color: pld.stroke || pld.fill || 'var(--color-text-primary)' }}>
            {`${pld.name}: ${pld.value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: (pld.dataKey === 'putCallRatio' || pld.dataKey === 'impliedVolatility' || pld.dataKey === 'historicalVolatility' ? 3 : 2) })}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const mockOptionsData: OptionsIndicator[] = [
  {
    id: 'ivHvComparison',
    title: 'Implied vs. Historical Volatility (BTC)',
    chartType: 'line',
    xAxisKey: 'date',
    description: 'Comparison of 30-day Implied Volatility (IV) and 30-day Historical Volatility (HV).',
    yAxisLabel: 'Volatility (%)',
    dataKeys: ['impliedVolatility', 'historicalVolatility'],
    colors: ['var(--color-accent-gold-luminous)', 'var(--color-accent-secondary-blue)'],
    data: Array.from({ length: 30 }, (_, i) => ({
      date: `2023-10-${String(i + 1).padStart(2, '0')}`,
      impliedVolatility: parseFloat((0.55 + (Math.random() - 0.4) * 0.1 + i * 0.002).toFixed(3)), // e.g., 55%
      historicalVolatility: parseFloat((0.50 + (Math.random() - 0.5) * 0.08 + i * 0.001).toFixed(3)),
    })),
  },
  {
    id: 'putCallRatio',
    title: 'Put/Call Ratio (Volume)',
    chartType: 'line', // Could be Bar too
    xAxisKey: 'date',
    description: 'Ratio of trading volume of put options to call options. A rising ratio can indicate bearish sentiment.',
    yAxisLabel: 'Ratio',
    dataKeys: ['putCallRatio'],
    colors: ['var(--color-accent-purple)'], // Assuming --color-accent-purple is defined
    data: Array.from({ length: 30 }, (_, i) => ({
      date: `2023-10-${String(i + 1).padStart(2, '0')}`,
      putCallRatio: parseFloat((0.7 + (Math.random() - 0.5) * 0.2 + i * 0.005).toFixed(3)),
    })),
  },
  {
    id: 'volumeByStrike',
    title: 'Options Volume by Strike (BTC - Placeholder)',
    chartType: 'bar',
    xAxisKey: 'strike',
    description: 'Trading volume of options at different strike prices for the nearest expiry. (Illustrative data)',
    yAxisLabel: 'Volume (Contracts)',
    dataKeys: ['volume'],
    colors: ['var(--color-accent-gold-luminous)'],
    data: Array.from({ length: 10 }, (_, i) => ({
      strike: 28000 + i * 500,
      volume: Math.floor(Math.random() * 1000 + 200),
    })),
  },
  {
    id: 'ivSurfacePlaceholder',
    title: '3D Implied Volatility Surface',
    chartType: 'placeholder', // Special type for non-chart card
    xAxisKey: '', // Not applicable
    description: 'This visualization will display the implied volatility across various strike prices and expiries, forming a 3D surface. It provides insights into market expectations of future volatility and potential mispricings. (Development in progress)',
    dataKeys: [],
    colors: [],
  },
];

const RenderOptionsChart = ({ indicator }: { indicator: OptionsIndicator }) => {
  if (indicator.chartType === 'placeholder') return null; // No chart for placeholder type

  const chartMargins = { top: 5, right: 20, left: 35, bottom: 20 };

  return (
    <ResponsiveContainer width="100%" height={250}>
      {indicator.chartType === 'line' && (
        <LineChart data={indicator.data} margin={chartMargins}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-gridlines)" />
          <XAxis dataKey={indicator.xAxisKey} stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} />
          <YAxis stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} tickFormatter={(value) => typeof value === 'number' ? value.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:3}) : value} label={{ value: indicator.yAxisLabel, angle: -90, position: 'insideLeft', fill: 'var(--color-chart-axis-text)', fontSize: 10, dx: -30 }} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: indicator.colors[0], strokeWidth: 1, strokeDasharray: '3 3' }} />
          <Legend wrapperStyle={{fontSize: "10px", paddingTop: "10px"}}/>
          {indicator.dataKeys.map((key, index) => (
            <Line key={key} dataKey={key} name={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} stroke={indicator.colors[index % indicator.colors.length]} strokeWidth={2} dot={{ fill: indicator.colors[index % indicator.colors.length], strokeWidth:0, r:3 }} activeDot={{r:6, stroke: 'var(--color-background-primary)', strokeWidth:2, fill: indicator.colors[index % indicator.colors.length]}}/>
          ))}
        </LineChart>
      )}
      {indicator.chartType === 'bar' && (
        <BarChart data={indicator.data} margin={chartMargins}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-gridlines)" />
          <XAxis dataKey={indicator.xAxisKey} type={indicator.xAxisKey === 'strike' ? 'number' : 'category'} domain={indicator.xAxisKey === 'strike' ? ['dataMin - 500', 'dataMax + 500'] : undefined} tickFormatter={indicator.xAxisKey === 'strike' ? (value) => value.toLocaleString() : undefined} stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} />
          <YAxis stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} tickFormatter={(value) => value.toLocaleString()} label={{ value: indicator.yAxisLabel, angle: -90, position: 'insideLeft', fill: 'var(--color-chart-axis-text)', fontSize: 10, dx: -30 }}/>
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(var(--rgb-accent-gold-luminous), 0.1)' }} />
          <Legend wrapperStyle={{fontSize: "10px", paddingTop: "10px"}}/>
          <Bar dataKey={indicator.dataKeys[0]} name={indicator.title.split('(')[0].trim()} fill={indicator.colors[0]} />
        </BarChart>
      )}
      {/* Placeholder for other chart types like Area if needed for options */}
    </ResponsiveContainer>
  );
};

const OptionsAnalysisPage: React.FC = () => {
  return (
    <div className="page-container">
      <h1 className="page-title">Options Market Analysis</h1>
      <p className="page-subtitle" style={{color: 'var(--color-text-secondary)', marginTop: '-20px', marginBottom: '20px'}}>
        Exploring options contracts, implied volatility, open interest by strike, and other options-specific metrics.
      </p>
      <div className="dashboard-grid">
        {mockOptionsData.map((indicator) => (
          <div key={indicator.id} className="dashboard-card">
            <div className="dashboard-card-header">
              <h3>{indicator.title}</h3>
            </div>
            <div className="dashboard-card-content">
              <p style={{ fontSize: '0.85rem', marginBottom: 'var(--spacing-unit)'}}>
                {indicator.description}
              </p>
              {indicator.chartType !== 'placeholder' ? (
                <div className="chart-container" style={{ height: '250px' }}>
                  <RenderOptionsChart indicator={indicator} />
                </div>
              ) : (
                <div style={{padding: 'var(--spacing-unit) 0'}}>
                  {/* Extra padding for placeholder text if no chart */}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OptionsAnalysisPage;
