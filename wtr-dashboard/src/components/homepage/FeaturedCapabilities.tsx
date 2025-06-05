import React from 'react';
import { Link } from 'react-router-dom'; // Added import

const FeaturedCapabilities: React.FC = () => {
  const capabilities = [
    { name: 'On-Chain Analysis', description: 'Deep dive into blockchain data, track whale movements, and uncover hidden alpha.', path: '/on-chain' },
    { name: 'Derivatives Analysis', description: 'Comprehensive insights into futures, options, and perpetual swaps across exchanges.', path: '/derivatives' },
    { name: 'Advanced Signals', description: 'Proprietary trading signals derived from complex data models and AI insights.', path: '/signals' },
  ];

  return (
    <section className="py-8 sm:py-12 bg-[var(--color-background-primary)]">
      <h2 className="text-2xl sm:text-3xl font-semibold mb-8 text-center text-[var(--color-accent-gold-highlight)] border-b border-[var(--color-accent-gold)] pb-3">
        Featured Capabilities
      </h2>
      <div className="grid md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"> {/* Added padding to match dashboard sections */}
        {capabilities.map((cap) => (
          <div key={cap.name} className="dashboard-card"> {/* Applied dashboard-card class */}
            <div className="dashboard-card-header">
              {/* h3 color will be handled by .dashboard-card-header h3 style */}
              <h3>{cap.name}</h3>
            </div>
            <div className="dashboard-card-content">
              {/* p color will be handled by .dashboard-card-content p style */}
              <p className="text-sm">{cap.description}</p>
              {/* Link styling will be handled by .dashboard-card-content a style */}
              <Link to={cap.path} className="inline-block mt-auto text-sm font-semibold">
                Learn More &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
export default FeaturedCapabilities;
