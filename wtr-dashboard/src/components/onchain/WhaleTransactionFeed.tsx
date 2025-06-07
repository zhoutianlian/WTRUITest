import React from 'react';
import { format } from 'date-fns';
import './WhaleTransactionFeed.css'; // To be created

export interface WhaleTransaction {
  timestamp: Date;
  from: string;
  to: string;
  amount: number;
  token: string;
  txHash: string;
}

interface WhaleTransactionFeedProps {
  transactions: WhaleTransaction[];
  title?: string;
}

const WhaleTransactionFeed: React.FC<WhaleTransactionFeedProps> = ({ transactions, title = "Whale Transaction Feed" }) => {
  const explorerBaseUrl = "https://etherscan.io/tx/"; // Example for Ethereum

  const shortenAddress = (address: string, chars = 6) => {
    if (!address) return 'N/A';
    return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
  };

  const formatAmount = (amount: number, token: string) => {
    return `${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${token}`;
  };

  return (
    <div className="whale-transaction-feed-container">
      {/* Title is part of the card in the page, not this component directly often */}
      {/* <h3>{title}</h3> */}
      <div className="transaction-feed-table-wrapper">
        <table className="transaction-feed-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>From</th>
              <th>To</th>
              <th>Amount</th>
              {/*<th>Token</th> // Amount column now includes token */}
              <th>Tx Hash</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="no-transactions-message">No recent whale transactions found.</td>
              </tr>
            ) : (
              transactions.map((tx, index) => (
                <tr key={index}>
                  <td data-label="Timestamp">{format(tx.timestamp, 'yyyy-MM-dd HH:mm:ss')}</td>
                  <td data-label="From" title={tx.from}>{shortenAddress(tx.from)}</td>
                  <td data-label="To" title={tx.to}>{shortenAddress(tx.to)}</td>
                  <td data-label="Amount" className="amount-cell">{formatAmount(tx.amount, tx.token)}</td>
                  {/* <td data-label="Token">{tx.token}</td> */}
                  <td data-label="Tx Hash">
                    <a href={`${explorerBaseUrl}${tx.txHash}`} target="_blank" rel="noopener noreferrer" title={tx.txHash}>
                      {shortenAddress(tx.txHash, 8)}
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WhaleTransactionFeed;
