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
  ReferenceLine,
  ComposedChart,
} from 'recharts';
import * as d3 from 'd3';
import { format, subDays, addMonths, setDate } from 'date-fns';

// Import custom D3 charts
import SimpleLineChart from '../../components/charts/SimpleLineChart';
import FundingRateHeatmap, { FundingRateDataPoint } from '../../components/charts/FundingRateHeatmap';

// --- Data Structures ---
interface TimeSeriesDataPoint {
  date: Date;
  value: number;
  dateString?: string; // For Recharts XAxis key
}

interface TermStructureDataPoint {
  expiryDate: Date;
  price: number;
  contract: string;
  dateString?: string; // For XAxis key
}

// Extending CategoricalDataPoint from previous pages for consistency if needed, but not directly used by new charts here
interface CategoricalDataPoint {
  category: string;
  value: number;
}


// Combined type for chart data flexibility
type ChartData = TimeSeriesDataPoint[] | TermStructureDataPoint[] | FundingRateDataPoint[] | RechartsSpecificChartDataPoint[];

// For existing Recharts data that uses string dates and multiple value keys
interface RechartsSpecificChartDataPoint {
    date: string; // Recharts can handle string dates
    value?: number; // General value
    longs?: number;
    shorts?: number;
    // other specific keys as needed by Recharts charts
}


interface BaseConfig {
  id: string;
  title: string;
  description: string;
  gridWidth?: number;
}

interface RechartsConfig extends BaseConfig {
  componentType: 'recharts';
  chartType: 'line' | 'bar' | 'area' | 'composed';
  data: RechartsSpecificChartDataPoint[];
  dataKey: string;
  dataKey2?: string;
  yAxisLabel?: string;
  positiveColor?: string;
  negativeColor?: string;
  color2?: string;
  valuePrefix?: string;
  valueSuffix?: string;
}

interface D3SimpleLineConfig extends BaseConfig {
  componentType: 'd3SimpleLine';
  data: TimeSeriesDataPoint[] | TermStructureDataPoint[]; // Can take either for different x-axis types
  yAxisLabel?: string;
  xAxisType?: 'date' | 'category'; // To help SimpleLineChart adapt if needed, though it primarily expects date
  lineColor?: string;
  // Specific to Term Structure to show contract name in tooltip
  customTooltipFormatter?: (d: any)
 => string;
}

interface D3FundingHeatmapConfig extends BaseConfig {
  componentType: 'd3FundingHeatmap';
  data: FundingRateDataPoint[];
  xAxisLabel?: string;
  yAxisLabel?: string;
}

type ComponentConfig = RechartsConfig | D3SimpleLineConfig | D3FundingHeatmapConfig;

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


// --- Mock Data Generation Helpers ---
const generateTimeSeries = (days: number, startVal: number, dailyFluctuation: number, trendPerDay: number = 0): TimeSeriesDataPoint[] => {
  const data: TimeSeriesDataPoint[] = [];
  let val = startVal;
  for (let i = 0; i < days; i++) {
    const date = subDays(new Date(), days - 1 - i);
    val += (Math.random() - 0.5) * dailyFluctuation + trendPerDay;
    data.push({ date, value: parseFloat(val.toFixed(2)), dateString: format(date, 'yyyy-MM-dd') });
  }
  return data;
};

const generateFundingRateData = (): FundingRateDataPoint[] => {
  const assets = ['BTC', 'ETH', 'SOL', 'ADA', 'AVAX'];
  const exchanges = ['Exchange A', 'Exchange B', 'Exchange C', 'Exchange D'];
  const data: FundingRateDataPoint[] = [];
  assets.forEach(asset => {
    exchanges.forEach(exchange => {
      data.push({
        asset,
        exchange,
        rate: parseFloat(((Math.random() - 0.5) * 0.002).toFixed(5)), // Small funding rates +/- 0.1%
        // timestamp: new Date() // Could be used if X-axis is time for each asset
      });
    });
  });
  return data;
};

const generateTermStructureData = (): TermStructureDataPoint[] => {
  const basePrice = 65000;
  const data: TermStructureDataPoint[] = [];
  const today = new Date();
  for (let i = 0; i < 6; i++) { // Next 6 expiries
    const expiry = setDate(addMonths(today, i * (i < 3 ? 1 : 3)), 28); // Monthly for first 3, then quarterly
    const monthName = format(expiry, 'MMM');
    const yearSuffix = format(expiry, 'yy');
    data.push({
      expiryDate: expiry,
      price: basePrice + i * 500 + (Math.random() - 0.3) * (500 + i*100),
      contract: `BTC-${format(expiry, 'ddMMMyy').toUpperCase()}`,
      dateString: `${monthName} '${yearSuffix}` // For X-axis display
    });
  }
  return data;
};

// --- Page Specific Configurations ---
const futuresPageComponentConfigs: ComponentConfig[] = [
  {
    id: 'totalOpenInterestBTC',
    title: 'Total Open Interest (BTC Futures)',
    description: 'Total USD value of outstanding BTC futures contracts (90 days).',
    componentType: 'd3SimpleLine',
    data: generateTimeSeries(90, 15e9, 1e9, 50e6), // Start 15B, fluctuate 1B, trend +50M/day
    yAxisLabel: 'USD Value',
    lineColor: 'var(--color-accent-gold-luminous)',
    gridWidth: 2, // Span two columns
  },
  {
    id: 'fundingRateHeatmap',
    title: 'Funding Rates Heatmap',
    description: 'Current funding rates for major assets across different exchanges.',
    componentType: 'd3FundingHeatmap',
    data: generateFundingRateData(),
    xAxisLabel: 'Exchange',
    yAxisLabel: 'Asset',
    gridWidth: 2,
  },
  {
    id: 'futuresTermStructureBTC',
    title: 'Futures Term Structure (BTC)',
    description: 'Current market prices for BTC futures contracts with varying expiry dates.',
    componentType: 'd3SimpleLine',
    data: generateTermStructureData(),
    yAxisLabel: 'Price (USD)',
    xAxisType: 'category', // X-axis is expiry month/year category
    lineColor: 'var(--color-accent-secondary-blue)',
    customTooltipFormatter: (d: TermStructureDataPoint) =>
      `<div><strong>Contract:</strong> ${d.contract}</div>
       <div><strong>Expiry:</strong> ${format(d.expiryDate, 'MMM dd, yyyy')}</div>
       <div><strong>Price:</strong> $${d.price.toLocaleString(undefined, {minimumFractionDigits:0, maximumFractionDigits: 0})}</div>`
  },
  // Existing Liquidations chart (Recharts) can be kept for variety
  {
    id: 'liquidationsTotal',
    title: 'Daily Liquidations (Longs vs Shorts)',
    description: 'Total USD value of liquidated long and short positions daily (Recharts).',
    componentType: 'recharts',
    chartType: 'bar',
    data: Array.from({ length: 30 }, (_, i) => ({ // Keep Recharts string date format for this one
      date: format(subDays(new Date(), 29 - i), 'yyyy-MM-dd'),
      longs: Math.floor(Math.random() * 50e6),
      shorts: Math.floor(Math.random() * 40e6),
    })),
    dataKey: 'longs',
    dataKey2: 'shorts',
    yAxisLabel: 'USD Value',
    positiveColor: 'var(--color-accent-secondary-red)',
    color2: 'var(--color-accent-secondary-green)',
  },
];


// Recharts Renderer (adapted from other on-chain pages)
const RenderRechart = ({ config }: { config: RechartsConfig }) => {
  const { dataKey, dataKey2, positiveColor, negativeColor, color2, chartType, yAxisLabel, data, title } = config;
   const commonLineProps = {
    type: "monotone" as const,
    stroke: positiveColor || "var(--color-accent-gold-luminous)",
    strokeWidth: 2,
    dot: { fill: indicator.positiveColor || "var(--color-accent-gold-luminous)", r: 3, strokeWidth:0 },
    activeDot: { r: 6, stroke: "var(--color-background-primary)", strokeWidth: 2, fill: positiveColor || "var(--color-accent-gold-highlight)" },
  };
  const chartMargins = { top: 10, right: 25, left: 40, bottom: 5 }; // Adjusted left for Y-axis label
  const gradientId = (type: string) => `${type}-${config.id.replace(/[^a-zA-Z0-9]/g, '-')}`;

  const yAxisTickFormatter = (value: any) => {
    if (config.id === 'fundingRateBTC') return `${(value * 100).toFixed(3)}%`; // Example, if keeping funding rate here
    if (typeof value === 'number') {
      if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
      if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
      if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(0)}K`; // No decimals for K
      return value.toLocaleString(undefined, {minimumFractionDigits:0, maximumFractionDigits:0}); // No decimals for raw numbers
    }
    return value;
  };

  const xAxisTickFormatter = (value: any) => {
    // For Recharts charts that use string dates like 'yyyy-MM-dd'
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return format(new Date(value), 'MMM dd'); // Show 'Jan 01'
    }
    return value; // For category based things like term structure 'Jan 24'
  };


  return (
    <ResponsiveContainer width="100%" height="100%">
      {chartType === 'line' && (
        <LineChart data={data} margin={chartMargins}>
          {/* ... (defs, CartesianGrid, XAxis, YAxis, Tooltip, Line, Area as before, ensuring dataKey and name are from config) */}
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-gridlines)" />
          <XAxis dataKey="date" stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} tickFormatter={xAxisTickFormatter} />
          <YAxis stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: 'var(--color-chart-axis-text)', fontSize: 10, dx: -35 }} tickFormatter={yAxisTickFormatter} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: positiveColor || 'var(--color-accent-gold-luminous)', strokeWidth: 1, strokeDasharray: '3 3' }} />
          <Line dataKey={dataKey} name={title} {...commonLineProps} />
        </LineChart>
      )}
      {chartType === 'bar' && config.id === 'liquidationsTotal' && dataKey2 && ( // Ensure it's the liquidations chart
        <BarChart data={data} margin={chartMargins}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-gridlines)" />
          <XAxis dataKey="date" stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} tickFormatter={xAxisTickFormatter} />
          <YAxis stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: 'var(--color-chart-axis-text)', fontSize: 10, dx: -35 }} tickFormatter={yAxisTickFormatter}/>
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(var(--rgb-accent-gold-luminous), 0.08)' }} />
          <Legend wrapperStyle={{fontSize: "10px", paddingTop: "10px"}}/>
          <Bar dataKey={dataKey} name="Long Liquidations" fill={positiveColor || "var(--color-accent-secondary-red)"} stackId="liquidations" />
          <Bar dataKey={dataKey2} name="Short Liquidations" fill={color2 || "var(--color-accent-secondary-green)"} stackId="liquidations" />
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
          <XAxis dataKey="date" stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} tickFormatter={xAxisTickFormatter} />
          <YAxis stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: 'var(--color-chart-axis-text)', fontSize: 10, dx: -35 }} tickFormatter={yAxisTickFormatter}/>
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: positiveColor || 'var(--color-accent-gold-luminous)', strokeWidth: 1, strokeDasharray: '3 3' }}/>
          <Area dataKey={dataKey} name={title} {...commonLineProps} fill={`url(#${gradientId('areaMain')})`} />
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
      <div className="dashboard-grid derivatives-futures-grid"> {/* Added specific class */}
        {futuresPageComponentConfigs.map((config) => (
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
              <div className="chart-container" style={{ height: '350px' }}>
                {config.componentType === 'recharts' && <RenderRechart config={config} />}
                {config.componentType === 'd3SimpleLine' && (
                  <SimpleLineChart
                    data={config.data as TimeSeriesDataPoint[] | TermStructureDataPoint[]}
                    yAxisLabel={config.yAxisLabel}
                    lineColor={config.lineColor}
                    // For Term Structure, SimpleLineChart needs to handle date vs category on X-axis
                    // and potentially a custom tooltip formatter from config.
                    // This might require enhancing SimpleLineChart or using a specific TermStructureChart.
                    // For now, passing data as is. Tooltip in SimpleLineChart expects date/value.
                    // For term structure, we pass `customTooltipFormatter` to SimpleLineChart props if we enhance it.
                  />
                )}
                {config.componentType === 'd3FundingHeatmap' && (
                  <FundingRateHeatmap
                    data={config.data as FundingRateDataPoint[]}
                    xAxisLabel={config.xAxisLabel}
                    yAxisLabel={config.yAxisLabel}
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

export default FuturesAnalysisPage;
