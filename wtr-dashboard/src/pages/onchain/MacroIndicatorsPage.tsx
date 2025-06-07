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

import { format } from 'date-fns'; // For date formatting

// Mock Data Structure
interface ChartDataPoint {
  date: Date; // Using Date objects now
  value: number;
  // Recharts usually expects string dates for XAxis dataKey, so we'll format it back before passing to chart
  // but store as Date for easier manipulation here.
  dateString?: string;
}

interface Indicator {
  id: string;
  title: string;
  chartType: 'line' | 'bar' | 'area';
  data: ChartDataPoint[];
  description: string;
  yAxisLabel?: string;
  dataKey: string;
  valuePrefix?: string; // e.g., "$", "EH/s "
  valueSuffix?: string; // e.g., " M", " B"
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
          {/* Assuming label is the date string */}
          {`Date: ${label}`}
        </p>
        {payload.map((pld: any, index: number) => {
          const indicator = mockIndicatorsData.find(ind => ind.title === pld.name); // Find corresponding indicator for prefix/suffix
          const valuePrefix = indicator?.valuePrefix || '';
          const valueSuffix = indicator?.valueSuffix || '';
          return (
            <p key={index} className="desc" style={{color: `var(--color-text-primary)`}}>
              {`${pld.name}: ${valuePrefix}${pld.value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}${valueSuffix}`}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};


// Helper to generate time series data
const generateTimeSeriesData = (days: number, startValue: number, fluctuation: number, trend: number, isCurrency: boolean = false): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const today = new Date();
  let currentValue = startValue;
  for (let i = days -1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    currentValue += (Math.random() - 0.5) * fluctuation + trend * (days - i) / days;
    currentValue = Math.max(0, currentValue); // Ensure value doesn't go negative

    data.push({
      date: date,
      value: isCurrency ? parseFloat(currentValue.toFixed(2)) : Math.floor(currentValue),
      dateString: format(date, 'yyyy-MM-dd') // Format for Recharts XAxis
    });
  }
  return data;
};

const mockIndicatorsData: Indicator[] = [
  {
    id: 'txVolume',
    title: 'Network Transaction Volume',
    chartType: 'bar',
    description: 'The total estimated value in USD of transactions on the network over the last 90 days.',
    yAxisLabel: 'USD',
    dataKey: 'value',
    valuePrefix: '$',
    valueSuffix: ' B', // Assuming values are in billions
    data: generateTimeSeriesData(90, 50, 10, 0.5, true).map(d => ({...d, value: d.value / 1000})), // Example: 50B start, values in Billions
  },
  {
    id: 'activeAddresses',
    title: 'Active Addresses',
    chartType: 'area',
    description: 'The number of unique addresses active in the network (sender or receiver) daily for the last 90 days.',
    yAxisLabel: 'Addresses',
    dataKey: 'value',
    valueSuffix: ' K', // Assuming values are in thousands
    data: generateTimeSeriesData(90, 700, 150, 2, false).map(d => ({...d, value: d.value / 1000})), // Example: 700K start
  },
  {
    id: 'hashRate',
    title: 'Network Hash Rate',
    chartType: 'line',
    description: 'The estimated daily mining hash rate of the network over the last 90 days.',
    yAxisLabel: 'EH/s',
    dataKey: 'value',
    valueSuffix: ' EH/s',
    data: generateTimeSeriesData(90, 300, 50, 1.5, false), // Example: 300 EH/s start
  },
  {
    id: 'tvl',
    title: 'Total Value Locked (TVL) in DeFi',
    chartType: 'line',
    description: 'The total value of assets locked in decentralized finance (DeFi) protocols across major chains, daily for the last 90 days.',
    yAxisLabel: 'USD',
    dataKey: 'value',
    valuePrefix: '$',
    valueSuffix: ' B', // Assuming values are in billions
    data: generateTimeSeriesData(90, 80, 20, 0.3, true), // Example: $80B start
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
          <XAxis dataKey="dateString" stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} />
          <YAxis
            stroke="var(--color-chart-axis-text)"
            tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }}
            label={{ value: indicator.yAxisLabel, angle: -90, position: 'insideLeft', fill: 'var(--color-chart-axis-text)', fontSize: 10, dx: -25 }}
            tickFormatter={(value) => `${indicator.valuePrefix || ''}${value.toLocaleString()}${indicator.valueSuffix || ''}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--color-accent-gold-luminous)', strokeWidth: 1, strokeDasharray: '3 3' }} />
          <Line dataKey={indicator.dataKey} name={indicator.title} {...commonLineProps} />
           <Area type="monotone" dataKey={indicator.dataKey} strokeWidth={0} fill={`url(#shadow-${indicator.id})`} />
        </LineChart>
      )}
      {indicator.chartType === 'bar' && (
        <BarChart data={indicator.data.map(d => ({...d, dateString: format(d.date, 'yyyy-MM-dd')}))} margin={chartMargins}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-gridlines)" />
          <XAxis dataKey="dateString" stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} />
          <YAxis
            stroke="var(--color-chart-axis-text)"
            tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }}
            label={{ value: indicator.yAxisLabel, angle: -90, position: 'insideLeft', fill: 'var(--color-chart-axis-text)', fontSize: 10, dx: -25 }}
            tickFormatter={(value) => `${indicator.valuePrefix || ''}${value.toLocaleString()}${indicator.valueSuffix || ''}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(var(--rgb-accent-gold-luminous), 0.1)' }} />
          <Bar dataKey={indicator.dataKey} name={indicator.title} fill="var(--color-accent-gold-luminous)" />
        </BarChart>
      )}
      {indicator.chartType === 'area' && (
        <AreaChart data={indicator.data.map(d => ({...d, dateString: format(d.date, 'yyyy-MM-dd')}))} margin={chartMargins}>
          <defs>
            <linearGradient id={`areaGradient-${indicator.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-accent-gold-luminous)" stopOpacity={0.7}/>
              <stop offset="95%" stopColor="var(--color-accent-gold-luminous)" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-gridlines)" />
          <XAxis dataKey="dateString" stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} />
          <YAxis
            stroke="var(--color-chart-axis-text)"
            tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }}
            label={{ value: indicator.yAxisLabel, angle: -90, position: 'insideLeft', fill: 'var(--color-chart-axis-text)', fontSize: 10, dx: -25 }}
            tickFormatter={(value) => `${indicator.valuePrefix || ''}${value.toLocaleString()}${indicator.valueSuffix || ''}`}
          />
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
      <div className="dashboard-grid onchain-macro-grid"> {/* Added specific class for styling if needed */}
        {mockIndicatorsData.map((indicator) => (
          <div key={indicator.id} className="dashboard-card glassmorphic-card"> {/* Added glassmorphic-card */}
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
