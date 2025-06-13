import React from 'react';
import './AboutPage.css'; // Import the new CSS file

export default function AboutPage() {
  return (
    <div className="about-page-container animated-gradient">
      <div className="about-page-content">
        <section className="about-section" id="team-introduction">
          <h2>Our Team</h2>
          <p>
            Welcome to WTR (Whale Trading Research). We are a dedicated team of analysts,
            data scientists, and blockchain enthusiasts passionate about demystifying the crypto markets.
            Our expertise spans across quantitative analysis, on-chain data interpretation, and
            cutting-edge financial technology.
          </p>
          <p>
            Founded in [Year], WTR was born from the desire to bring institutional-grade research tools
            and insights to a wider audience. We believe that data-driven decision-making is key to
            navigating the complexities of the digital asset space.
          </p>
        </section>

        <section className="about-section" id="mission-value">
          <h2>Mission & Values</h2>
          <p>
            <strong>Our Mission:</strong> To empower investors and traders with transparent, actionable,
            and forward-looking crypto market intelligence. We strive to be the leading source for
            on-chain analytics, derivatives insights, and comprehensive market research.
          </p>
          <p><strong>Our Values:</strong></p>
          <ul>
            <li><strong>Integrity:</strong> Unbiased, data-backed research is the cornerstone of our work.</li>
            <li><strong>Innovation:</strong> Continuously exploring new datasets and analytical methods.</li>
            <li><strong>Clarity:</strong> Presenting complex information in an accessible and understandable way.</li>
            <li><strong>Community:</strong> Fostering an educated and informed crypto community.</li>
            <li><strong>Excellence:</strong> Committing to the highest standards in everything we do.</li>
          </ul>
        </section>

        <section className="about-section" id="team-members">
          <h2>Meet the Team</h2>
          <div className="team-members-grid">
            {/* Placeholder Team Members - Replace with actual data */}
            <div className="team-member-card">
              <img src="https://placehold.co/120x120/4A5568/E2E8F0?text=Team1" alt="Team Member 1" />
              <h3>Alex Chen</h3>
              <p className="role">Lead Quantitative Analyst</p>
              <p className="bio">Alex specializes in time-series analysis and algorithmic strategy development.</p>
            </div>
            <div className="team-member-card">
              <img src="https://placehold.co/120x120/4A5568/E2E8F0?text=Team2" alt="Team Member 2" />
              <h3>Dr. Sarah Valueva</h3>
              <p className="role">Head of On-Chain Research</p>
              <p className="bio">Sarah holds a PhD in Distributed Systems and focuses on network-level intelligence.</p>
            </div>
            <div className="team-member-card">
              <img src="https://placehold.co/120x120/4A5568/E2E8F0?text=Team3" alt="Team Member 3" />
              <h3>Ben Carter</h3>
              <p className="role">Derivatives Market Specialist</p>
              <p className="bio">Ben has over a decade of experience in options and futures trading.</p>
            </div>
            <div className="team-member-card">
              <img src="https://placehold.co/120x120/4A5568/E2E8F0?text=Team4" alt="Team Member 4" />
              <h3>Olivia Ramirez</h3>
              <p className="role">Data Visualization Lead</p>
              <p className="bio">Olivia turns complex data into insightful visuals and user-friendly dashboards.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
