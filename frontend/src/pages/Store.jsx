import React, { useState } from "react";
import {
  Sparkles,
  Coins,
  Shield,
  CreditCard,
  Wallet as WalletIcon,
  Check,
  Flame,
  Zap,
  ArrowRight,
  Receipt,
  Download,
} from "lucide-react";
import { usePayment } from "../context/PaymentContext.jsx";
import { useAuthWallet } from "../context/AuthWalletContext.jsx";
import Button from "../components/Button.jsx";
import PaymentModal from "../components/PaymentModal.jsx";

export default function Store() {
  const { items, ownedItems, equippedBrush, transactions, openCheckout, equipBrush, buyWithGold } = usePayment();
  const { user } = useAuthWallet();

  const [activeTab, setActiveTab] = useState("all"); // all | gold | pass | brush
  const [goldError, setGoldError] = useState("");

  const filteredItems = items.filter((item) => {
    if (activeTab === "all") return true;
    return item.category === activeTab;
  });

  const handleGoldPurchase = (item) => {
    setGoldError("");
    const res = buyWithGold(item);
    if (!res.success) {
      setGoldError(res.error);
    }
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
            <span>DRAGON EMPORIUM & SECURE GATEWAY</span>
          </div>

          <h1 className="store-hero-title">
            Unlock the Dynasty's <span className="gold-gradient-text">Greatest Treasures</span>
          </h1>

          <p className="store-hero-desc">
            Acquire Dragon Gold bundles, claim the Season 4 VIP Pass, and equip mythic calligraphy brush skins with fire and lightning stroke animations.
          </p>

          <div className="store-balance-strip">
            <div className="store-bal-item">
              <span className="bal-lbl">Your Vault Balance:</span>
              <span className="bal-val gold">🪙 {user.coins.toLocaleString()} GOLD</span>
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

      {goldError && <div className="store-gold-error">{goldError}</div>}

      {/* Filter Tabs */}
      <div className="store-filter-bar">
        <div className="store-tabs-group">
          {[
            { id: "all", label: "✨ All Items" },
            { id: "gold", label: "🪙 Gold Bundles" },
            { id: "pass", label: "📜 Season VIP Pass" },
            { id: "brush", label: "🎨 Brush Cosmetics" },
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
                  <span className="price-main">${item.priceUsd} USD</span>
                  <span className="price-sub">≈ {item.priceEth} ETH</span>
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
                        Buy Now
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
              <p>Verified on-chain and gateway receipts for your account.</p>
            </div>
          </div>
        </div>

        {transactions.length === 0 ? (
          <p className="ledger-empty">No transactions recorded yet.</p>
        ) : (
          <div className="ledger-table-wrap">
            <div className="ledger-table-head">
              <span>INVOICE ID</span>
              <span>DATE</span>
              <span>ITEM</span>
              <span>AMOUNT</span>
              <span>PAYMENT METHOD</span>
              <span>STATUS</span>
            </div>

            <div className="ledger-table-body">
              {transactions.map((tx) => (
                <div key={tx.id} className="ledger-table-row">
                  <span className="tx-id">{tx.id}</span>
                  <span className="tx-date">{tx.date}</span>
                  <span className="tx-item">{tx.item}</span>
                  <span className="tx-amount">{tx.amount}</span>
                  <span className="tx-method">{tx.method}</span>
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
