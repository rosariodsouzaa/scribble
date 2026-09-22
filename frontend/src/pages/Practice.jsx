import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Flame,
  Swords,
  RotateCcw,
  Trophy,
  Coins,
  Timer as TimerIcon,
  Play,
  ArrowRight,
  Zap,
  CheckCircle,
  Shuffle,
  ShieldAlert,
  Palette,
} from "lucide-react";
import { useAuthWallet } from "../context/AuthWalletContext.jsx";
import { SKETCH_CATEGORIES, classifySketch, classifyWithDeepLearning } from "../lib/ai/sketchClassifier.js";
import { speechOracle } from "../lib/ai/speechOracle.js";
import PracticeCanvas from "../components/PracticeCanvas.jsx";
import PredictionPanel from "../components/PredictionPanel.jsx";
import Button from "../components/Button.jsx";

const CHALLENGE_TIME_LIMIT = 30; // seconds

export default function Practice() {
  const navigate = useNavigate();
  const { user, setUser, soundEnabled } = useAuthWallet();

  // Mode: "challenge" (Time attack target) vs "sandbox" (Free draw)
  const [mode, setMode] = useState("challenge");

  // Challenge Target Word State - randomized so it starts on different words every time
  const [targetPrompt, setTargetPrompt] = useState(() => {
    return SKETCH_CATEGORIES[Math.floor(Math.random() * SKETCH_CATEGORIES.length)] || SKETCH_CATEGORIES[0];
  });
  const [timeLeft, setTimeLeft] = useState(CHALLENGE_TIME_LIMIT);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [streak, setStreak] = useState(0);
  const [goldEarnedSession, setGoldEarnedSession] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // Drawing Tools State
  const [brushColor, setBrushColor] = useState("#fbbf24");
  const [brushSize, setBrushSize] = useState(6);
  const [selectedTool, setSelectedTool] = useState("pen");
  const canvasRef = useRef(null);

  // AI Prediction State
  const [predictions, setPredictions] = useState([]);
  const [topPrediction, setTopPrediction] = useState(null);
  const [commentary, setCommentary] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Stop speech oracle if user navigates away
  useEffect(() => {
    return () => {
      speechOracle.stop();
    };
  }, []);

  // Pick random prompt different from current
  const getRandomPrompt = useCallback(() => {
    const pool = SKETCH_CATEGORIES.filter((c) => c.id!== targetPrompt?.id);
    return pool[Math.floor(Math.random() * pool.length)] || SKETCH_CATEGORIES[0];
  }, [targetPrompt]);

  // Start new challenge round
  const startNewChallenge = useCallback(
    (prompt = null) => {
      const nextPrompt = prompt || getRandomPrompt();
      setTargetPrompt(nextPrompt);
      setTimeLeft(CHALLENGE_TIME_LIMIT);
      setIsTimerRunning(true);
      setIsSuccess(false);
      setIsGameOver(false);
      setPredictions([]);
      setTopPrediction(null);
      setCommentary(`New Challenge: Draw a ${nextPrompt.name}! Time starts now!`);

      if (voiceEnabled) {
        speechOracle.speak(`Draw a ${nextPrompt.name}! Go!`, true);
      }

      canvasRef.current?.clearCanvas();
    },
    [getRandomPrompt, voiceEnabled]
  );

  // Timer countdown hook for challenge mode
  useEffect(() => {
    if (mode!== "challenge" ||!isTimerRunning || isSuccess || isGameOver) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsGameOver(true);
          setIsTimerRunning(false);
          setStreak(0);
          setCommentary(` Time is up! The Oracle could not verify ${targetPrompt.name} in time.`);
          if (voiceEnabled) {
            speechOracle.speak("Time's up! Let's try another one.");
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, isTimerRunning, isSuccess, isGameOver, targetPrompt, voiceEnabled]);

  // Trigger Victory celebration and reward user
  const handleVictory = useCallback(() => {
    if (isSuccess) return;
    setIsSuccess(true);
    setIsTimerRunning(false);

    const bonusReward = 50 + streak * 10;
    setGoldEarnedSession((prev) => prev + bonusReward);
    setStreak((prev) => prev + 1);

    // Update persistent user state (Dragon Gold & Wins)
    setUser?.((prev) => ({
...prev,
      coins: (prev.coins || 0) + bonusReward,
      wins: (prev.wins || 0) + 1,
      matches: (prev.matches || 0) + 1,
    }));

    // Confetti fanfare
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#fbbf24", "#f97316", "#ef4444", "#10b981", "#38bdf8"],
    });

    const winComment = ` Masterful! The Oracle is certain this is ${targetPrompt.name}! (+${bonusReward} Dragon Gold)`;
    setCommentary(winComment);

    if (voiceEnabled) {
      speechOracle.speak(`Brilliant! That is definitely a ${targetPrompt.name}!`, true);
    }
  }, [isSuccess, streak, targetPrompt, setUser, voiceEnabled]);

  // Real-time canvas change handler (Immediate 60fps response + Google QuickDraw Neural Inference)
  const handleCanvasChange = useCallback(
    (canvas, strokesData = []) => {
      if (!canvas) return;

      const fastResult = classifySketch(canvas, strokesData);
      if (fastResult.empty) {
        setPredictions([]);
        setTopPrediction(null);
        setCommentary("Scroll is empty. Make your mark!");
        return;
      }

      setPredictions(fastResult.predictions);
      setTopPrediction(fastResult.topPrediction);

      // Check victory condition (requires drawing to be substantially completed, not just 10% start)
      if (mode === "challenge" &&!isSuccess &&!isGameOver && targetPrompt) {
        const hasSubstance = (fastResult.drawnPixels || 0) >= 55 || (strokesData && strokesData.length >= 2);
        const match = fastResult.predictions.find(
          (p) =>
            (p.name.toLowerCase() === targetPrompt.name.toLowerCase() || p.id === targetPrompt.id) &&
            p.confidence >= 65
        );

        if (match && hasSubstance) {
          handleVictory();
          return;
        }
      }

      // Generate dynamic Oracle commentary
      const dynamicComment = speechOracle.getCommentary(
        fastResult.topPrediction,
        mode === "challenge"? targetPrompt: null,
        isSuccess
      );
      setCommentary(dynamicComment);

      // Debounced Google QuickDraw Neural AI pass
      clearTimeout(window._deepAiTimer);
      window._deepAiTimer = setTimeout(async () => {
        try {
          const deepResult = await classifyWithDeepLearning(canvas, strokesData);
          if (deepResult &&!deepResult.empty && deepResult.predictions.length > 0) {
            setPredictions(deepResult.predictions);
            setTopPrediction(deepResult.topPrediction);

            if (mode === "challenge" &&!isSuccess &&!isGameOver && targetPrompt) {
              const hasDeepSubstance = (deepResult.drawnPixels || 0) >= 55 || (strokesData && strokesData.length >= 2);
              const deepMatch = deepResult.predictions.find(
                (p) =>
                  (p.name.toLowerCase() === targetPrompt.name.toLowerCase() || p.id === targetPrompt.id) &&
                  p.confidence >= 65
              );
              if (deepMatch && hasDeepSubstance) {
                handleVictory();
              }
            }
          }
        } catch {
          // Fallback handled
        }
      }, 100);
    },
    [mode, isSuccess, isGameOver, targetPrompt, handleVictory]
  );

  return (
    <div className="practice-dojo-page">
      {/* Top Header / Mode Switcher & Stats Ribbon */}
      <div className="practice-header-ribbon">
        <div className="practice-title-cluster">
          <div className="practice-badge-pill">
            <Flame size={15} className="flame-spark" />
            <span>AI DRAGON DOJO</span>
          </div>
          <h1 className="practice-heading">Sketch Practice Arena</h1>
          <p className="practice-subtext">
            Hone your drawing mastery. Our AI Oracle predicts your strokes in real-time.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="practice-mode-tabs">
          <button
            className={`mode-tab-btn ${mode === "challenge"? "active": ""}`}
            onClick={() => {
              setMode("challenge");
              startNewChallenge();
            }}
          >
            <Zap size={16} />
            <span>Speed Challenge</span>
          </button>
          <button
            className={`mode-tab-btn ${mode === "sandbox"? "active": ""}`}
            onClick={() => {
              setMode("sandbox");
              setIsTimerRunning(false);
              setCommentary("Sandbox Mode: Draw anything and watch the AI guess in real-time!");
            }}
          >
            <Sparkles size={16} />
            <span>Free Doodle</span>
          </button>
        </div>

        {/* Session Stats Tracker */}
        <div className="practice-stats-ribbon">
          <div className="practice-stat-pill gold">
            <Coins size={16} />
            <span>+{(goldEarnedSession || 0).toLocaleString()} Gold Earned</span>
          </div>
          {mode === "challenge" && (
            <div className="practice-stat-pill streak">
              <Flame size={16} />
              <span>{streak} Streak Combo</span>
            </div>
          )}
        </div>
      </div>

      {/* Prominent Color Accuracy Tip Banner at Top */}
      <div className="practice-color-tip-banner">
        <div className="tip-badge-tag">
          <Palette size={15} className="tip-palette-spark" />
          <span>ACCURACY PRO-TIP</span>
        </div>
        <p className="tip-banner-text">
          Draw using the <strong>natural colors of the object</strong> (e.g.  <strong>Red</strong> for Apple/Heart,  <strong>Green</strong> for Tree,  <strong>Blue</strong> for Fish,  <strong>Gold</strong> for Sun/Crown/Star) to dramatically increase AI recognition accuracy!
        </p>
      </div>

      {/* Challenge Status Bar (When in challenge mode) */}
      {mode === "challenge" && (
        <div className={`practice-challenge-bar ${isSuccess? "success": isGameOver? "failed": ""}`}>
          <div className="challenge-prompt-info">
            <span className="challenge-icon">{targetPrompt.icon}</span>
            <div className="challenge-prompt-text">
              <span className="prompt-label">MISSION PROMPT:</span>
              <h2 className="prompt-word">Draw a {targetPrompt.name}</h2>
            </div>
          </div>

          <div className="challenge-center-timer">
            <div className={`timer-ring ${timeLeft <= 5? "urgent": ""}`}>
              <TimerIcon size={18} />
              <span className="timer-seconds">{timeLeft}s</span>
            </div>
          </div>

          <div className="challenge-actions-group">
            <button
              className="skip-prompt-btn"
              onClick={() => startNewChallenge()}
              title="Skip to another word"
            >
              <Shuffle size={15} />
              <span>Skip Word</span>
            </button>

            {isSuccess && (
              <Button
                variant="flame"
                size="md"
                onClick={() => startNewChallenge()}
                icon={<ArrowRight size={16} />}
              >
                Next Challenge 
              </Button>
            )}

            {isGameOver && (
              <Button
                variant="primary"
                size="md"
                onClick={() => startNewChallenge(targetPrompt)}
                icon={<RotateCcw size={16} />}
              >
                Try Again
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Main Interactive Dojo Grid */}
      <div className="practice-arena-grid">
        {/* Left Column: Drawing Studio Canvas */}
        <div className="practice-canvas-col">
          <PracticeCanvas
            ref={canvasRef}
            onCanvasChange={handleCanvasChange}
            brushColor={brushColor}
            setBrushColor={setBrushColor}
            brushSize={brushSize}
            setBrushSize={setBrushSize}
            selectedTool={selectedTool}
            setSelectedTool={setSelectedTool}
            disabled={isSuccess || isGameOver}
          />
        </div>

        {/* Right Column: Real-Time AI Predictions & Oracle Commentary */}
        <div className="practice-sidebar-col">
          <PredictionPanel
            predictions={predictions}
            topPrediction={topPrediction}
            targetPrompt={mode === "challenge"? targetPrompt: null}
            mode={mode}
            isMatch={isSuccess}
            commentary={commentary}
            voiceEnabled={voiceEnabled}
            setVoiceEnabled={setVoiceEnabled}
          />

          {/* Quick Matchmaking CTA Banner */}
          <div className="practice-lobby-cta-card">
            <div className="cta-header">
              <Swords size={18} className="cta-icon" />
              <span>READY FOR REAL COMBAT?</span>
            </div>
            <p>Take your trained drawing skills into the live multiplayer battle arena!</p>
            <Button
              variant="flame"
              size="md"
              onClick={() => navigate("/lobby")}
              icon={<Play size={16} fill="#111" />}
            >
              Enter Battle Arena 
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
