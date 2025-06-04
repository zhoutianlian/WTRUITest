import React from 'react';

const FeaturedCapabilities: React.FC = () => {
  const capabilities = [
    { name: 'On-Chain Analysis', description: 'Deep dive into blockchain data, track whale movements, and uncover hidden alpha.' },
    { name: 'Derivatives Analysis', description: 'Comprehensive insights into futures, options, and perpetual swaps across exchanges.' },
    { name: 'Advanced Signals', description: 'Proprietary trading signals derived from complex data models and AI insights.' },
  ];

  return (
    <section className="py-8 sm:py-12 bg-[var(--color-background-primary)]"> // Slightly different background for separation if needed, or keep same
      <h2 className="text-2xl sm:text-3xl font-semibold mb-8 text-center text-[var(--color-accent-gold-highlight)] border-b border-[var(--color-accent-gold)] pb-3">
        Featured Capabilities
      </h2>
      <div className="grid md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
        {capabilities.map((cap) => (
          <div key={cap.name} className="bg-[var(--color-background-secondary)] p-6 rounded-lg shadow-xl border border-[var(--color-border-primary)] hover:shadow-2xl hover:border-[var(--color-accent-gold)] transition-all duration-300">
            <h3 className="text-xl font-semibold mb-3 text-[var(--color-accent-gold-highlight)]">{cap.name}</h3>
            <p className="text-[var(--color-text-secondary)] text-sm">{cap.description}</p>
            {/* Placeholder for a link/button */}
            <a href="#" className="inline-block mt-4 text-[var(--color-accent-gold)] hover:text-[var(--color-accent-gold-hover)] text-sm font-semibold">Learn More &rarr;</a>
          </div>
        ))}
      </div>
    </section>
  );
};
export default FeaturedCapabilities;
