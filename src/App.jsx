import React, { useState } from 'react';
import TopBar from './components/TopBar/TopBar';
import Sidebar from './components/Sidebar/Sidebar';
import GeoBg from './components/GeoBg/GeoBg'; // Import GeoBg
import Dashboard from './components/Dashboard/Dashboard';
import './index.css';

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="shell">
      {/* 1. Add Sidebar */}
      <GeoBg/>
      <Sidebar active={page} setActive={setPage} collapsed={collapsed} />
      
      {/* 2. Add 'full' class logic to shift content */}
      <main className={`content-area ${collapsed ? "full" : ""}`} style={{ 
        marginLeft: collapsed ? "0" : "440px", 
        transition: "margin-left 0.3s ease" 
      }}>
        <TopBar 
          page={page} 
          collapsed={collapsed} 
          setCollapsed={setCollapsed} 
        />
        
        <div className="page" style={{ padding: '64px' }}>
          <h1 className="h1">Dashboard</h1>
          <Dashboard />
          <p className="body">Everything is connected and 2x scaled.</p>
        </div>
      </main>
    </div>
  );
}
