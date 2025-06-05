import React from 'react';
import './LatestResearchSnippets.css';
// import { FaFeatherAlt } from 'react-icons/fa'; // Example icon

const snippets = [
  {
    title: 'Market Cycle Analysis: Q4 Outlook',
    summary: 'A deep dive into the current market cycle, identifying key indicators and potential scenarios for the upcoming quarter.',
    link: '/research/market-cycle-q4-2023', // Example link
  },
  {
    title: 'The Rise of Layer 2 Solutions',
    summary: 'Exploring the impact of Layer 2 scaling solutions on Ethereum and the broader DeFi ecosystem.',
    link: '/research/layer-2-impact',
  },
  {
    title: 'Regulatory Landscape: What to Expect',
    summary: 'An overview of the evolving regulatory environment for digital assets globally.',
    link: '/research/regulatory-landscape-2024',
  },
];

const LatestResearchSnippets: React.FC = () => {
  return (
    <section id="latest-research" className="homepage-section latest-research-snippets">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="section-title">Latest Research Snippets</h2>
        <div className="snippets-list">
          {snippets.map((snippet, index) => (
            <article key={index} className="snippet-item">
              {/* Optional Icon here */}
              {/* <FaFeatherAlt className="snippet-icon" /> */}
              <h3>{snippet.title}</h3>
              <p>{snippet.summary}</p>
              <a href={snippet.link} className="read-more-link">
                Read More &rarr;
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LatestResearchSnippets;
