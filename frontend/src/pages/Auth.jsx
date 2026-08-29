import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Flame,
  Shield,
  Lock,
  Mail,
  User,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Dices,
  Crown,
  Swords,
  RefreshCw,
  Zap,
} from "lucide-react";
import { useAuthWallet } from "../context/AuthWalletContext.jsx";
import { AuthService } from "../services/auth/AuthService.js";
import Avatar from "../components/Avatar.jsx";

const RANDOM_NAMES = [
  "ShadowDragon",
  "FlameStriker",
  "JadeEmperor",
  "CrimsonVanguard",
  "StormBreaker",
  "MythicPhoenix",
  "SolarKnight",
  "VoidWarden",
  "ThunderClaw",
  "EmberLord",
];

const COLOR_PALETTES = [
  { name: "Imperial Gold", hex: "#f59e0b" },
  { name: "Dragon Crimson", hex: "#dc2626" },
  { name: "Jade Emerald", hex: "#10b981" },
  { name: "Void Violet", hex: "#8b5cf6" },
  { name: "Mystic Azure", hex: "#3b82f6" },
  { name: "Solar Orange", hex: "#f97316" },
];

const BATTLE_TITLES = [
  "Dragon Novice",
  "Flame Knight",
  "Jade Sentinel",
  "Shadow Artist",
  "Brush Master",
  "Imperial Scholar",
];

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const { loginWithCredentials, signupWithOtp, user } = useAuthWallet();

  // Route determines initial mode: /signup or /login
  const isInitialSignup = location.pathname.includes("signup");
  const [activeTab, setActiveTab] = useState(isInitialSignup ? "signup" : "login");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup multi-step state
  const [signupStep, setSignupStep] = useState(1); // 1: Info -> 2: OTP -> 3: Customization
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpTimer, setOtpTimer] = useState(60);
  const [canResendOtp, setCanResendOtp] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#f59e0b");
  const [selectedTitle, setSelectedTitle] = useState("Dragon Novice");
  const [lastDispatchedOtp, setLastDispatchedOtp] = useState("");

  // Status & loading
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const otpInputRefs = useRef([]);

  // Auto redirect if already authenticated
  useEffect(() => {
    if (user && user.isAuthenticated && user.email) {
      if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        const from = location.state?.from?.pathname || location.state?.from || "/dashboard";
        navigate(from, { replace: true });
      }
    }
  }, [user, navigate, location.state]);

  // Sync tab with URL
  useEffect(() => {
    setActiveTab(location.pathname.includes("signup") ? "signup" : "login");
    setErrorMsg("");
    setSuccessMsg("");
  }, [location.pathname]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval = null;
    if (signupStep === 2 && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    } else if (otpTimer === 0) {
      setCanResendOtp(true);
    }
    return () => clearInterval(interval);
  }, [signupStep, otpTimer]);

  const handleRandomName = () => {
    const random = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    const suffix = Math.floor(Math.random() * 99) + 1;
    setSignupName(`${random}_${suffix}`);
  };

  // --- Login Handler ---
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await loginWithCredentials(loginEmail, loginPassword);
      setSuccessMsg(`Welcome back, ${res.user.name}!`);
      setTimeout(() => {
        if (res.user.role === "admin") {
          navigate("/admin");
        } else {
          const from = location.state?.from || "/dashboard";
          navigate(from);
        }
      }, 500);
    } catch (err) {
      setErrorMsg(err.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-click Demo Account Logins
  const handleQuickDemoLogin = async (role) => {
    setErrorMsg("");
    setLoading(true);
    try {
      const seed = await AuthService.seedDemoAccounts();
      const creds =
        role === "admin"
          ? seed.demoAccounts?.admin || { email: "admin@scribbleroyale.io", password: "admin123" }
          : seed.demoAccounts?.user || { email: "warrior@scribbleroyale.io", password: "warrior123" };

      setLoginEmail(creds.email);
      setLoginPassword(creds.password);

      const res = await loginWithCredentials(creds.email, creds.password);
      setSuccessMsg(`Logged in as ${res.user.name} (${res.user.role.toUpperCase()})`);
      setTimeout(() => {
        if (res.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }, 500);
    } catch (err) {
      setErrorMsg(err.message || "Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  // --- Signup Step 1: Send OTP ---
  const handleSendOtpStep1 = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!signupName.trim()) {
      setErrorMsg("Please enter a warrior nickname");
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes("@")) {
      setErrorMsg("Please enter a valid email address");
      return;
    }
    if (signupPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await AuthService.sendOtp(signupEmail, "signup");
      if (res.simulatedOtp) {
        setLastDispatchedOtp(res.simulatedOtp);
      }
      setSuccessMsg(res.message || `Verification code sent to ${signupEmail}`);
      setSignupStep(2);
      setOtpTimer(60);
      setCanResendOtp(false);
    } catch (err) {
      setErrorMsg(err.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP digit input
  const handleOtpDigitChange = (index, val) => {
    const clean = val.replace(/\D/g, "").slice(-1);
    const updated = [...otpDigits];
    updated[index] = clean;
    setOtpDigits(updated);

    if (clean && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!paste) return;
    const digits = paste.split("");
    const updated = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      updated[i] = digits[i] || "";
    }
    setOtpDigits(updated);
    const focusIdx = Math.min(paste.length, 5);
    otpInputRefs.current[focusIdx]?.focus();
  };

  const handleAutoFillDemoOtp = () => {
    if (lastDispatchedOtp && lastDispatchedOtp.length === 6) {
      const digits = lastDispatchedOtp.split("");
      setOtpDigits(digits);
      otpInputRefs.current[5]?.focus();
    }
  };

  // --- Signup Step 2: Verify OTP ---
  const handleVerifyOtpStep2 = async (e) => {
    e.preventDefault();
    const enteredOtp = otpDigits.join("");
    if (enteredOtp.length < 6) {
      setErrorMsg("Please enter all 6 digits of your verification code");
      return;
    }

    setErrorMsg("");
    setLoading(true);
    try {
      await AuthService.verifyOtp(signupEmail, enteredOtp, "signup");
      setSuccessMsg("Verification code accepted! Customize your warrior persona.");
      setSignupStep(3);
    } catch (err) {
      setErrorMsg(err.message || "Invalid or expired verification code");
    } finally {
      setLoading(false);
    }
  };

  // --- Signup Step 3: Finalize Registration ---
  const handleFinalizeSignup = async () => {
    setErrorMsg("");
    setLoading(true);
    const enteredOtp = otpDigits.join("");

    try {
      const res = await signupWithOtp({
        name: signupName,
        email: signupEmail,
        password: signupPassword,
        otp: enteredOtp,
        avatarColor: selectedColor,
        title: selectedTitle,
      });

      setSuccessMsg(`Welcome to the Dragon Dynasty, ${res.user.name}!`);
      setTimeout(() => {
        navigate("/profile");
      }, 700);
    } catch (err) {
      setErrorMsg(err.message || "Failed to finalize registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dragon-auth-page">
      <div className="auth-ambient-glow glow-1" />
      <div className="auth-ambient-glow glow-2" />

      <div className="dragon-auth-container">
        {/* Brand Banner */}
        <div className="auth-brand-header">
          <div className="auth-logo-badge">
            <Flame size={28} className="auth-flame-icon" />
          </div>
          <h1 className="auth-brand-title">SCRIBBLE ROYALE</h1>
          <p className="auth-brand-subtitle">Dragon Dynasty Authentication Sanctuary</p>
        </div>

        {/* Tab Selector */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${activeTab === "login" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("login");
              navigate("/login");
            }}
          >
            <Shield size={16} />
            <span>Warrior Portal (Login)</span>
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${activeTab === "signup" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("signup");
              navigate("/signup");
            }}
          >
            <Crown size={16} />
            <span>Join Dynasty (Sign Up)</span>
          </button>
        </div>

        {/* Alert Banners */}
        {errorMsg && (
          <div className="auth-alert error">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="auth-alert success">
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ======================= LOGIN VIEW ======================= */}
        {activeTab === "login" && (
          <form className="auth-form" onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label">
                <Mail size={15} />
                <span>Warrior Email</span>
              </label>
              <input
                type="email"
                className="dragon-input"
                placeholder="warrior@scribbleroyale.io"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Lock size={15} />
                <span>Secret Passcode</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showLoginPassword ? "text" : "password"}
                  className="dragon-input"
                  placeholder="Enter your battle passcode"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                >
                  {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="dragon-btn primary auth-submit-btn" disabled={loading}>
              {loading ? (
                <span>Channeling Dragon Qi...</span>
              ) : (
                <>
                  <span>Enter Battle Arena</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>

            {/* Quick Demo Credentials */}
            <div className="auth-demo-section">
              <div className="demo-section-label">
                <Sparkles size={14} color="#f59e0b" />
                <span>Quick 1-Click Demo Login</span>
              </div>
              <div className="demo-chips-grid">
                <button
                  type="button"
                  className="demo-chip-btn admin"
                  onClick={() => handleQuickDemoLogin("admin")}
                  disabled={loading}
                >
                  <Crown size={15} className="chip-icon" />
                  <div className="chip-text">
                    <strong>Imperial Admin</strong>
                    <small>admin@scribbleroyale.io</small>
                  </div>
                </button>

                <button
                  type="button"
                  className="demo-chip-btn warrior"
                  onClick={() => handleQuickDemoLogin("user")}
                  disabled={loading}
                >
                  <Swords size={15} className="chip-icon" />
                  <div className="chip-text">
                    <strong>Demo Warrior</strong>
                    <small>warrior@scribbleroyale.io</small>
                  </div>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ======================= SIGN UP VIEW (MULTI-STEP) ======================= */}
        {activeTab === "signup" && (
          <div className="auth-signup-workflow">
            {/* Step Progress Indicators */}
            <div className="signup-steps-bar">
              <div className={`step-item ${signupStep >= 1 ? "active" : ""} ${signupStep > 1 ? "done" : ""}`}>
                <span className="step-num">1</span>
                <span className="step-label">Credentials</span>
              </div>
              <div className="step-connector" />
              <div className={`step-item ${signupStep >= 2 ? "active" : ""} ${signupStep > 2 ? "done" : ""}`}>
                <span className="step-num">2</span>
                <span className="step-label">Email OTP</span>
              </div>
              <div className="step-connector" />
              <div className={`step-item ${signupStep >= 3 ? "active" : ""}`}>
                <span className="step-num">3</span>
                <span className="step-label">Avatar</span>
              </div>
            </div>

            {/* STEP 1: Name, Email, Password */}
            {signupStep === 1 && (
              <form className="auth-form" onSubmit={handleSendOtpStep1}>
                <div className="form-group">
                  <div className="form-label-row">
                    <label className="form-label">
                      <User size={15} />
                      <span>Warrior Nickname</span>
                    </label>
                    <button type="button" className="dice-random-btn" onClick={handleRandomName}>
                      <Dices size={14} />
                      <span>Randomize</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    className="dragon-input"
                    placeholder="e.g. DragonSlayer_99"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                    maxLength={25}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Mail size={15} />
                    <span>Email Address (OTP will be sent)</span>
                  </label>
                  <input
                    type="email"
                    className="dragon-input"
                    placeholder="your.email@realm.io"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Lock size={15} />
                    <span>Create Battle Passcode</span>
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showSignupPassword ? "text" : "password"}
                      className="dragon-input"
                      placeholder="Minimum 6 characters"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                    >
                      {showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="dragon-btn primary auth-submit-btn" disabled={loading}>
                  {loading ? (
                    <span>Dispatching Royal Scroll...</span>
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: Live OTP Verification */}
            {signupStep === 2 && (
              <form className="auth-form" onSubmit={handleVerifyOtpStep2}>
                <div className="otp-intro-card">
                  <p className="otp-intro-text">
                    Enter the 6-digit scroll code sent to <strong>{signupEmail}</strong>:
                  </p>

                  {/* Discrete OTP Digit Boxes */}
                  <div className="otp-boxes-grid" onPaste={handleOtpPaste}>
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpInputRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className="otp-digit-box"
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        autoFocus={idx === 0}
                      />
                    ))}
                  </div>

                  {/* Auto-fill Simulated OTP for instant dev convenience */}
                  {lastDispatchedOtp && (
                    <div className="otp-autofill-banner">
                      <div className="autofill-left">
                        <Zap size={14} color="#ffd700" />
                        <span>Code: <strong>{lastDispatchedOtp}</strong></span>
                      </div>
                      <button type="button" className="autofill-btn" onClick={handleAutoFillDemoOtp}>
                        ⚡ Auto-Fill Code
                      </button>
                    </div>
                  )}

                  {/* Resend Countdown */}
                  <div className="otp-timer-row">
                    {canResendOtp ? (
                      <button
                        type="button"
                        className="resend-otp-btn"
                        onClick={handleSendOtpStep1}
                        disabled={loading}
                      >
                        <RefreshCw size={13} />
                        <span>Resend Verification Code</span>
                      </button>
                    ) : (
                      <span className="resend-countdown">Resend code in {otpTimer}s</span>
                    )}
                  </div>
                </div>

                <div className="otp-actions-row">
                  <button
                    type="button"
                    className="dragon-btn secondary"
                    onClick={() => setSignupStep(1)}
                    disabled={loading}
                  >
                    Edit Email
                  </button>
                  <button type="submit" className="dragon-btn primary" disabled={loading}>
                    {loading ? "Verifying..." : "Verify Code"}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Persona Customization & Finalize */}
            {signupStep === 3 && (
              <div className="auth-persona-customizer">
                <div className="persona-preview-box">
                  <Avatar name={signupName} size={72} color={selectedColor} />
                  <div className="persona-preview-info">
                    <span className="persona-name">{signupName}</span>
                    <span className="persona-title">{selectedTitle}</span>
                    <span className="persona-gold-bonus">🪙 +2,500 Gold Welcome Bonus</span>
                  </div>
                </div>

                {/* Color Swatch Picker */}
                <div className="form-group">
                  <label className="form-label">
                    <Sparkles size={15} />
                    <span>Select Avatar Aura Color</span>
                  </label>
                  <div className="color-swatches-grid">
                    {COLOR_PALETTES.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        className={`color-swatch-item ${selectedColor === c.hex ? "active" : ""}`}
                        style={{ backgroundColor: c.hex }}
                        onClick={() => setSelectedColor(c.hex)}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Title Selector */}
                <div className="form-group">
                  <label className="form-label">
                    <Crown size={15} />
                    <span>Warrior Battle Title</span>
                  </label>
                  <select
                    className="dragon-select"
                    value={selectedTitle}
                    onChange={(e) => setSelectedTitle(e.target.value)}
                  >
                    {BATTLE_TITLES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  className="dragon-btn primary auth-submit-btn"
                  onClick={handleFinalizeSignup}
                  disabled={loading}
                >
                  {loading ? (
                    <span>Entering Dynasty...</span>
                  ) : (
                    <>
                      <span>Complete Dynasty Enrollment</span>
                      <Sparkles size={17} />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
