import React from 'react';
import { NAV_ITEMS } from '../../data/constants';
import './Sidebar.css';

export default function Sidebar({ active, setActive, collapsed }) {
  return (
    <aside className={`sidebar ${collapsed ? "hidden" : ""}`}>
      <div className="logo-zone">
        <div className="logo-mark">MathHive</div>
        <div className="logo-sub">Learning Hub</div>
      </div>

      <nav className="nav-section">
        <div className="nav-label">Main Menu</div>
        {NAV_ITEMS.map((item) => (
          <div
            key={item.id}
            className={`nav-item ${active === item.id ? "active" : ""}`}
            onClick={() => setActive(item.id)}
          >
            <span className="icon">{item.icon}</span>
            {item.label}
          </div>
        ))}
      </nav>

      <div className="avatar-zone">
        <div className="avatar-circle">KP</div>
        <div className="avatar-info">
          <div className="avatar-name">User Name</div>
          <div className="avatar-rank">Level 12</div>
        </div>
      </div>
    </aside>
  );
}