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
import { format, subDays } from 'date-fns';

// Import custom D3 charts and new components
import SimpleBarChart from '../../components/charts/SimpleBarChart';
import SimpleLineChart from '../../components/charts/SimpleLineChart';
import WhaleTransactionFeed, { WhaleTransaction } from '../../components/onchain/WhaleTransactionFeed';


// --- Data Structures ---
interface TimeSeriesDataPoint { // For D3 Line chart & Recharts
  date: Date;
  value: number;
  dateString?: string; // For Recharts XAxis key if needed
}

interface CategoricalDataPoint { // For D3 Bar chart
  category: string;
  value: number;
}

// Combined type for chart data flexibility used by configurations
type ChartData = TimeSeriesDataPoint[] | CategoricalDataPoint[] | WhaleTransaction[];

interface BaseConfig {
  id: string;
  title: string;
  description: string;
  gridWidth?: number; // Optional: For layout control (e.g., 1 or 2 for 1-col or 2-col span)
}

interface RechartsConfig extends BaseConfig {
  componentType: 'recharts';
  chartType: 'line' | 'bar' | 'area';
  data: TimeSeriesDataPoint[]; // Recharts generally use TimeSeriesDataPoint with dateString
  dataKey: string;
  yAxisLabel?: string;
  positiveColor?: string;
  negativeColor?: string;
  valuePrefix?: string;
  valueSuffix?: string;
}

interface D3SimpleBarConfig extends BaseConfig {
  componentType: 'd3SimpleBar';
  data: CategoricalDataPoint[];
  yAxisLabel?: string;
  // barColor could be a prop if needed
}

interface D3SimpleLineConfig extends BaseConfig {
  componentType: 'd3SimpleLine';
  data: TimeSeriesDataPoint[];
  yAxisLabel?: string;
  lineColor?: string;
}

interface WhaleFeedConfig extends BaseConfig {
  componentType: 'whaleFeed';
  data: WhaleTransaction[];
}

type ComponentConfig = RechartsConfig | D3SimpleBarConfig | D3SimpleLineConfig | WhaleFeedConfig;

// Custom Tooltip (Recharts only)
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

// --- Mock Data Generation Helpers ---
const generateTimeSeries = (days: number, startVal: number, dailyFluctuation: number, trendPerDay: number = 0): TimeSeriesDataPoint[] => {
  const data: TimeSeriesDataPoint[] = [];
  let val = startVal;
  for (let i = 0; i < days; i++) {
    const date = subDays(new Date(), days - 1 - i);
    val += (Math.random() - 0.5) * dailyFluctuation + trendPerDay;
    val = Math.max(0, val);
    data.push({ date, value: parseFloat(val.toFixed(2)), dateString: format(date, 'yyyy-MM-dd') });
  }
  return data;
};

const generateWhaleBalances = (count: number): CategoricalDataPoint[] => {
  const data: CategoricalDataPoint[] = [];
  const tokens = ['BTC', 'ETH'];
  for (let i = 0; i < count; i++) {
    const token = tokens[i % tokens.length];
    data.push({
      category: `0x${Math.random().toString(16).substring(2, 10)}...`, // Random shortened address
      value: parseFloat((Math.random() * (token === 'BTC' ? 10000 : 50000) + (token === 'BTC' ? 1000 : 5000)).toFixed(2)) // Larger balances
    });
  }
  return data.sort((a,b) => b.value - a.value); // Sort by balance descending
};

const generateWhaleTransactions = (count: number): WhaleTransaction[] => {
  const data: WhaleTransaction[] = [];
  const tokens = ['BTC', 'ETH', 'USDT', 'USDC', 'LINK'];
  const baseAddresses = Array.from({length: 20}, () => `0x${Math.random().toString(16).substring(2,12)}`);

  for (let i = 0; i < count; i++) {
    const token = tokens[Math.floor(Math.random() * tokens.length)];
    let amount;
    switch(token) {
        case 'BTC': amount = Math.random() * 100 + 50; break; // 50-150 BTC
        case 'ETH': amount = Math.random() * 2000 + 500; break; // 500-2500 ETH
        default: amount = Math.random() * 500000 + 100000; // 100k - 600k for stables/others
    }
    data.push({
      timestamp: subDays(new Date(), Math.floor(Math.random()*5)), // Within last 5 days
      from: baseAddresses[Math.floor(Math.random() * baseAddresses.length)],
      to: baseAddresses[Math.floor(Math.random() * baseAddresses.length)],
      amount: parseFloat(amount.toFixed(2)),
      token: token,
      txHash: `0x${Math.random().toString(16).substring(2, 66)}`
    });
  }
  return data.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
};


// --- Page Specific Configurations ---
const whaleTrackingComponents: ComponentConfig[] = [
  {
    id: 'topWhaleBalancesBTC',
    title: 'Top Whale Balances (BTC)',
    description: 'Largest BTC balances held by individual non-exchange addresses.',
    componentType: 'd3SimpleBar',
    data: generateWhaleBalances(8).map(d => ({...d, category: `${d.category.substring(0,10)}... (${d.value.toFixed(0)} BTC)`})), // Format category for display
    yAxisLabel: 'BTC Balance',
    gridWidth: 2, // Span 2 columns
  },
  {
    id: 'whaleAccumulationScore',
    title: 'Whale Accumulation Score',
    description: 'A score (0-100) indicating general whale accumulation or distribution pressure (90 days).',
    componentType: 'd3SimpleLine',
    data: generateTimeSeries(90, 50, 20, 0.1), // Score between 0-100
    yAxisLabel: 'Score (0-100)',
    lineColor: 'var(--color-accent-secondary-blue)',
  },
   {
    id: 'whaleNetPositionChangeETH', // Example of another Recharts chart
    title: 'Whale Net Position Change (ETH)',
    description: 'Daily net change in ETH holdings by whale entities.',
    componentType: 'recharts',
    chartType: 'bar',
    data: generateTimeSeries(90, 0, 5000, 10).map(d=> ({...d, value: d.value - 2500})), // Centering around 0
    dataKey: 'value',
    yAxisLabel: 'ETH',
    positiveColor: 'var(--color-accent-secondary-green)',
    negativeColor: 'var(--color-accent-secondary-red)',
    valueSuffix: ' ETH'
  },
  {
    id: 'whaleTransactionFeed',
    title: 'Recent Whale Transactions',
    description: 'A feed of notable large transactions across various tokens.',
    componentType: 'whaleFeed',
    data: generateWhaleTransactions(15),
    gridWidth: 2, // Span 2 columns for wider feed
  },
];

// Rechart Renderer (can be enhanced or moved to a shared util if used across many onchain pages)
const RenderRechart = ({ config }: { config: RechartsConfig }) => {
  const { dataKey, positiveColor, chartType, yAxisLabel, valuePrefix, valueSuffix, data, title, negativeColor } = config;
  const commonLineProps = {
    type: "monotone" as const,
    stroke: positiveColor || "var(--color-accent-gold-luminous)",
    strokeWidth: 2,
    dot: { fill: indicator.positiveColor || "var(--color-accent-gold-luminous)", strokeWidth: 0, r: 3 },
    activeDot: { r: 6, stroke: "var(--color-background-primary)", strokeWidth: 2, fill: positiveColor || "var(--color-accent-gold-highlight)" },
  };
  const chartMargins = { top: 5, right: 20, left: 35, bottom: 5 };
  const gradientId = (type: string) => `${type}-${config.id.replace(/\s+/g, '-')}`;

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
              <stop offset="0%" stopColor={d3.color(positiveColor || "var(--color-accent-gold-luminous)")?.brighter(0.5).toString()} stopOpacity={0.9}/>
              <stop offset="100%" stopColor={positiveColor || "var(--color-accent-gold-luminous)"} stopOpacity={0.7}/>
            </linearGradient>
            <linearGradient id={gradientId('barNegative')} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={d3.color(negativeColor || "var(--color-accent-secondary-red)")?.brighter(0.5).toString()} stopOpacity={0.9}/>
              <stop offset="100%" stopColor={negativeColor || "var(--color-accent-secondary-red)"} stopOpacity={0.7}/>
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

const WhaleTrackingPage: React.FC = () => {
  return (
    <div className="page-container">
      <h1 className="page-title">Whale Activity & Tracking</h1>
      <p className="page-subtitle" style={{color: 'var(--color-text-secondary)', marginTop: '-20px', marginBottom: '30px'}}>
        Monitoring large wallet movements and accumulation patterns to identify potential market-moving activities.
      </p>
      <div className="dashboard-grid onchain-whale-grid"> {/* Added specific class */}
        {whaleTrackingComponents.map((config) => (
          <div
            key={config.id}
            className={`dashboard-card glassmorphic-card ${config.gridWidth === 2 ? 'grid-col-span-2' : ''}`}
          >
            <div className="dashboard-card-header">
              <h3>{config.title}</h3>
            </div>
            <div className="dashboard-card-content">
              <p style={{ fontSize: '0.85rem', marginBottom: 'var(--spacing-unit)'}}>
                {config.description}
              </p>
              <div className="chart-container" style={{ height: '350px' }}> {/* Increased height slightly */}
                {config.componentType === 'recharts' && <RenderRechart config={config} />}
                {config.componentType === 'd3SimpleBar' && (
                  <SimpleBarChart
                    data={config.data as CategoricalDataPoint[]}
                    yAxisLabel={config.yAxisLabel}
                  />
                )}
                {config.componentType === 'd3SimpleLine' && (
                  <SimpleLineChart
                    data={config.data as TimeSeriesDataPoint[]}
                    yAxisLabel={config.yAxisLabel}
                    lineColor={config.lineColor}
                  />
                )}
                {config.componentType === 'whaleFeed' && (
                  <WhaleTransactionFeed transactions={config.data as WhaleTransaction[]} />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhaleTrackingPage;
