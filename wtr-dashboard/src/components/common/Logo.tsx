import React from 'react';
import './Logo.css'; // Keep existing CSS import

const Logo: React.FC = () => {
  return (
    <div className="logo-container">
      <svg
        className="wtr-text-logo-svg"
        viewBox="0 0 150 50" // Base viewBox, can be adjusted
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="wtrLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'var(--color-accent-gold-highlight, #FFD700)', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'var(--color-accent-gold, #B08D57)', stopOpacity: 1 }} />
          </linearGradient>
          <filter id="wtrLogoDropShadow" x="-20%" y="-20%" width="140%" height="140%">
             <feGaussianBlur in="SourceAlpha" stdDeviation="1"/>
             <feOffset dx="1" dy="1" result="offsetblur"/>
             <feFlood floodColor="rgba(0,0,0,0.3)"/>
             <feComposite in2="offsetblur" operator="in"/>
             <feMerge>
                 <feMergeNode/>
                 <feMergeNode in="SourceGraphic"/>
             </feMerge>
         </filter>
        </defs>

        {/* Text WTR */}
        <text
          x="50%"
          y="50%"
          dy=".35em" // Vertical alignment adjustment
          textAnchor="middle"
          className="wtr-logo-text-w"
          fill="url(#wtrLogoGradient)"
          filter="url(#wtrLogoDropShadow)"
        >
          W
        </text>
        <text
          x="50%"
          y="50%"
          dy=".35em" // Vertical alignment adjustment
          textAnchor="middle"
          className="wtr-logo-text-t"
          fill="url(#wtrLogoGradient)"
          filter="url(#wtrLogoDropShadow)"
        >
          T
        </text>
        <text
          x="50%"
          y="50%"
          dy=".35em" // Vertical alignment adjustment
          textAnchor="middle"
          className="wtr-logo-text-r"
          fill="url(#wtrLogoGradient)"
          filter="url(#wtrLogoDropShadow)"
        >
          R
        </text>

        {/* Optional: Add a small decorative element, like a line or shape */}
        {/* <line x1="10" y1="45" x2="140" y2="45" stroke="url(#wtrLogoGradient)" strokeWidth="2" /> */}
      </svg>
    </div>
  );
};

export default Logo;
