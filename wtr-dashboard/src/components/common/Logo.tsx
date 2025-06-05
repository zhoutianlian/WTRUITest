import React from 'react';
import './Logo.css'; // Keep existing CSS import

const Logo: React.FC = () => {
  return (
    <div className="logo-container">
      <svg
        className="wtr-text-logo-svg"
        viewBox="0 0 190 50" // Adjusted viewBox for new shape and spaced text
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

        {/* New Graphical Shape Element */}
        <g id="wtrLogoShape" stroke="var(--color-accent-gold-highlight)" strokeWidth="0.5">
          {/* Parallelogram 1: Top-left (15,15), Top-right(25,15), Bottom-right(20,40), Bottom-left(10,40) */}
          <polygon points="15,20 25,20 20,40 10,40" fill="var(--color-accent-gold-muted)" />
          {/* Parallelogram 2: Top-left (30,10), Top-right(40,10), Bottom-right(35,40), Bottom-left(25,40) - Taller */}
          <polygon points="30,10 40,10 35,40 25,40" fill="var(--color-accent-gold)" />
          {/* Parallelogram 3: Top-left (45,25), Top-right(55,25), Bottom-right(50,40), Bottom-left(40,40) */}
          <polygon points="45,15 55,15 50,40 40,40" fill="var(--color-accent-gold-muted)" />
        </g>

        {/* Adjusted Text WTR - Ensure font-size is set in CSS or here for proper spacing */}
        {/* Approximate character width + kerning could be 30-40 units at this scale. */}
        {/* Let's assume font-size makes W, T, R each about 25-30 units wide including spacing. */}
        {/* Shape ends around x=55. Start text around x=75 (center of W) */}
        <text
          x="85" // Adjusted x position: Shape (approx 55 wide) + gap (10) + W_half_width (20)
          y="50%"
          dy=".35em"
          textAnchor="middle"
          className="wtr-logo-text-w"
          fill="url(#wtrLogoGradient)"
          filter="url(#wtrLogoDropShadow)"
        >
          W
        </text>
        <text
          x="120" // Adjusted x position: W_center (85) + W_half_width (17.5) + T_half_width (17.5) = 85 + 35
          y="50%"
          dy=".35em"
          textAnchor="middle"
          className="wtr-logo-text-t"
          fill="url(#wtrLogoGradient)"
          filter="url(#wtrLogoDropShadow)"
        >
          T
        </text>
        <text
          x="155" // Adjusted x position: T_center (120) + T_half_width (17.5) + R_half_width (17.5) = 120 + 35
          y="50%"
          dy=".35em"
          textAnchor="middle"
          className="wtr-logo-text-r"
          fill="url(#wtrLogoGradient)"
          filter="url(#wtrLogoDropShadow)"
        >
          R
        </text>
      </svg>
    </div>
  );
};

export default Logo;
