import React from 'react';

const WTRCoreInsights: React.FC = () => {
  return (
    <section className="py-8 sm:py-12">
      <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center text-[var(--color-accent-gold-highlight)] border-b border-[var(--color-accent-gold)] pb-3">
        WTR Core Insights
      </h2>
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Insight Card 1 */}
        <div className="bg-[var(--color-background-secondary)] p-6 rounded-lg shadow-lg border border-[var(--color-border-primary)]">
          <h3 className="text-xl font-semibold mb-3 text-[var(--color-accent-gold-highlight)]">Market Anomaly Detected</h3>
          <p className="text-[var(--color-text-secondary)] text-sm">
            Placeholder: Significant deviation in BTC funding rates observed on major exchanges. Potential for short-term volatility increase.
          </p>
        </div>
        {/* Insight Card 2 */}
        <div className="bg-[var(--color-background-secondary)] p-6 rounded-lg shadow-lg border border-[var(--color-border-primary)]">
          <h3 className="text-xl font-semibold mb-3 text-[var(--color-accent-gold-highlight)]">On-Chain Spike Alert</h3>
          <p className="text-[var(--color-text-secondary)] text-sm">
            Placeholder: Unusual spike in dormant ETH wallet activity. Whales may be repositioning assets. Further analysis pending.
          </p>
        </div>
      </div>
    </section>
  );
};
export default WTRCoreInsights;
