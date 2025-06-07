import React from 'react';
import './derivatives/DerivativesPages.css'; // Using common derivatives page styles for layout
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ScatterChart,
  Scatter,
  ComposedChart,
  ReferenceLine,
} from 'recharts';
import * as d3 from 'd3';

// --- Data Interfaces ---
interface PnLDataPoint {
  date: string;
  pnl: number;
}

interface PriceDataPoint {
  date: string;
  price: number;
}

interface SignalPoint {
  date: string;
  type: 'buy' | 'sell';
  price: number;
  description?: string;
}

interface TradeData {
  id: string;
  pair: string;
  type: 'Buy' | 'Sell';
  entryPrice: number;
  exitPrice: number | string;
  pnlPercent: number;
  timestamp: string;
}

// --- Mock Data Generation ---
const generatePnLCurveData = (days = 60): PnLDataPoint[] => {
  let cumulativePnl = 1000;
  return Array.from({ length: days }, (_, i) => {
    cumulativePnl += (Math.random() - 0.45) * 50;
    const date = new Date(2023, 10, 1); // Start from Nov 1, 2023
    date.setDate(date.getDate() + i);
    return {
      date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      pnl: parseFloat(cumulativePnl.toFixed(2)),
    };
  });
};

const generatePriceAndSignalsData = (days = 60): { prices: PriceDataPoint[], signals: SignalPoint[] } => {
  const prices: PriceDataPoint[] = [];
  const signals: SignalPoint[] = [];
  let currentPrice = 40000;
  const startDate = new Date(2023, 10, 1); // Start from Nov 1, 2023

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const dateStr = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD

    prices.push({ date: dateStr, price: parseFloat(currentPrice.toFixed(2)) });

    if (Math.random() < 0.08) { // ~8% chance of a signal
      const type = Math.random() < 0.5 ? 'buy' : 'sell';
      signals.push({
        date: dateStr,
        type: type,
        price: parseFloat(currentPrice.toFixed(2)),
        description: `${type === 'buy' ? 'Potential breakout' : 'Possible reversal'}`,
      });
    }
    currentPrice += (Math.random() - 0.5) * 800;
    if (currentPrice < 30000) currentPrice = 30000 + Math.random() * 1000;
    if (currentPrice > 50000) currentPrice = 50000 - Math.random() * 1000;
  }
  return { prices, signals };
};

const mockRecentTrades: TradeData[] = [
  { id: 'T1001', pair: 'BTC/USD', type: 'Buy', entryPrice: 39500, exitPrice: 40100, pnlPercent: 1.52, timestamp: '2023-11-28 10:15 UTC' },
  { id: 'T1002', pair: 'ETH/USD', type: 'Sell', entryPrice: 2200, exitPrice: 2150, pnlPercent: 2.27, timestamp: '2023-11-28 14:30 UTC' },
  { id: 'T1003', pair: 'BTC/USD', type: 'Buy', entryPrice: 40200, exitPrice: 'Open', pnlPercent: 0.00, timestamp: '2023-11-29 09:00 UTC' },
  { id: 'T1004', pair: 'SOL/USD', type: 'Buy', entryPrice: 58.50, exitPrice: 61.20, pnlPercent: 4.62, timestamp: '2023-11-29 11:45 UTC' },
  { id: 'T1005', pair: 'BTC/USD', type: 'Sell', entryPrice: 40800, exitPrice: 40300, pnlPercent: -1.23, timestamp: '2023-11-30 08:20 UTC' }, // Example of negative P&L
];

const pnlCurveData = generatePnLCurveData();
const { prices: signalChartPriceData, signals: signalChartSignals } = generatePriceAndSignalsData();

// --- Custom Tooltip for Charts ---
const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const point = payload[0].payload; // Access the data point for richer tooltips

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
          <p key={index} className="desc" style={{color: pld.stroke || pld.fill || 'var(--color-text-primary)'}}>
            {`${pld.name}: ${pld.value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
          </p>
        ))}
        {/* Check if it's a signal point from the Scatter component */}
        {point.type && point.description && (
             <p className="desc" style={{color: point.type === 'buy' ? 'var(--color-accent-gold-luminous)' : 'var(--color-accent-secondary-red)', marginTop: 'calc(var(--spacing-unit)/2)'}}>
                Signal: {point.type.toUpperCase()} @ {point.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                <br/>Desc: {point.description}
            </p>
        )}
      </div>
    );
  }
  return null;
};

// --- Custom Shape for Scatter Signals ---
const SignalShape = (props: any) => {
  const { cx, cy, payload } = props; // payload here refers to the individual signal data point
  if (!cx || !cy) return null; // Avoid rendering if cx/cy are not valid

  const size = 8;
  const color = payload.type === 'buy' ? 'var(--color-accent-gold-luminous)' : 'var(--color-accent-secondary-red)';

  const points = payload.type === 'buy'
    ? `${cx},${cy - size} ${cx - size / 1.5},${cy + size / 2} ${cx + size / 1.5},${cy + size / 2}` // Triangle up
    : `${cx},${cy + size} ${cx - size / 1.5},${cy - size / 2} ${cx + size / 1.5},${cy - size / 2}`; // Triangle down

  return <polygon points={points} fill={color} stroke="var(--color-background-primary)" strokeWidth={1}/>;
};


const SignalsPage: React.FC = () => {
  const chartMargins = { top: 10, right: 30, left: 30, bottom: 5 };
  const tableDateFormatter = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'});
  };


  return (
    <div className="page-container">
      <h1 className="page-title">Trading Signals & Performance</h1>
      <p className="page-subtitle" style={{color: 'var(--color-text-secondary)', marginTop: '-20px', marginBottom: '30px'}}>
        Overview of strategy performance, signal occurrences, and recent simulated trade activity.
      </p>
      <div className="dashboard-grid">
        {/* P&L Curve Card */}
        <div className="dashboard-card">
          <div className="dashboard-card-header"><h3>Strategy Backtest P&L</h3></div>
          <div className="dashboard-card-content">
            <p style={{ fontSize: '0.85rem', marginBottom: 'var(--spacing-unit)'}}>Cumulative profit and loss over the backtesting period.</p>
            <div className="chart-container" style={{ height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={pnlCurveData} margin={chartMargins}>
                  <defs>
                    <linearGradient id="pnlGradientSignalPage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-accent-gold-luminous)" stopOpacity={0.7}/>
                      <stop offset="95%" stopColor="var(--color-accent-gold-luminous)" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-gridlines)" />
                  <XAxis dataKey="date" stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} tickFormatter={(tick) => new Date(tick).toLocaleDateString('en-US', {month:'short', day:'numeric'})} />
                  <YAxis stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} label={{ value: 'Cumulative P&L (USD)', angle: -90, position: 'insideLeft', fill: 'var(--color-chart-axis-text)', fontSize: 10, dx:-25 }} tickFormatter={(val) => `$${val.toLocaleString()}`}/>
                  <Tooltip content={<CustomChartTooltip />} cursor={{ stroke: 'var(--color-accent-gold-luminous)', strokeWidth: 1 }}/>
                  <Area type="monotone" dataKey="pnl" name="P&L" stroke="var(--color-accent-gold-luminous)" strokeWidth={2} fill="url(#pnlGradientSignalPage)" dot={{ fill: "var(--color-accent-gold-luminous)", r: 2 }} activeDot={{ r: 5, stroke: "var(--color-background-primary)" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Signal Occurrences Card */}
        <div className="dashboard-card">
          <div className="dashboard-card-header"><h3>Signal Occurrences on Price Chart (BTC/USD)</h3></div>
          <div className="dashboard-card-content">
             <p style={{ fontSize: '0.85rem', marginBottom: 'var(--spacing-unit)'}}>Visual representation of buy/sell signals overlaid on the price chart.</p>
            <div className="chart-container" style={{ height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart margin={chartMargins}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-gridlines)" />
                  <XAxis dataKey="date" stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} data={signalChartPriceData} tickFormatter={(tick) => new Date(tick).toLocaleDateString('en-US', {month:'short', day:'numeric'})}/>
                  <YAxis yAxisId="left" stroke="var(--color-chart-axis-text)" tick={{ fill: 'var(--color-chart-axis-text)', fontSize: 10 }} label={{ value: 'Price (USD)', angle: -90, position: 'insideLeft', fill: 'var(--color-chart-axis-text)', fontSize: 10, dx:-25 }} tickFormatter={(val) => `$${val.toLocaleString()}`} />
                  <Tooltip content={<CustomChartTooltip />} cursor={{ stroke: 'var(--color-accent-gold-luminous)', strokeWidth: 1 }}/>
                  <Legend wrapperStyle={{fontSize: "10px", paddingTop: "10px"}}/>
                  <Area yAxisId="left" type="monotone" dataKey="price" name="Price" data={signalChartPriceData} stroke="var(--color-accent-secondary-blue)" fill="rgba(var(--rgb-accent-secondary-blue), 0.1)" strokeWidth={2} dot={false} activeDot={{r:4}}/>
                  <Scatter yAxisId="left" name="Signals" data={signalChartSignals} shape={<SignalShape />} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Simulated Trades Table Card */}
        <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}> {/* Make table span full width */}
          <div className="dashboard-card-header"><h3>Recent Simulated Trades</h3></div>
          <div className="dashboard-card-content">
            <p style={{ fontSize: '0.85rem', marginBottom: 'var(--spacing-unit)'}}>A log of the latest trades executed by the signaling strategy.</p>
            <div className="table-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <table className="wtr-table"> {/* Add class for styling */}
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Pair</th>
                    <th>Type</th>
                    <th>Entry Price</th>
                    <th>Exit Price</th>
                    <th>P&L (%)</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {mockRecentTrades.map(trade => (
                    <tr key={trade.id}>
                      <td>{trade.id}</td>
                      <td>{trade.pair}</td>
                      <td style={{ color: trade.type === 'Buy' ? 'var(--color-accent-gold-luminous)' : 'var(--color-accent-secondary-red)' }}>{trade.type}</td>
                      <td>{trade.entryPrice.toLocaleString()}</td>
                      <td>{typeof trade.exitPrice === 'number' ? trade.exitPrice.toLocaleString() : trade.exitPrice}</td>
                      <td style={{ color: trade.pnlPercent >= 0 ? 'var(--color-accent-gold-luminous)' : 'var(--color-accent-secondary-red)' }}>
                        {trade.pnlPercent.toFixed(2)}%
                      </td>
                      <td>{tableDateFormatter(trade.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignalsPage;
