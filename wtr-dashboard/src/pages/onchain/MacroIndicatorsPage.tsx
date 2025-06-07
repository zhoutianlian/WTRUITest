import React from 'react';
import './OnChainPages.css'; // Import shared CSS
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
} from 'recharts'; // Assuming recharts is available

// Mock Data Structure
interface ChartDataPoint {
  date: string; // e.g., "2023-01-01"
  value: number;
}

interface Indicator {
  id: string;
  title: string;
  chartType: 'line' | 'bar' | 'area';
  data: ChartDataPoint[];
  description: string;
  yAxisLabel?: string; // Optional: For YAxis label
  dataKey: string; // Key for the 'value' in ChartDataPoint, usually 'value'
}

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip-recharts" style={{ // Use a distinct class or inline styles
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
          <p key={index} className="desc" style={{color: `var(--color-text-primary)`}}>
            {`${pld.name}: ${pld.value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};


const mockIndicatorsData: Indicator[] = [
  {
    id: 'hashRate',
    title: 'Network Hash Rate',
    chartType: 'line',
    description: 'The estimated number of terahashes per second the Bitcoin network is performing.',
    description: 'The estimated number of terahashes per second the Bitcoin network is performing.',
    yAxisLabel: 'EH/s',
    dataKey: 'value',
    data: Array.from({ length: 30 }, (_, i) => ({
      date: `2023-10-${String(i + 1).padStart(2, '0')}`,
      value: Math.floor(300 + Math.random() * 50 + i * 2),
    })),
  },
  {
    id: 'activeAddresses',
    title: 'Active Addresses',
    chartType: 'area',
    description: 'The number of unique addresses that were active in the network (either as a sender or receiver).',
    yAxisLabel: 'Addresses',
    dataKey: 'value',
    data: Array.from({ length: 30 }, (_, i) => ({
      date: `2023-10-${String(i + 1).padStart(2, '0')}`,
      value: Math.floor(700000 + Math.random() * 100000 + i * 1000),
    })),
  },
  {
    id: 'txVolume',
    title: 'Transaction Volume (USD)',
    chartType: 'bar',
    description: 'The total estimated value in USD of transactions on the network.',
    yAxisLabel: 'USD',
    dataKey: 'value',
    data: Array.from({ length: 30 }, (_, i) => ({
      date: `2023-10-${String(i + 1).padStart(2, '0')}`,
      value: Math.floor(1000000000 + Math.random() * 500000000 + i * 10000000),
    })),
  },
  {
    id: 'stockToFlow',
    title: 'Stock-to-Flow Model',
    chartType: 'line',
    description: 'A model that quantifies scarcity by comparing current stock (total supply) to production flow (new supply).',
    yAxisLabel: 'Ratio',
    dataKey: 'value',
    data: Array.from({ length: 30 }, (_, i) => ({
      date: `2023-10-${String(i + 1).padStart(2, '0')}`,
      value: parseFloat((50 + Math.random() * 5 + i * 0.1).toFixed(1)),
    })),
  },
];

const RenderChart = ({ indicator }: { indicator: Indicator }) => {
  const commonLineProps = {
    type: "monotone" as const,
    stroke: "var(--color-accent-gold-luminous)",
    strokeWidth: 2,
    dot: { fill: "var(--color-accent-gold-luminous)", strokeWidth: 0, r: 3 },
    activeDot: { r: 6, stroke: "var(--color-background-primary)", strokeWidth: 2, fill: "var(--color-accent-gold-highlight)" },
  };

  const chartMargins = { top: 5, right: 20, left: 30, bottom: 5 }; // Adjusted left margin for YAxis label

  return (
    <ResponsiveContainer width="100%" height={250}>
      {indicator.chartType === 'line' && (
        <LineChart data={indicator.data} margin={chartMargins}>
          <defs>
            <linearGradient id={`shadow-${indicator.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-accent-gold-luminous)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--color-accent-gold-luminous)" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-gridlines)" />
          <XAxis dataKey="date" stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} />
          <YAxis stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} label={{ value: indicator.yAxisLabel, angle: -90, position: 'insideLeft', fill: 'var(--color-chart-axis-text)', fontSize: 10, dx: -25 }} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--color-accent-gold-luminous)', strokeWidth: 1, strokeDasharray: '3 3' }} />
          <Line dataKey={indicator.dataKey} name={indicator.title} {...commonLineProps} />
           {/* Optional: subtle shadow/glow area below line */}
           <Area type="monotone" dataKey={indicator.dataKey} strokeWidth={0} fill={`url(#shadow-${indicator.id})`} />
        </LineChart>
      )}
      {indicator.chartType === 'bar' && (
        <BarChart data={indicator.data} margin={chartMargins}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-gridlines)" />
          <XAxis dataKey="date" stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} />
          <YAxis stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} label={{ value: indicator.yAxisLabel, angle: -90, position: 'insideLeft', fill: 'var(--color-chart-axis-text)', fontSize: 10, dx: -25 }} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(var(--rgb-accent-gold-luminous), 0.1)' }} />
          <Bar dataKey={indicator.dataKey} name={indicator.title} fill="var(--color-accent-gold-luminous)" />
        </BarChart>
      )}
      {indicator.chartType === 'area' && (
        <AreaChart data={indicator.data} margin={chartMargins}>
          <defs>
            <linearGradient id={`areaGradient-${indicator.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-accent-gold-luminous)" stopOpacity={0.7}/>
              <stop offset="95%" stopColor="var(--color-accent-gold-luminous)" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-gridlines)" />
          <XAxis dataKey="date" stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} />
          <YAxis stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} label={{ value: indicator.yAxisLabel, angle: -90, position: 'insideLeft', fill: 'var(--color-chart-axis-text)', fontSize: 10, dx: -25 }} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--color-accent-gold-luminous)', strokeWidth: 1, strokeDasharray: '3 3' }}/>
          <Area type="monotone" dataKey={indicator.dataKey} name={indicator.title} stroke="var(--color-accent-gold-luminous)" strokeWidth={2} fill={`url(#areaGradient-${indicator.id})`} {...commonLineProps} />
        </AreaChart>
      )}
    </ResponsiveContainer>
  );
};

const MacroIndicatorsPage: React.FC = () => {
  return (
    <div className="page-container">
      <h1 className="page-title">Macro On-Chain Indicators</h1>
      <p className="page-subtitle" style={{color: 'var(--color-text-secondary)', marginTop: '-20px', marginBottom: '20px'}}>
        High-level metrics to gauge overall network health, adoption, and security.
      </p>
      <div className="dashboard-grid">
        {mockIndicatorsData.map((indicator) => (
          <div key={indicator.id} className="dashboard-card">
            <div className="dashboard-card-header">
              <h3>{indicator.title}</h3>
            </div>
            <div className="dashboard-card-content">
              <p style={{ fontSize: '0.85rem', marginBottom: 'var(--spacing-unit)'}}>
                {indicator.description}
              </p>
              <div className="chart-container" style={{ height: '250px' }}> {/* Ensure chart-container has a defined height */}
                <RenderChart indicator={indicator} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MacroIndicatorsPage;
