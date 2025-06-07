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
import * as d3 from 'd3'; // For color manipulation and scales

// Interfaces
interface ChartDataPoint {
  date?: string; // For time-series or categorical like Term Structure
  category?: string; // For categorical axes like Strike for Volume/Skew
  value: number;
  value2?: number; // For grouped/stacked bars (e.g., Calls vs Puts volume)
  iv?: number; // For IV Surface
  daysToExpiry?: number; // For IV Surface Y-axis
  strike?: number; // For IV Surface X-axis
}

interface Indicator {
  id: string;
  title: string;
  chartType: 'line' | 'bar' | 'area' | 'scatter'; // Added scatter for IV Surface
  data: ChartDataPoint[];
  description: string;
  yAxisLabel?: string;
  xAxisLabel?: string; // For IV Surface
  dataKey: string;
  dataKey2?: string;
  positiveColor?: string;
  negativeColor?: string;
  color2?: string;
  isIVSurface?: boolean; // Flag for special handling
}

// Custom Tooltip (adapted from FuturesAnalysisPage)
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


// Mock Data for Options Analysis
const optionsAnalysisData: Indicator[] = [
  {
    id: 'optionsVolumeStrike',
    title: 'Options Volume by Strike (BTC - Near Month)',
    chartType: 'bar',
    description: 'Trading volume (Calls vs Puts) at different strike prices for near-month expiry contracts.',
    yAxisLabel: 'Volume (Contracts)',
    xAxisLabel: 'Strike Price',
    dataKey: 'calls',
    dataKey2: 'puts',
    positiveColor: 'var(--color-accent-gold-luminous)', // Calls
    color2: 'var(--color-accent-secondary-blue)',      // Puts
    data: [
      { category: '38k', value: 0, calls: 1200, puts: 800 }, // Using k for brevity
      { category: '39k', value: 0, calls: 1500, puts: 950 },
      { category: '40k', value: 0, calls: 2200, puts: 1300 },
      { category: '41k', value: 0, calls: 1800, puts: 1100 },
      { category: '42k', value: 0, calls: 1300, puts: 700 },
    ],
  },
  {
    id: 'putCallRatio',
    title: 'Put/Call Ratio (Daily Volume)',
    chartType: 'line',
    description: 'Ratio of put options volume to call options volume. A rising ratio can indicate bearish sentiment.',
    yAxisLabel: 'Ratio',
    dataKey: 'value',
    positiveColor: 'var(--color-accent-gold-burnished)',
    data: Array.from({ length: 30 }, (_, i) => ({
      date: `2023-11-${String(i + 1).padStart(2, '0')}`,
      value: parseFloat((0.6 + Math.random() * 0.4 + Math.sin(i/10)*0.1).toFixed(2)),
    })),
  },
  {
    id: 'ivSkewBTC',
    title: 'Implied Volatility Skew (BTC - Near Month)',
    chartType: 'line',
    description: 'Difference in implied volatility between out-of-the-money puts and calls.',
    yAxisLabel: 'IV (%)',
    xAxisLabel: 'Moneyness / Strike',
    dataKey: 'value',
    positiveColor: 'var(--color-accent-secondary-red)',
    data: [
      { category: '25D Put', value: 0.65 + Math.random()*0.05 },
      { category: 'ATM', value: 0.60 + Math.random()*0.02 },
      { category: '25D Call', value: 0.58 + Math.random()*0.03 },
      { category: '40D Call', value: 0.59 + Math.random()*0.03 },
    ],
  },
  {
    id: 'ivSurfaceBTC',
    title: 'Implied Volatility Surface (BTC)',
    chartType: 'scatter',
    description: 'Heatmap representation of implied volatility across different strike prices and times to expiry.',
    yAxisLabel: 'Days to Expiry (DTE)',
    xAxisLabel: 'Strike Price ($)',
    dataKey: 'iv',
    isIVSurface: true,
    data: ((): ChartDataPoint[] => {
      const surfaceData: ChartDataPoint[] = [];
      const expiries = [7, 14, 30, 60, 90];
      const strikes = [36000, 38000, 39000, 40000, 41000, 42000, 44000, 46000];
      const atmStrike = 40000; // Assumed ATM for smile generation
      const baseIV = 0.55;
      expiries.forEach(dte => {
        strikes.forEach(strike => {
          let iv = baseIV;
          iv += Math.pow((strike - atmStrike) / 1000, 2) * (0.002 + dte * 0.00005); // Smile effect, wider with DTE
          iv += dte * 0.0003; // Term structure effect
          iv = Math.max(0.30, Math.min(iv, 0.95)); // Clamp IV
          surfaceData.push({ daysToExpiry: dte, strike: strike, value: 0, iv: parseFloat(iv.toFixed(3)) });
        });
      });
      return surfaceData;
    })(),
  },
];

// Recharts Color Scale for IV Surface
const ivColorScale = d3.scaleSequential(d3.interpolateYlOrBr).domain([0.4, 0.75]); // Adjusted domain for typical IVs

// RenderChart Component (adapted for Options)
const RenderChart = ({ indicator }: { indicator: Indicator }) => {
  const commonLineProps = {
    type: "monotone" as const,
    stroke: indicator.positiveColor || "var(--color-accent-gold-luminous)",
    strokeWidth: 2,
    dot: { fill: indicator.positiveColor || "var(--color-accent-gold-luminous)", r: 3, strokeWidth:0 },
    activeDot: { r: 6, stroke: "var(--color-background-primary)", strokeWidth: 2, fill: indicator.positiveColor || "var(--color-accent-gold-highlight)" },
  };
  const chartMargins = { top: 10, right: 30, left: 45, bottom: 25 }; // Adjusted margins

  const gradientId = (type: string) => `${type}-${indicator.id.replace(/[^a-zA-Z0-9]/g, '-')}`;

  const yAxisTickFormatter = (value: any) => {
    if (indicator.id === 'ivSkewBTC' || (indicator.isIVSurface && indicator.dataKey === 'iv')) return `${(value * 100).toFixed(0)}%`;
    if (indicator.id === 'putCallRatio') return value.toFixed(2);
    if (typeof value === 'number') {
        if (Math.abs(value) >= 1e3 && indicator.id !== 'optionsVolumeStrike' && !indicator.yAxisLabel?.includes('DTE')) return `${(value/1e3).toFixed(0)}k`;
        return value.toLocaleString(undefined, {minimumFractionDigits:0, maximumFractionDigits:0});
    }
    return value;
  };

  const xAxisTickFormatter = (value: any) => {
    if (indicator.id === 'optionsVolumeStrike' || indicator.id === 'ivSkewBTC') return value; // category is already '38k' etc.
    if (indicator.isIVSurface) return `${(value/1000)}k`; // Strike for IV surface
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}$/)) return value.substring(5);
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
          <XAxis dataKey={indicator.xAxisLabel ? "category" : "date"} name={indicator.xAxisLabel} stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} tickFormatter={xAxisTickFormatter} label={indicator.xAxisLabel ? { value: indicator.xAxisLabel, position: 'insideBottom', dy:15, fill: 'var(--color-chart-axis-text)', fontSize: 10 } : undefined} />
          <YAxis stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} label={{ value: indicator.yAxisLabel, angle: -90, position: 'insideLeft', fill: 'var(--color-chart-axis-text)', fontSize: 10, dx: -40 }} tickFormatter={yAxisTickFormatter} />
          <Tooltip content={<CustomTooltip indicatorContext={indicator} />} cursor={{ stroke: indicator.positiveColor || 'var(--color-accent-gold-luminous)', strokeWidth: 1, strokeDasharray: '3 3' }} />
          <Line dataKey={indicator.dataKey} name={indicator.title} {...commonLineProps} />
          <Area type="monotone" dataKey={indicator.dataKey} strokeWidth={0} fill={`url(#${gradientId('lineShadow')})`} />
        </LineChart>
      )}
      {indicator.chartType === 'bar' && (
        <BarChart data={indicator.data} margin={chartMargins}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-gridlines)" />
          <XAxis dataKey="category" name={indicator.xAxisLabel} stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} label={indicator.xAxisLabel ? { value: indicator.xAxisLabel, position: 'insideBottom', dy:15, fill: 'var(--color-chart-axis-text)', fontSize: 10 } : undefined} />
          <YAxis stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} label={{ value: indicator.yAxisLabel, angle: -90, position: 'insideLeft', fill: 'var(--color-chart-axis-text)', fontSize: 10, dx: -40 }} tickFormatter={yAxisTickFormatter}/>
          <Tooltip content={<CustomTooltip indicatorContext={indicator}/>} cursor={{ fill: 'rgba(var(--rgb-accent-gold-luminous), 0.08)' }} />
          <Legend wrapperStyle={{fontSize: "10px", paddingTop: "10px"}}/>
          <Bar dataKey={indicator.dataKey} name="Calls" fill={indicator.positiveColor || "var(--color-accent-gold-luminous)"} />
          {indicator.dataKey2 && <Bar dataKey={indicator.dataKey2} name="Puts" fill={indicator.color2 || "var(--color-accent-secondary-blue)"} />}
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
         <YAxis stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} label={{ value: indicator.yAxisLabel, angle: -90, position: 'insideLeft', fill: 'var(--color-chart-axis-text)', fontSize: 10, dx: -40 }} tickFormatter={yAxisTickFormatter}/>
         <Tooltip content={<CustomTooltip indicatorContext={indicator} />} cursor={{ stroke: indicator.positiveColor || 'var(--color-accent-gold-luminous)', strokeWidth: 1, strokeDasharray: '3 3' }}/>
         <Area dataKey={indicator.dataKey} name={indicator.title} {...commonLineProps} fill={`url(#${gradientId('areaMain')})`} />
       </AreaChart>
      )}
      {indicator.chartType === 'scatter' && indicator.isIVSurface && (
        <ScatterChart margin={{ top: 10, right: 30, bottom: 30, left: 50 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-gridlines)" />
          <XAxis type="number" dataKey="strike" name="Strike" stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} domain={['dataMin - 1000', 'dataMax + 1000']} label={{ value: indicator.xAxisLabel, position: 'insideBottom', dy:15, fill: 'var(--color-chart-axis-text)', fontSize: 10 }} tickFormatter={(val) => `${(val/1000)}k`} />
          <YAxis type="number" dataKey="daysToExpiry" name="Days to Expiry" stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} domain={['dataMin - 2', 'dataMax + 5']} label={{ value: indicator.yAxisLabel, angle: -90, position: 'insideLeft', fill: 'var(--color-chart-axis-text)', fontSize: 10, dx: -45 }} />
          <ZAxis type="number" dataKey="iv" range={[60, 500]} name="Implied Volatility" />
          <Tooltip content={<CustomTooltip indicatorContext={indicator} />} cursor={{ stroke: 'var(--color-accent-gold-luminous)', strokeWidth: 1, strokeDasharray: '3 3' }}/>
          <Scatter name={indicator.title} data={indicator.data} >
            {indicator.data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={ivColorScale(entry.iv || 0)} />
            ))}
          </Scatter>
        </ScatterChart>
      )}
    </ResponsiveContainer>
  );
};


const OptionsAnalysisPage: React.FC = () => {
  return (
    <div className="page-container">
      <h1 className="page-title">Options Market Analysis</h1>
      <p className="page-subtitle" style={{color: 'var(--color-text-secondary)', marginTop: '-20px', marginBottom: '30px'}}>
        Analyzing options data including volume, open interest, put/call ratios, and implied volatility metrics.
      </p>
      <div className="dashboard-grid">
        {optionsAnalysisData.map((indicator) => (
          <div key={indicator.id} className="dashboard-card">
            <div className="dashboard-card-header">
              <h3>{indicator.title}</h3>
            </div>
            <div className="dashboard-card-content">
              <p style={{ fontSize: '0.85rem', marginBottom: 'var(--spacing-unit)'}}>
                {indicator.description}
              </p>
              <div className="chart-container" style={{ height: indicator.isIVSurface ? '400px' : '320px' }}> {/* Larger for IV Surface */}
                <RenderChart indicator={indicator} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OptionsAnalysisPage;
