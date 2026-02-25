import React, { useState } from 'react';
import TopBar from '../src/components/TopBar.jsx';
import Sidebar from '../src/components/SideBar.jsx';
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="shell">
      {/* Add the Sidebar here */}
      <Sidebar active={page} setActive={setPage} collapsed={collapsed} />
      
      <main className={`content-area ${collapsed ? "full" : ""}`}>
        <TopBar 
          page={page} 
          collapsed={collapsed} 
          setCollapsed={setCollapsed} 
        />
        <div className="page">
          <h1 className="h1">Sidebar Added</h1>
        </div>
      </main>
    </div>
  );
}