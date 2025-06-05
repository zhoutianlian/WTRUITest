import React from 'react';
import './ResearchPage.css'; // To be created

const researchArticles = [
  {
    title: 'The Evolving Landscape of DeFi Protocols - Q3 2024',
    summary: 'A deep dive into the current market cycle within DeFi, identifying key indicators and potential scenarios for the upcoming quarter. We explore new primitives and risk factors.',
    date: 'October 26, 2023',
    link: '#', // Placeholder link
  },
  {
    title: 'On-Chain Forensics: Uncovering Smart Money Moves',
    summary: 'Learn how WTR leverages advanced on-chain analysis to track sophisticated investors and identify early signals of significant market movements.',
    date: 'November 05, 2023',
    link: '#',
  },
  {
    title: 'The Impact of Macroeconomics on Crypto Valuations',
    summary: 'This report examines the correlation between traditional macroeconomic indicators and the valuation trends in the digital asset space.',
    date: 'November 12, 2023',
    link: '#',
  },
];

const ResearchPage: React.FC = () => {
  return (
    <div className="page-container research-page">
      <header className="page-header">
        <h1>WTR Research & Insights</h1>
      </header>
      <div className="page-content">
        <section className="content-section intro-section">
          <p>
            At WTR, we are committed to providing our users with comprehensive, data-driven research
            and actionable insights into the cryptocurrency markets. Our team of expert analysts
            works diligently to uncover trends, assess risks, and identify opportunities across
            the digital asset landscape.
          </p>
        </section>

        <section className="content-section articles-section">
          <h2 className="section-title">Latest Publications</h2>
          <div className="articles-list">
            {researchArticles.map((article, index) => (
              <article key={index} className="article-item">
                <h3 className="article-title">{article.title}</h3>
                <p className="article-meta">Published on: {article.date}</p>
                <p className="article-summary">{article.summary}</p>
                <a href={article.link} className="article-read-more">
                  Read More &rarr;
                </a>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ResearchPage;
