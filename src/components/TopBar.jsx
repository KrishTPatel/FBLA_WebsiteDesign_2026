// src/components/TopBar.jsx
import React from 'react';

export default function TopBar({ page, collapsed, setCollapsed }) {
  const labels = {
    dashboard: "Dashboard",
    schedule: "Schedule",
    resources: "Resources",
    community: "Community",
  };

  return (
    <div className="topbar">
      <div className="topbar-left">
        <button className="hamburger" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">
          {collapsed ? "☰" : "✕"}
        </button>
        <div className="page-title">{labels[page] || page}</div>
      </div>
      <div className="topbar-right">
        <div className="xp-pill">⚡ 3,240 XP</div>
        <div className="notif-btn">
          🔔
          <div className="notif-dot" />
        </div>
      </div>
    </div>
  );
}