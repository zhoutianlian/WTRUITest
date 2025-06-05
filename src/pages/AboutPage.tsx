import React from 'react';
import './AboutPage.css'; // To be created

const AboutPage: React.FC = () => {
  return (
    <div className="page-container about-page">
      <header className="page-header">
        <h1>About WTR</h1>
      </header>
      <div className="page-content">
        <section className="content-section about-section">
          <h2 className="section-title">Our Mission</h2>
          <p>
            To empower crypto investors, traders, and researchers with unparalleled clarity and
            foresight in the complex world of digital assets. We are dedicated to building
            sophisticated tools and delivering actionable intelligence that helps our users
            navigate the future of finance with confidence.
          </p>
        </section>

        <section className="content-section about-section">
          <h2 className="section-title">Our Technology</h2>
          <p>
            WTR leverages a state-of-the-art data analytics platform, integrating advanced
            on-chain metrics, real-time market data, and proprietary AI-driven models.
            Our technology stack is designed for scalability, speed, and precision, ensuring
            that our users have access to the most reliable and timely insights available.
            We are constantly innovating to incorporate the latest advancements in data science
            and machine learning.
          </p>
        </section>

        <section className="content-section about-section">
          <h2 className="section-title">The WTR Team</h2>
          <p>
            Our team comprises experienced financial analysts, data scientists, software engineers,
            and blockchain experts who are passionate about the digital asset space. We believe
            in a collaborative and research-driven approach to product development.
            (Full team details coming soon!)
          </p>
        </section>

        <section className="content-section about-section contact-section">
          <h2 className="section-title">Contact Us</h2>
          <p>
            For inquiries, partnership opportunities, or support, please feel free to reach out to us.
            We value feedback from our community and are always eager to connect.
          </p>
          <p className="contact-email">
            Email: <a href="mailto:contact@wtrcrypto.dev">contact@wtrcrypto.dev</a>
          </p>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
