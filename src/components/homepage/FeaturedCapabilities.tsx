import React from 'react';
import './FeaturedCapabilities.css';
import { FaShieldAlt, FaChartLine, FaBolt } from 'react-icons/fa'; // Using different icons

const capabilities = [
  {
    icon: <FaChartLine size={36} />, // Adjusted size
    title: 'Advanced Charting',
    description: 'Visualize complex market data with our suite of advanced charting tools and indicators.',
  },
  {
    icon: <FaShieldAlt size={36} />, // Adjusted size
    title: 'On-Chain Analytics',
    description: 'Gain deep insights into blockchain activity, including exchange flows and whale movements.',
  },
  {
    icon: <FaBolt size={36} />, // Adjusted size
    title: 'Real-Time Signals',
    description: 'Receive timely, actionable trading signals based on our proprietary algorithms.',
  },
];

const FeaturedCapabilities: React.FC = () => {
  return (
    <section id="featured-capabilities" className="homepage-section featured-capabilities">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="section-title">Featured Capabilities</h2>
        <div className="capabilities-grid">
          {capabilities.map((cap, index) => (
            <div key={index} className="capability-card">
              {cap.icon && <div className="capability-icon-wrapper">{cap.icon}</div>}
              <h3>{cap.title}</h3>
              <p>{cap.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCapabilities;
