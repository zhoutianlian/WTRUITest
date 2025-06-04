import React from 'react';

const LatestResearchSnippets: React.FC = () => {
  const snippets = [
    { title: 'The Rise of Decentralized Options Vaults', summary: 'An in-depth look at DOVs, their risk/reward profiles, and impact on DeFi volatility markets.' },
    { title: 'Cross-Chain Arbitrage: Opportunities & Challenges', summary: 'Exploring new arbitrage vectors in a multi-chain world and the infrastructure required.' },
  ];

  return (
    <section className="py-8 sm:py-12">
      <h2 className="text-2xl sm:text-3xl font-semibold mb-8 text-center text-[var(--color-accent-gold-highlight)] border-b border-[var(--color-accent-gold)] pb-3">
        Latest Research
      </h2>
      <div className="space-y-6 max-w-3xl mx-auto">
        {snippets.map((snippet) => (
          <div key={snippet.title} className="bg-[var(--color-background-secondary)] p-6 rounded-lg shadow-lg border border-[var(--color-border-primary)]">
            <h3 className="text-xl font-semibold mb-2 text-[var(--color-accent-gold-highlight)]">{snippet.title}</h3>
            <p className="text-[var(--color-text-secondary)] text-sm mb-3">{snippet.summary}</p>
            <a href="#" className="text-[var(--color-accent-gold)] hover:text-[var(--color-accent-gold-hover)] text-sm font-semibold">Read Full Report &rarr;</a>
          </div>
        ))}
      </div>
    </section>
  );
};
export default LatestResearchSnippets;
