import React from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom'; // Added RouterLink for potential internal links
import './ResearchPage.css'; // Shared CSS

// Mock data - in a real app, this would be fetched based on articleId
// Ensure IDs match those used in ResearchPage.tsx mock data for navigation to work.
const mockResearchArticles: { [key: string]: any } = {
  'l2-scalability-deep-dive': {
    id: 'l2-scalability-deep-dive',
    title: 'Deep Dive into L2 Scalability Solutions',
    author: 'Dr. Crypto Eth',
    publishDate: '2023-12-01',
    imagePlaceholderText: 'L2 Scaling Diagram', // For consistency if needed at top of article
    // Structured content example:
    content: [
      { type: 'h2', text: 'Executive Summary' },
      { type: 'p', text: 'Layer 2 scaling solutions are critical for the continued growth and adoption of blockchain technology. This report provides an exhaustive analysis of current Layer 2 technologies including Optimistic Rollups, ZK-Rollups, and State Channels. We explore their underlying mechanisms, performance characteristics, security assumptions, and decentralization trade-offs.' },
      { type: 'p', text: 'Our findings suggest that while ZK-Rollups offer superior long-term scalability and security guarantees, Optimistic Rollups currently provide a more EVM-compatible and developer-friendly environment, fostering quicker adoption. State Channels remain niche but highly effective for specific high-throughput, low-value transaction use cases.'},
      { type: 'placeholder', text: 'Comparative Analysis Chart: L2 Solutions (Throughput vs. Latency)' },
      { type: 'h2', text: '1. Introduction to Layer 2 Scaling' },
      { type: 'p', text: 'The scalability trilemma – achieving decentralization, security, and scalability simultaneously – remains a fundamental challenge for Layer 1 blockchains. As user adoption grows, transaction fees and confirmation times on popular L1s like Ethereum can become prohibitive. Layer 2 solutions aim to alleviate this by processing transactions off the main chain while still inheriting its security guarantees.' },
      { type: 'h3', text: '1.1. Defining Layer 2' },
      { type: 'p', text: 'A Layer 2 protocol is a secondary framework or protocol built on top of an existing Layer 1 blockchain. Its primary purpose is to increase transaction throughput without compromising the foundational security and decentralization of the main chain.' },
      { type: 'h2', text: '2. Optimistic Rollups'},
      { type: 'p', text: 'Optimistic Rollups assume transactions are valid by default and only run computations, via a fraud proof, in the event of a challenge. This approach significantly reduces the amount of data that needs to be processed on the main chain. Key players include Arbitrum and Optimism.'},
      { type: 'p', text: 'Advantages include EVM compatibility and mature ecosystem support. However, they face challenges with longer withdrawal times due to the challenge period.'},
      { type: 'h2', text: '3. ZK-Rollups'},
      { type: 'p', text: 'Zero-Knowledge Rollups (ZK-Rollups) use validity proofs (SNARKs or STARKs) to confirm the correctness of off-chain computations before results are submitted to the main chain. This offers faster finality compared to Optimistic Rollups as there is no need for a challenge period.'},
      { type: 'p', text: 'Current hurdles include the complexity of generating ZK proofs and typically higher transaction costs per batch, though ongoing research is rapidly improving efficiency.'},
      { type: 'placeholder', text: 'Diagram: ZK-Rollup Proof Generation' },
      { type: 'h2', text: 'Conclusion' },
      { type: 'p', text: 'The L2 landscape is dynamic and rapidly evolving. While no single solution is universally superior, understanding the specific trade-offs of each technology is crucial for developers and users alike. We anticipate continued innovation and convergence of features across different L2 categories.' },
    ]
  },
  'defi-risk-frameworks': {
    id: 'defi-risk-frameworks',
    title: 'Advanced Risk Frameworks for DeFi Protocols',
    author: 'Jane Doe, CFA',
    publishDate: '2023-11-15',
    imagePlaceholderText: 'DeFi Risk Matrix',
    content: [
        { type: 'h2', text: 'Abstract'},
        { type: 'p', text: 'This paper introduces novel methodologies for assessing risk in decentralized finance, covering smart contract vulnerabilities, economic exploits, and oracle manipulation. Includes case studies of recent incidents and proposes mitigation strategies for users and protocol developers.'},
        { type: 'h2', text: 'Understanding DeFi Risk Vectors'},
        { type: 'p', text: 'DeFi, while innovative, presents a complex and often opaque risk landscape. Unlike traditional finance, risks are not only financial but also deeply technical and systemic.'},
        { type: 'h3', text: 'Smart Contract Risk'},
        { type: 'p', text: 'Bugs or vulnerabilities in the underlying smart contracts can lead to catastrophic loss of funds. Audits are crucial but not foolproof.'},
        { type: 'h3', text: 'Economic Exploit Risk'},
        { type: 'p', text: 'These involve manipulating market conditions or protocol mechanics to extract value, often through flash loans or oracle price manipulation.'},
        { type: 'placeholder', text: 'Chart: Common DeFi Exploit Types by Value Lost'},
        { type: 'h2', text: 'Proposed Framework'},
        { type: 'p', text: 'We propose a multi-dimensional risk scoring system incorporating code audit scores, economic modeling, oracle dependency analysis, and governance structure robustness.'},
        { type: 'p', text: 'Each dimension is weighted to produce an overall risk score, providing a clearer picture for investors and users.'},
    ]
  }
  // Add more articles here to match IDs from ResearchPage.tsx if needed for testing more links
};

const ResearchDetailPage: React.FC = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const article = articleId ? mockResearchArticles[articleId] : null;

  if (!article) {
    return (
        <div className="research-page-container">
            <div className="research-article-container">
                <h1 className="research-article-title">Article Not Found</h1>
                <p>The requested research article could not be found. Please check the ID or return to the research portal.</p>
                <RouterLink to="/research" className="research-card-link" style={{marginTop: 'var(--spacing-unit)'}}>&larr; Back to Research Portal</RouterLink>
            </div>
        </div>
    );
  }

  const renderContent = (contentItem: any, index: number) => {
    switch (contentItem.type) {
      case 'h2':
        return <h2 key={index}>{contentItem.text}</h2>;
      case 'h3':
        return <h3 key={index}>{contentItem.text}</h3>;
      case 'p':
        return <p key={index}>{contentItem.text}</p>;
      case 'placeholder':
        return <div key={index} className="research-article-placeholder">{contentItem.text}</div>;
      default:
        return null;
    }
  };

  return (
    <div className="research-page-container"> {/* Use the overall page container for padding */}
        <div className="research-article-container">
        <RouterLink to="/research" className="research-card-link" style={{marginBottom: 'var(--spacing-unit)', fontSize: '0.9rem'}}>&larr; Back to Research Portal</RouterLink>
        <h1 className="research-article-title">{article.title}</h1>
        <p className="research-article-meta">
            By: {article.author}
            <span style={{margin: '0 8px'}}>|</span>
            Published: {new Date(article.publishDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <div className="research-article-content">
            {article.content.map(renderContent)}
        </div>
        </div>
    </div>
  );
};
export default ResearchDetailPage;
