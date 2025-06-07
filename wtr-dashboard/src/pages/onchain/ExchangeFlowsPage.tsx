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
  Legend, // Added Legend for potential use
  Cell,   // Added Cell for conditional bar coloring
} from 'recharts';
import * as d3 from 'd3'; // For color manipulation in gradients
import { format, subDays } from 'date-fns'; // Added subDays
import SimpleBarChart from '../../components/charts/SimpleBarChart'; // Import D3 Bar Chart

// --- Data Structures ---
interface TimeSeriesDataPoint {
  date: Date;
  value: number;
  dateString?: string; // For Recharts XAxis key
}

interface CategoricalDataPoint {
  category: string; // For D3 Bar Chart (e.g., exchange name)
  value: number;    // For D3 Bar Chart (e.g., netflow amount)
}

// Combined type for chart data flexibility
type ChartData = TimeSeriesDataPoint[] | CategoricalDataPoint[];

interface BaseIndicatorConfig {
  id: string;
  title: string;
  description: string;
  yAxisLabel?: string;
}

interface RechartsIndicatorConfig extends BaseIndicatorConfig {
  chartComponent: 'recharts';
  chartType: 'line' | 'bar' | 'area';
  data: TimeSeriesDataPoint[];
  dataKey: string; // e.g., 'value'
  positiveColor?: string;
  negativeColor?: string;
  valuePrefix?: string;
  valueSuffix?: string;
}

interface D3IndicatorConfig extends BaseIndicatorConfig {
  chartComponent: 'd3';
  chartType: 'simpleBar'; // Add other D3 chart types here if needed
  data: CategoricalDataPoint[];
  // D3 specific props if any (e.g. barColor could be here)
}

type IndicatorConfig = RechartsIndicatorConfig | D3IndicatorConfig;


// Custom Tooltip (adapted from MacroIndicatorsPage)
// This tooltip is for Recharts. D3 charts have their own tooltip logic.
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

// --- Mock Data Generation ---
const generateTimeSeries = (days: number, startVal: number, dailyFluctuation: number, trendPerDay: number = 0): TimeSeriesDataPoint[] => {
  const data: TimeSeriesDataPoint[] = [];
  let val = startVal;
  for (let i = 0; i < days; i++) {
    const date = subDays(new Date(), days - 1 - i);
    val += (Math.random() - 0.5) * dailyFluctuation + trendPerDay;
    val = Math.max(0, val); // Ensure non-negative for some metrics
    data.push({ date, value: parseFloat(val.toFixed(2)), dateString: format(date, 'yyyy-MM-dd') });
  }
  return data;
};

const generateNetflowData = (days: number, baseMagnitude: number): TimeSeriesDataPoint[] => {
  const data: TimeSeriesDataPoint[] = [];
  for (let i = 0; i < days; i++) {
    const date = subDays(new Date(), days - 1 - i);
    const value = (Math.random() - 0.5) * 2 * baseMagnitude; // +/- baseMagnitude
    data.push({ date, value: parseFloat(value.toFixed(2)), dateString: format(date, 'yyyy-MM-dd') });
  }
  return data;
};

const mockExchangeSnapshotNetflow: CategoricalDataPoint[] = [
  { category: 'Exchange Alpha', value: Math.random() * 1000 - 500 },
  { category: 'Exchange Beta', value: Math.random() * 800 - 600 },
  { category: 'Exchange Gamma', value: Math.random() * 1200 - 400 },
  { category: 'Exchange Delta', value: Math.random() * 500 - 250 },
];


const exchangeFlowIndicators: IndicatorConfig[] = [
  {
    id: 'totalBTCReserves',
    title: 'Total BTC Reserves on Exchanges',
    description: 'Total amount of BTC held in known exchange wallets (last 90 days).',
    chartComponent: 'recharts',
    chartType: 'area',
    dataKey: 'value',
    yAxisLabel: 'BTC',
    data: generateTimeSeries(90, 2300000, 50000, -1500), // Starts at 2.3M, trends down
    positiveColor: 'var(--color-accent-gold-luminous)',
    valueSuffix: ' BTC',
  },
  {
    id: 'exchangeANetflow',
    title: 'Exchange Alpha: Net BTC Flow',
    description: 'Net daily BTC flow for Exchange Alpha (last 90 days). Positive is inflow, negative is outflow.',
    chartComponent: 'recharts',
    chartType: 'bar', // Bar chart for netflows often clearer
    dataKey: 'value',
    yAxisLabel: 'BTC',
    data: generateNetflowData(90, 1000), // Avg magnitude 1k BTC
    positiveColor: 'var(--color-accent-secondary-green)', // Or use gold/red for positive/negative
    negativeColor: 'var(--color-accent-secondary-red)',
    valueSuffix: ' BTC',
  },
   {
    id: 'exchangeBNetflow',
    title: 'Exchange Beta: Net BTC Flow',
    description: 'Net daily BTC flow for Exchange Beta (last 90 days).',
    chartComponent: 'recharts',
    chartType: 'bar',
    dataKey: 'value',
    yAxisLabel: 'BTC',
    data: generateNetflowData(90, 800),
    positiveColor: 'var(--color-accent-secondary-green)',
    negativeColor: 'var(--color-accent-secondary-red)',
    valueSuffix: ' BTC',
  },
  {
    id: 'currentDayNetflowByExchange',
    title: "Today's Netflow by Exchange (BTC)",
    description: "Snapshot of the net BTC flow for major exchanges today.",
    chartComponent: 'd3',
    chartType: 'simpleBar',
    yAxisLabel: 'BTC',
    data: mockExchangeSnapshotNetflow,
    // D3 SimpleBarChart will use its internal color logic for positive/negative
  }
];

// RenderChart Component (for Recharts)
const RenderRechart = ({ indicatorConfig }: { indicatorConfig: RechartsIndicatorConfig }) => {
  const { dataKey, positiveColor, chartType, yAxisLabel, valuePrefix, valueSuffix, data, title } = indicatorConfig;
  const commonLineProps = {
    type: "monotone" as const,
    stroke: positiveColor || "var(--color-accent-gold-luminous)",
    strokeWidth: 2,
    dot: { fill: indicator.positiveColor || "var(--color-accent-gold-luminous)", strokeWidth: 0, r: 3 },
    activeDot: { r: 6, stroke: "var(--color-background-primary)", strokeWidth: 2, fill: positiveColor || "var(--color-accent-gold-highlight)" },
  };
  const chartMargins = { top: 5, right: 20, left: 35, bottom: 5 };
  const gradientId = (type: string) => `${type}-${indicatorConfig.id.replace(/\s+/g, '-')}`;

  const yAxisTickFormatter = (value: any) =>
    `${valuePrefix || ''}${typeof value === 'number' ? value.toLocaleString() : value}${valueSuffix || ''}`;


  return (
    <ResponsiveContainer width="100%" height="100%">
      {chartType === 'line' && (
        <LineChart data={data} margin={chartMargins}>
          <defs>
            <linearGradient id={gradientId('lineShadow')} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={positiveColor || "var(--color-accent-gold-luminous)"} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={positiveColor || "var(--color-accent-gold-luminous)"} stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-gridlines)" />
          <XAxis dataKey="dateString" stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} />
          <YAxis stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: 'var(--color-chart-axis-text)', fontSize: 10, dx: -30 }} tickFormatter={yAxisTickFormatter} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: positiveColor || 'var(--color-accent-gold-luminous)', strokeWidth: 1, strokeDasharray: '3 3' }} />
          <Line dataKey={dataKey} name={title} {...commonLineProps} />
          <Area type="monotone" dataKey={dataKey} strokeWidth={0} fill={`url(#${gradientId('lineShadow')})`} />
        </LineChart>
      )}
      {chartType === 'bar' && (
        <BarChart data={data} margin={chartMargins}>
          <defs>
            <linearGradient id={gradientId('barPositive')} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={d3.color(indicatorConfig.positiveColor || "var(--color-accent-gold-luminous)")?.brighter(0.5).toString()} stopOpacity={0.9}/>
              <stop offset="100%" stopColor={indicatorConfig.positiveColor || "var(--color-accent-gold-luminous)"} stopOpacity={0.7}/>
            </linearGradient>
            <linearGradient id={gradientId('barNegative')} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={d3.color(indicatorConfig.negativeColor || "var(--color-accent-secondary-red)")?.brighter(0.5).toString()} stopOpacity={0.9}/>
              <stop offset="100%" stopColor={indicatorConfig.negativeColor || "var(--color-accent-secondary-red)"} stopOpacity={0.7}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-gridlines)" />
          <XAxis dataKey="dateString" stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} />
          <YAxis stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: 'var(--color-chart-axis-text)', fontSize: 10, dx: -30 }} tickFormatter={yAxisTickFormatter} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(var(--rgb-accent-gold-luminous), 0.08)' }} />
          <Bar dataKey={dataKey} name={title}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.value >= 0 ? `url(#${gradientId('barPositive')})` : `url(#${gradientId('barNegative')})`} />
            ))}
          </Bar>
        </BarChart>
      )}
      {chartType === 'area' && (
        <AreaChart data={data} margin={chartMargins}>
          <defs>
            <linearGradient id={gradientId('areaMain')} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={positiveColor || "var(--color-accent-gold-luminous)"} stopOpacity={0.7}/>
              <stop offset="95%" stopColor={positiveColor || "var(--color-accent-gold-luminous)"} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-gridlines)" />
          <XAxis dataKey="dateString" stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} />
          <YAxis stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: 'var(--color-chart-axis-text)', fontSize: 10, dx: -30 }} tickFormatter={yAxisTickFormatter} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: positiveColor || 'var(--color-accent-gold-luminous)', strokeWidth: 1, strokeDasharray: '3 3' }}/>
          <Area dataKey={dataKey} name={title} {...commonLineProps} fill={`url(#${gradientId('areaMain')})`} />
        </AreaChart>
      )}
    </ResponsiveContainer>
  );
};

const ExchangeFlowsPage: React.FC = () => {
  return (
    <div className="page-container">
      <h1 className="page-title">Exchange Flows</h1>
      <p className="page-subtitle" style={{color: 'var(--color-text-secondary)', marginTop: '-20px', marginBottom: '30px'}}>
        Tracking cryptocurrency movements to and from exchanges to gauge market sentiment and potential supply shifts.
      </p>
      <div className="dashboard-grid onchain-exchange-grid">
        {exchangeFlowIndicators.map((config) => (
          <div key={config.id} className="dashboard-card glassmorphic-card">
            <div className="dashboard-card-header">
              <h3>{config.title}</h3>
            </div>
            <div className="dashboard-card-content">
              <p style={{ fontSize: '0.85rem', marginBottom: 'var(--spacing-unit)'}}>
                {config.description}
              </p>
              <div className="chart-container" style={{ height: '300px' }}>
                {config.chartComponent === 'recharts' && <RenderRechart indicatorConfig={config} />}
                {config.chartComponent === 'd3' && config.chartType === 'simpleBar' && (
                  <SimpleBarChart
                    data={config.data as CategoricalDataPoint[]}
                    yAxisLabel={config.yAxisLabel}
                    // Pass other D3 specific props if any, e.g. barColor
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExchangeFlowsPage;
