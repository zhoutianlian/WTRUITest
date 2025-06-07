import React from 'react';
import { Outlet } from 'react-router-dom';
// import './DerivativesPage.css'; // Can be used for layout styling specific to /derivatives parent

const DerivativesPage: React.FC = () => {
  return (
    <div>
      {/*
        Optional: Common header for all derivatives sub-pages
        <header className="page-header">
          <h1>Derivatives Market Intelligence</h1>
        </header>
      */}
      <Outlet /> {/* This will render the matched sub-page component */}
    </div>
  );
};

export default DerivativesPage;
