import React from 'react';
import './WTRVision.css';

const WTRVision: React.FC = () => {
  return (
    <section id="wtr-vision" className="homepage-section wtr-vision">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="section-title">Our Vision & Mission</h2>
        <div className="vision-content">
          <p className="mission-statement">
            "To empower investors and researchers with unparalleled clarity and foresight
            in the complex world of digital assets. We build sophisticated tools and deliver
            actionable intelligence to navigate the future of finance."
          </p>
          {/* Optional: Could add a call to action or link to About Us page */}
          {/* <a href="/about" className="vision-cta-link">Learn More About WTR</a> */}
        </div>
      </div>
    </section>
  );
};

export default WTRVision;
