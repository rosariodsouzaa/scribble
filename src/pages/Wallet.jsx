import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, ArrowRight, Wallet as WalletIcon, Sparkles } from 'lucide-react';
import { useGame } from '../context/GameContext';
import Button from '../components/Button';
import { formatAddress } from '../components/WalletStatus';

const MetaMaskFoxSvg = () => (
  <svg className="metamask-svg" viewBox="0 0 318.6 318.6" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M274.1 35.5L174.6 109.4L193 65.8L274.1 35.5Z" fill="#E17726" stroke="#E17726" strokeWidth="1.2"/>
    <path d="M44.4 35.5L143.5 109.8L125.6 65.8L44.4 35.5Z" fill="#E27625" stroke="#E27625" strokeWidth="1.2"/>
    <path d="M238.3 206.8L211.8 247.4L268.5 263L284.8 207.7L238.3 206.8Z" fill="#E27625" stroke="#E27625" strokeWidth="1.2"/>
    <path d="M33.9 207.7L50.1 263L106.8 247.4L80.3 206.8L33.9 207.7Z" fill="#E27625" stroke="#E27625" strokeWidth="1.2"/>
    <path d="M103.6 138.2L87.8 162.1L144.1 164.6L142.3 104.1L103.6 138.2Z" fill="#E27625" stroke="#E27625" strokeWidth="1.2"/>
    <path d="M214.9 138.2L175.9 103.4L174.6 164.6L230.8 162.1L214.9 138.2Z" fill="#E27625" stroke="#E27625" strokeWidth="1.2"/>
    <path d="M106.8 247.4L140.6 230.9L111.4 207.4L106.8 247.4Z" fill="#E27625" stroke="#E27625" strokeWidth="1.2"/>
    <path d="M178 230.9L211.8 247.4L207.2 207.4L178 230.9Z" fill="#E27625" stroke="#E27625" strokeWidth="1.2"/>
    <path d="M211.8 247.4L178 230.9L180.4 266.2L180.8 279.7L211.8 247.4Z" fill="#D5BFB2" stroke="#D5BFB2" strokeWidth="1.2"/>
    <path d="M106.8 247.4L137.8 279.7L138.2 266.2L140.6 230.9L106.8 247.4Z" fill="#D5BFB2" stroke="#D5BFB2" strokeWidth="1.2"/>
    <path d="M138.8 193.5L110.1 185.2L130.6 168.8L138.8 193.5Z" fill="#233447" stroke="#233447" strokeWidth="1.2"/>
    <path d="M179.8 193.5L188 168.8L208.5 185.2L179.8 193.5Z" fill="#233447" stroke="#233447" strokeWidth="1.2"/>
    <path d="M106.8 247.4L111.4 206.8L80.3 207.4L106.8 247.4Z" fill="#CC6228" stroke="#CC6228" strokeWidth="1.2"/>
    <path d="M207.2 206.8L211.8 247.4L238.3 207.4L207.2 206.8Z" fill="#CC6228" stroke="#CC6228" strokeWidth="1.2"/>
    <path d="M230.8 162.1L174.6 164.6L179.8 193.5L208.5 185.2L230.8 162.1Z" fill="#CC6228" stroke="#CC6228" strokeWidth="1.2"/>
    <path d="M87.8 162.1L110.1 185.2L138.8 193.5L144.1 164.6L87.8 162.1Z" fill="#CC6228" stroke="#CC6228" strokeWidth="1.2"/>
    <path d="M87.8 162.1L111.4 207.4L110.1 185.2L87.8 162.1Z" fill="#E27525" stroke="#E27525" strokeWidth="1.2"/>
    <path d="M208.5 185.2L207.2 207.4L230.8 162.1L208.5 185.2Z" fill="#E27525" stroke="#E27525" strokeWidth="1.2"/>
    <path d="M144.1 164.6L138.8 193.5L145.4 227.6L146 165.2L144.1 164.6Z" fill="#E27525" stroke="#E27525" strokeWidth="1.2"/>
    <path d="M174.6 164.6L172.6 165.2L173.2 227.6L179.8 193.5L174.6 164.6Z" fill="#E27525" stroke="#E27525" strokeWidth="1.2"/>
    <path d="M173.2 227.6L172.6 165.2L159.3 155.8L146 165.2L145.4 227.6L140.6 230.9L159.3 241.6L178 230.9L173.2 227.6Z" fill="#F5841F" stroke="#F5841F" strokeWidth="1.2"/>
    <path d="M178 230.9L159.3 241.6L140.6 230.9L138.2 266.2L137.8 279.7L159.3 293.2L180.8 279.7L180.4 266.2L178 230.9Z" fill="#C0AC9D" stroke="#C0AC9D" strokeWidth="1.2"/>
    <path d="M159.3 103.4L193 65.8L174.6 109.4L159.3 103.4Z" fill="#161616" stroke="#161616" strokeWidth="1.2"/>
    <path d="M159.3 103.4L143.5 109.8L125.6 65.8L159.3 103.4Z" fill="#161616" stroke="#161616" strokeWidth="1.2"/>
    <path d="M284.8 207.7L268.5 263L298.6 244.1L318.6 207.7H284.8Z" fill="#763E1A" stroke="#763E1A" strokeWidth="1.2"/>
    <path d="M0 207.7L20 244.1L50.1 263L33.9 207.7H0Z" fill="#763E1A" stroke="#763E1A" strokeWidth="1.2"/>
  </svg>
);

const Wallet = () => {
  const navigate = useNavigate();
  const { wallet, connectWallet } = useGame();
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    await new Promise((r) => setTimeout(r, 650));
    await connectWallet();
    setConnecting(false);
  };

  const handleContinue = () => {
    navigate('/game');
  };

  return (
    <div className="wallet-page">
      <div className="wallet-card-container">
        <div className="wallet-header">
          <div className="wallet-badge">
            <Sparkles size={15} />
            <span>Web3 Gaming Authentication</span>
          </div>
          <h1 className="wallet-title">Connect your wallet</h1>
          <p className="wallet-desc">
            Your wallet is required to play Scribble Royale. Connect your MetaMask wallet securely to participate in live matches.
          </p>
        </div>

        <div className="wallet-main-card">
          {/* Provider Card */}
          <div className={`wallet-provider-box ${wallet.isConnected ? 'active' : ''}`}>
            <div className="provider-left">
              <div className="metamask-icon-box">
                <MetaMaskFoxSvg />
              </div>
              <div className="provider-info">
                <h4>MetaMask</h4>
                <p>Connect using browser extension or mobile wallet</p>
              </div>
            </div>

            {wallet.isConnected && (
              <div style={{ color: 'var(--emerald)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.85rem' }}>
                <CheckCircle2 size={18} />
                <span>Connected</span>
              </div>
            )}
          </div>

          {/* Connected State Box */}
          {wallet.isConnected ? (
            <div className="connected-state-box">
              <div className="connected-header">
                <div className="connected-title">
                  <CheckCircle2 size={20} />
                  <span>Wallet Connected</span>
                </div>
                <div className="network-badge">
                  <span className="network-dot" />
                  <span>{wallet.network}</span>
                </div>
              </div>

              <div className="address-chip">
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Account:</span>
                <span className="address-text">{formatAddress(wallet.address || '0xA83B92C7F19672804d98a00191F')}</span>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={handleContinue}
                style={{ width: '100%', marginTop: '0.5rem' }}
                icon={<ArrowRight size={20} />}
              >
                Continue to Game
              </Button>
            </div>
          ) : (
            <Button
              variant="primary"
              size="lg"
              onClick={handleConnect}
              disabled={connecting}
              style={{ width: '100%' }}
              icon={<WalletIcon size={20} />}
            >
              {connecting ? 'Connecting...' : 'Connect MetaMask'}
            </Button>
          )}

          {/* Security Guarantee Note */}
          <div className="wallet-security-note">
            <ShieldCheck size={18} />
            <span>
              We will never request your private keys, seed phrases, or transfer permissions. Connection is strictly for gamer verification.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
