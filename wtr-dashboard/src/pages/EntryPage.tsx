import React from 'react';
import { Link } from 'react-router-dom';
import './EntryPage.css';
import Logo from '../components/common/Logo';
import NewBackground from '../components/common/NewBackground'; // Import the NewBackground component

const EntryPage: React.FC = () => {
  return (
    <div className="entry-page">
      <NewBackground /> {/* Add the NewBackground component here */}
      {/* The entry-page-background div and its contents (Dynamic3DBackground, background-overlay-text) are removed */}
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
