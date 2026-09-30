import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Coins,
  Receipt,
  Copy,
  Check,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import { useAuthWallet } from "../context/AuthWalletContext.jsx";
import Button from "../components/Button.jsx";

const MetaMaskFoxSvg = () => (
  <svg className="metamask-svg" viewBox="0 0 318.6 318.6" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M274.1 35.5L174.6 109.4L193 65.8L274.1 35.5Z" fill="#E17726" stroke="#E17726" strokeWidth="1.2" />
    <path d="M44.4 35.5L143.5 109.8L125.6 65.8L44.4 35.5Z" fill="#E27625" stroke="#E27625" strokeWidth="1.2" />
    <path d="M238.3 206.8L211.8 247.4L268.5 263L284.8 207.7L238.3 206.8Z" fill="#E27625" stroke="#E27625" strokeWidth="1.2" />
    <path d="M33.9 207.7L50.1 263L106.8 247.4L80.3 206.8L33.9 207.7Z" fill="#E27625" stroke="#E27625" strokeWidth="1.2" />
    <path d="M103.6 138.2L87.8 162.1L144.1 164.6L142.3 104.1L103.6 138.2Z" fill="#E27625" stroke="#E27625" strokeWidth="1.2" />
    <path d="M214.9 138.2L175.9 103.4L174.6 164.6L230.8 162.1L214.9 138.2Z" fill="#E27625" stroke="#E27625" strokeWidth="1.2" />
    <path d="M106.8 247.4L140.6 230.9L111.4 207.4L106.8 247.4Z" fill="#E27625" stroke="#E27625" strokeWidth="1.2" />
    <path d="M178 230.9L211.8 247.4L207.2 207.4L178 230.9Z" fill="#E27625" stroke="#E27625" strokeWidth="1.2" />
    <path d="M211.8 247.4L178 230.9L180.4 266.2L180.8 279.7L211.8 247.4Z" fill="#D5BFB2" stroke="#D5BFB2" strokeWidth="1.2" />
    <path d="M106.8 247.4L137.8 279.7L138.2 266.2L140.6 230.9L106.8 247.4Z" fill="#D5BFB2" stroke="#D5BFB2" strokeWidth="1.2" />
    <path d="M138.8 193.5L110.1 185.2L130.6 168.8L138.8 193.5Z" fill="#233447" stroke="#233447" strokeWidth="1.2" />
    <path d="M179.8 193.5L188 168.8L208.5 185.2L179.8 193.5Z" fill="#233447" stroke="#233447" strokeWidth="1.2" />
    <path d="M106.8 247.4L111.4 206.8L80.3 207.4L106.8 247.4Z" fill="#CC6228" stroke="#CC6228" strokeWidth="1.2" />
    <path d="M207.2 206.8L211.8 247.4L238.3 207.4L207.2 206.8Z" fill="#CC6228" stroke="#CC6228" strokeWidth="1.2" />
    <path d="M230.8 162.1L174.6 164.6L179.8 193.5L208.5 185.2L230.8 162.1Z" fill="#CC6228" stroke="#CC6228" strokeWidth="1.2" />
    <path d="M87.8 162.1L110.1 185.2L138.8 193.5L144.1 164.6L87.8 162.1Z" fill="#CC6228" stroke="#CC6228" strokeWidth="1.2" />
    <path d="M87.8 162.1L111.4 207.4L110.1 185.2L87.8 162.1Z" fill="#E27525" stroke="#E27525" strokeWidth="1.2" />
    <path d="M208.5 185.2L207.2 207.4L230.8 162.1L208.5 185.2Z" fill="#E27525" stroke="#E27525" strokeWidth="1.2" />
    <path d="M144.1 164.6L138.8 193.5L145.4 227.6L146 165.2L144.1 164.6Z" fill="#E27525" stroke="#E27525" strokeWidth="1.2" />
    <path d="M174.6 164.6L172.6 165.2L173.2 227.6L179.8 193.5L174.6 164.6Z" fill="#E27525" stroke="#E27525" strokeWidth="1.2" />
    <path d="M173.2 227.6L172.6 165.2L159.3 155.8L146 165.2L145.4 227.6L140.6 230.9L159.3 241.6L178 230.9L173.2 227.6Z" fill="#F5841F" stroke="#F5841F" strokeWidth="1.2" />
    <path d="M178 230.9L159.3 241.6L140.6 230.9L138.2 266.2L137.8 279.7L159.3 293.2L180.8 279.7L180.4 266.2L178 230.9Z" fill="#C0AC9D" stroke="#C0AC9D" strokeWidth="1.2" />
    <path d="M159.3 103.4L193 65.8L174.6 109.4L159.3 103.4Z" fill="#161616" stroke="#161616" strokeWidth="1.2" />
    <path d="M159.3 103.4L143.5 109.8L125.6 65.8L159.3 103.4Z" fill="#161616" stroke="#161616" strokeWidth="1.2" />
    <path d="M284.8 207.7L268.5 263L298.6 244.1L318.6 207.7H284.8Z" fill="#763E1A" stroke="#763E1A" strokeWidth="1.2" />
    <path d="M0 207.7L20 244.1L50.1 263L33.9 207.7H0Z" fill="#763E1A" stroke="#763E1A" strokeWidth="1.2" />
  </svg>
);

export default function Wallet() {
  const navigate = useNavigate();
  const { wallet, connectMetaMask, connectDemoWallet, disconnectWallet, refreshWalletBalance } = useAuthWallet();
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleConnect = async () => {
    setBusy(true);
    await connectMetaMask();
    setBusy(false);
  };

  const handleDemo = () => {
    connectDemoWallet();
  };

  const handleCopyAddress = () => {
    if (!wallet.address) return;
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="wallet-page-container">
      <div className="wallet-card-master dragon-card">
        {/* Imperial Corner Brackets */}
        <div className="imperial-bracket tl" />
        <div className="imperial-bracket tr" />
        <div className="imperial-bracket bl" />
        <div className="imperial-bracket br" />

        {/* Card Header */}
        <div className="wallet-card-header">
          <div className="wallet-tag-badge">
            <Sparkles size={13} className="badge-sparkle-icon" />
            <span>DRAGON VAULT & WEB3</span>
          </div>

          <h1 className="wallet-card-title">
            Connect Your Web3 Wallet
          </h1>

          <p className="wallet-card-desc">
            Connect your MetaMask wallet to authenticate your warrior identity, unlock tournament prize pools, and receive Dragon Gold rewards.
          </p>
        </div>

        {/* Primary MetaMask Provider Card */}
        <div className={`wallet-provider-box ${wallet.isConnected ? "is-connected" : ""}`}>
          <div className="provider-left">
            <div className="metamask-icon-wrap">
              <MetaMaskFoxSvg />
            </div>
            <div className="provider-text-wrap">
              <div className="provider-title-row">
                <h3>MetaMask</h3>
                <span className="provider-sub-badge">WEB3 PROVIDER</span>
              </div>
              <p>Connect using browser extension or mobile wallet</p>
            </div>
          </div>

          <div className="provider-action-wrap">
            {wallet.isConnected ? (
              <div className="connected-badge">
                <CheckCircle2 size={16} />
                <span>Connected</span>
              </div>
            ) : (
              <Button
                variant="primary"
                size="md"
                className="metamask-connect-btn"
                onClick={handleConnect}
                disabled={busy}
              >
                {busy ? "Connecting…" : "Connect"}
              </Button>
            )}
          </div>
        </div>

        {/* Connected Wallet State */}
        {wallet.isConnected ? (
          <div className="wallet-details-box">
            <div className="details-row">
              <span className="details-label">Wallet Address:</span>
              <div className="details-addr-group">
                <span className="details-value address">{wallet.address}</span>
                <button
                  type="button"
                  className="addr-copy-mini-btn"
                  onClick={handleCopyAddress}
                  title="Copy full address"
                >
                  {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            <div className="details-row">
              <span className="details-label">Network:</span>
              <span className="details-value network">
                <span className="network-dot" />
                {wallet.network || "Ethereum Sepolia"}
              </span>
            </div>

            <div className="details-row">
              <span className="details-label">Live Token Balance:</span>
              <span className="details-value gold">{wallet.balance || "0.0000 ETH"}</span>
            </div>

            <div className="wallet-actions-row">
              <Button variant="secondary" size="sm" onClick={disconnectWallet}>
                Disconnect
              </Button>
              <Button variant="secondary" size="sm" onClick={refreshWalletBalance}>
                <RefreshCw size={13} />
                <span>Refresh</span>
              </Button>
              <Button variant="emerald" size="md" onClick={() => navigate("/store")}>
                <ShoppingBag size={15} />
                <span>Dragon Emporium</span>
                <ArrowRight size={15} />
              </Button>
            </div>
          </div>
        ) : (
          /* Disconnected State: Demo Wallet Option */
          <div className="demo-wallet-box">
            <div className="demo-wallet-desc">
              <strong>Don&apos;t have MetaMask installed?</strong>
              <p>Use the Instant Dragon Vault test mode to experience Web3 rewards right away.</p>
            </div>
            <Button variant="secondary" size="md" className="demo-wallet-action-btn" onClick={handleDemo}>
              Instant Demo Wallet
            </Button>
          </div>
        )}

        {/* Benefits Grid (Two Cards) */}
        <div className="wallet-features-grid">
          <div className="feature-item">
            <div className="feat-icon-box">
              <ShieldCheck size={20} className="feat-icon" />
            </div>
            <div className="feat-content">
              <h4>Verifiable Identity</h4>
              <p>Your wins and battle achievements are permanently linked to your wallet.</p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feat-icon-box">
              <Coins size={20} className="feat-icon" />
            </div>
            <div className="feat-content">
              <h4>Battle Rewards</h4>
              <p>Win multiplayer matches and challenges to earn Dragon Gold tokens.</p>
            </div>
          </div>
        </div>

        {/* Dedicated Transaction Ledger Shortcut Card */}
        <div className="wallet-ledger-shortcut-box">
          <div className="ledger-box-left">
            <div className="ledger-receipt-icon-wrap">
              <Receipt size={18} />
            </div>
            <div className="ledger-receipt-text">
              <strong>Transaction History & Invoices</strong>
              <span>Inspect all past Web3 token orders & official receipts</span>
            </div>
          </div>

          <Button
            variant="emerald"
            size="sm"
            className="ledger-open-action-btn"
            onClick={() => navigate("/transactions")}
          >
            <span>Open Transaction Ledger</span>
            <ArrowRight size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
