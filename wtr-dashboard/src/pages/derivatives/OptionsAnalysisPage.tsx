import React from 'react';
import './DerivativesPages.css'; // Shared CSS
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
  ZAxis, // For ScatterChart color/size encoding
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ScatterChart, // For IV Surface Heatmap attempt
  Scatter,      // For IV Surface Heatmap attempt
  ReferenceLine,
} from 'recharts';
import * as d3 from 'd3';
import { format, subDays, addMonths, setDate } from 'date-fns';

// Import custom D3 charts
import SimpleLineChart from '../../components/charts/SimpleLineChart';
import SimpleBarChart from '../../components/charts/SimpleBarChart';
import IVSurfaceChart, { IVSurfaceDataPoint } from '../../components/charts/IVSurfaceChart';

// --- Data Structures ---
interface TimeSeriesDataPoint {
  date: Date;
  value: number;
  dateString?: string;
}

interface CategoricalDataPoint {
  category: string;
  value: number;
  type?: 'Call' | 'Put'; // For OI by Strike if differentiating
}

// For existing Recharts data that uses string dates
interface RechartsOriginalDataPoint {
    date?: string;
    category?: string;
    value: number;
    value2?: number;
    calls?: number;
    puts?: number;
    iv?: number;
    daysToExpiry?: number;
    strike?: number;
}


interface BaseConfig {
  id: string;
  title: string;
  description: string;
  gridWidth?: number;
}

interface RechartsConfig extends BaseConfig {
  componentType: 'recharts';
  chartType: 'line' | 'bar' | 'area'; // Scatter removed, will use D3 for IV surface
  data: RechartsOriginalDataPoint[];
  dataKey: string;
  dataKey2?: string;
  yAxisLabel?: string;
  xAxisLabel?: string;
  positiveColor?: string;
  negativeColor?: string;
  color2?: string;
  isIVSurface?: boolean; // Kept if Recharts tooltip needs it for other charts
}

interface D3SimpleLineConfig extends BaseConfig {
  componentType: 'd3SimpleLine';
  data: TimeSeriesDataPoint[];
  yAxisLabel?: string;
  lineColor?: string;
}

interface D3SimpleBarConfig extends BaseConfig {
  componentType: 'd3SimpleBar';
  data: CategoricalDataPoint[];
  yAxisLabel?: string;
  // barColor could be a prop
}

interface D3IVSurfaceConfig extends BaseConfig {
  componentType: 'd3IVSurface';
  data: IVSurfaceDataPoint[];
  // Specific props for IV Surface chart if any
}

type ComponentConfig = RechartsConfig | D3SimpleLineConfig | D3SimpleBarConfig | D3IVSurfaceConfig;


// Custom Tooltip (Recharts only)
const CustomTooltip = ({ active, payload, label, ...rest }: any) => {
  if (active && payload && payload.length) {
    // Accessing context passed to Tooltip content prop
    const contextIndicator = (rest as any).indicatorContext as Indicator | undefined;

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
          {contextIndicator?.isIVSurface ? `Strike: ${payload[0].payload.strike}, DTE: ${payload[0].payload.daysToExpiry}` : label}
        </p>
        {payload.map((pld: any, index: number) => {
          const valueExists = pld.value !== undefined && pld.value !== null;
          let formattedValue = 'N/A';
          let displayName = pld.name;

          if (valueExists) {
            if (contextIndicator?.isIVSurface && pld.dataKey === 'iv') {
              formattedValue = `${(pld.value * 100).toFixed(1)}%`;
              displayName = "Implied Vol";
            } else if (displayName === "Put/Call Ratio") { // Check against displayName from data series
                formattedValue = pld.value.toFixed(2);
            } else if (displayName === "IV Skew") { // Check against displayName
                formattedValue = `${(pld.value * 100).toFixed(1)}%`;
            }
             else { // Default for volume, etc.
                formattedValue = pld.value.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0});
            }
          }

          return (
            <p key={index} className="desc" style={{ color: pld.stroke || pld.fill || 'var(--color-text-primary)' }}>
              {`${displayName}: ${formattedValue}`}
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
    data.push({ date, value: parseFloat(val.toFixed(4)), dateString: format(date, 'yyyy-MM-dd') });
  }
  return data;
};

const generateIVSurfaceData = (): IVSurfaceDataPoint[] => {
  const surfaceData: IVSurfaceDataPoint[] = [];
  const expiries = [7, 14, 30, 60, 90, 180]; // Days
  const strikes = [50000, 55000, 58000, 60000, 62000, 65000, 68000, 70000, 75000];
  const atmStrike = 60000;
  const baseIV = 0.50; // 50%
  expiries.forEach(dte => {
    strikes.forEach(strike => {
      let iv = baseIV;
      // Smile/Skew: Higher IV for OTM strikes, more pronounced for shorter expiries
      const moneyness = Math.log(strike / atmStrike) / (Math.sqrt(dte / 365)); // Simplified moneyness
      iv += Math.abs(moneyness) * 0.15 + Math.pow(moneyness,2)*0.05; // Basic smile shape
      if (moneyness < 0) iv += Math.abs(moneyness) * 0.05; // Add some put skew
      // Term structure: upward sloping for shorter DTEs
      iv += (30-Math.min(dte,30)) * 0.001;
      iv = Math.max(0.20, Math.min(iv, 1.20)); // Clamp IV between 20% and 120%
      surfaceData.push({ timeToExpiryDays: dte, strike: strike, iv: parseFloat(iv.toFixed(3)) });
    });
  });
  return surfaceData;
};

const generateOIByStrikeData = (numStrikes: number): CategoricalDataPoint[] => {
  const data: CategoricalDataPoint[] = [];
  const baseStrike = 55000;
  const strikeIncrement = 1000;
  for (let i = 0; i < numStrikes; i++) {
    const strike = baseStrike + i * strikeIncrement;
    data.push({
      category: `${strike / 1000}k`, // e.g., "55k"
      value: Math.floor(Math.random() * 2000 + 200), // OI in contracts
      // type: Math.random() > 0.5 ? 'Call' : 'Put' // If differentiating
    });
  }
  return data;
};


// --- Page Specific Configurations ---
const optionsPageComponentConfigs: ComponentConfig[] = [
  {
    id: 'ivSurfaceBTC',
    title: 'Implied Volatility Surface (BTC)',
    description: 'IV across different strike prices and times to expiry. (D3 Heatmap)',
    componentType: 'd3IVSurface',
    data: generateIVSurfaceData(),
    gridWidth: 2, // Span two columns
  },
  {
    id: 'ivSkew25Delta',
    title: '25-Delta Skew (BTC - 90 Days)',
    description: 'Time-series of the 25-delta skew (difference between 25D Put IV and 25D Call IV). (D3 Line)',
    componentType: 'd3SimpleLine',
    data: generateTimeSeries(90, 0.05, 0.02, 0.0001), // Skew typically a small percentage
    yAxisLabel: 'Skew Value',
    lineColor: 'var(--color-accent-secondary-teal, #4DB6AC)',
  },
  {
    id: 'oiByStrikeBTC',
    title: 'Open Interest by Strike (BTC - Near Month)',
    description: 'Open interest at different strike prices for near-month BTC options. (D3 Bar)',
    componentType: 'd3SimpleBar',
    data: generateOIByStrikeData(10),
    yAxisLabel: 'Open Interest (Contracts)',
  },
  // Keeping existing Put/Call Ratio from Recharts for variety
  {
    id: 'putCallRatio',
    title: 'Put/Call Ratio (Daily Volume - Recharts)',
    description: 'Ratio of put options volume to call options volume. A rising ratio can indicate bearish sentiment.',
    componentType: 'recharts',
    chartType: 'line',
    data: Array.from({ length: 30 }, (_, i) => ({ // Original Recharts data format
      date: format(subDays(new Date(), 29-i), 'yyyy-MM-dd'),
      value: parseFloat((0.6 + Math.random() * 0.4 + Math.sin(i/10)*0.1).toFixed(2)),
    })),
    dataKey: 'value',
    yAxisLabel: 'Ratio',
    positiveColor: 'var(--color-accent-gold-burnished)',
  },
];


// Recharts Renderer (minor adaptations from other pages)
const RenderRechart = ({ config }: { config: RechartsConfig }) => {
  const { dataKey, dataKey2, positiveColor, negativeColor, color2, chartType, yAxisLabel, xAxisLabel, data, title, isIVSurface } = config;
   const commonLineProps = {
    type: "monotone" as const,
    stroke: positiveColor || "var(--color-accent-gold-luminous)",
    strokeWidth: 2,
    dot: { fill: indicator.positiveColor || "var(--color-accent-gold-luminous)", r: 3, strokeWidth:0 },
    activeDot: { r: 6, stroke: "var(--color-background-primary)", strokeWidth: 2, fill: positiveColor || "var(--color-accent-gold-highlight)" },
  };
  const chartMargins = { top: 10, right: 30, left: 45, bottom: 25 };
  const gradientId = (type: string) => `${type}-${config.id.replace(/[^a-zA-Z0-9]/g, '-')}`;

  const yAxisTickFormatter = (value: any) => {
    if (config.id === 'putCallRatio') return typeof value === 'number' ? value.toFixed(2) : value;
    if (typeof value === 'number') {
        if (Math.abs(value) >= 1e3 && !config.yAxisLabel?.includes('Contracts')) return `${(value/1e3).toFixed(0)}k`;
        return value.toLocaleString(undefined, {minimumFractionDigits:0, maximumFractionDigits:0});
    }
    return value;
  };

  const xAxisTickFormatter = (value: any) => {
    if (config.id === 'optionsVolumeStrike' || config.id === 'ivSkewBTC') return value; // category is already '38k' etc.
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}$/)) return format(new Date(value), 'MMM dd');
    return value;
  };

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
          <XAxis dataKey={xAxisLabel ? "category" : "date"} name={xAxisLabel} stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} tickFormatter={xAxisTickFormatter} label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', dy:15, fill: 'var(--color-chart-axis-text)', fontSize: 10 } : undefined} />
          <YAxis stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: 'var(--color-chart-axis-text)', fontSize: 10, dx: -40 }} tickFormatter={yAxisTickFormatter} />
          <Tooltip content={<CustomTooltip indicatorContext={config} />} cursor={{ stroke: positiveColor || 'var(--color-accent-gold-luminous)', strokeWidth: 1, strokeDasharray: '3 3' }} />
          <Line dataKey={dataKey} name={title} {...commonLineProps} />
          <Area type="monotone" dataKey={dataKey} strokeWidth={0} fill={`url(#${gradientId('lineShadow')})`} />
        </LineChart>
      )}
      {/* Other Recharts types like bar, area can be added here if needed for other configs */}
    </ResponsiveContainer>
  );
};


const OptionsAnalysisPage: React.FC = () => {
  return (
    <div className="page-container">
      <h1 className="page-title">Options Market Analysis</h1>
      <p className="page-subtitle" style={{color: 'var(--color-text-secondary)', marginTop: '-20px', marginBottom: '30px'}}>
        Analyzing options data including IV surface, skew, and open interest by strike.
      </p>
      <div className="dashboard-grid derivatives-options-grid"> {/* Added specific class */}
        {optionsPageComponentConfigs.map((config) => (
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
              <div className="chart-container" style={{ height: config.componentType === 'd3IVSurface' ? '450px' : '350px' }}>
                {config.componentType === 'recharts' && <RenderRechart config={config} />}
                {config.componentType === 'd3SimpleLine' && (
                  <SimpleLineChart
                    data={config.data as TimeSeriesDataPoint[]}
                    yAxisLabel={config.yAxisLabel}
                    lineColor={config.lineColor}
                  />
                )}
                {config.componentType === 'd3SimpleBar' && (
                  <SimpleBarChart
                    data={config.data as CategoricalDataPoint[]}
                    yAxisLabel={config.yAxisLabel}
                  />
                )}
                {config.componentType === 'd3IVSurface' && (
                  <IVSurfaceChart
                    data={config.data as IVSurfaceDataPoint[]}
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

export default OptionsAnalysisPage;
