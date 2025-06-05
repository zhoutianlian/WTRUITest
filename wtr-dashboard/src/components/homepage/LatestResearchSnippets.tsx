import React from 'react';
import { Link } from 'react-router-dom'; // Added import

const LatestResearchSnippets: React.FC = () => {
  const snippets = [
    { title: 'The Rise of Decentralized Options Vaults', summary: 'An in-depth look at DOVs, their risk/reward profiles, and impact on DeFi volatility markets.', pathSlug: 'decentralized-options-vaults' },
    { title: 'Cross-Chain Arbitrage: Opportunities & Challenges', summary: 'Exploring new arbitrage vectors in a multi-chain world and the infrastructure required.', pathSlug: 'cross-chain-arbitrage' },
  ];

  return (
    <section className="py-8 sm:py-12">
      <h2 className="text-2xl sm:text-3xl font-semibold mb-8 text-center text-[var(--color-accent-gold-highlight)] border-b border-[var(--color-accent-gold)] pb-3">
        Latest Research
      </h2>
      <div className="space-y-6 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8"> {/* Added padding to match dashboard sections */}
        {snippets.map((snippet) => (
          <div key={snippet.title} className="dashboard-card"> {/* Applied dashboard-card class */}
            <div className="dashboard-card-header">
              {/* h3 color will be handled by .dashboard-card-header h3 style */}
              <h3>{snippet.title}</h3>
            </div>
            <div className="dashboard-card-content">
              {/* p color will be handled by .dashboard-card-content p style */}
              <p className="text-sm mb-3">{snippet.summary}</p>
              {/* Link styling will be handled by .dashboard-card-content a style */}
              <Link to={`/research/${snippet.pathSlug}`} className="inline-block mt-auto text-sm font-semibold">
                Read Full Report &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
export default LatestResearchSnippets;
