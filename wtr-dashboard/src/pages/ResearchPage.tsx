import React from 'react';
import { Link } from 'react-router-dom';
import './ResearchPage.css'; // Styles for research pages
// Assuming .dashboard-card styles are globally available or imported via ResearchPage.css if needed for base card
// For this example, we'll rely on .dashboard-card being available from a global/shared import like DashboardPage.css might provide,
// or we could add its definition to ResearchPage.css if it's not.

interface ResearchReport {
  id: string;
  title: string;
  abstract: string;
  publishDate: string; // e.g., "2023-12-01"
  author: string;
  imagePlaceholderText: string; // e.g., "L2 Concept Art"
  // category?: string; // Optional
  // tags?: string[]; // Optional
}

const mockResearchReports: ResearchReport[] = [
  {
    id: 'l2-scalability-deep-dive',
    title: 'Deep Dive into L2 Scalability Solutions',
    abstract: 'An exhaustive analysis of current Layer 2 technologies including Optimistic Rollups, ZK-Rollups, and State Channels. We explore their trade-offs in terms of security, scalability, and decentralization, providing a framework for evaluating their suitability for various applications.',
    publishDate: '2023-12-01',
    author: 'Dr. Crypto Eth',
    imagePlaceholderText: 'L2 Scaling Diagram',
  },
  {
    id: 'defi-risk-frameworks',
    title: 'Advanced Risk Frameworks for DeFi Protocols',
    abstract: 'This paper introduces novel methodologies for assessing risk in decentralized finance, covering smart contract vulnerabilities, economic exploits, and oracle manipulation. Includes case studies of recent incidents and proposes mitigation strategies.',
    publishDate: '2023-11-15',
    author: 'Jane Doe, CFA',
    imagePlaceholderText: 'DeFi Risk Matrix',
  },
  {
    id: 'cross-chain-interoperability',
    title: 'The Future of Cross-Chain Interoperability',
    abstract: 'Examining the evolving landscape of cross-chain communication protocols. We compare various approaches like atomic swaps, bridge technologies, and hub-and-spoke models, assessing their potential to create a seamless multi-chain ecosystem.',
    publishDate: '2023-10-28',
    author: 'Consensus Research Group',
    imagePlaceholderText: 'Interconnected Chains',
  },
  {
    id: 'nft-market-dynamics',
    title: 'Understanding NFT Market Dynamics & Valuation',
    abstract: 'A quantitative look into the factors driving NFT market trends, including rarity, community engagement, and creator reputation. Proposes a multi-factor model for NFT valuation beyond simple floor prices.',
    publishDate: '2023-10-05',
    author: 'Art Vandelay',
    imagePlaceholderText: 'NFT Graph Analysis',
  },
  {
    id: 'onchain-privacy-solutions',
    title: 'On-Chain Privacy: ZKPs vs. Mixers',
    abstract: 'Comparing the effectiveness and practicality of Zero-Knowledge Proofs against traditional mixing services for enhancing transaction privacy on public blockchains. Discusses regulatory implications and future outlook.',
    publishDate: '2023-09-20',
    author: 'Anonymous Researcher X',
    imagePlaceholderText: 'Privacy Shield Icon',
  },
  {
    id: 'real-world-asset-tokenization',
    title: 'Tokenization of Real-World Assets (RWAs)',
    abstract: 'Exploring the potential and challenges of bringing real-world assets onto the blockchain. Covers legal, technical, and market adoption hurdles for asset classes like real estate, private equity, and commodities.',
    publishDate: '2023-09-01',
    author: 'WTR Fixed Income Desk',
    imagePlaceholderText: 'RWA Bridge Graphic',
  },
  {
    id: 'decentralized-identity-impact',
    title: 'The Impact of Decentralized Identity (DID)',
    abstract: 'How DIDs can revolutionize online interactions, data ownership, and security. Analysis of current DID standards and their potential applications across Web3 and traditional web services.',
    publishDate: '2023-08-18',
    author: 'Identity Foundation Guild',
    imagePlaceholderText: 'DID Network Visual',
  },
  {
    id: 'algorithmic-stablecoins-post-mortem',
    title: 'Algorithmic Stablecoins: A Post-Mortem and Future Outlook',
    abstract: 'Analyzing the failures of past algorithmic stablecoin models and discussing the viability of new designs. Focuses on peg stability mechanisms, reflexivity risks, and regulatory concerns.',
    publishDate: '2023-08-02',
    author: 'Dr. Peg Stability',
    imagePlaceholderText: 'Stablecoin Chart (Falling)',
  },
  {
    id: 'mev-mitigation-strategies',
    title: 'MEV Mitigation Strategies in PoS Networks',
    abstract: 'A technical review of Maximal Extractable Value (MEV) in Proof-of-Stake systems and current research into mitigation techniques such as PBS (Proposer-Builder Separation) and encrypted mempools.',
    publishDate: '2023-07-25',
    author: 'ProofOfStake.eth',
    imagePlaceholderText: 'MEV Flowchart',
  },
  {
    id: 'governance-tokenomics-evolved',
    title: 'Evolved Tokenomics for DAO Governance',
    abstract: 'Examining next-generation governance token models designed to improve voter participation, reduce plutocracy, and align long-term incentives within Decentralized Autonomous Organizations.',
    publishDate: '2023-07-10',
    author: 'DAO Governance Collective',
    imagePlaceholderText: 'Governance Structure',
  },
];


const ResearchPage: React.FC = () => {
  return (
    <div className="research-page-container">
      <h1 className="research-page-title">WTR Research Portal</h1>
      <p className="research-page-subtitle">
        In-depth analyses, market commentary, and pioneering insights from the WTR team and contributing experts.
      </p>
      <div className="research-grid">
        {mockResearchReports.map((report) => (
          <div key={report.id} className="dashboard-card"> {/* Using .dashboard-card for base glassmorphic style */}
            <div className="research-card-image-container"> {/* Renamed class for clarity */}
              <img src={`https://placehold.co/600x400/2D3748/E2E8F0?text=${encodeURIComponent(report.title)}`} alt={report.title} className="research-card-image" />
            </div>
            <div className="research-card-content">
              <h3 className="research-card-title">{report.title}</h3>
              <p className="research-card-date">
                By {report.author} | Published on: {new Date(report.publishDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p className="research-card-abstract">{report.abstract}</p>
              <Link to={`/research/${report.id}`} className="research-card-link">
                Read More &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResearchPage;
