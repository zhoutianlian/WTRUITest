import React, { useState } from 'react'; // Import useState
import { Outlet } from 'react-router-dom';
import Logo from '../components/common/Logo';
import Sidebar from '../components/common/Sidebar';
import ContactModal from '../components/common/ContactModal'; // Import the new ContactModal
import './MainLayout.css';

export default function MainLayout() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const openContactModal = () => setIsContactModalOpen(true);
  const closeContactModal = () => setIsContactModalOpen(false);

  return (
    <div className="main-layout">
      <header className="main-header">
        <Logo />
        {/* Other header content can go here, e.g., user profile, search bar */}
      </header>
      <Sidebar openContactModal={openContactModal} />
      <main className="main-content-area">
        <Outlet />
      </main>
      <footer className="main-footer">
        <p>&copy; {new Date().getFullYear()} WTR Crypto Intelligence. All rights reserved.</p>
        <div>
          {/* Placeholder for other footer links like Terms, Privacy */}
          <button onClick={openContactModal} className="footer-contact-link">
            Contact Us
          </button>
        </div>
      </footer>

      <ContactModal isOpen={isContactModalOpen} onClose={closeContactModal} />
    </div>
  );
}
