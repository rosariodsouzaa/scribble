import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Receipt,
  Search,
  Filter,
  Download,
  Coins,
  Wallet as WalletIcon,
  Sparkles,
  ExternalLink,
  RotateCw,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  ShoppingBag,
  FileText,
  Copy,
  Check,
  Flame,
  ShieldCheck,
} from "lucide-react";
import { usePayment } from "../context/PaymentContext.jsx";
import { useAuthWallet } from "../context/AuthWalletContext.jsx";
import Button from "./Button.jsx";
import TransactionReceiptModal from "./TransactionReceiptModal.jsx";

export default function TransactionHistory({ title = "Dragon Treasury Transaction Ledger", showHeader = true, limit = null }) {
  const navigate = useNavigate();
  const { transactions, loadingTransactions, fetchTransactions, items } = usePayment();
  const { user, wallet, isAdmin } = useAuthWallet();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all"); // all, gold, crypto, pass, brush
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, highest
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedHash, setCopiedHash] = useState("");

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (typeof fetchTransactions === "function") {
        await fetchTransactions();
      }
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleCopyHash = (hash, e) => {
    e?.stopPropagation();
    if (!hash) return;
    navigator.clipboard?.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(""), 2000);
  };

  // Find item icon or details by name/id
  const getItemDetails = (tx) => {
    const found = items?.find(
      (i) => i.id === tx.itemId || i.name.toLowerCase() === (tx.item || tx.itemName || "").toLowerCase()
    );
    return {
      icon: found?.icon || (tx.category === "gold" ? "🪙" : tx.category === "pass" ? "👑" : "🖌️"),
      badge: found?.badge || (tx.category === "gold" ? "Gold Bundle" : tx.category === "pass" ? "Season Pass" : "Cosmetic"),
      color: found?.color || "#ffd700",
    };
  };

  // Filter and sort transactions (strictly for current player account, or all transactions for Admin)
  const filteredTransactions = useMemo(() => {
    if (!Array.isArray(transactions)) return [];

    let list = [];

    if (isAdmin || user?.role === "admin" || user?.accountType === "admin") {
      // Admins view overall transactions of ALL players
      list = [...transactions];
    } else {
      const hasAccount = Boolean(
        (user?.isAuthenticated && (user?.id || user?.email)) ||
        user?.id ||
        user?.email ||
        (wallet?.isConnected && wallet?.address)
      );

      if (!hasAccount) {
        return [];
      }

      list = transactions.filter((t) => {
        const matchUser = user?.id && String(t.userId || "") === String(user.id);
        const matchEmail = user?.email && String(t.email || "").toLowerCase().trim() === String(user.email).toLowerCase().trim();
        const matchWallet = wallet?.address && String(t.walletAddress || "").toLowerCase().trim() === String(wallet.address).toLowerCase().trim();
        return Boolean(matchUser || matchEmail || matchWallet);
      });
    }

    // Filter by category or payment rail
    if (filterCategory !== "all") {
      if (filterCategory === "crypto") {
        list = list.filter((t) => {
          const method = String(t.method || t.paymentMethod || "").toLowerCase();
          return method.includes("metamask") || method.includes("eth") || method.includes("token") || method.includes("web3");
        });
      } else if (filterCategory === "gold_method") {
        list = list.filter((t) => {
          const method = String(t.method || t.paymentMethod || "").toLowerCase();
          return method.includes("gold");
        });
      } else {
        list = list.filter((t) => {
          const cat = String(t.category || "").toLowerCase();
          const itemName = String(t.item || t.itemName || "").toLowerCase();
          if (filterCategory === "gold") return cat === "gold" || itemName.includes("gold");
          if (filterCategory === "pass") return cat === "pass" || itemName.includes("pass");
          if (filterCategory === "brush") return cat === "brush" || itemName.includes("brush") || itemName.includes("ink");
          return true;
        });
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (t) =>
          (t.item && t.item.toLowerCase().includes(q)) ||
          (t.itemName && t.itemName.toLowerCase().includes(q)) ||
          (t.userName && t.userName.toLowerCase().includes(q)) ||
          (t.email && t.email.toLowerCase().includes(q)) ||
          (t.id && t.id.toLowerCase().includes(q)) ||
          (t.receiptId && t.receiptId.toLowerCase().includes(q)) ||
          (t.walletAddress && t.walletAddress.toLowerCase().includes(q)) ||
          (t.hash && t.hash.toLowerCase().includes(q)) ||
          (t.txHash && t.txHash.toLowerCase().includes(q)) ||
          (t.method && t.method.toLowerCase().includes(q))
      );
    }

    // Sort
    list.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date || 0).getTime();
      const dateB = new Date(b.createdAt || b.date || 0).getTime();
      if (sortBy === "newest") return dateB - dateA;
      if (sortBy === "oldest") return dateA - dateB;
      if (sortBy === "highest") {
        const valA = parseFloat(String(a.amount).replace(/[^0-9.]/g, "")) || 0;
        const valB = parseFloat(String(b.amount).replace(/[^0-9.]/g, "")) || 0;
        return valB - valA;
      }
      return dateB - dateA;
    });

    if (limit && typeof limit === "number") {
      return list.slice(0, limit);
    }

    return list;
  }, [transactions, user?.id, user?.email, user?.role, user?.accountType, user?.isAuthenticated, wallet?.isConnected, wallet?.address, isAdmin, filterCategory, searchQuery, sortBy, limit]);

  // Aggregate stats calculations
  const stats = useMemo(() => {
    if (!Array.isArray(filteredTransactions)) {
      return { totalCount: 0, totalGold: 0, totalEth: "0.0000", latestDate: "N/A" };
    }

    let goldSum = 0;
    let ethSum = 0;

    filteredTransactions.forEach((tx) => {
      if (tx.goldAmount) {
        goldSum += Number(tx.goldAmount);
      }
      const amountStr = String(tx.amount || "");
      if (amountStr.includes("ETH")) {
        const ethVal = parseFloat(amountStr.replace(/[^0-9.]/g, "")) || 0;
        ethSum += ethVal;
      }
    });

    const latestTx = filteredTransactions[0];
    const latestDate = latestTx ? latestTx.date || (latestTx.createdAt ? new Date(latestTx.createdAt).toLocaleDateString() : "Recent") : "No Orders";

    return {
      totalCount: filteredTransactions.length,
      totalGold: goldSum,
      totalEth: ethSum.toFixed(4),
      latestDate,
    };
  }, [filteredTransactions]);

  // Export to CSV
  const handleExportCsv = () => {
    if (!filteredTransactions || filteredTransactions.length === 0) return;

    const headers = ["Invoice ID", "Date", "Item", "Category", "Amount", "Gold Credited", "Payment Method", "Status", "Tx Hash", "Payer Wallet"];
    const rows = filteredTransactions.map((t) => [
      `"${t.receiptId || t.id}"`,
      `"${t.date || t.createdAt || ""}"`,
      `"${t.item || t.itemName || ""}"`,
      `"${t.category || ""}"`,
      `"${t.amount || ""}"`,
      `"${t.goldAmount || 0}"`,
      `"${t.method || t.paymentMethod || ""}"`,
      `"${t.status || "COMPLETED"}"`,
      `"${t.hash || t.txHash || ""}"`,
      `"${t.walletAddress || ""}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `scribble_royale_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatShortAddr = (addr) => {
    if (!addr || addr === "0x00000000" || addr.includes("INTERNAL") || addr.includes("VAULT")) {
      return addr || "N/A";
    }
    if (addr.length > 14) {
      return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    }
    return addr;
  };

  return (
    <div className="transaction-history-container">
      {/* Modal for Selected Past Receipt */}
      {selectedReceipt && (
        <TransactionReceiptModal
          transaction={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}

      {/* Header & Meta Summary */}
      {showHeader && (
        <div className="tx-history-header-box dragon-card">
          <div className="tx-header-left">
            <div className="tx-header-icon-wrap">
              <Receipt size={24} className="text-amber-400" />
            </div>
            <div>
              <div className="tx-badge-pill">
                <Sparkles size={13} />
                <span>
                  {isAdmin
                    ? "👑 IMPERIAL SOVEREIGN OVERALL LEDGER (ALL PLAYERS)"
                    : user?.email
                    ? `LEDGER: ${user.email}`
                    : user?.name && user.name !== "Guest Warrior"
                    ? `WARRIOR: ${user.name}`
                    : wallet?.address
                    ? `WALLET: ${formatShortAddr(wallet.address)}`
                    : "CURRENT ACCOUNT LEDGER"}
                </span>
              </div>
              <h2 className="tx-header-title">{isAdmin ? "All Realm Player Transactions" : title}</h2>
              <p className="tx-header-sub">
                {isAdmin
                  ? "Real-time audit ledger of all item purchases, gold top-ups, and Web3 settlements executed by all players across the Dragon Dynasty."
                  : "Verified smart contract transactions, in-game item acquisitions, and official invoice receipts for your account."}
              </p>
            </div>
          </div>

          <div className="tx-header-actions">
            <button
              className={`tx-action-btn ${isRefreshing ? "spinning" : ""}`}
              onClick={handleRefresh}
              title="Refresh transaction history"
            >
              <RotateCw size={15} />
              <span>Refresh</span>
            </button>

            {filteredTransactions.length > 0 && (
              <button className="tx-action-btn export-btn" onClick={handleExportCsv} title="Export CSV ledger">
                <Download size={15} />
                <span>Export CSV</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Metrics Stats Banner */}
      <div className="tx-metrics-grid">
        <div className="tx-metric-card">
          <div className="metric-icon-wrap gold-icon-bg">
            <Coins size={18} />
          </div>
          <div className="metric-content">
            <span className="metric-label">{isAdmin ? "REALM GOLD SPENT" : "GOLD ACQUIRED"}</span>
            <strong className="metric-value gold">
              +{stats.totalGold.toLocaleString()}
            </strong>
          </div>
        </div>

        <div className="tx-metric-card">
          <div className="metric-icon-wrap crypto-icon-bg">
            <WalletIcon size={18} />
          </div>
          <div className="metric-content">
            <span className="metric-label">WEB3 TOKENS SPENT</span>
            <strong className="metric-value crypto">
              {stats.totalEth} ETH
            </strong>
          </div>
        </div>

        <div className="tx-metric-card">
          <div className="metric-icon-wrap orders-icon-bg">
            <Receipt size={18} />
          </div>
          <div className="metric-content">
            <span className="metric-label">TOTAL TRANSACTIONS</span>
            <strong className="metric-value">{stats.totalCount} Orders</strong>
          </div>
        </div>

        <div className="tx-metric-card">
          <div className="metric-icon-wrap date-icon-bg">
            <Clock size={18} />
          </div>
          <div className="metric-content">
            <span className="metric-label">LATEST SETTLEMENT</span>
            <strong className="metric-value date-val">{stats.latestDate}</strong>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="tx-controls-bar">
        {/* Search Input */}
        <div className="tx-search-wrapper">
          <Search size={16} className="tx-search-icon" />
          <input
            type="text"
            className="tx-search-input"
            placeholder={isAdmin ? "Search by player name, email, item, invoice ID, hash, or method…" : "Search by item, invoice ID, hash, or payment method…"}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="tx-search-clear" onClick={() => setSearchQuery("")}>
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="tx-filter-pills-row">
          {[
            { id: "all", label: "All Records" },
            { id: "crypto", label: "🦊 Web3 Tokens (ETH)" },
            { id: "gold_method", label: "🪙 Gold Vault" },
            { id: "gold", label: "Gold Bundles" },
            { id: "pass", label: "VIP Passes" },
            { id: "brush", label: "Brushes" },
          ].map((pill) => (
            <button
              key={pill.id}
              className={`tx-filter-pill ${filterCategory === pill.id ? "active" : ""}`}
              onClick={() => setFilterCategory(pill.id)}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Sort Selector */}
        <div className="tx-sort-select-wrap">
          <ArrowUpDown size={14} className="sort-icon" />
          <select
            className="tx-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest" style={{ backgroundColor: "#1e130c", color: "#fef3c7" }}>
              Newest First
            </option>
            <option value="oldest" style={{ backgroundColor: "#1e130c", color: "#fef3c7" }}>
              Oldest First
            </option>
            <option value="highest" style={{ backgroundColor: "#1e130c", color: "#fef3c7" }}>
              Amount (High to Low)
            </option>
          </select>
        </div>
      </div>

      {/* Transaction List / Ledger Table */}
      {filteredTransactions.length === 0 ? (
        /* Empty State */
        <div className="tx-empty-card dragon-card">
          <div className="empty-dragon-icon">
            <Receipt size={48} className="empty-receipt-icon" />
          </div>
          <h3>No Transactions Found</h3>
          <p>
            {searchQuery || filterCategory !== "all"
              ? "No transactions match your active search filter. Try clearing your filters."
              : isAdmin
              ? "No transactions have been recorded in the realm ledger yet."
              : "You haven't made any purchases or token settlements yet. Explore the Dragon Emporium to power up your arsenal!"}
          </p>

          <div className="empty-actions-row">
            {searchQuery || filterCategory !== "all" ? (
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  setSearchQuery("");
                  setFilterCategory("all");
                }}
              >
                Clear Filters
              </Button>
            ) : !isAdmin ? (
              <Button variant="flame" size="md" onClick={() => navigate("/store")}>
                <ShoppingBag size={16} />
                <span>Visit Dragon Emporium</span>
              </Button>
            ) : null}
          </div>
        </div>
      ) : (
        /* Rich Ledger Table */
        <div className="tx-table-card dragon-card">
          <div className="tx-table-container">
            <table className="tx-ledger-table">
              <thead>
                <tr>
                  {isAdmin && <th>WARRIOR / PLAYER</th>}
                  <th>ITEM / RELIC</th>
                  <th>INVOICE #</th>
                  <th>DATE & TIME</th>
                  <th>AMOUNT PAID</th>
                  <th>PAYMENT METHOD</th>
                  <th>TX HASH</th>
                  <th>STATUS</th>
                  <th className="text-right">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => {
                  const details = getItemDetails(tx);
                  const isGold =
                    String(tx.method || tx.paymentMethod || "").toLowerCase().includes("gold");

                  return (
                    <tr
                      key={tx.id || tx.receiptId}
                      className="tx-table-row"
                      onClick={() => setSelectedReceipt(tx)}
                    >
                      {/* Warrior Column for Admin */}
                      {isAdmin && (
                        <td className="warrior-cell">
                          <div className="tx-warrior-info">
                            <strong className="tx-warrior-name">{tx.userName || "Warrior"}</strong>
                            <small className="tx-warrior-email">{tx.email || "N/A"}</small>
                          </div>
                        </td>
                      )}
                      {/* Item Column with Icon */}
                      <td className="item-cell">
                        <div className="tx-item-flex">
                          <span className="tx-item-icon" style={{ textShadow: `0 0 10px ${details.color}` }}>
                            {details.icon}
                          </span>
                          <div>
                            <span className="tx-item-title">{tx.item || tx.itemName}</span>
                            {tx.goldAmount > 0 && (
                              <span className="tx-gold-bonus">
                                +{Number(tx.goldAmount).toLocaleString()} Gold Credited
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Invoice ID */}
                      <td className="id-cell">
                        <span className="tx-invoice-id">
                          #{tx.receiptId || tx.id}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="date-cell">
                        <span className="tx-date-str">
                          {tx.date || (tx.createdAt ? new Date(tx.createdAt).toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" }) : "N/A")}
                        </span>
                      </td>

                      {/* Amount Paid */}
                      <td className="amount-cell">
                        <span className={`tx-amount-val ${isGold ? "gold-cost" : "crypto-cost"}`}>
                          {tx.amount}
                        </span>
                      </td>

                      {/* Payment Method */}
                      <td className="method-cell">
                        <span className={`tx-method-badge ${isGold ? "gold-vault" : "metamask-web3"}`}>
                          {isGold ? <Coins size={12} /> : <WalletIcon size={12} />}
                          <span>{tx.method || tx.paymentMethod || "Web3 Tokens"}</span>
                        </span>
                      </td>

                      {/* Tx Hash */}
                      <td className="hash-cell">
                        {tx.hash || tx.txHash ? (
                          <div className="tx-hash-pill" onClick={(e) => handleCopyHash(tx.hash || tx.txHash, e)}>
                            <code className="hash-code">{formatShortAddr(tx.hash || tx.txHash)}</code>
                            <button
                              type="button"
                              className="tx-copy-icon-btn"
                              title="Copy transaction hash"
                            >
                              {copiedHash === (tx.hash || tx.txHash) ? (
                                <Check size={12} color="#10b981" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted text-xs">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="status-cell">
                        <span className="tx-status-pill completed">
                          <CheckCircle2 size={12} />
                          <span>{tx.status || "COMPLETED"}</span>
                        </span>
                      </td>

                      {/* View Receipt CTA */}
                      <td className="action-cell text-right">
                        <button
                          className="tx-view-receipt-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReceipt(tx);
                          }}
                          title="View official printable invoice receipt"
                        >
                          <FileText size={13} />
                          <span>Receipt</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
