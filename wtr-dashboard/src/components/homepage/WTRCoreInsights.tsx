import React from 'react';

const WTRCoreInsights: React.FC = () => {
  return (
    <section className="py-8 sm:py-12">
      <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center text-[var(--color-accent-gold-highlight)] border-b border-[var(--color-accent-gold)] pb-3">
        WTR Core Insights
      </h2>
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"> {/* Added padding to match dashboard sections */}
        {/* Insight Card 1 */}
        <div className="dashboard-card"> {/* Applied dashboard-card class */}
          <div className="dashboard-card-header">
            {/* Ensure h3 styling is picked up from .dashboard-card-header h3 in DashboardPage.css */}
            <h3>Market Anomaly Detected</h3>
          </div>
          <div className="dashboard-card-content">
            {/* Ensure p styling is picked up from .dashboard-card-content p in DashboardPage.css */}
            <p className="text-sm"> {/* text-sm might be redundant if base p style is already 0.9rem */}
              Placeholder: Significant deviation in BTC funding rates observed on major exchanges. Potential for short-term volatility increase.
            </p>
          </div>
        </div>
        {/* Insight Card 2 */}
        <div className="dashboard-card"> {/* Applied dashboard-card class */}
          <div className="dashboard-card-header">
            <h3>On-Chain Spike Alert</h3>
          </div>
          <div className="dashboard-card-content">
            <p className="text-sm">
              Placeholder: Unusual spike in dormant ETH wallet activity. Whales may be repositioning assets. Further analysis pending.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
export default WTRCoreInsights;
