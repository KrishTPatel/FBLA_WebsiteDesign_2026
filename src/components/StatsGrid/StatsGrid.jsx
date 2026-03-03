import React from 'react';
import './StatsGrid.css';

export default function StatsGrid() {
  const stats = [
    { label: "Current Streak", value: "14 Days", icon: "🔥", color: "#ff6b6b" },
    { label: "Total XP", value: "3,240", icon: "⚡", color: "var(--lime)" },
    { label: "Global Rank", value: "#128", icon: "🏆", color: "#f1c40f" },
    { label: "Accuracy", value: "94%", icon: "🎯", color: "#2dd4bf" },
  ];

  return (
    <div className="stats-grid">
      {stats.map((s, i) => (
        <div className="stat-card" key={i} style={{ '--accent': s.color }}>
          <div className="stat-icon-wrapper">
            <span className="stat-icon">{s.icon}</span>
          </div>
          <div className="stat-content">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
          </div>
          {/* Subtle background glow effect */}
          <div className="stat-glow"></div>
        </div>
      ))}
    </div>
  );
}