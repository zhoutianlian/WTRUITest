import React from 'react';
import { Link } from 'react-router-dom';
import './EntryPage.css';
import Logo from '../components/common/Logo'; // Assuming Logo is desired
import Dynamic3DBackground from '../components/common/Dynamic3DBackground'; // Import the new component

const EntryPage: React.FC = () => {
  return (
    <div className="entry-page">
      <div className="entry-page-background">
        <Dynamic3DBackground />
        <div className="background-overlay-text">
          <h1>WTR Crypto Intelligence</h1>
          <p>Unlock the Future of Digital Asset Analysis.</p>
        </div>
      </div>
      <div className="entry-page-content">
        <div className="entry-logo-container">
          <Logo />
          <h2>Welcome</h2>
        </div>
        <div className="entry-options">
          <Link to="/dashboard" className="entry-button primary-entry-button">
            Enter Dashboard
          </Link>
          <Link to="/login" className="entry-button secondary-entry-button">
            Login
          </Link>
        </div>
        <footer className="entry-footer">
          <p>&copy; {new Date().getFullYear()} WTR. All Rights Reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default EntryPage;
