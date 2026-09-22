import React, { useState, useEffect } from "react";
import {
  X,
  Wallet as WalletIcon,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Sparkles,
  Coins,
  ArrowRight,
  Mail,
  Printer,
  Copy,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { usePayment } from "../context/PaymentContext.jsx";
import { useAuthWallet } from "../context/AuthWalletContext.jsx";
import Button from "./Button.jsx";

export default function PaymentModal() {
  const { activeItem, checkoutModalOpen, closeCheckout, processPayment } = usePayment();
  const { wallet, user, connectMetaMask, connectDemoWallet } = useAuthWallet();

  // Receipt delivery email
  const [email, setEmail] = useState("");
  const [copiedHash, setCopiedHash] = useState(false);

  // Stepper & Payment State
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(null); // 'PREPARING' | 'SIGNING' | 'BROADCASTING' | 'CONFIRMING' | 'COMPLETED'
  const [stepMessage, setStepMessage] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState("");

  // Pre-fill email from logged-in user profile
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  if (!checkoutModalOpen || !activeItem) return null;

  const itemPriceEth = parseFloat(activeItem.priceEth || "0.002");
  const walletEthBalance = parseFloat(String(wallet?.balance || "0").replace(/[^0-9.]/g, "")) || 0;
  const hasSufficientBalance = Boolean(wallet?.isConnected && walletEthBalance >= itemPriceEth);

  const stepsList = [
    { key: "PREPARING", label: "Payload Ready" },
    { key: "SIGNING", label: "MetaMask Signature" },
    { key: "BROADCASTING", label: "Mempool Broadcast" },
    { key: "CONFIRMING", label: "Block Verification" },
    { key: "COMPLETED", label: "Receipt Minted" },
  ];

  const getStepIndex = (stepKey) => {
    return stepsList.findIndex((s) => s.key === stepKey);
  };

  const handleConnectWallet = async () => {
    setError("");
    const res = await connectMetaMask();
    if (!res?.success) {
      setError(res?.error || "Failed to connect to MetaMask.");
    }
  };

  const handlePay = async (e) => {
    e?.preventDefault();
    setError("");

    if (!wallet?.isConnected) {
      setError("Please connect your MetaMask wallet first.");
      return;
    }

    if (!hasSufficientBalance) {
      setError(
        `Insufficient ETH balance. Your wallet currently has ${wallet.balance || "0.0000 ETH"}, but this purchase requires ${itemPriceEth} ETH (+ network gas). Please top up your wallet.`
      );
      return;
    }

    setProcessing(true);
    setCurrentStep("PREPARING");
    setStepMessage("Preparing on-chain transaction payload & verifying balance...");

    try {
      const res = await processPayment({
        item: activeItem,
        method: wallet?.isMetaMask ? "metamask" : (wallet?.isConnected ? "demo" : "metamask"),
        email: email.trim(),
        onStepChange: (step, msg) => {
          setCurrentStep(step);
          if (msg) setStepMessage(msg);
        },
      });

      if (res.success) {
        setReceipt(res.receipt || res.transaction);
      } else {
        setError(res.error || "Transaction signature was cancelled or failed.");
        setCurrentStep(null);
      }
    } catch (err) {
      setError(err.message || "Network transaction error. Please try again.");
      setCurrentStep(null);
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    if (processing) return; // prevent close during signing
    setReceipt(null);
    setCurrentStep(null);
    setStepMessage("");
    setError("");
    closeCheckout();
  };

  const handleCopyHash = (hash) => {
    if (!hash) return;
    navigator.clipboard?.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const formatShortAddr = (addr) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal-card dragon-card web3-checkout-modal">
        {/* Imperial Brackets */}
        <div className="imperial-bracket tl" />
        <div className="imperial-bracket tr" />
        <div className="imperial-bracket bl" />
        <div className="imperial-bracket br" />

        {/* Header */}
        <div className="payment-modal-header">
          <div className="pay-tag">
            <Lock size={12} />
            <span>WEB3 TOKEN SMART CHECKOUT</span>
          </div>
          {!processing && (
            <button className="modal-close-btn" onClick={handleClose} title="Close checkout">
              <X size={18} />
            </button>
          )}
        </div>

        {receipt ? (
          /* ==================== OFFICIAL RECEIPT VIEW ==================== */
          <div className="payment-success-view printable-receipt">
            <div className="success-icon-wrap">
              <CheckCircle2 size={52} className="success-icon" />
            </div>
            <h2 className="success-title">Payment Confirmed & Verified!</h2>
            <p className="success-sub">
              Your Web3 token payment was confirmed on-chain and your in-game coins have been credited.
            </p>

            {/* Email Dispatch Notification Banner */}
            {receipt.email && (
              <div className="receipt-email-banner">
                <Mail size={16} className="mail-icon" />
                <span>
                  Official invoice & receipt delivered to <strong>{receipt.email}</strong>
                </span>
              </div>
            )}

            {/* Imperial Treasury Receipt Card */}
            <div className="receipt-box imperial-receipt-card">
              <div className="receipt-header-row">
                <span className="receipt-title-tag">OFFICIAL SETTLEMENT INVOICE</span>
                <span className="receipt-id-tag">#{receipt.id}</span>
              </div>

              <div className="receipt-divider" />

              <div className="receipt-row">
                <span>Date & Time:</span>
                <strong>{receipt.date}</strong>
              </div>
              <div className="receipt-row">
                <span>Item Acquired:</span>
                <strong className="receipt-item-name">{receipt.item}</strong>
              </div>
              {receipt.goldAmount && (
                <div className="receipt-row">
                  <span>In-Game Coins Credited:</span>
                  <strong className="receipt-gold-val">
                    +{Number(receipt.goldAmount).toLocaleString()} Dragon Gold
                  </strong>
                </div>
              )}

              {/* Live Token Deduction Breakdown */}
              <div className="receipt-divider" />
              <div className="receipt-balance-ledger-block">
                {receipt.initialBalance && (
                  <div className="receipt-row">
                    <span>Initial Wallet Balance:</span>
                    <span className="hash-mono">{receipt.initialBalance}</span>
                  </div>
                )}
                <div className="receipt-row">
                  <span>Tokens Deducted:</span>
                  <strong className="receipt-token-amount text-amber-400">-{receipt.amount}</strong>
                </div>
                {receipt.remainingBalance && (
                  <div className="receipt-row">
                    <span>Updated Wallet Balance:</span>
                    <strong className="text-emerald-400 font-bold">{receipt.remainingBalance}</strong>
                  </div>
                )}
              </div>
              <div className="receipt-divider" />

              <div className="receipt-row">
                <span>Paying Wallet:</span>
                <span className="hash-mono">{formatShortAddr(receipt.walletAddress)}</span>
              </div>
              <div className="receipt-row">
                <span>Blockchain Network:</span>
                <strong>{receipt.network || "Ethereum Network"}</strong>
              </div>
              <div className="receipt-row tx-hash-row">
                <span>Transaction Hash:</span>
                <div className="hash-action-wrap">
                  <span className="hash-mono" title={receipt.txHash}>
                    {formatShortAddr(receipt.txHash || "0x00000000")}
                  </span>
                  <button
                    className="receipt-copy-btn"
                    onClick={() => handleCopyHash(receipt.txHash)}
                    title="Copy Transaction Hash"
                  >
                    {copiedHash ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="receipt-actions-row">
              <button className="receipt-print-btn" onClick={handlePrintReceipt}>
                <Printer size={15} />
                <span>Print Invoice</span>
              </button>
              <Button variant="flame" size="lg" onClick={handleClose}>
                Claim & Return to Arena
              </Button>
            </div>
          </div>
        ) : (
          /* ==================== WEB3 CHECKOUT BODY ==================== */
          <div className="payment-checkout-body">
            {/* Left Column: Item Overview */}
            <div className="checkout-summary-col">
              <div className="summary-item-card">
                {activeItem.badge && (
                  <div className="item-badge-pill" style={{ color: activeItem.color || "#ffd700" }}>
                    <Sparkles size={13} />
                    <span>{activeItem.badge}</span>
                  </div>
                )}

                <div className="item-icon-huge">{activeItem.icon}</div>
                <h3 className="summary-item-name">{activeItem.name}</h3>
                <p className="summary-item-desc">{activeItem.description}</p>

                {/* Token Pricing */}
                <div className="token-price-display">
                  <span className="token-crypto-val">{activeItem.priceEth} ETH</span>
                  <span className="token-crypto-sub">Pay directly with Web3 Tokens</span>
                </div>

                {activeItem.goldAmount && (
                  <div className="gold-reward-pill">
                    <Coins size={15} color="#ffd700" />
                    <span>+{activeItem.goldAmount.toLocaleString()} Dragon Gold</span>
                  </div>
                )}
              </div>

              <div className="security-guarantee-box">
                <ShieldCheck size={18} className="shield-icon" />
                <div>
                  <strong>Token-Only Settlement</strong>
                  <p>Direct smart contract transfer with automatic balance validation & instant delivery.</p>
                </div>
              </div>
            </div>

            {/* Right Column: Web3 Wallet & Transaction Steps */}
            <div className="checkout-rails-col">
              {/* Connected Wallet Status Card */}
              <div className="web3-wallet-panel dragon-card">
                <div className="panel-header-row">
                  <div className="panel-title-wrap">
                    <WalletIcon size={18} className="text-amber-400" />
                    <h4>Connected Web3 Wallet</h4>
                  </div>
                  {wallet?.isConnected && (
                    <span className="network-pill-tag">{wallet.network || "Ethereum"}</span>
                  )}
                </div>

                {wallet?.isConnected ? (
                  <div className="wallet-connected-details">
                    <div className="wallet-data-row">
                      <span className="data-lbl">Address:</span>
                      <strong className="hash-mono">{formatShortAddr(wallet.address)}</strong>
                    </div>

                    <div className="wallet-data-row balance-highlight">
                      <span className="data-lbl">Live Token Balance:</span>
                      <strong className="wallet-eth-balance">{wallet.balance || "0.0000 ETH"}</strong>
                    </div>

                    {/* Strict Insufficient Funds Warning */}
                    {!hasSufficientBalance && (
                      <div className="balance-warning-banner">
                        <AlertCircle size={15} className="flex-shrink-0" />
                        <span>
                          Insufficient balance ({wallet.balance || "0.0000 ETH"}). You need at least{" "}
                          {activeItem.priceEth} ETH to purchase this item.
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="wallet-disconnected-box">
                    <p className="wallet-disconn-text">
                      No Web3 wallet connected. Connect your MetaMask wallet to pay with tokens.
                    </p>
                    <div className="wallet-connect-actions">
                      <Button
                        variant="primary"
                        size="md"
                        onClick={handleConnectWallet}
                        className="connect-metamask-btn"
                      >
                        <WalletIcon size={16} />
                        <span>Connect MetaMask</span>
                      </Button>
                      <button
                        type="button"
                        className="demo-vault-btn"
                        onClick={connectDemoWallet}
                        title="Use Instant Dragon Demo Vault"
                      >
                        or Use Demo Vault
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Receipt Delivery Email Form */}
              <div className="email-receipt-section">
                <label className="input-label-with-icon">
                  <Mail size={14} />
                  <span>Send Official Receipt To Email</span>
                </label>
                <input
                  type="email"
                  className="input dragon-input"
                  placeholder="warrior@dragon.realm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={processing}
                  required
                />
                <span className="input-micro-hint">
                  An official transaction confirmation & invoice will be sent to this email.
                </span>
              </div>

              {/* Real-time Stepper (shown while processing) */}
              {processing && (
                <div className="realtime-stepper-box">
                  <div className="stepper-header">
                    <Loader2 size={16} className="animate-spin text-amber-400" />
                    <span>Real-Time On-Chain Progression</span>
                  </div>

                  <div className="stepper-track">
                    {stepsList.map((st, idx) => {
                      const curIdx = getStepIndex(currentStep);
                      const isDone = curIdx > idx;
                      const isCurrent = curIdx === idx;
                      return (
                        <div
                          key={st.key}
                          className={`stepper-step ${isDone ? "completed" : ""} ${
                            isCurrent ? "active" : ""
                          }`}
                        >
                          <div className="step-circle">
                            {isDone ? (
                              <Check size={12} />
                            ) : isCurrent ? (
                              <div className="step-spinner" />
                            ) : (
                              <span>{idx + 1}</span>
                            )}
                          </div>
                          <span className="step-lbl">{st.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  {stepMessage && <p className="step-live-message">{stepMessage}</p>}
                </div>
              )}

              {error && (
                <div className="payment-error-banner">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Action Button */}
              <div className="checkout-cta-wrap">
                {wallet?.isConnected ? (
                  <Button
                    variant={hasSufficientBalance ? "flame" : "secondary"}
                    size="lg"
                    className="block pay-submit-btn"
                    onClick={handlePay}
                    disabled={processing || !hasSufficientBalance}
                  >
                    {processing ? (
                      <span className="btn-flex-center">
                        <Loader2 size={18} className="animate-spin" />
                        <span>Broadcasting to Chain…</span>
                      </span>
                    ) : !hasSufficientBalance ? (
                      <span className="btn-flex-center">
                        <span>Insufficient Balance ({wallet.balance || "0.0000 ETH"})</span>
                      </span>
                    ) : (
                      <span className="btn-flex-center">
                        <span>Pay {activeItem.priceEth} ETH with Tokens</span>
                        <ArrowRight size={18} />
                      </span>
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    className="block pay-submit-btn"
                    onClick={handleConnectWallet}
                  >
                    Connect MetaMask to Purchase
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
