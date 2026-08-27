import React, { useState } from "react";
import { Trophy, Crown, Flame, Sparkles, Medal, ArrowUpRight } from "lucide-react";
import Avatar from "../components/Avatar.jsx";
import { useAuthWallet } from "../context/AuthWalletContext.jsx";

const TOP_WARRIORS = [
  { rank: 1, name: "Vedansh", title: "🐉 Dragon Emperor", score: 4850, wins: 28, matches: 32, winRate: "88%", color: "#ffd700" },
  { rank: 2, name: "Bhakti", title: "🐯 Tiger Champion", score: 4210, wins: 24, matches: 30, winRate: "80%", color: "#f59e0b" },
  { rank: 3, name: "Rosario", title: "🦅 Phoenix Master", score: 3890, wins: 21, matches: 28, winRate: "75%", color: "#ef4444" },
  { rank: 4, name: "Kaelen", title: "⚔️ Dragon Slayer", score: 3240, wins: 18, matches: 26, winRate: "69%", color: "#8b5cf6" },
  { rank: 5, name: "Aria", title: "⚡ Lightning Brush", score: 2950, wins: 16, matches: 24, winRate: "66%", color: "#06b6d4" },
  { rank: 6, name: "Ryu", title: "🗡️ Shadow Ronin", score: 2640, wins: 14, matches: 22, winRate: "63%", color: "#10b981" },
  { rank: 7, name: "Elysia", title: "🌸 Lotus Master", score: 2310, wins: 12, matches: 20, winRate: "60%", color: "#ec4899" },
];

export default function Leaderboard() {
  const { user } = useAuthWallet();

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-header">
        <div className="lead-tag">
          <Sparkles size={14} />
          <span>DYNASTY HALL OF FAME</span>
        </div>
        <h1>Global Dragon Leaderboard</h1>
        <p>Top artists and riddle deciphereers of Season 4. Earn victory points to ascend the dragon ranks.</p>
      </div>

      {/* Podium Cards for Top 3 */}
      <div className="podium-grid">
        {/* 2nd Place */}
        <div className="podium-card rank-2">
          <div className="podium-medal">🥈 2nd</div>
          <Avatar name={TOP_WARRIORS[1].name} size={54} color={TOP_WARRIORS[1].color} />
          <h3 className="podium-name">{TOP_WARRIORS[1].name}</h3>
          <span className="podium-title">{TOP_WARRIORS[1].title}</span>
          <div className="podium-score">🪙 {TOP_WARRIORS[1].score.toLocaleString()} pts</div>
        </div>

        {/* 1st Place */}
        <div className="podium-card rank-1">
          <div className="crown-badge">
            <Crown size={22} color="#ffd700" />
          </div>
          <div className="podium-medal first">👑 Champion</div>
          <Avatar name={TOP_WARRIORS[0].name} size={64} color={TOP_WARRIORS[0].color} />
          <h3 className="podium-name">{TOP_WARRIORS[0].name}</h3>
          <span className="podium-title">{TOP_WARRIORS[0].title}</span>
          <div className="podium-score gold">🪙 {TOP_WARRIORS[0].score.toLocaleString()} pts</div>
        </div>

        {/* 3rd Place */}
        <div className="podium-card rank-3">
          <div className="podium-medal">🥉 3rd</div>
          <Avatar name={TOP_WARRIORS[2].name} size={54} color={TOP_WARRIORS[2].color} />
          <h3 className="podium-name">{TOP_WARRIORS[2].name}</h3>
          <span className="podium-title">{TOP_WARRIORS[2].title}</span>
          <div className="podium-score">🪙 {TOP_WARRIORS[2].score.toLocaleString()} pts</div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="leaderboard-table-card dragon-card">
        <div className="table-head-row">
          <span className="col-rank">RANK</span>
          <span className="col-warrior">WARRIOR</span>
          <span className="col-title">TITLE</span>
          <span className="col-winrate">WIN RATE</span>
          <span className="col-score">TOTAL GOLD</span>
        </div>

        <div className="table-body">
          {TOP_WARRIORS.map((w) => (
            <div key={w.rank} className={`table-row ${w.name === user.name ? "is-current-user" : ""}`}>
              <span className="col-rank">
                {w.rank === 1 ? "🥇" : w.rank === 2 ? "🥈" : w.rank === 3 ? "🥉" : `#${w.rank}`}
              </span>
              <div className="col-warrior">
                <Avatar name={w.name} size={30} color={w.color} />
                <span className="warrior-name">
                  {w.name} {w.name === user.name && <span className="you-pill">You</span>}
                </span>
              </div>
              <span className="col-title">{w.title}</span>
              <span className="col-winrate">{w.winRate} ({w.wins}W)</span>
              <span className="col-score">🪙 {w.score.toLocaleString()} pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
