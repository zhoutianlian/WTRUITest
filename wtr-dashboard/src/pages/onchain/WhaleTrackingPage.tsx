import React from 'react';
import './OnChainPages.css'; // Shared CSS for on-chain pages
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
  Cell,
} from 'recharts';
import * as d3 from 'd3'; // For color manipulation in gradients

// Mock Data Structure
interface ChartDataPoint {
  date: string;
  value: number;
}

interface Indicator {
  id: string;
  title: string;
  chartType: 'line' | 'bar' | 'area';
  data: ChartDataPoint[];
  description: string;
  yAxisLabel?: string;
  dataKey: string;
  positiveColor?: string;
  negativeColor?: string;
}

// Custom Tooltip (copied from ExchangeFlowsPage)
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
        <p className="label" style={{color: 'var(--color-accent-gold-luminous)', marginBottom: 'calc(var(--spacing-unit) / 2)'}}>
          {`Date: ${label}`}
        </p>
        {payload.map((pld: any, index: number) => (
          <p key={index} className="desc" style={{color: pld.payload.value >= 0 ? (pld.fill && pld.fill !== `url(#barPositive-${pld.name.replace(/\s+/g, '-')})` && pld.fill !== `url(#barNegative-${pld.name.replace(/\s+/g, '-')})` ? pld.fill : 'var(--color-text-primary)') : (pld.fill && pld.fill !== `url(#barPositive-${pld.name.replace(/\s+/g, '-')})` && pld.fill !== `url(#barNegative-${pld.name.replace(/\s+/g, '-')})` ? pld.fill : 'var(--color-accent-secondary-red)') }}>
            {`${pld.name}: ${pld.value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Mock Data for Whale Tracking
const whaleTrackingData: Indicator[] = [
  {
    id: 'whaleNetPositionChangeBTC',
    title: 'Whale Net Position Change (BTC)',
    chartType: 'bar',
    description: 'Daily net change in BTC holdings by whale entities (typically >1k BTC). Positive values indicate accumulation, negative values indicate distribution.',
    yAxisLabel: 'BTC',
    dataKey: 'value',
    positiveColor: 'var(--color-accent-gold-luminous)',
    negativeColor: 'var(--color-accent-secondary-red)',
    data: Array.from({ length: 30 }, (_, i) => ({
      date: `2023-12-${String(i + 1).padStart(2, '0')}`,
      value: parseFloat(((Math.random() - 0.55) * 500).toFixed(2)), // +/- 500 BTC, slight negative bias
    })),
  },
  {
    id: 'activeWhaleAddresses',
    title: 'Active Whale Addresses (>1k BTC)',
    chartType: 'line',
    description: 'Number of unique whale addresses transacting daily, indicating whale activity levels.',
    yAxisLabel: 'Addresses',
    dataKey: 'value',
    positiveColor: 'var(--color-accent-secondary-blue)',
    data: Array.from({ length: 30 }, (_, i) => ({
      date: `2023-12-${String(i + 1).padStart(2, '0')}`,
      value: Math.floor(1800 + (Math.sin(i / 6) * 100) + (Math.random() * 50)), // Oscillating trend
    })),
  },
  {
    id: 'whaleAccumulationScore',
    title: 'Whale Accumulation Trend Score',
    chartType: 'area',
    description: 'A composite score (0-100) indicating general whale accumulation or distribution pressure based on multiple factors.',
    yAxisLabel: 'Score (0-100)',
    dataKey: 'value',
    positiveColor: 'var(--color-accent-gold-burnished)',
    data: Array.from({ length: 30 }, (_, i) => ({
      date: `2023-12-${String(i + 1).padStart(2, '0')}`,
      value: Math.floor(40 + (Math.random() * 30) + (i * 0.5) ), // Generally increasing but noisy
    })),
  },
  {
    id: 'avgWhaleTxSizeUSD',
    title: 'Average Whale Transaction Size (USD)',
    chartType: 'line',
    description: 'Average USD value of transactions conducted by whale entities, highlighting large capital movements.',
    yAxisLabel: 'USD',
    dataKey: 'value',
    positiveColor: 'var(--color-accent-gold-highlight)',
    data: Array.from({ length: 30 }, (_, i) => ({
      date: `2023-12-${String(i + 1).padStart(2, '0')}`,
      value: Math.floor(1500000 + (Math.random() - 0.2) * 500000), // Average $1.5M with variation
    })),
  },
];

// RenderChart Component (copied and adapted from ExchangeFlowsPage)
const RenderChart = ({ indicator }: { indicator: Indicator }) => {
  const commonLineProps = {
    type: "monotone" as const,
    stroke: indicator.positiveColor || "var(--color-accent-gold-luminous)",
    strokeWidth: 2,
    dot: { fill: indicator.positiveColor || "var(--color-accent-gold-luminous)", strokeWidth: 0, r: 3 },
    activeDot: { r: 6, stroke: "var(--color-background-primary)", strokeWidth: 2, fill: indicator.positiveColor || "var(--color-accent-gold-highlight)" },
  };
  const chartMargins = { top: 5, right: 20, left: 35, bottom: 5 };

  const gradientId = (type: string) => `${type}-${indicator.id.replace(/\s+/g, '-')}`;

  return (
    <ResponsiveContainer width="100%" height="100%">
      {indicator.chartType === 'line' && (
        <LineChart data={indicator.data} margin={chartMargins}>
          <defs>
            <linearGradient id={gradientId('lineShadow')} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={indicator.positiveColor || "var(--color-accent-gold-luminous)"} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={indicator.positiveColor || "var(--color-accent-gold-luminous)"} stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-gridlines)" />
          <XAxis dataKey="date" stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} />
          <YAxis stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} label={{ value: indicator.yAxisLabel, angle: -90, position: 'insideLeft', fill: 'var(--color-chart-axis-text)', fontSize: 10, dx: -30 }} tickFormatter={(value) => typeof value === 'number' ? value.toLocaleString() : value} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: indicator.positiveColor || 'var(--color-accent-gold-luminous)', strokeWidth: 1, strokeDasharray: '3 3' }} />
          <Line dataKey={indicator.dataKey} name={indicator.title} {...commonLineProps} />
          <Area type="monotone" dataKey={indicator.dataKey} strokeWidth={0} fill={`url(#${gradientId('lineShadow')})`} />
        </LineChart>
      )}
      {indicator.chartType === 'bar' && (
        <BarChart data={indicator.data} margin={chartMargins}>
          <defs>
            <linearGradient id={gradientId('barPositive')} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={d3.color(indicator.positiveColor || "var(--color-accent-gold-luminous)")?.brighter(0.5).toString()} stopOpacity={0.9}/>
              <stop offset="100%" stopColor={indicator.positiveColor || "var(--color-accent-gold-luminous)"} stopOpacity={0.7}/>
            </linearGradient>
            <linearGradient id={gradientId('barNegative')} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={d3.color(indicator.negativeColor || "var(--color-accent-secondary-red)")?.brighter(0.5).toString()} stopOpacity={0.9}/>
              <stop offset="100%" stopColor={indicator.negativeColor || "var(--color-accent-secondary-red)"} stopOpacity={0.7}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-gridlines)" />
          <XAxis dataKey="date" stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} />
          <YAxis stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} label={{ value: indicator.yAxisLabel, angle: -90, position: 'insideLeft', fill: 'var(--color-chart-axis-text)', fontSize: 10, dx: -30 }} tickFormatter={(value) => typeof value === 'number' ? value.toLocaleString() : value} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(var(--rgb-accent-gold-luminous), 0.08)' }} />
          <Bar dataKey={indicator.dataKey} name={indicator.title}>
            {indicator.data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.value >= 0 ? `url(#${gradientId('barPositive')})` : `url(#${gradientId('barNegative')})`} />
            ))}
          </Bar>
        </BarChart>
      )}
      {indicator.chartType === 'area' && (
        <AreaChart data={indicator.data} margin={chartMargins}>
          <defs>
            <linearGradient id={gradientId('areaMain')} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={indicator.positiveColor || "var(--color-accent-gold-luminous)"} stopOpacity={0.7}/>
              <stop offset="95%" stopColor={indicator.positiveColor || "var(--color-accent-gold-luminous)"} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-gridlines)" />
          <XAxis dataKey="date" stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} />
          <YAxis stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} label={{ value: indicator.yAxisLabel, angle: -90, position: 'insideLeft', fill: 'var(--color-chart-axis-text)', fontSize: 10, dx: -30 }} tickFormatter={(value) => typeof value === 'number' ? value.toLocaleString() : value} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: indicator.positiveColor || 'var(--color-accent-gold-luminous)', strokeWidth: 1, strokeDasharray: '3 3' }}/>
          <Area dataKey={indicator.dataKey} name={indicator.title} {...commonLineProps} fill={`url(#${gradientId('areaMain')})`} />
        </AreaChart>
      )}
    </ResponsiveContainer>
  );
};

const WhaleTrackingPage: React.FC = () => {
  return (
    <div className="page-container">
      <h1 className="page-title">Whale Activity & Tracking</h1>
      <p className="page-subtitle" style={{color: 'var(--color-text-secondary)', marginTop: '-20px', marginBottom: '30px'}}>
        Monitoring large wallet movements and accumulation patterns to identify potential market-moving activities.
      </p>
      <div className="dashboard-grid">
        {whaleTrackingData.map((indicator) => (
          <div key={indicator.id} className="dashboard-card">
            <div className="dashboard-card-header">
              <h3>{indicator.title}</h3>
            </div>
            <div className="dashboard-card-content">
              <p style={{ fontSize: '0.85rem', marginBottom: 'var(--spacing-unit)'}}>
                {indicator.description}
              </p>
              <div className="chart-container" style={{ height: '300px' }}>
                <RenderChart indicator={indicator} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhaleTrackingPage;
