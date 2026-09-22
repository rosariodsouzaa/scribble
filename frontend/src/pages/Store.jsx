import React, { useState } from "react";
import {
  Sparkles,
  Coins,
  Shield,
  Wallet as WalletIcon,
  Check,
  Flame,
  Zap,
  ArrowRight,
  Receipt,
  RotateCw,
  ExternalLink,
} from "lucide-react";
import { usePayment } from "../context/PaymentContext.jsx";
import { useAuthWallet } from "../context/AuthWalletContext.jsx";
import Button from "../components/Button.jsx";
import PaymentModal from "../components/PaymentModal.jsx";

export default function Store() {
  const { items, ownedItems, equippedBrush, transactions, openCheckout, equipBrush, buyWithGold } =
    usePayment();
  const { user, wallet, connectMetaMask, refreshWalletBalance } = useAuthWallet();

  const [activeTab, setActiveTab] = useState("all"); // all | gold | pass | brush
  const [goldError, setGoldError] = useState("");
  const [goldSuccess, setGoldSuccess] = useState("");
  const [walletError, setWalletError] = useState("");
  const [isRefreshingBal, setIsRefreshingBal] = useState(false);

  const filteredItems = items.filter((item) => {
    if (activeTab === "all") return true;
    return item.category === activeTab;
  });

  const handleGoldPurchase = async (item) => {
    setGoldError("");
    setGoldSuccess("");
    try {
      const res = await buyWithGold(item);
      if (!res.success) {
        setGoldError(res.error || "Failed to acquire item with Gold.");
      } else {
        setGoldSuccess(`Successfully acquired ${item.name}! Equipped to your persona.`);
        setTimeout(() => setGoldSuccess(""), 4000);
      }
    } catch (err) {
      setGoldError(err.message || "Gold transaction failed.");
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshingBal(true);
    try {
      await refreshWalletBalance();
    } finally {
      setTimeout(() => setIsRefreshingBal(false), 600);
    }
  };

  const handleConnectWallet = async () => {
    setWalletError("");
    const res = await connectMetaMask();
    if (!res?.success) {
      setWalletError(res?.error || "Failed to connect MetaMask.");
      setTimeout(() => setWalletError(""), 6000);
    }
  };

  const formatShortAddr = (addr) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="store-page">
      <PaymentModal />

      {/* Store Hero Banner */}
      <div className="store-hero-banner">
        <div className="hero-ornament tl" />
        <div className="hero-ornament tr" />
        <div className="hero-ornament bl" />
        <div className="hero-ornament br" />

        <div className="store-hero-content">
          <div className="hero-season-tag">
            <Sparkles size={14} />
            <span>DRAGON EMPORIUM & WEB3 TOKEN GATEWAY</span>
          </div>

          <h1 className="store-hero-title">
            Power Up with <span className="gold-gradient-text">Dragon Gold</span>
          </h1>

          <p className="store-hero-desc">
            Use your connected MetaMask wallet balance to acquire Dragon Gold bundles, claim the Season VIP Pass, and equip mythic calligraphy brush skins. All purchases are settled directly with Web3 tokens.
          </p>

          {/* Web3 Wallet Banner */}
          <div className="store-wallet-card dragon-card">
            <div className="store-wallet-info">
              <div className="wallet-avatar-pill">
                <WalletIcon size={20} className="text-amber-400" />
              </div>
              <div>
                <div className="wallet-card-title-row">
                  <span className="wallet-title-text">
                    {wallet?.isConnected ? "MetaMask Wallet Connected" : "No Wallet Connected"}
                  </span>
                  {wallet?.isConnected && (
                    <span className="wallet-net-badge">{wallet.network || "Ethereum"}</span>
                  )}
                </div>
                <div className="wallet-subtext">
                  {wallet?.isConnected ? (
                    <span>Address: <code className="hash-mono">{formatShortAddr(wallet.address)}</code></span>
                  ) : (
                    <span>Connect your wallet to purchase coins directly with crypto tokens</span>
                  )}
                </div>
              </div>
            </div>

            <div className="store-wallet-actions">
              {wallet?.isConnected ? (
                <div className="store-wallet-bal-wrap">
                  <div className="bal-display-col">
                    <span className="bal-micro-label">WALLET BALANCE</span>
                    <span className="bal-crypto-val">{wallet.balance || "0.00 ETH"}</span>
                  </div>
                  <button
                    className={`refresh-bal-btn ${isRefreshingBal ? "spinning" : ""}`}
                    onClick={handleManualRefresh}
                    title="Refresh on-chain balance"
                  >
                    <RotateCw size={14} />
                  </button>
                </div>
              ) : (
                <Button variant="primary" size="md" onClick={handleConnectWallet}>
                  <WalletIcon size={16} />
                  <span>Connect MetaMask</span>
                </Button>
              )}
            </div>
          </div>

          {/* Balance Strip */}
          <div className="store-balance-strip">
            <div className="store-bal-item">
              <span className="bal-lbl">Your In-Game Vault:</span>
              <span className="bal-val gold">
                <Coins size={16} className="inline mr-1" />
                {(user?.coins || 0).toLocaleString()} GOLD
              </span>
            </div>
            <div className="store-bal-item">
              <span className="bal-lbl">Crypto Token Balance:</span>
              <span className="bal-val crypto">
                {wallet?.isConnected ? wallet.balance : "Disconnected"}
              </span>
            </div>
            <div className="store-bal-item">
              <span className="bal-lbl">Active Brush:</span>
              <span className="bal-val">
                {items.find((i) => i.id === equippedBrush)?.name || "Default Ink Brush"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {walletError && <div className="store-gold-error" style={{ margin: "16px 0" }}>⚠️ {walletError}</div>}
      {goldError && <div className="store-gold-error">⚠️ {goldError}</div>}
      {goldSuccess && <div className="auth-alert success" style={{ margin: "16px 0" }}>✓ {goldSuccess}</div>}

      {/* Filter Tabs */}
      <div className="store-filter-bar">
        <div className="store-tabs-group">
          {[
            { id: "all", label: " All Items" },
            { id: "gold", label: " Gold Bundles" },
            { id: "pass", label: " Season VIP Pass" },
            { id: "brush", label: " Brush Cosmetics" },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`store-tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="store-cards-grid">
        {filteredItems.map((item) => {
          const isOwned = ownedItems.includes(item.id);
          const isEquipped = equippedBrush === item.id;

          return (
            <div key={item.id} className={`store-card ${isEquipped ? "is-equipped" : ""}`}>
              {item.badge && (
                <div className="store-card-badge" style={{ backgroundColor: item.color }}>
                  {item.badge}
                </div>
              )}

              <div className="store-card-icon-wrap" style={{ textShadow: `0 0 20px ${item.color}` }}>
                {item.icon}
              </div>

              <h3 className="store-card-name">{item.name}</h3>
              <p className="store-card-desc">{item.description}</p>

              <div className="store-card-footer">
                <div className="store-card-pricing">
                  <span className="price-main token-price">{item.priceEth || "0.002"} ETH</span>
                  <span className="price-sub">Web3 Tokens</span>
                </div>

                <div className="store-card-actions">
                  {item.category === "brush" && isOwned ? (
                    isEquipped ? (
                      <div className="equipped-badge">
                        <Check size={16} />
                        <span>Equipped</span>
                      </div>
                    ) : (
                      <Button variant="emerald" size="sm" onClick={() => equipBrush(item.id)}>
                        Equip Brush
                      </Button>
                    )
                  ) : (
                    <div className="buy-buttons-cluster">
                      {item.goldCost && (
                        <button
                          className="btn-buy-gold"
                          onClick={() => handleGoldPurchase(item)}
                          title={`Buy with ${item.goldCost} in-game Dragon Gold`}
                        >
                          🪙 {item.goldCost.toLocaleString()}
                        </button>
                      )}

                      <Button
                        variant={item.category === "gold" ? "flame" : "primary"}
                        size="sm"
                        onClick={() => openCheckout(item)}
                      >
                        Buy with Tokens
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Transaction History & Invoice Ledger */}
      <div className="store-ledger-section dragon-card">
        <div className="ledger-header">
          <div className="ledger-title-wrap">
            <Receipt size={20} className="receipt-icon" />
            <div>
              <h3>Dragon Treasury Transaction Ledger</h3>
              <p>Verified on-chain transactions and official email receipts for your account.</p>
            </div>
          </div>
        </div>

        {transactions.length === 0 ? (
          <p className="ledger-empty">No transactions recorded yet.</p>
        ) : (
          <div className="ledger-table-wrap">
            <div className="ledger-table-head">
              <span>INVOICE / RECEIPT</span>
              <span>DATE</span>
              <span>ITEM</span>
              <span>TOKEN AMOUNT</span>
              <span>PAYMENT METHOD</span>
              <span>TX HASH</span>
              <span>STATUS</span>
            </div>

            <div className="ledger-table-body">
              {transactions.map((tx) => (
                <div key={tx.id} className="ledger-table-row">
                  <span className="tx-id">{tx.receiptId || tx.id}</span>
                  <span className="tx-date">{tx.date}</span>
                  <span className="tx-item">{tx.item}</span>
                  <span className="tx-amount font-semibold text-amber-400">{tx.amount}</span>
                  <span className="tx-method">{tx.method}</span>
                  <span className="tx-hash hash-mono" title={tx.hash}>
                    {formatShortAddr(tx.hash || "0x00000000")}
                  </span>
                  <span className="tx-status-badge">{tx.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
