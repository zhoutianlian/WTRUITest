import React from 'react';
import './SignalsPage.css'; // To be created

const signalsData = [
  {
    asset: 'Bitcoin (BTC)',
    signalType: 'BTC Momentum Shift (Long)',
    timestamp: '2023-11-15 14:30 UTC',
    confidence: 'High',
    status: 'Active',
  },
  {
    asset: 'Ethereum (ETH)',
    signalType: 'ETH Volatility Spike Alert',
    timestamp: '2023-11-15 09:15 UTC',
    confidence: 'Medium',
    status: 'Monitoring',
  },
  {
    asset: 'Solana (SOL)',
    signalType: 'SOL Breakout Pattern (Short)',
    timestamp: '2023-11-14 22:00 UTC',
    confidence: 'High',
    status: 'Closed (Target Hit)',
  },
  {
    asset: 'Cardano (ADA)',
    signalType: 'ADA Accumulation Zone',
    timestamp: '2023-11-15 18:45 UTC',
    confidence: 'Low',
    status: 'Active',
  },
];

const SignalsPage: React.FC = () => {
  return (
    <div className="page-container signals-page">
      <header className="page-header">
        <h1>WTR Trading Signals</h1>
      </header>
      <div className="page-content">
        <section className="content-section intro-section">
          <p>
            Leveraging advanced on-chain analysis, sophisticated market models, and AI-driven
            algorithms, WTR provides timely and actionable trading signals. Our system is
            designed to help you identify potential opportunities and risks in the dynamic
            cryptocurrency markets.
          </p>
        </section>

        <section className="content-section signal-categories">
          <h2 className="section-title">Signal Categories</h2>
          <div className="categories-list">
            <span>BTC Momentum Signals</span>
            <span>ETH Volatility Alerts</span>
            <span>Altcoin Breakouts</span>
            <span>On-Chain Anomaly Detection</span>
            <span>Large Cap Index Signals</span>
          </div>
        </section>

        <section className="content-section signals-table-section">
          <h2 className="section-title">Current Signals</h2>
          <div className="table-container">
            <table className="signals-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Signal Type</th>
                  <th>Timestamp</th>
                  <th>Confidence</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {signalsData.map((signal, index) => (
                  <tr key={index}>
                    <td>{signal.asset}</td>
                    <td>{signal.signalType}</td>
                    <td>{signal.timestamp}</td>
                    <td className={`confidence-${signal.confidence?.toLowerCase()}`}>{signal.confidence}</td>
                    <td>{signal.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="content-section disclaimer-section">
          <h3 className="disclaimer-title">Disclaimer</h3>
          <p>
            Trading signals and all information provided on this page are for informational
            purposes only. They do not constitute financial advice, investment advice, trading
            advice, or any other sort of advice and you should not treat any of the website's
            content as such. WTR does not recommend that any cryptocurrency should be bought,
            sold, or held by you. Conduct your own due diligence and consult your financial
            advisor before making any investment decisions.
          </p>
        </section>
      </div>
    </div>
  );
};

export default SignalsPage;
