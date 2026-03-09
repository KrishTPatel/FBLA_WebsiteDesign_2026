import {React, useState} from 'react';
import './TopBar.css';
import NotificationPanel from '../NotificationPanel/NotificationPanel.jsx'


export default function TopBar({ page, collapsed, setCollapsed, theme, setTheme }) {
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  const [showNotifs, setShowNotifs] = useState(false);
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="hamburger" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? "☰" : "✕"}
        </button>
        <span className="page-title">{page}</span>
      </div>

      <div className="topbar-right">
        <div className="xp-pill">⚡ 3,240 XP</div>
        <div className="theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
            {theme === "dark" ? "☀️" : "🌙"}
        </div>
        <div className="notif-btn" onClick={() => setShowNotifs(!showNotifs)}>
          🔔
          <div className="notif-dot"></div>
        </div>
        {showNotifs && <NotificationPanel closePanel={() => setShowNotifs(false)} />}
      </div>
    </header>
  );
}