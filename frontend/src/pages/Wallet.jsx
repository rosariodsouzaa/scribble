import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Wallet as WalletIcon,
  Sparkles,
  ExternalLink,
  Coins,
  RefreshCw,
} from "lucide-react";
import { useAuthWallet } from "../context/AuthWalletContext.jsx";
import Button from "../components/Button.jsx";
import { formatAddress } from "../components/WalletStatus.jsx";

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
  const { wallet, connectMetaMask, connectDemoWallet, disconnectWallet } = useAuthWallet();
  const [busy, setBusy] = useState(false);

  const handleConnect = async () => {
    setBusy(true);
    await connectMetaMask();
    setBusy(false);
  };

  const handleDemo = () => {
    connectDemoWallet();
  };

  return (
    <div className="wallet-page-container">
      <div className="wallet-card-master dragon-card">
        {/* Imperial Corner Brackets */}
        <div className="imperial-bracket tl" />
        <div className="imperial-bracket tr" />
        <div className="imperial-bracket bl" />
        <div className="imperial-bracket br" />

        <div className="wallet-card-header">
          <div className="wallet-tag-badge">
            <Sparkles size={14} />
            <span>DRAGON VAULT & WEB3</span>
          </div>
          <h1>Connect Your Web3 Wallet</h1>
          <p>
            Connect your MetaMask wallet to authenticate your warrior identity, unlock tournament prize pools, and receive Dragon Gold rewards.
          </p>
        </div>

        {/* MetaMask Provider Option */}
        <div className={`wallet-provider-box ${wallet.isConnected ? "is-connected" : ""}`}>
          <div className="provider-left">
            <div className="metamask-icon-wrap">
              <MetaMaskFoxSvg />
            </div>
            <div>
              <h3>MetaMask</h3>
              <p>Connect using browser extension or mobile wallet</p>
            </div>
          </div>

          <div>
            {wallet.isConnected ? (
              <div className="connected-badge">
                <CheckCircle2 size={16} color="#10b981" />
                <span>Connected</span>
              </div>
            ) : (
              <Button variant="primary" size="md" onClick={handleConnect} disabled={busy}>
                {busy ? "Connecting…" : "Connect"}
              </Button>
            )}
          </div>
        </div>

        {/* Connected Wallet Details */}
        {wallet.isConnected ? (
          <div className="wallet-details-box">
            <div className="details-row">
              <span className="details-label">Wallet Address:</span>
              <span className="details-value address">{wallet.address}</span>
            </div>
            <div className="details-row">
              <span className="details-label">Network:</span>
              <span className="details-value">{wallet.network}</span>
            </div>
            <div className="details-row">
              <span className="details-label">Balance:</span>
              <span className="details-value gold">{wallet.balance}</span>
            </div>

            <div className="wallet-actions-row">
              <Button variant="secondary" size="sm" onClick={disconnectWallet}>
                Disconnect Wallet
              </Button>
              <Button variant="emerald" size="md" onClick={() => navigate("/lobby")}>
                Proceed to Arena <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        ) : (
          <div className="demo-wallet-box">
            <div className="demo-wallet-desc">
              <strong>Don't have MetaMask installed?</strong>
              <p>Use the Instant Dragon Vault test mode to experience Web3 rewards right away.</p>
            </div>
            <Button variant="secondary" size="md" onClick={handleDemo}>
              ⚡ Instant Demo Wallet
            </Button>
          </div>
        )}

        {/* Benefits Grid */}
        <div className="wallet-features-grid">
          <div className="feature-item">
            <ShieldCheck size={22} className="feat-icon" />
            <div>
              <h4>Verifiable Identity</h4>
              <p>Your wins and leaderboard rank are permanently linked to your wallet.</p>
            </div>
          </div>
          <div className="feature-item">
            <Coins size={22} className="feat-icon" />
            <div>
              <h4>Season Rewards</h4>
              <p>Climb the Dynasty Hall of Fame to earn Dragon Gold crypto tokens.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
