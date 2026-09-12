import React, { useState } from "react";
import {
  Sparkles,
  Flame,
  Volume2,
  VolumeX,
  Lightbulb,
  CheckCircle2,
  HelpCircle,
  Eye,
  Cpu,
} from "lucide-react";
import { speechOracle } from "../lib/ai/speechOracle.js";

export default function PredictionPanel({
  predictions = [],
  topPrediction = null,
  targetPrompt = null,
  mode = "challenge", // "challenge" | "sandbox"
  isMatch = false,
  commentary = "",
  voiceEnabled = true,
  setVoiceEnabled,
}) {
  const [showHints, setShowHints] = useState(false);

  const toggleVoice = () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    speechOracle.enabled = next;
    if (!next) speechOracle.stop();
  };

  // Find match score if target prompt is active
  const targetConfidence = targetPrompt
    ? predictions.find(
        (p) => p.name.toLowerCase() === targetPrompt.name.toLowerCase() || p.id === targetPrompt.id
      )?.confidence || 0
    : 0;

  return (
    <div className="prediction-panel-container">
      {/* Header with Dragon Oracle Persona */}
      <div className="prediction-oracle-header">
        <div className="oracle-avatar-badge">
          <Flame size={20} className="oracle-flame-icon" />
          <div className="oracle-pulse-glow" />
        </div>

        <div className="oracle-info">
          <div className="oracle-title-row">
            <h4>DRAGON AI ORACLE</h4>
            <span className="live-ai-badge">
              <Cpu size={12} /> REAL-TIME AI
            </span>
          </div>
          <p className="oracle-subtitle">Neural Doodle Classifier</p>
        </div>

        {/* Voice Speech Toggle */}
        <button
          className={`oracle-voice-btn ${voiceEnabled ? "active" : ""}`}
          onClick={toggleVoice}
          title={voiceEnabled ? "Mute Dragon AI Voice" : "Enable Dragon AI Voice Narrator"}
        >
          {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </div>

      {/* Target Word Mission (In Challenge Mode) */}
      {mode === "challenge" && targetPrompt && (
        <div className={`challenge-target-box ${isMatch ? "matched" : ""}`}>
          <div className="target-top-row">
            <span className="target-lbl">TARGET MISSION:</span>
            {targetPrompt.hints && (
              <button
                className="target-hint-toggle-btn"
                onClick={() => setShowHints(!showHints)}
                title="View stroke tips"
              >
                <Lightbulb size={13} /> {showHints ? "Hide Tips" : "Tips"}
              </button>
            )}
          </div>

          <div className="target-word-display">
            <span className="target-icon">{targetPrompt.icon}</span>
            <span className="target-name">Draw a {targetPrompt.name}</span>
            {isMatch && (
              <span className="target-check-badge">
                <CheckCircle2 size={16} /> RECOGNIZED!
              </span>
            )}
          </div>

          {showHints && targetPrompt.hints && (
            <div className="target-hint-popover">
              <Lightbulb size={14} className="hint-icon" />
              <span>{targetPrompt.hints}</span>
            </div>
          )}
        </div>
      )}

      {/* MAIN HERO CARD: WHAT YOUR CURRENT DRAWING LOOKS LIKE */}
      <div className="current-drawing-spotlight-card">
        <div className="spotlight-header">
          <Eye size={16} className="spotlight-eye-icon" />
          <span>CURRENT DRAWING LOOKS LIKE</span>
        </div>

        {topPrediction ? (
          <div className="spotlight-content">
            <div className="spotlight-icon-ring">
              <span className="spotlight-large-icon">{topPrediction.icon}</span>
            </div>

            <div className="spotlight-text-group">
              <h3 className="spotlight-prediction-name">{topPrediction.name}</h3>
              <div className="spotlight-badge-row">
                <span className="spotlight-confidence-pill">
                  {topPrediction.confidence}% Confidence
                </span>
                {targetPrompt &&
                  (topPrediction.name.toLowerCase() === targetPrompt.name.toLowerCase() ||
                    topPrediction.id === targetPrompt.id) && (
                    <span className="spotlight-match-pill">🎯 Target Match!</span>
                  )}
              </div>
            </div>

            {/* Visual Confidence Meter Bar */}
            <div className="spotlight-meter-bar-bg">
              <div
                className="spotlight-meter-bar-fill"
                style={{
                  width: `${Math.min(100, topPrediction.confidence)}%`,
                  backgroundColor:
                    targetPrompt &&
                    (topPrediction.name.toLowerCase() === targetPrompt.name.toLowerCase() ||
                      topPrediction.id === targetPrompt.id)
                      ? "#10b981"
                      : topPrediction.confidence > 70
                      ? "#fbbf24"
                      : "#f97316",
                }}
              />
            </div>
          </div>
        ) : (
          <div className="empty-prediction-state">
            <HelpCircle size={32} className="empty-icon" />
            <p>Ready to identify your art</p>
            <span>Make strokes on the scroll to see real-time AI recognition</span>
          </div>
        )}
      </div>

      {/* Live AI Speech / Commentary Bubble */}
      <div className="oracle-commentary-bubble">
        <Sparkles size={16} className="commentary-sparkle" />
        <p className="commentary-text">
          {commentary || "Draw your lines on the scroll, and I shall unveil what it looks like..."}
        </p>
      </div>
    </div>
  );
}
