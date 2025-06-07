import React, { useState } from 'react'; // Import useState
import { Outlet } from 'react-router-dom';
import Logo from '../components/common/Logo'; // Corrected path
import Sidebar from '../components/common/Sidebar'; // Corrected path
import './MainLayout.css';

export default function MainLayout() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const toggleContactModal = () => setIsContactModalOpen(!isContactModalOpen);

  return (
    <div className="main-layout">
      <header className="main-header">
        <Logo />
        {/* Other header content can go here, e.g., user profile, search bar */}
      </header>
      <Sidebar toggleContactModal={toggleContactModal} /> {/* Pass toggle function */}
      <main className="main-content-area">
        <Outlet />
      </main>

      {isContactModalOpen && (
        <div className="modal-overlay active"> {/* Ensure 'active' class is applied to trigger visibility/animation */}
          <div className="modal-container">
            <div className="modal-header">
              <h2>Contact WTR</h2>
              <button onClick={toggleContactModal} className="modal-close-button">&times;</button>
            </div>
            <div className="modal-body">
              <p>For inquiries, please reach out to the relevant department:</p>
              <ul>
                <li><strong>General & Partnerships:</strong> <a href="mailto:info@wtr.example.com">info@wtr.example.com</a></li>
                <li><strong>Data & Analytics:</strong> <a href="mailto:analysis@wtr.example.com">analysis@wtr.example.com</a></li>
                <li><strong>Technical Support:</strong> <a href="mailto:support@wtr.example.com">support@wtr.example.com</a></li>
                <li><strong>Media Relations:</strong> <a href="mailto:media@wtr.example.com">media@wtr.example.com</a></li>
              </ul>
              <p style={{ marginTop: 'calc(var(--spacing-unit) * 2)' }}>We aim to respond within 24-48 hours.</p> {/* CSS calc for margin */}
            </div>
            <div className="modal-footer">
              <button onClick={toggleContactModal} className="btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
