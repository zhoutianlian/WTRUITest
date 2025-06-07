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
  Legend, // Added Legend for multi-line/bar charts
} from 'recharts';

// Mock Data Structure (can be shared or adapted)
interface ChartDataPoint {
  date: string;
  value?: number; // For single value series
  inflow?: number; // For inflow/outflow charts
  outflow?: number;
  btcReserve?: number;
  ethReserve?: number;
}

interface ExchangeFlowIndicator {
  id: string;
  title: string;
  chartType: 'line' | 'bar' | 'area' | 'groupedBar';
  data: ChartDataPoint[];
  description: string;
  yAxisLabel?: string;
  dataKeys: string[]; // Can be multiple for grouped/stacked charts
  colors: string[]; // Colors corresponding to dataKeys
}

// Custom Tooltip (can be imported from a shared util if available, or defined here)
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
            {`${pld.name}: ${pld.value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const mockExchangeFlowsData: ExchangeFlowIndicator[] = [
  {
    id: 'netExchangeFlowBTC',
    title: 'Net Exchange Flow (BTC)',
    chartType: 'bar',
    description: 'Net amount of BTC flowing into (positive) or out of (negative) all exchanges.',
    yAxisLabel: 'BTC',
    dataKeys: ['value'],
    colors: ['var(--color-accent-gold-luminous)'], // Will need logic to change color based on value
    data: Array.from({ length: 30 }, (_, i) => ({
      date: `2023-10-${String(i + 1).padStart(2, '0')}`,
      value: Math.floor((Math.random() - 0.5) * 5000), // Positive or negative
    })),
  },
  {
    id: 'stablecoinBalance',
    title: 'Stablecoin Balance on Exchanges',
    chartType: 'area',
    description: 'Total balance of major stablecoins (USDT, USDC, etc.) held on exchanges.',
    yAxisLabel: 'USD',
    dataKeys: ['value'],
    colors: ['var(--color-accent-secondary-blue)'],
    data: Array.from({ length: 30 }, (_, i) => ({
      date: `2023-10-${String(i + 1).padStart(2, '0')}`,
      value: Math.floor(20000000000 + (Math.random() - 0.3) * 500000000 + i * 100000000),
    })),
  },
  {
    id: 'exchangeReserves',
    title: 'Exchange Reserves (BTC & ETH)',
    chartType: 'line', // Could be two separate lines
    description: 'Total reserves of BTC and ETH held by exchanges.',
    yAxisLabel: 'Amount',
    dataKeys: ['btcReserve', 'ethReserve'],
    colors: ['var(--color-accent-gold-luminous)', 'var(--color-accent-secondary-blue)'],
    data: Array.from({ length: 30 }, (_, i) => ({
      date: `2023-10-${String(i + 1).padStart(2, '0')}`,
      btcReserve: Math.floor(2000000 + (Math.random() - 0.5) * 50000 - i * 1000),
      ethReserve: Math.floor(15000000 + (Math.random() - 0.5) * 200000 - i * 5000),
    })),
  },
];

const RenderExchangeChart = ({ indicator }: { indicator: ExchangeFlowIndicator }) => {
  const chartMargins = { top: 5, right: 20, left: 30, bottom: 5 };

  const getBarFillColor = (value: number) => {
    if (indicator.id === 'netExchangeFlowBTC') {
      return value >= 0 ? 'var(--color-accent-gold-luminous)' : 'var(--color-accent-secondary-red)';
    }
    return indicator.colors[0];
  };

  return (
    <ResponsiveContainer width="100%" height={250}>
      {indicator.chartType === 'line' && (
        <LineChart data={indicator.data} margin={chartMargins}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-gridlines)" />
          <XAxis dataKey="date" stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} />
          <YAxis stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} label={{ value: indicator.yAxisLabel, angle: -90, position: 'insideLeft', fill: 'var(--color-chart-axis-text)', fontSize: 10, dx: -25 }} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--color-accent-gold-luminous)', strokeWidth: 1, strokeDasharray: '3 3' }} />
          <Legend wrapperStyle={{fontSize: "10px", paddingTop: "10px"}}/>
          {indicator.dataKeys.map((key, index) => (
            <Line key={key} dataKey={key} name={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} stroke={indicator.colors[index % indicator.colors.length]} strokeWidth={2} dot={{ fill: indicator.colors[index % indicator.colors.length], strokeWidth: 0, r:3 }} activeDot={{r:6, stroke: 'var(--color-background-primary)', strokeWidth:2, fill: indicator.colors[index % indicator.colors.length]}}/>
          ))}
        </LineChart>
      )}
      {indicator.chartType === 'bar' && (
        <BarChart data={indicator.data} margin={chartMargins}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-gridlines)" />
          <XAxis dataKey="date" stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} />
          <YAxis stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} label={{ value: indicator.yAxisLabel, angle: -90, position: 'insideLeft', fill: 'var(--color-chart-axis-text)', fontSize: 10, dx: -25 }} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(var(--rgb-accent-gold-luminous), 0.1)' }} />
          <Legend wrapperStyle={{fontSize: "10px", paddingTop: "10px"}}/>
          {indicator.dataKeys.map((key, index) => (
             <Bar key={key} dataKey={key} name={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} >
              {indicator.data.map((entry, entryIndex) => (
                <rect key={`cell-${entryIndex}`} x={0} y={0} width={0} height={0} fill={getBarFillColor(entry[key as keyof ChartDataPoint] as number || 0)} />
              ))}
            </Bar>
          ))}
        </BarChart>
      )}
      {indicator.chartType === 'area' && (
        <AreaChart data={indicator.data} margin={chartMargins}>
          <defs>
            {indicator.dataKeys.map((key, index) => (
              <linearGradient key={`areaGradient-${key}`} id={`areaGradient-${indicator.id}-${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={indicator.colors[index % indicator.colors.length]} stopOpacity={0.7}/>
                <stop offset="95%" stopColor={indicator.colors[index % indicator.colors.length]} stopOpacity={0.1}/>
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-gridlines)" />
          <XAxis dataKey="date" stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} />
          <YAxis stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} label={{ value: indicator.yAxisLabel, angle: -90, position: 'insideLeft', fill: 'var(--color-chart-axis-text)', fontSize: 10, dx: -25 }} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--color-accent-gold-luminous)', strokeWidth: 1, strokeDasharray: '3 3' }}/>
          <Legend wrapperStyle={{fontSize: "10px", paddingTop: "10px"}}/>
          {indicator.dataKeys.map((key, index) => (
            <Area key={key} type="monotone" dataKey={key} name={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} stroke={indicator.colors[index % indicator.colors.length]} strokeWidth={2} fill={`url(#areaGradient-${indicator.id}-${key})`} dot={{ fill: indicator.colors[index % indicator.colors.length], strokeWidth:0, r:3 }} activeDot={{r:6, stroke: 'var(--color-background-primary)', strokeWidth:2, fill: indicator.colors[index % indicator.colors.length]}} />
          ))}
        </AreaChart>
      )}
    </ResponsiveContainer>
  );
};


const ExchangeFlowsPage: React.FC = () => {
  return (
    <div className="page-container">
      <h1 className="page-title">Exchange Flows Analysis</h1>
      <p className="page-subtitle" style={{color: 'var(--color-text-secondary)', marginTop: '-20px', marginBottom: '20px'}}>
        Insights into asset movements to and from cryptocurrency exchanges.
      </p>
      <div className="dashboard-grid">
        {mockExchangeFlowsData.map((indicator) => (
          <div key={indicator.id} className="dashboard-card">
            <div className="dashboard-card-header">
              <h3>{indicator.title}</h3>
            </div>
            <div className="dashboard-card-content">
              <p style={{ fontSize: '0.85rem', marginBottom: 'var(--spacing-unit)'}}>
                {indicator.description}
              </p>
              <div className="chart-container" style={{ height: '250px' }}>
                <RenderExchangeChart indicator={indicator} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExchangeFlowsPage;
