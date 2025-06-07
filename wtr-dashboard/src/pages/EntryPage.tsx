import React from 'react';
import { Link } from 'react-router-dom';
import './EntryPage.css';
import Logo from '../components/common/Logo';
import NewBackground from '../components/common/NewBackground'; // Import the NewBackground component

const EntryPage: React.FC = () => {
  const createParticleBurst = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const numParticles = 20;
    const particleLifetime = 700; // Should match CSS transition duration
    const buttonRect = event.currentTarget.getBoundingClientRect();

    // Calculate click position relative to the viewport if not using button center
    const clickX = event.clientX;
    const clickY = event.clientY;

    for (let i = 0; i < numParticles; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      document.body.appendChild(particle);

      // Initial position at the click event coordinates
      particle.style.left = `${clickX}px`;
      particle.style.top = `${clickY}px`;
      // For centering on the button instead:
      // particle.style.left = `${buttonRect.left + buttonRect.width / 2}px`;
      // particle.style.top = `${buttonRect.top + buttonRect.height / 2}px`;

      // Force reflow to ensure initial styles are applied before transition starts
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      particle.offsetWidth;

      requestAnimationFrame(() => {
        const angle = Math.random() * 2 * Math.PI;
        // Increase distance for a more explosive effect
        const distance = Math.random() * 80 + 70; // e.g., 70px to 150px
        const translateX = Math.cos(angle) * distance;
        const translateY = Math.sin(angle) * distance;

        // Particles spread out and fade
        particle.style.transform = `translate(${translateX}px, ${translateY}px) scale(0.3)`; // Scale down more
        particle.style.opacity = '0';
      });

      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, particleLifetime);
    }
  };

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
          <Link to="/dashboard" className="entry-button primary-entry-button" onClick={createParticleBurst}>
            Enter Dashboard
          </Link>
          <Link to="/login" className="entry-button secondary-entry-button" onClick={createParticleBurst}>
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
