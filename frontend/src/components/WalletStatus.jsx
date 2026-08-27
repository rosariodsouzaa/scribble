import React, { useState } from "react";
import { CheckCircle2, Copy, ExternalLink, Wallet as WalletIcon } from "lucide-react";

export const formatAddress = (addr) => {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

export default function WalletStatus({ isConnected, address, balance, network, onDisconnect }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard?.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!isConnected) {
    return (
      <div className="wallet-status-pill disconnected">
        <span className="status-dot red" />
        <span className="status-text">Wallet Disconnected</span>
      </div>
    );
  }

  return (
    <div className="wallet-status-pill connected">
      <span className="status-dot green" />
      <span className="wallet-addr-text" title={address}>
        {formatAddress(address)}
      </span>
      {balance && <span className="wallet-balance-tag">{balance}</span>}
      <button className="wallet-mini-action" onClick={handleCopy} title="Copy Address">
        {copied ? <CheckCircle2 size={13} color="#10b981" /> : <Copy size={13} />}
      </button>
      {onDisconnect && (
        <button className="wallet-disconnect-btn" onClick={onDisconnect} title="Disconnect">
          Disconnect
        </button>
      )}
    </div>
  );
}
