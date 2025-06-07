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
  ScatterChart, // Added ScatterChart
  Scatter,      // Added Scatter
  ZAxis,        // Added ZAxis for scatter plot bubble size
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

// Mock Data Structure
interface ChartDataPoint {
  date: string;
  value?: number;
  netChange?: number; // For Whale Net Position Change
  txAmount?: number;  // For Large Wallet Inflow/Outflow scatter plot
  txType?: 'inflow' | 'outflow' | 'neutral'; // For scatter plot coloring
  concentration?: number; // For Whale Concentration Index
  activeWhales?: number; // For Number of Active Whale Wallets
}

interface WhaleTrackingIndicator {
  id: string;
  title: string;
  chartType: 'line' | 'bar' | 'area' | 'scatter';
  data: ChartDataPoint[];
  description: string;
  yAxisLabel?: string;
  xAxisLabel?: string; // For scatter plot
  zAxisLabel?: string; // For scatter plot bubble size
  dataKeys: { x: string; y: string; z?: string, type?: string }; // More flexible for scatter
  colors?: string[]; // Primary color for single series, or array for specific uses
}

// Custom Tooltip (can be imported or defined)
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const point = payload[0].payload; // For scatter plots, label might be undefined
    const displayLabel = label || point.date || 'Data Point';

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
          {displayLabel}
        </p>
        {payload.map((pld: any, index: number) => (
          <p key={index} className="desc" style={{color: pld.color || pld.stroke || pld.fill || 'var(--color-text-primary)' }}>
            {`${pld.name}: ${pld.value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
            {pld.dataKey === 'txAmount' && point.txType && ` (${point.txType})`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const mockWhaleTrackingData: WhaleTrackingIndicator[] = [
  {
    id: 'whaleNetPositionChange',
    title: 'Whale Net Position Change (BTC)',
    chartType: 'bar',
    description: 'Daily net change in BTC holdings by identified whale wallets. Positive indicates accumulation, negative indicates distribution.',
    yAxisLabel: 'BTC Change',
    dataKeys: { x: 'date', y: 'netChange' },
    colors: ['var(--color-accent-gold-luminous)'], // Base color, will be conditional
    data: Array.from({ length: 30 }, (_, i) => ({
      date: `2023-10-${String(i + 1).padStart(2, '0')}`,
      netChange: Math.floor((Math.random() - 0.5) * 1000), // Positive or negative
    })),
  },
  {
    id: 'largeWalletTransactions',
    title: 'Large Wallet Transactions',
    chartType: 'scatter',
    description: 'Individual large transactions to/from exchanges. Bubble size indicates transaction amount.',
    xAxisLabel: 'Day of Month',
    yAxisLabel: 'Transaction Amount (BTC)',
    zAxisLabel: 'Amount',
    dataKeys: { x: 'date', y: 'txAmount', z: 'txAmount', type: 'txType' }, // z for bubble size, type for color
    data: Array.from({ length: 40 }, (_, i) => { // More data points for scatter
      const type = Math.random() > 0.5 ? 'inflow' : 'outflow';
      return {
        date: `2023-10-${String(Math.floor(i / 2) + 1).padStart(2, '0')}`, // Multiple tx per day
        txAmount: Math.floor(Math.random() * 500 + 50), // 50 to 550 BTC
        txType: type,
      };
    }),
  },
  {
    id: 'whaleConcentration',
    title: 'Whale Concentration Index',
    chartType: 'line',
    description: 'Percentage of total BTC supply held by the top 1% of addresses.',
    yAxisLabel: '% of Supply',
    dataKeys: { x: 'date', y: 'concentration' },
    colors: ['var(--color-accent-secondary-blue)'],
    data: Array.from({ length: 30 }, (_, i) => ({
      date: `2023-10-${String(i + 1).padStart(2, '0')}`,
      concentration: parseFloat((25 + Math.random() * 2 + i * 0.05).toFixed(2)), // Small fluctuations
    })),
  },
];

const RenderWhaleChart = ({ indicator }: { indicator: WhaleTrackingIndicator }) => {
  const chartMargins = { top: 5, right: 20, left: 35, bottom: 20 }; // Adjusted for axis labels

  const getBarFillColor = (value: number) => {
    if (indicator.id === 'whaleNetPositionChange') {
      return value >= 0 ? 'var(--color-accent-gold-luminous)' : 'var(--color-accent-secondary-red)';
    }
    return indicator.colors?.[0] || 'var(--color-accent-gold-luminous)';
  };

  const getScatterFillColor = (type?: 'inflow' | 'outflow' | 'neutral') => {
    if (type === 'inflow') return 'var(--color-accent-gold-luminous)';
    if (type === 'outflow') return 'var(--color-accent-secondary-red)';
    return 'var(--color-text-disabled)';
  };

  return (
    <ResponsiveContainer width="100%" height={280}> {/* Increased height for potentially complex charts */}
      {indicator.chartType === 'line' && (
        <LineChart data={indicator.data} margin={chartMargins}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-gridlines)" />
          <XAxis dataKey={indicator.dataKeys.x} stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} name={indicator.xAxisLabel || 'Date'} />
          <YAxis stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} label={{ value: indicator.yAxisLabel, angle: -90, position: 'insideLeft', fill: 'var(--color-chart-axis-text)', fontSize: 10, dx: -30 }} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: indicator.colors?.[0], strokeWidth: 1, strokeDasharray: '3 3' }} />
          <Legend wrapperStyle={{fontSize: "10px", paddingTop: "10px"}}/>
          <Line dataKey={indicator.dataKeys.y} name={indicator.title} stroke={indicator.colors?.[0]} strokeWidth={2} dot={{ fill: indicator.colors?.[0], strokeWidth:0, r:3 }} activeDot={{r:6, stroke: 'var(--color-background-primary)', strokeWidth:2, fill: indicator.colors?.[0]}}/>
        </LineChart>
      )}
      {indicator.chartType === 'bar' && (
        <BarChart data={indicator.data} margin={chartMargins}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-gridlines)" />
          <XAxis dataKey={indicator.dataKeys.x} stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} name={indicator.xAxisLabel || 'Date'} />
          <YAxis stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} label={{ value: indicator.yAxisLabel, angle: -90, position: 'insideLeft', fill: 'var(--color-chart-axis-text)', fontSize: 10, dx: -30 }} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(var(--rgb-accent-gold-luminous), 0.1)' }} />
          <Legend wrapperStyle={{fontSize: "10px", paddingTop: "10px"}}/>
          <Bar dataKey={indicator.dataKeys.y} name={indicator.title}>
            {indicator.data.map((entry, index) => (
              <rect key={`cell-${index}`} x={0} y={0} width={0} height={0} fill={getBarFillColor(entry[indicator.dataKeys.y as keyof ChartDataPoint] as number || 0)} />
            ))}
          </Bar>
        </BarChart>
      )}
       {indicator.chartType === 'area' && (
        <AreaChart data={indicator.data} margin={chartMargins}>
          <defs>
            <linearGradient id={`areaGradient-${indicator.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={indicator.colors?.[0]} stopOpacity={0.7}/>
              <stop offset="95%" stopColor={indicator.colors?.[0]} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-gridlines)" />
          <XAxis dataKey={indicator.dataKeys.x} stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} name={indicator.xAxisLabel || 'Date'} />
          <YAxis stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} label={{ value: indicator.yAxisLabel, angle: -90, position: 'insideLeft', fill: 'var(--color-chart-axis-text)', fontSize: 10, dx: -30 }} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: indicator.colors?.[0], strokeWidth: 1, strokeDasharray: '3 3' }}/>
          <Legend wrapperStyle={{fontSize: "10px", paddingTop: "10px"}}/>
          <Area type="monotone" dataKey={indicator.dataKeys.y} name={indicator.title} stroke={indicator.colors?.[0]} strokeWidth={2} fill={`url(#areaGradient-${indicator.id})`} dot={{ fill: indicator.colors?.[0], strokeWidth:0, r:3 }} activeDot={{r:6, stroke: 'var(--color-background-primary)', strokeWidth:2, fill: indicator.colors?.[0]}} />
        </AreaChart>
      )}
      {indicator.chartType === 'scatter' && indicator.dataKeys.z && (
        <ScatterChart margin={chartMargins}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-gridlines)" />
          <XAxis type="category" dataKey={indicator.dataKeys.x} name={indicator.xAxisLabel || 'Date'} stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} />
          <YAxis type="number" dataKey={indicator.dataKeys.y} name={indicator.yAxisLabel || 'Value'} stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} label={{ value: indicator.yAxisLabel, angle: -90, position: 'insideLeft', fill: 'var(--color-chart-axis-text)', fontSize: 10, dx: -30 }} />
          {indicator.dataKeys.z && <ZAxis type="number" dataKey={indicator.dataKeys.z} range={[50, 500]} name={indicator.zAxisLabel || 'Size'} />}
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: 'var(--color-text-disabled)' }} />
          <Legend wrapperStyle={{fontSize: "10px", paddingTop: "10px"}}/>
          <Scatter name={indicator.title} data={indicator.data} >
            {indicator.data.map((entry, index) => (
              <rect key={`cell-${index}`} x={0} y={0} width={0} height={0} fill={getScatterFillColor(entry[indicator.dataKeys.type as keyof ChartDataPoint] as 'inflow' | 'outflow' | 'neutral' | undefined)} />
            ))}
          </Scatter>
        </ScatterChart>
      )}
    </ResponsiveContainer>
  );
};

const WhaleTrackingPage: React.FC = () => {
  return (
    <div className="page-container">
      <h1 className="page-title">Whale Tracking Analysis</h1>
      <p className="page-subtitle" style={{color: 'var(--color-text-secondary)', marginTop: '-20px', marginBottom: '20px'}}>
        Monitoring the activity of large market participants (whales).
      </p>
      <div className="dashboard-grid">
        {mockWhaleTrackingData.map((indicator) => (
          <div key={indicator.id} className="dashboard-card">
            <div className="dashboard-card-header">
              <h3>{indicator.title}</h3>
            </div>
            <div className="dashboard-card-content">
              <p style={{ fontSize: '0.85rem', marginBottom: 'var(--spacing-unit)'}}>
                {indicator.description}
              </p>
              <div className="chart-container" style={{ height: '280px' }}> {/* Adjusted height for charts */}
                <RenderWhaleChart indicator={indicator} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhaleTrackingPage;
