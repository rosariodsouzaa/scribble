import React, { useState } from "react";
import {
  X,
  CreditCard,
  Wallet as WalletIcon,
  QrCode,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Coins,
  Flame,
} from "lucide-react";
import { usePayment } from "../context/PaymentContext.jsx";
import { useAuthWallet } from "../context/AuthWalletContext.jsx";
import Button from "./Button.jsx";

export default function PaymentModal() {
  const { activeItem, checkoutModalOpen, closeCheckout, processPayment } = usePayment();
  const { wallet, connectMetaMask } = useAuthWallet();

  const [paymentMethod, setPaymentMethod] = useState("card"); // card | web3 | upi | paypal
  const [processing, setProcessing] = useState(false);
  const [successTx, setSuccessTx] = useState(null);
  const [error, setError] = useState("");

  // Card Form State
  const [cardNumber, setCardNumber] = useState("4532 8901 2345 6789");
  const [cardName, setCardName] = useState("VEDANSH DHARGALKAR");
  const [cardExpiry, setCardExpiry] = useState("08/28");
  const [cardCvc, setCardCvc] = useState("789");

  // UPI State
  const [upiId, setUpiId] = useState("vedansh@oksbi");

  if (!checkoutModalOpen || !activeItem) return null;

  const handlePay = async (e) => {
    e?.preventDefault();
    setProcessing(true);
    setError("");

    try {
      const res = await processPayment({
        item: activeItem,
        method: paymentMethod,
        cardDetails: { cardNumber, cardName, cardExpiry, cardCvc },
        upiId,
      });

      if (res.success) {
        setSuccessTx(res.transaction);
      } else {
        setError(res.error || "Payment failed to authorize.");
      }
    } catch {
      setError("Payment gateway timeout. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    setSuccessTx(null);
    setError("");
    closeCheckout();
  };

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal-card dragon-card">
        {/* Imperial Brackets */}
        <div className="imperial-bracket tl" />
        <div className="imperial-bracket tr" />
        <div className="imperial-bracket bl" />
        <div className="imperial-bracket br" />

        {/* Modal Header */}
        <div className="payment-modal-header">
          <div className="pay-tag">
            <Lock size={12} />
            <span>256-BIT SSL ENCRYPTED GATEWAY</span>
          </div>
          <button className="modal-close-btn" onClick={handleClose}>
            <X size={18} />
          </button>
        </div>

        {successTx ? (
          /* Success Screen */
          <div className="payment-success-view">
            <div className="success-icon-wrap">
              <CheckCircle2 size={56} className="success-icon" />
            </div>
            <h2 className="success-title">Order Complete!</h2>
            <p className="success-sub">
              Your transaction has been securely confirmed on the Dragon Ledger.
            </p>

            <div className="receipt-box">
              <div className="receipt-row">
                <span>Transaction ID:</span>
                <strong className="hash">{successTx.id}</strong>
              </div>
              <div className="receipt-row">
                <span>Item Purchased:</span>
                <strong>{successTx.item}</strong>
              </div>
              <div className="receipt-row">
                <span>Amount Paid:</span>
                <strong className="gold">{successTx.amount}</strong>
              </div>
              <div className="receipt-row">
                <span>Payment Method:</span>
                <strong>{successTx.method}</strong>
              </div>
              <div className="receipt-row">
                <span>Reference Hash:</span>
                <span className="hash-mono">{successTx.hash}</span>
              </div>
            </div>

            <Button variant="flame" size="lg" className="block" onClick={handleClose}>
              Claim & Return to Arena ⛩️
            </Button>
          </div>
        ) : (
          /* Checkout View */
          <div className="payment-checkout-body">
            {/* Left: Item Summary Card */}
            <div className="checkout-summary-col">
              <div className="summary-item-card">
                <div className="item-badge-pill" style={{ color: activeItem.color }}>
                  <Sparkles size={13} />
                  <span>{activeItem.badge}</span>
                </div>

                <div className="item-icon-huge">{activeItem.icon}</div>
                <h3 className="summary-item-name">{activeItem.name}</h3>
                <p className="summary-item-desc">{activeItem.description}</p>

                <div className="price-tag-block">
                  <div className="price-usd">${activeItem.priceUsd} USD</div>
                  <div className="price-eth">≈ {activeItem.priceEth} ETH</div>
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
                  <strong>Instant Delivery</strong>
                  <p>Coins and cosmetics unlock immediately across all chambers.</p>
                </div>
              </div>
            </div>

            {/* Right: Payment Gateway Rails */}
            <div className="checkout-rails-col">
              {/* Payment Method Selector Tabs */}
              <div className="payment-methods-tabs">
                <button
                  type="button"
                  className={`method-tab ${paymentMethod === "card" ? "active" : ""}`}
                  onClick={() => setPaymentMethod("card")}
                >
                  <CreditCard size={16} />
                  <span>Card</span>
                </button>

                <button
                  type="button"
                  className={`method-tab ${paymentMethod === "web3" ? "active" : ""}`}
                  onClick={() => setPaymentMethod("web3")}
                >
                  <WalletIcon size={16} />
                  <span>Web3 Crypto</span>
                </button>

                <button
                  type="button"
                  className={`method-tab ${paymentMethod === "upi" ? "active" : ""}`}
                  onClick={() => setPaymentMethod("upi")}
                >
                  <QrCode size={16} />
                  <span>UPI / QR</span>
                </button>
              </div>

              {/* Form 1: Credit / Debit Card */}
              {paymentMethod === "card" && (
                <form onSubmit={handlePay} className="gateway-form card-form">
                  {/* Visual Card Preview */}
                  <div className="visual-credit-card">
                    <div className="card-chip" />
                    <div className="card-preview-number">{cardNumber || "•••• •••• •••• ••••"}</div>
                    <div className="card-preview-bottom">
                      <div>
                        <span className="card-preview-label">CARD HOLDER</span>
                        <span className="card-preview-val">{cardName || "WARRIOR NAME"}</span>
                      </div>
                      <div>
                        <span className="card-preview-label">EXPIRES</span>
                        <span className="card-preview-val">{cardExpiry || "MM/YY"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Card Number</label>
                    <input
                      className="input dragon-input"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      maxLength={19}
                      placeholder="4532 •••• •••• ••••"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Cardholder Name</label>
                    <input
                      className="input dragon-input uppercase"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="FULL NAME"
                      required
                    />
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Expires</label>
                      <input
                        className="input dragon-input"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        maxLength={5}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>CVC / CVV</label>
                      <input
                        className="input dragon-input"
                        type="password"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        placeholder="•••"
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>

                  <Button
                    variant="flame"
                    size="lg"
                    type="submit"
                    className="block pay-submit-btn"
                    disabled={processing}
                  >
                    {processing ? "Authorizing 3D-Secure…" : `Pay $${activeItem.priceUsd} USD 💳`}
                  </Button>
                </form>
              )}

              {/* Form 2: Web3 MetaMask Crypto */}
              {paymentMethod === "web3" && (
                <div className="gateway-form web3-form">
                  <div className="web3-status-box">
                    <span className="web3-status-lbl">Wallet Connected:</span>
                    <strong>{wallet.isConnected ? wallet.address : "MetaMask Not Connected"}</strong>
                  </div>

                  <div className="web3-quote-box">
                    <div className="quote-row">
                      <span>Item Price:</span>
                      <strong>{activeItem.priceEth} ETH</strong>
                    </div>
                    <div className="quote-row">
                      <span>Estimated Gas:</span>
                      <span>~0.0003 ETH ($0.95)</span>
                    </div>
                    <div className="quote-row total">
                      <span>Total ETH:</span>
                      <strong className="gold">{(parseFloat(activeItem.priceEth) + 0.0003).toFixed(4)} ETH</strong>
                    </div>
                  </div>

                  {wallet.isConnected ? (
                    <Button
                      variant="flame"
                      size="lg"
                      className="block pay-submit-btn"
                      onClick={handlePay}
                      disabled={processing}
                    >
                      {processing ? "Confirming in MetaMask…" : `Sign & Pay ${activeItem.priceEth} ETH 🦊`}
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="lg"
                      className="block pay-submit-btn"
                      onClick={connectMetaMask}
                    >
                      Connect MetaMask Wallet 🦊
                    </Button>
                  )}
                </div>
              )}

              {/* Form 3: UPI / Instant QR Code */}
              {paymentMethod === "upi" && (
                <div className="gateway-form upi-form">
                  <div className="qr-box-center">
                    <div className="qr-canvas-mock">
                      <QrCode size={130} className="qr-svg-icon" />
                      <div className="qr-center-logo">🪙</div>
                    </div>
                    <span className="qr-hint">Scan with Google Pay, PhonePe, Paytm or any UPI App</span>
                  </div>

                  <div className="form-group">
                    <label>Or Enter UPI ID</label>
                    <input
                      className="input dragon-input"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@upi"
                    />
                  </div>

                  <Button
                    variant="emerald"
                    size="lg"
                    className="block pay-submit-btn"
                    onClick={handlePay}
                    disabled={processing}
                  >
                    {processing ? "Verifying UPI Response…" : `Verify & Pay ₹${Math.round(activeItem.priceUsd * 83)} 📱`}
                  </Button>
                </div>
              )}

              {error && <p className="payment-error-msg">{error}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
