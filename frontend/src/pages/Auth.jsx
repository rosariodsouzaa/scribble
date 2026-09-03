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
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Dices,
  Crown,
  Swords,
  RefreshCw,
  Zap,
  KeyRound,
  ShieldCheck,
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

  // Route determines initial mode: /signup, /forgot-password, or /login
  const getInitialTab = (pathname) => {
    if (pathname.includes("signup")) return "signup";
    if (pathname.includes("forgot-password")) return "forgot";
    return "login";
  };

  const [activeTab, setActiveTab] = useState(() => getInitialTab(location.pathname));

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
  const [signupOtpDigits, setSignupOtpDigits] = useState(["", "", "", "", "", ""]);
  const [signupOtpTimer, setSignupOtpTimer] = useState(60);
  const [canResendSignupOtp, setCanResendSignupOtp] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#f59e0b");
  const [selectedTitle, setSelectedTitle] = useState("Dragon Novice");
  const [signupLastDispatchedOtp, setSignupLastDispatchedOtp] = useState("");

  // Forgot Password multi-step state
  const [forgotStep, setForgotStep] = useState(1); // 1: Email -> 2: OTP -> 3: New Passcode -> 4: Done
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtpDigits, setForgotOtpDigits] = useState(["", "", "", "", "", ""]);
  const [forgotOtpTimer, setForgotOtpTimer] = useState(60);
  const [canResendForgotOtp, setCanResendForgotOtp] = useState(false);
  const [forgotLastDispatchedOtp, setForgotLastDispatchedOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & loading
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const signupOtpInputRefs = useRef([]);
  const forgotOtpInputRefs = useRef([]);

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
    setActiveTab(getInitialTab(location.pathname));
    setErrorMsg("");
    setSuccessMsg("");
  }, [location.pathname]);

  // Countdown timer for Signup OTP resend
  useEffect(() => {
    let interval = null;
    if (activeTab === "signup" && signupStep === 2 && signupOtpTimer > 0) {
      interval = setInterval(() => setSignupOtpTimer((prev) => prev - 1), 1000);
    } else if (signupOtpTimer === 0) {
      setCanResendSignupOtp(true);
    }
    return () => clearInterval(interval);
  }, [activeTab, signupStep, signupOtpTimer]);

  // Countdown timer for Forgot Password OTP resend
  useEffect(() => {
    let interval = null;
    if (activeTab === "forgot" && forgotStep === 2 && forgotOtpTimer > 0) {
      interval = setInterval(() => setForgotOtpTimer((prev) => prev - 1), 1000);
    } else if (forgotOtpTimer === 0) {
      setCanResendForgotOtp(true);
    }
    return () => clearInterval(interval);
  }, [activeTab, forgotStep, forgotOtpTimer]);

  const handleRandomName = () => {
    const random = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    const suffix = Math.floor(Math.random() * 99) + 1;
    setSignupName(`${random}_${suffix}`);
  };

  // --- Login Handler ---
  const handleLoginSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
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
  const handleSendSignupOtpStep1 = async (e) => {
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
        setSignupLastDispatchedOtp(res.simulatedOtp);
      }
      setSuccessMsg(res.message || `Verification code sent to ${signupEmail}`);
      setSignupStep(2);
      setSignupOtpTimer(60);
      setCanResendSignupOtp(false);
    } catch (err) {
      setErrorMsg(err.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  // Signup OTP handlers
  const handleSignupOtpDigitChange = (index, val) => {
    const clean = val.replace(/\D/g, "").slice(-1);
    const updated = [...signupOtpDigits];
    updated[index] = clean;
    setSignupOtpDigits(updated);

    if (clean && index < 5) {
      signupOtpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleSignupOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !signupOtpDigits[index] && index > 0) {
      signupOtpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleSignupOtpPaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!paste) return;
    const digits = paste.split("");
    const updated = [...signupOtpDigits];
    for (let i = 0; i < 6; i++) {
      updated[i] = digits[i] || "";
    }
    setSignupOtpDigits(updated);
    const focusIdx = Math.min(paste.length, 5);
    signupOtpInputRefs.current[focusIdx]?.focus();
  };

  const handleAutoFillSignupOtp = () => {
    if (signupLastDispatchedOtp && signupLastDispatchedOtp.length === 6) {
      const digits = signupLastDispatchedOtp.split("");
      setSignupOtpDigits(digits);
      signupOtpInputRefs.current[5]?.focus();
    }
  };

  // Signup Step 2: Verify OTP
  const handleVerifySignupOtpStep2 = async (e) => {
    e.preventDefault();
    const enteredOtp = signupOtpDigits.join("");
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

  // Signup Step 3: Finalize
  const handleFinalizeSignup = async () => {
    setErrorMsg("");
    setLoading(true);
    const enteredOtp = signupOtpDigits.join("");

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

  // ======================= FORGOT PASSWORD WORKFLOW =======================

  // Forgot Step 1: Request Password Reset OTP
  const handleSendForgotOtpStep1 = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!forgotEmail.trim() || !forgotEmail.includes("@")) {
      setErrorMsg("Please enter a valid warrior email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await AuthService.sendOtp(forgotEmail, "reset_password");
      if (res.simulatedOtp) {
        setForgotLastDispatchedOtp(res.simulatedOtp);
      }
      setSuccessMsg(res.message || `Password reset code dispatched to ${forgotEmail}`);
      setForgotStep(2);
      setForgotOtpTimer(60);
      setCanResendForgotOtp(false);
    } catch (err) {
      setErrorMsg(err.message || "No warrior account found with this email.");
    } finally {
      setLoading(false);
    }
  };

  // Forgot OTP Input Handlers
  const handleForgotOtpDigitChange = (index, val) => {
    const clean = val.replace(/\D/g, "").slice(-1);
    const updated = [...forgotOtpDigits];
    updated[index] = clean;
    setForgotOtpDigits(updated);

    if (clean && index < 5) {
      forgotOtpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleForgotOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !forgotOtpDigits[index] && index > 0) {
      forgotOtpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleForgotOtpPaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!paste) return;
    const digits = paste.split("");
    const updated = [...forgotOtpDigits];
    for (let i = 0; i < 6; i++) {
      updated[i] = digits[i] || "";
    }
    setForgotOtpDigits(updated);
    const focusIdx = Math.min(paste.length, 5);
    forgotOtpInputRefs.current[focusIdx]?.focus();
  };

  const handleAutoFillForgotOtp = () => {
    if (forgotLastDispatchedOtp && forgotLastDispatchedOtp.length === 6) {
      const digits = forgotLastDispatchedOtp.split("");
      setForgotOtpDigits(digits);
      forgotOtpInputRefs.current[5]?.focus();
    }
  };

  // Forgot Step 2: Pre-validate OTP
  const handleVerifyForgotOtpStep2 = async (e) => {
    e.preventDefault();
    const enteredOtp = forgotOtpDigits.join("");
    if (enteredOtp.length < 6) {
      setErrorMsg("Please enter all 6 digits of your recovery code.");
      return;
    }

    setErrorMsg("");
    setLoading(true);
    try {
      await AuthService.verifyOtp(forgotEmail, enteredOtp, "reset_password");
      setSuccessMsg("Recovery code verified! Enter your new battle passcode.");
      setForgotStep(3);
    } catch (err) {
      setErrorMsg(err.message || "Invalid or expired recovery code.");
    } finally {
      setLoading(false);
    }
  };

  // Forgot Step 3: Reset Passcode
  const handleResetPasswordStep3 = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg("New passcode must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passcodes do not match. Please verify.");
      return;
    }

    const enteredOtp = forgotOtpDigits.join("");
    setLoading(true);
    try {
      const res = await AuthService.resetPassword({
        email: forgotEmail,
        otp: enteredOtp,
        newPassword,
      });

      setSuccessMsg(res.message || "Battle passcode successfully reset!");
      setForgotStep(4);
      // Pre-fill login credentials for seamless entry
      setLoginEmail(forgotEmail);
      setLoginPassword(newPassword);
    } catch (err) {
      setErrorMsg(err.message || "Failed to reset passcode. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Switch to Forgot Password View
  const handleOpenForgotPassword = () => {
    if (loginEmail.trim()) {
      setForgotEmail(loginEmail.trim());
    }
    setForgotStep(1);
    setForgotOtpDigits(["", "", "", "", "", ""]);
    setNewPassword("");
    setConfirmPassword("");
    setErrorMsg("");
    setSuccessMsg("");
    setActiveTab("forgot");
    navigate("/forgot-password");
  };

  // Switch back to Login View
  const handleBackToLogin = () => {
    setActiveTab("login");
    setErrorMsg("");
    setSuccessMsg("");
    setForgotStep(1);
    navigate("/login");
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
          <p className="auth-brand-subtitle">
            {activeTab === "forgot"
              ? "Battle Passcode Recovery Chamber"
              : "Dragon Dynasty Authentication Sanctuary"}
          </p>
        </div>

        {/* Tab Selector (Shown for Login & Sign Up) */}
        {activeTab !== "forgot" ? (
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
        ) : (
          <div className="forgot-header-bar">
            <button type="button" className="forgot-back-btn" onClick={handleBackToLogin}>
              <ArrowLeft size={16} />
              <span>Back to Login</span>
            </button>
            <span className="forgot-header-title">Passcode Recovery</span>
          </div>
        )}

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
              <div className="form-label-row">
                <label className="form-label">
                  <Lock size={15} />
                  <span>Secret Passcode</span>
                </label>
                <button
                  type="button"
                  className="forgot-password-trigger"
                  onClick={handleOpenForgotPassword}
                >
                  <KeyRound size={13} />
                  <span>Forgot Passcode?</span>
                </button>
              </div>
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

        {/* ======================= FORGOT PASSWORD WORKFLOW ======================= */}
        {activeTab === "forgot" && (
          <div className="auth-forgot-workflow">
            {/* Step Progress Indicators */}
            {forgotStep <= 3 && (
              <div className="signup-steps-bar">
                <div className={`step-item ${forgotStep >= 1 ? "active" : ""} ${forgotStep > 1 ? "done" : ""}`}>
                  <span className="step-num">1</span>
                  <span className="step-label">Email</span>
                </div>
                <div className="step-connector" />
                <div className={`step-item ${forgotStep >= 2 ? "active" : ""} ${forgotStep > 2 ? "done" : ""}`}>
                  <span className="step-num">2</span>
                  <span className="step-label">Email OTP</span>
                </div>
                <div className="step-connector" />
                <div className={`step-item ${forgotStep >= 3 ? "active" : ""}`}>
                  <span className="step-num">3</span>
                  <span className="step-label">New Passcode</span>
                </div>
              </div>
            )}

            {/* FORGOT STEP 1: Enter Email */}
            {forgotStep === 1 && (
              <form className="auth-form" onSubmit={handleSendForgotOtpStep1}>
                <div className="form-info-banner">
                  <KeyRound size={18} className="info-icon" />
                  <p>
                    Enter the email registered with your warrior account. We will send a 6-digit passcode recovery scroll code.
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Mail size={15} />
                    <span>Warrior Account Email</span>
                  </label>
                  <input
                    type="email"
                    className="dragon-input"
                    placeholder="e.g. warrior@scribbleroyale.io"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    autoFocus
                    autoComplete="email"
                  />
                </div>

                <button type="submit" className="dragon-btn primary auth-submit-btn" disabled={loading}>
                  {loading ? (
                    <span>Dispatching Recovery Scroll...</span>
                  ) : (
                    <>
                      <span>Send Recovery Code</span>
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="dragon-btn secondary"
                  style={{ width: "100%", marginTop: "4px" }}
                  onClick={handleBackToLogin}
                  disabled={loading}
                >
                  <ArrowLeft size={16} />
                  <span>Return to Login</span>
                </button>
              </form>
            )}

            {/* FORGOT STEP 2: Enter & Verify OTP */}
            {forgotStep === 2 && (
              <form className="auth-form" onSubmit={handleVerifyForgotOtpStep2}>
                <div className="otp-intro-card">
                  <p className="otp-intro-text">
                    Enter the 6-digit recovery code sent to <strong>{forgotEmail}</strong>:
                  </p>

                  {/* Discrete OTP Digit Boxes */}
                  <div className="otp-boxes-grid" onPaste={handleForgotOtpPaste}>
                    {forgotOtpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (forgotOtpInputRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className="otp-digit-box"
                        value={digit}
                        onChange={(e) => handleForgotOtpDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleForgotOtpKeyDown(idx, e)}
                        autoFocus={idx === 0}
                      />
                    ))}
                  </div>

                  {/* Auto-fill Simulated OTP for dev convenience */}
                  {forgotLastDispatchedOtp && (
                    <div className="otp-autofill-banner">
                      <div className="autofill-left">
                        <Zap size={14} color="#ffd700" />
                        <span>Code: <strong>{forgotLastDispatchedOtp}</strong></span>
                      </div>
                      <button type="button" className="autofill-btn" onClick={handleAutoFillForgotOtp}>
                        ⚡ Auto-Fill Code
                      </button>
                    </div>
                  )}

                  {/* Resend Countdown */}
                  <div className="otp-timer-row">
                    {canResendForgotOtp ? (
                      <button
                        type="button"
                        className="resend-otp-btn"
                        onClick={handleSendForgotOtpStep1}
                        disabled={loading}
                      >
                        <RefreshCw size={13} />
                        <span>Resend Recovery Code</span>
                      </button>
                    ) : (
                      <span className="resend-countdown">Resend code in {forgotOtpTimer}s</span>
                    )}
                  </div>
                </div>

                <div className="otp-actions-row">
                  <button
                    type="button"
                    className="dragon-btn secondary"
                    onClick={() => setForgotStep(1)}
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

            {/* FORGOT STEP 3: Enter New Passcode */}
            {forgotStep === 3 && (
              <form className="auth-form" onSubmit={handleResetPasswordStep3}>
                <div className="form-info-banner">
                  <ShieldCheck size={18} className="info-icon" />
                  <p>Recovery code verified! Create your new battle passcode below.</p>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Lock size={15} />
                    <span>New Battle Passcode</span>
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      className="dragon-input"
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      autoFocus
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Lock size={15} />
                    <span>Confirm New Passcode</span>
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className={`dragon-input ${
                        confirmPassword && newPassword !== confirmPassword ? "input-mismatch" : ""
                      }`}
                      placeholder="Re-enter new passcode"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <span className="field-validation-error">Passcodes do not match</span>
                  )}
                  {confirmPassword && newPassword === confirmPassword && (
                    <span className="field-validation-success">✓ Passcodes match</span>
                  )}
                </div>

                <button
                  type="submit"
                  className="dragon-btn primary auth-submit-btn"
                  disabled={loading || (confirmPassword && newPassword !== confirmPassword)}
                >
                  {loading ? (
                    <span>Forging New Passcode...</span>
                  ) : (
                    <>
                      <span>Reset Battle Passcode</span>
                      <Sparkles size={17} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* FORGOT STEP 4: Success Confirmation */}
            {forgotStep === 4 && (
              <div className="forgot-success-card">
                <div className="success-icon-badge">
                  <CheckCircle2 size={48} className="success-flame" />
                </div>
                <h3 className="success-title">Passcode Reset Complete!</h3>
                <p className="success-description">
                  Your battle passcode for <strong>{forgotEmail}</strong> has been updated. You can now enter the arena.
                </p>

                <button
                  type="button"
                  className="dragon-btn primary auth-submit-btn"
                  onClick={handleLoginSubmit}
                  disabled={loading}
                >
                  {loading ? "Entering Arena..." : "Log In with New Passcode"}
                </button>

                <button
                  type="button"
                  className="dragon-btn secondary"
                  style={{ width: "100%", marginTop: "8px" }}
                  onClick={handleBackToLogin}
                >
                  Return to Login Screen
                </button>
              </div>
            )}
          </div>
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
              <form className="auth-form" onSubmit={handleSendSignupOtpStep1}>
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
              <form className="auth-form" onSubmit={handleVerifySignupOtpStep2}>
                <div className="otp-intro-card">
                  <p className="otp-intro-text">
                    Enter the 6-digit scroll code sent to <strong>{signupEmail}</strong>:
                  </p>

                  {/* Discrete OTP Digit Boxes */}
                  <div className="otp-boxes-grid" onPaste={handleSignupOtpPaste}>
                    {signupOtpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (signupOtpInputRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className="otp-digit-box"
                        value={digit}
                        onChange={(e) => handleSignupOtpDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleSignupOtpKeyDown(idx, e)}
                        autoFocus={idx === 0}
                      />
                    ))}
                  </div>

                  {/* Auto-fill Simulated OTP for instant dev convenience */}
                  {signupLastDispatchedOtp && (
                    <div className="otp-autofill-banner">
                      <div className="autofill-left">
                        <Zap size={14} color="#ffd700" />
                        <span>Code: <strong>{signupLastDispatchedOtp}</strong></span>
                      </div>
                      <button type="button" className="autofill-btn" onClick={handleAutoFillSignupOtp}>
                        ⚡ Auto-Fill Code
                      </button>
                    </div>
                  )}

                  {/* Resend Countdown */}
                  <div className="otp-timer-row">
                    {canResendSignupOtp ? (
                      <button
                        type="button"
                        className="resend-otp-btn"
                        onClick={handleSendSignupOtpStep1}
                        disabled={loading}
                      >
                        <RefreshCw size={13} />
                        <span>Resend Verification Code</span>
                      </button>
                    ) : (
                      <span className="resend-countdown">Resend code in {signupOtpTimer}s</span>
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
