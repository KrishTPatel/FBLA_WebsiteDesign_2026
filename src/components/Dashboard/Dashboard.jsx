import React, { useState } from 'react';
import './Dashboard.css';
import { COMPLETED_TOPICS, ACTIVITY, SESSIONS, LEADERBOARD, STREAK_DATA,  } from '../../Data/constants';

export default function DashboardPage() {
  const [streakCells] = useState(STREAK_DATA);

  return (
    <div className="page">
      {/* Hero */}
      <div className="hero-band fade-up">
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="box1" style={{ marginBottom: 12 }}>
            <span className="badge badge-lime">🔥 Top 10% this week</span>
            <span className="badge badge-teal">🔥 14 Day Streak</span>
          </div>
          <div className="h1">Welcome back,<br /><span className="lime">Harshal Khande!</span></div>
          <div className="body" style={{ marginTop: 10, maxWidth: 480 }}>
            You've completed <strong style={{ color: "var(--text)" }}>3 lessons</strong> this week. Your next tutoring session starts in <strong style={{ color: "var(--lime)" }}>2 hours</strong>. Keep it up!
          </div>
          <div className="box2">
            <button className="btn btn-lime">Continue Learning →</button>
            <button className="btn btn-outline">View Schedule</button>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid-4 fade-up fade-up-1">
        {[
          { n: "14", label: "Day Streak", color: "#c8f135", glow: "#c8f135", icon: "🔥" },
          { n: "72%", label: "Calculus Progress", color: "#2dd4bf", glow: "#2dd4bf", icon: "📈" },
          { n: "890", label: "XP This Week", color: "#a78bfa", glow: "#a78bfa", icon: "⚡" },
          { n: "8", label: "Sessions Joined", color: "#fbbf24", glow: "#fbbf24", icon: "🎓" },
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-card-glow" style={{ background: s.glow }} />
            <div className="flex-between">
              <span style={{ fontSize: 24 }}>{s.icon}</span>
              <span className="badge" style={{
                background: `${s.color}18`, color: s.color,
                border: `1px solid ${s.color}40`, fontSize: 10
              }}>THIS MONTH</span>
            </div>
            <div className="stat-number" style={{ color: s.color }}>{s.n}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2 mt-24 fade-up fade-up-2">
        {/* Progress section */}
        <div className="card">
          <div className="flex-between">
            <div className="h3">My Topics</div>
            <span className="badge badge-lime">5 active</span>
          </div>
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 18 }}>
            {COMPLETED_TOPICS.map((t, i) => (
              <div key={i}>
                <div className="flex-between" style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</span>
                  <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>{t.pct}%</span>
                </div>
                <div className="progress-bar">
                  <div className={`progress-fill ${t.color}`} style={{ width: `${t.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity feed */}
        <div className="card">
          <div className="h3">Recent Activity</div>
          <div style={{ marginTop: 16 }}>
            {ACTIVITY.map((a, i) => (
              <div className="activity-item" key={i}>
                <div className="activity-dot" style={{ background: a.dot }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{a.text}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3, fontFamily: "var(--font-mono)" }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Streak heatmap */}
      <div className="card mt-24 fade-up fade-up-3">
        <div className="flex-between" style={{ marginBottom: 16 }}>
          <div>
            <div className="h3">Study Streak</div>
            <div className="body" style={{ marginTop: 4 }}>84 days tracked · <span className="lime">🔥 14 active streak</span></div>
          </div>
          <div className="flex-row gap-8" style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
            <span>Less</span>
            {["", "level-1", "level-2", "level-3", "level-4"].map((l, i) => (
              <div key={i} className={`streak-cell ${l}`} style={{ width: 14, height: 14 }} />
            ))}
            <span>More</span>
          </div>
        </div>
        <div className="streak-grid">
          {streakCells.map((level, i) => (
            <div key={i} className={`streak-cell ${level}`} />
          ))}
        </div>
      </div>

      {/* Upcoming + Leaderboard */}
      <div className="grid-2 mt-24 fade-up fade-up-4">
        <div className="card">
          <div className="flex-between">
            <div className="h3">Today's Sessions</div>
            <span className="badge badge-coral">2 Today</span>
          </div>
          <div style={{ marginTop: 16 }}>
            {SESSIONS.slice(0, 3).map(s => (
              <div className="session-card card-sm" key={s.id} style={{ borderLeft: `3px solid ${s.color}` }}>
                <div className="session-time-block">
                  <div className="session-time-h">{s.time.split(":")[0]}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>{s.time.split(" ")[1]}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>{s.day}</div>
                </div>
                <div className="session-divider" />
                <div className="session-info">
                  <div className="session-title">{s.title}</div>
                  <div className="session-meta">with {s.host} · {s.attendees} joining</div>
                </div>
                <button className="btn btn-lime btn-sm">Join</button>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex-between">
            <div className="h3">Leaderboard</div>
            <span className="badge badge-amber">Weekly</span>
          </div>
          <div style={{ marginTop: 16 }}>
            {LEADERBOARD.map((l, i) => (
              <div className="lb-row" key={i} style={l.isMe ? { background: "rgba(200,241,53,.06)", border: "1px solid rgba(200,241,53,.2)", borderRadius: 10 } : {}}>
                <div className="lb-rank" style={{
                  color: i === 0 ? "#fbbf24" : i === 1 ? "#e0e0e0" : i === 2 ? "#cd7f32" : "var(--muted)"
                }}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                </div>
                <div className="lb-avatar" style={{ background: `${l.color}20`, color: l.color }}>{l.avatar}</div>
                <div className="lb-name">{l.name} {l.isMe && <span className="badge badge-lime" style={{ fontSize: 9 }}>YOU</span>}</div>
                <div className="lb-pts">{l.pts.toLocaleString()} XP</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
