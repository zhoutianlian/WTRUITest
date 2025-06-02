import React from 'react';
import './Logo.css';

const Logo: React.FC = () => {
  return (
    <div className="logo-container">
      {/* The path /assets/... works because 'public' directory is served at the root */}
      <img src="/assets/images/logo/wtr-logo.svg" alt="WTR Logo" className="logo-svg" />
    </div>
  );
};

export default Logo;
