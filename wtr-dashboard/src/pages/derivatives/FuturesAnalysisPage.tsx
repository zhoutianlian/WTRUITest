import React from 'react';
import './DerivativesPages.css'; // Import shared CSS
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

// Data Structures
interface ChartDataPoint {
  date: string;
  value?: number;
  openInterest?: number;
  fundingRate?: number;
  longLiquidations?: number;
  shortLiquidations?: number;
}

interface FuturesIndicator {
  id: string;
  title: string;
  chartType: 'line' | 'bar' | 'area' | 'groupedBar'; // groupedBar for liquidations
  data: ChartDataPoint[];
  description: string;
  yAxisLabel?: string;
  dataKeys: string[]; // For single or multiple series (e.g., long/short liquidations)
  colors: string[];
}

// Custom Tooltip (reusable)
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
          {`Date: ${label}`}
        </p>
        {payload.map((pld: any, index: number) => (
          <p key={index} className="desc" style={{color: pld.stroke || pld.fill || 'var(--color-text-primary)' }}>
            {`${pld.name}: ${pld.value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: (pld.dataKey === 'fundingRate' ? 4 : 2) })}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const mockFuturesData: FuturesIndicator[] = [
  {
    id: 'openInterestBTC',
    title: 'Open Interest (BTC Futures)',
    chartType: 'area',
    description: 'Total value of outstanding futures contracts for Bitcoin.',
    yAxisLabel: 'USD',
    dataKeys: ['openInterest'],
    colors: ['var(--color-accent-gold-luminous)'],
    data: Array.from({ length: 30 }, (_, i) => ({
      date: `2023-10-${String(i + 1).padStart(2, '0')}`,
      openInterest: Math.floor(10000000000 + Math.random() * 1000000000 + i * 50000000),
    })),
  },
  {
    id: 'fundingRateBTC',
    title: 'Funding Rate (BTC Perpetual)',
    chartType: 'line',
    description: 'Periodic payments exchanged between traders holding long and short positions in perpetual futures.',
    yAxisLabel: 'Rate (%)',
    dataKeys: ['fundingRate'],
    colors: ['var(--color-accent-secondary-blue)'],
    data: Array.from({ length: 30 }, (_, i) => ({
      date: `2023-10-${String(i + 1).padStart(2, '0')}`,
      fundingRate: parseFloat(((Math.random() - 0.45) * 0.05).toFixed(4)), // typical small values
    })),
  },
  {
    id: 'liquidationsBTC',
    title: 'Liquidations (BTC Futures)',
    chartType: 'groupedBar', // Will render as two bars per date
    description: 'Total value of long and short positions liquidated.',
    yAxisLabel: 'USD',
    dataKeys: ['longLiquidations', 'shortLiquidations'],
    colors: ['var(--color-accent-gold-luminous)', 'var(--color-accent-secondary-red)'], // Gold for Longs, Red for Shorts
    data: Array.from({ length: 30 }, (_, i) => ({
      date: `2023-10-${String(i + 1).padStart(2, '0')}`,
      longLiquidations: Math.floor(Math.random() * 50000000),
      shortLiquidations: Math.floor(Math.random() * 40000000),
    })),
  },
];

const RenderFuturesChart = ({ indicator }: { indicator: FuturesIndicator }) => {
  const chartMargins = { top: 5, right: 20, left: 35, bottom: 20 };

  return (
    <ResponsiveContainer width="100%" height={250}>
      {indicator.chartType === 'line' && (
        <LineChart data={indicator.data} margin={chartMargins}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-gridlines)" />
          <XAxis dataKey="date" stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} />
          <YAxis stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} tickFormatter={(value) => indicator.dataKeys[0] === 'fundingRate' ? `${(value * 100).toFixed(3)}%` : value.toLocaleString()} label={{ value: indicator.yAxisLabel, angle: -90, position: 'insideLeft', fill: 'var(--color-chart-axis-text)', fontSize: 10, dx: -30 }} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: indicator.colors[0], strokeWidth: 1, strokeDasharray: '3 3' }} />
          <Legend wrapperStyle={{fontSize: "10px", paddingTop: "10px"}}/>
          <Line dataKey={indicator.dataKeys[0]} name={indicator.title} stroke={indicator.colors[0]} strokeWidth={2} dot={{ fill: indicator.colors[0], strokeWidth:0, r:3 }} activeDot={{r:6, stroke: 'var(--color-background-primary)', strokeWidth:2, fill: indicator.colors[0]}}/>
        </LineChart>
      )}
      {indicator.chartType === 'area' && (
         <AreaChart data={indicator.data} margin={chartMargins}>
          <defs>
            <linearGradient id={`areaGradient-${indicator.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={indicator.colors[0]} stopOpacity={0.7}/>
              <stop offset="95%" stopColor={indicator.colors[0]} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-gridlines)" />
          <XAxis dataKey="date" stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} />
          <YAxis stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} tickFormatter={(value) => value.toLocaleString()} label={{ value: indicator.yAxisLabel, angle: -90, position: 'insideLeft', fill: 'var(--color-chart-axis-text)', fontSize: 10, dx: -30 }} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: indicator.colors[0], strokeWidth: 1, strokeDasharray: '3 3' }}/>
          <Legend wrapperStyle={{fontSize: "10px", paddingTop: "10px"}}/>
          <Area type="monotone" dataKey={indicator.dataKeys[0]} name={indicator.title} stroke={indicator.colors[0]} strokeWidth={2} fill={`url(#areaGradient-${indicator.id})`} dot={{ fill: indicator.colors[0], strokeWidth:0, r:3 }} activeDot={{r:6, stroke: 'var(--color-background-primary)', strokeWidth:2, fill: indicator.colors[0]}} />
        </AreaChart>
      )}
      {indicator.chartType === 'groupedBar' && ( // For liquidations
        <BarChart data={indicator.data} margin={chartMargins}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-gridlines)" />
          <XAxis dataKey="date" stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} />
          <YAxis stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} tickFormatter={(value) => value.toLocaleString()} label={{ value: indicator.yAxisLabel, angle: -90, position: 'insideLeft', fill: 'var(--color-chart-axis-text)', fontSize: 10, dx: -30 }}/>
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(var(--rgb-accent-gold-luminous), 0.1)' }} />
          <Legend wrapperStyle={{fontSize: "10px", paddingTop: "10px"}}/>
          <Bar dataKey={indicator.dataKeys[0]} name="Long Liquidations" fill={indicator.colors[0]} />
          <Bar dataKey={indicator.dataKeys[1]} name="Short Liquidations" fill={indicator.colors[1]} />
        </BarChart>
      )}
       {/* Simple Bar chart (if not grouped) - can be added if needed */}
    </ResponsiveContainer>
  );
};

const FuturesAnalysisPage: React.FC = () => {
  return (
    <div className="page-container">
      <h1 className="page-title">Futures Market Analysis</h1>
      <p className="page-subtitle" style={{color: 'var(--color-text-secondary)', marginTop: '-20px', marginBottom: '20px'}}>
        Insights into futures contracts, open interest, funding rates, and liquidations.
      </p>
      <div className="dashboard-grid">
        {mockFuturesData.map((indicator) => (
          <div key={indicator.id} className="dashboard-card">
            <div className="dashboard-card-header">
              <h3>{indicator.title}</h3>
            </div>
            <div className="dashboard-card-content">
              <p style={{ fontSize: '0.85rem', marginBottom: 'var(--spacing-unit)'}}>
                {indicator.description}
              </p>
              <div className="chart-container"> {/* Ensure .chart-container has height in CSS */}
                <RenderFuturesChart indicator={indicator} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FuturesAnalysisPage;
