import React from 'react';
import { Outlet } from 'react-router-dom';
// import './OnChainPage.css'; // Can be used for layout styling specific to /on-chain parent

const OnChainPage: React.FC = () => {
  return (
    <div>
      {/*
        Could include a common header for all on-chain sub-pages here, e.g.:
        <header className="page-header"> // Assuming .page-header is defined in a shared CSS
          <h1>On-Chain Analysis Platform</h1>
        </header>
      */}
      <Outlet /> {/* This will render the matched sub-page component */}
    </div>
  );
};

export default OnChainPage;
