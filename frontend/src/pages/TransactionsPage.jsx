import React from "react";
import TransactionHistory from "../components/TransactionHistory.jsx";

export default function TransactionsPage() {
  return (
    <div className="transactions-page-container animate-fade-in">
      <TransactionHistory
        title="Dragon Treasury & Transaction Ledger"
        showHeader={true}
      />
    </div>
  );
}
