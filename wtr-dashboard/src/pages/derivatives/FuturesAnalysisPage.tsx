import React from 'react';
import './DerivativesPages.css'; // Shared CSS for derivatives pages
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
  ReferenceLine, // For Funding Rate zero line
  ComposedChart, // For potential combined charts like Open Interest
} from 'recharts';
import * as d3 from 'd3'; // For color manipulation in gradients

// Mock Data Structure
interface ChartDataPoint {
  date: string; // Can also be category like "Jan '24" for Term Structure
  value: number;
  value2?: number; // For stacked/grouped charts or multiple lines
  longs?: number; // For liquidations
  shorts?: number; // For liquidations
}

interface Indicator {
  id: string;
  title: string;
  chartType: 'line' | 'bar' | 'area' | 'composed'; // Added composed for flexibility
  data: ChartDataPoint[];
  description: string;
  yAxisLabel?: string;
  dataKey: string;
  dataKey2?: string; // For second series in line/area or stacked/grouped bar
  positiveColor?: string;
  negativeColor?: string;
  color2?: string; // Color for second data series
}

// Custom Tooltip (adapted from ExchangeFlowsPage)
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
          {label} {/* Label could be date or contract month */}
        </p>
        {payload.map((pld: any, index: number) => {
          // Check if value exists before trying to format
          const valueExists = pld.value !== undefined && pld.value !== null;
          let formattedValue = 'N/A';
          if (valueExists) {
            // Special handling for funding rate to show percentage
            if (pld.name === "Funding Rate") {
                formattedValue = `${(pld.value * 100).toFixed(4)}%`;
            } else if (pld.name.includes("Liquidations")) {
                 formattedValue = `$${pld.value.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
            } else {
                formattedValue = pld.value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
            }
          }

          // Determine color based on value for specific charts if needed
          let valueColor = pld.stroke || pld.fill; // Default to Recharts color
          if (pld.name === "Funding Rate") {
            valueColor = pld.value >= 0 ? 'var(--color-accent-gold-luminous)' : 'var(--color-accent-secondary-red)';
          } else if (pld.name === "BTC Net Position") { // Example if another chart needed conditional coloring
            valueColor = pld.value >= 0 ? 'var(--color-accent-gold-luminous)' : 'var(--color-accent-secondary-red)';
          }


          return (
            <p key={index} className="desc" style={{ color: valueColor }}>
              {`${pld.name}: ${formattedValue}`}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};


// Mock Data for Futures Analysis
const futuresAnalysisData: Indicator[] = [
  {
    id: 'totalOpenInterest',
    title: 'Total Open Interest (BTC Futures)',
    chartType: 'area',
    description: 'Total value of outstanding futures contracts, indicating market participation and liquidity.',
    yAxisLabel: 'USD',
    dataKey: 'value',
    positiveColor: 'var(--color-accent-gold-luminous)',
    data: Array.from({ length: 30 }, (_, i) => ({
      date: `2023-11-${String(i + 1).padStart(2, '0')}`,
      value: Math.floor(10e9 + Math.random() * 2e9 + i * 5e7), // Billions
    })),
  },
  {
    id: 'fundingRateBTC',
    title: 'Funding Rate History (BTC Perpetual)',
    chartType: 'line',
    description: 'Periodic payments exchanged between long and short traders. Positive rates suggest longs pay shorts; negative, shorts pay longs.',
    yAxisLabel: '%',
    dataKey: 'value',
    positiveColor: 'var(--color-accent-gold-luminous)',
    negativeColor: 'var(--color-accent-secondary-red)', // Used for line segment below zero if implemented
    data: Array.from({ length: 60 }, (_, i) => ({
      date: `Day ${i + 1}`,
      value: parseFloat(((Math.random() - 0.5) * 0.001).toFixed(5)),
    })),
  },
  {
    id: 'futuresTermStructure',
    title: 'Futures Term Structure (BTC - Monthly)',
    chartType: 'line',
    description: 'Prices of futures contracts with different expiry dates, indicating market expectations (contango or backwardation).',
    yAxisLabel: 'Price (USD)',
    dataKey: 'value',
    positiveColor: 'var(--color-accent-secondary-blue)',
    data: [
      { date: 'Jan \'24', value: 45000 + Math.random()*200 },
      { date: 'Feb \'24', value: 45200 + Math.random()*200 },
      { date: 'Mar \'24', value: 45500 + Math.random()*200 },
      { date: 'Jun \'24', value: 46000 + Math.random()*300 },
      { date: 'Sep \'24', value: 46500 + Math.random()*300 },
      { date: 'Dec \'24', value: 47000 + Math.random()*400 },
    ],
  },
  {
    id: 'liquidationsTotal',
    title: 'Daily Liquidations (Longs vs Shorts)',
    chartType: 'bar',
    description: 'Total USD value of liquidated long and short positions daily, indicating market stress.',
    yAxisLabel: 'USD',
    dataKey: 'longs',
    dataKey2: 'shorts',
    positiveColor: 'var(--color-accent-secondary-red)', // Long liquidations often red
    color2: 'var(--color-accent-gold-luminous)',      // Short liquidations often green/gold
    data: Array.from({ length: 30 }, (_, i) => ({
      date: `2023-11-${String(i + 1).padStart(2, '0')}`,
      value: 0, // Not used directly for grouped bar
      longs: Math.floor(Math.random() * 50e6), // Up to $50M
      shorts: Math.floor(Math.random() * 40e6), // Up to $40M
    })),
  },
];

// RenderChart Component (adapted from ExchangeFlowsPage)
const RenderChart = ({ indicator }: { indicator: Indicator }) => {
  const commonLineProps = {
    type: "monotone" as const,
    stroke: indicator.positiveColor || "var(--color-accent-gold-luminous)",
    strokeWidth: 2,
    dot: { fill: indicator.positiveColor || "var(--color-accent-gold-luminous)", r: 3, strokeWidth:0 },
    activeDot: { r: 6, stroke: "var(--color-background-primary)", strokeWidth: 2, fill: indicator.positiveColor || "var(--color-accent-gold-highlight)" },
  };
  const chartMargins = { top: 10, right: 25, left: 40, bottom: 5 };

  const gradientId = (type: string) => `${type}-${indicator.id.replace(/[^a-zA-Z0-9]/g, '-')}`;

  const yAxisTickFormatter = (value: any) => {
    if (indicator.id === 'fundingRateBTC') return `${(value * 100).toFixed(3)}%`;
    if (typeof value === 'number') {
      if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
      if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
      if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
      return value.toLocaleString(undefined, {minimumFractionDigits:0, maximumFractionDigits:2});
    }
    return value;
  };

  const xAxisTickFormatter = (value: any) => {
    if (indicator.id === 'futuresTermStructure') return value;
    // Simple date formatting for other charts if they are like 'YYYY-MM-DD'
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return value.substring(5); // Show MM-DD
    }
    if (typeof value === 'string' && value.startsWith('Day ')) return value; // For funding rate 'Day X'
    return value;
  };


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
          <XAxis dataKey="date" stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} tickFormatter={xAxisTickFormatter} />
          <YAxis stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} label={{ value: indicator.yAxisLabel, angle: -90, position: 'insideLeft', fill: 'var(--color-chart-axis-text)', fontSize: 10, dx: -35 }} tickFormatter={yAxisTickFormatter} domain={indicator.id === 'fundingRateBTC' ? ['auto', 'auto'] : undefined} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: indicator.positiveColor || 'var(--color-accent-gold-luminous)', strokeWidth: 1, strokeDasharray: '3 3' }} />
          {indicator.id === 'fundingRateBTC' && <ReferenceLine y={0} stroke="var(--color-text-secondary)" strokeDasharray="2 2" />}
          {/* Conditional line coloring for funding rate */}
          {indicator.id === 'fundingRateBTC' ? (
            <Line dataKey={indicator.dataKey} name="Funding Rate" strokeWidth={commonLineProps.strokeWidth} activeDot={commonLineProps.activeDot} dot={false}>
              {indicator.data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.value >= 0 ? (indicator.positiveColor || "var(--color-accent-gold-luminous)") : (indicator.negativeColor || "var(--color-accent-secondary-red)")} />
              ))}
            </Line>
          ) : (
            <Line dataKey={indicator.dataKey} name={indicator.title} {...commonLineProps} />
          )}
          {indicator.id !== 'fundingRateBTC' && <Area type="monotone" dataKey={indicator.dataKey} strokeWidth={0} fill={`url(#${gradientId('lineShadow')})`} />}
        </LineChart>
      )}
      {indicator.chartType === 'bar' && indicator.id === 'liquidationsTotal' && indicator.dataKey2 && (
        <BarChart data={indicator.data} margin={chartMargins}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-gridlines)" />
          <XAxis dataKey="date" stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} tickFormatter={xAxisTickFormatter} />
          <YAxis stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} label={{ value: indicator.yAxisLabel, angle: -90, position: 'insideLeft', fill: 'var(--color-chart-axis-text)', fontSize: 10, dx: -35 }} tickFormatter={yAxisTickFormatter}/>
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(var(--rgb-accent-gold-luminous), 0.08)' }} />
          <Legend wrapperStyle={{fontSize: "10px", paddingTop: "10px"}}/>
          <Bar dataKey={indicator.dataKey} name="Long Liquidations" fill={indicator.positiveColor || "var(--color-accent-secondary-red)"} stackId="liquidations" />
          <Bar dataKey={indicator.dataKey2} name="Short Liquidations" fill={indicator.color2 || "var(--color-accent-gold-luminous)"} stackId="liquidations" />
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
          <XAxis dataKey="date" stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} tickFormatter={xAxisTickFormatter} />
          <YAxis stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} label={{ value: indicator.yAxisLabel, angle: -90, position: 'insideLeft', fill: 'var(--color-chart-axis-text)', fontSize: 10, dx: -35 }} tickFormatter={yAxisTickFormatter}/>
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: indicator.positiveColor || 'var(--color-accent-gold-luminous)', strokeWidth: 1, strokeDasharray: '3 3' }}/>
          <Area dataKey={indicator.dataKey} name={indicator.title} {...commonLineProps} fill={`url(#${gradientId('areaMain')})`} />
        </AreaChart>
      )}
    </ResponsiveContainer>
  );
};

const FuturesAnalysisPage: React.FC = () => {
  return (
    <div className="page-container">
      <h1 className="page-title">Futures Market Analysis</h1>
      <p className="page-subtitle" style={{color: 'var(--color-text-secondary)', marginTop: '-20px', marginBottom: '30px'}}>
        Insights into futures contracts, open interest, funding rates, and liquidation events across major exchanges.
      </p>
      <div className="dashboard-grid">
        {futuresAnalysisData.map((indicator) => (
          <div key={indicator.id} className="dashboard-card">
            <div className="dashboard-card-header">
              <h3>{indicator.title}</h3>
            </div>
            <div className="dashboard-card-content">
              <p style={{ fontSize: '0.85rem', marginBottom: 'var(--spacing-unit)'}}>
                {indicator.description}
              </p>
              <div className="chart-container" style={{ height: '320px' }}> {/* Adjusted height */}
                <RenderChart indicator={indicator} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FuturesAnalysisPage;
