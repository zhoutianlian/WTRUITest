import React from 'react';
import './WTRCoreInsights.css';

const WTRCoreInsights: React.FC = () => {
  return (
    <section id="wtr-core-insights" className="homepage-section wtr-core-insights">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="section-title">WTR Core Insights</h2>
        <div className="insights-grid">
          {/* Placeholder for 1-2 high-value signals/anomalies cards */}
          <div className="insight-card">
            <h3>Signal/Anomaly 1</h3>
            <p>Description of the insight or data point. Charts or key numbers could go here.</p>
          </div>
          <div className="insight-card">
            <h3>Signal/Anomaly 2</h3>
            <p>Description of the insight or data point. Further details and context.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WTRCoreInsights;
