import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  Lock,
  Sparkles,
  Coins,
  Mail,
  Printer,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Wallet as WalletIcon,
} from "lucide-react";
import Button from "./Button.jsx";

export default function TransactionReceiptModal({ transaction, onClose }) {
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  if (!transaction) return null;

  const handleCopyHash = (hash) => {
    if (!hash) return;
    navigator.clipboard?.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleCopyId = (id) => {
    if (!id) return;
    navigator.clipboard?.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const formatShortAddr = (addr) => {
    if (!addr || addr === "0x00000000" || addr.includes("INTERNAL") || addr.includes("VAULT")) {
      return addr || "N/A";
    }
    if (addr.length > 16) {
      return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
    }
    return addr;
  };

  const receiptId = transaction.receiptId || transaction.id;
  const isGoldMethod =
    String(transaction.method || transaction.paymentMethod || "").toLowerCase().includes("gold");
  const isCrypto = !isGoldMethod;

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div
        className="payment-modal-card dragon-card receipt-modal-card printable-receipt"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Imperial Corner Brackets */}
        <div className="imperial-bracket tl" />
        <div className="imperial-bracket tr" />
        <div className="imperial-bracket bl" />
        <div className="imperial-bracket br" />

        {/* Modal Header */}
        <div className="payment-modal-header">
          <div className="pay-tag">
            <Lock size={12} />
            <span>OFFICIAL DRAGON TREASURY RECEIPT</span>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close invoice">
            <X size={18} />
          </button>
        </div>

        {/* Receipt Content Body */}
        <div className="payment-success-view">
          <div className="success-icon-wrap">
            <CheckCircle2 size={48} className="success-icon" />
          </div>

          <h2 className="success-title">Verified Treasury Settlement</h2>
          <p className="success-sub">
            This transaction has been permanently recorded in the Dragon Dynasty ledger.
          </p>

          {transaction.email && (
            <div className="receipt-email-banner">
              <Mail size={15} className="mail-icon" />
              <span>
                Delivered to <strong>{transaction.email}</strong>
              </span>
            </div>
          )}

          {/* Imperial Treasury Receipt Card */}
          <div className="receipt-box imperial-receipt-card">
            <div className="receipt-header-row">
              <div className="receipt-badge-title">
                <Sparkles size={14} className="text-amber-400" />
                <span className="receipt-title-tag">OFFICIAL SETTLEMENT INVOICE</span>
              </div>
              <div className="receipt-id-action-wrap">
                <span className="receipt-id-tag">#{receiptId}</span>
                <button
                  className="receipt-copy-btn"
                  onClick={() => handleCopyId(receiptId)}
                  title="Copy Invoice ID"
                >
                  {copiedId ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                </button>
              </div>
            </div>

            <div className="receipt-divider" />

            <div className="receipt-row">
              <span className="receipt-row-label">Settlement Date:</span>
              <strong>{transaction.date || new Date(transaction.createdAt || Date.now()).toLocaleString()}</strong>
            </div>

            <div className="receipt-row">
              <span className="receipt-row-label">Item / Relic Acquired:</span>
              <strong className="receipt-item-name">{transaction.item || transaction.itemName}</strong>
            </div>

            {transaction.goldAmount > 0 && (
              <div className="receipt-row">
                <span className="receipt-row-label">Coins Credited:</span>
                <strong className="receipt-gold-val">
                  +{Number(transaction.goldAmount).toLocaleString()} Dragon Gold
                </strong>
              </div>
            )}

            <div className="receipt-row">
              <span className="receipt-row-label">Payment Method:</span>
              <strong className="text-amber-300 font-semibold">
                {transaction.method || transaction.paymentMethod || "Web3 Native Tokens"}
              </strong>
            </div>

            {/* Token / Balance Ledger Section */}
            <div className="receipt-divider" />
            <div className="receipt-balance-ledger-block">
              {transaction.initialBalance && (
                <div className="receipt-row">
                  <span className="receipt-row-label">Initial Balance:</span>
                  <span className="hash-mono">{transaction.initialBalance}</span>
                </div>
              )}

              <div className="receipt-row">
                <span className="receipt-row-label">Total Amount Paid:</span>
                <strong className="receipt-token-amount text-amber-400 font-bold">
                  {transaction.amount}
                </strong>
              </div>

              {transaction.remainingBalance && (
                <div className="receipt-row">
                  <span className="receipt-row-label">Updated Remaining Balance:</span>
                  <strong className="text-emerald-400 font-bold">{transaction.remainingBalance}</strong>
                </div>
              )}
            </div>
            <div className="receipt-divider" />

            {/* Verification & Address Data */}
            {transaction.walletAddress && (
              <div className="receipt-row">
                <span className="receipt-row-label">Paying Wallet:</span>
                <span className="hash-mono">{formatShortAddr(transaction.walletAddress)}</span>
              </div>
            )}

            <div className="receipt-row">
              <span className="receipt-row-label">Network / Realm:</span>
              <strong>{transaction.network || (isCrypto ? "Ethereum Network" : "Dragon Empire Realm")}</strong>
            </div>

            <div className="receipt-row tx-hash-row">
              <span className="receipt-row-label">Transaction Hash:</span>
              <div className="hash-action-wrap">
                <span className="hash-mono" title={transaction.txHash || transaction.hash}>
                  {formatShortAddr(transaction.txHash || transaction.hash || "INTERNAL-ROYALE")}
                </span>
                {transaction.txHash || transaction.hash ? (
                  <button
                    className="receipt-copy-btn"
                    onClick={() => handleCopyHash(transaction.txHash || transaction.hash)}
                    title="Copy Transaction Hash"
                  >
                    {copiedHash ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                  </button>
                ) : null}
              </div>
            </div>

            <div className="receipt-row">
              <span className="receipt-row-label">Status:</span>
              <span className="receipt-status-pill">{transaction.status || "COMPLETED"}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="receipt-actions-row">
            <button className="receipt-print-btn" onClick={handlePrint}>
              <Printer size={15} />
              <span>Print Official Invoice</span>
            </button>
            <Button variant="primary" size="md" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
