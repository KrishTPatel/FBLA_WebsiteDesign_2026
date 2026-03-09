import { useState, useEffect, useRef, createContext, useContext } from "react";
import { LanguageProvider, useLanguage, LANGUAGES } from "./context/LanguageContext";

/* ═══════════════════════════════════════════════════════════════════
   AUTHENTICATION CONTEXT
═══════════════════════════════════════════════════════════════════ */

const AuthContext = createContext(null);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("studylink_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const signup = (username, email, password) => {
    const users = JSON.parse(localStorage.getItem("studylink_users") || "[]");
    
    if (users.find(u => u.username === username)) {
      return { success: false, error: "Username already exists" };
    }
    
    if (users.find(u => u.email === email)) {
      return { success: false, error: "Email already registered" };
    }

    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password,
      createdAt: new Date().toISOString(),
      xp: 3240,
      level: 14,
      streak: 14,
    };

    users.push(newUser);
    localStorage.setItem("studylink_users", JSON.stringify(users));
    
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem("studylink_user", JSON.stringify(userWithoutPassword));
    
    return { success: true };
  };

  const login = (username, password) => {
    const users = JSON.parse(localStorage.getItem("studylink_users") || "[]");
    const foundUser = users.find(
      u => u.username === username && u.password === password
    );

    if (!foundUser) {
      return { success: false, error: "Invalid username or password" };
    }

    const { password: _, ...userWithoutPassword } = foundUser;
    setUser(userWithoutPassword);
    localStorage.setItem("studylink_user", JSON.stringify(userWithoutPassword));
    
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("studylink_user");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signup, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   XP SYSTEM UTILITIES
═══════════════════════════════════════════════════════════════════ */

// Get XP for a specific subject
const getSubjectXP = (subjectId) => {
  if (!subjectId) return 0;
  
  // Get all lesson progress for this specific subject
  let totalXP = 0;
  const prefix = `studylink_lesson_progress_${subjectId}_`;
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      const progress = JSON.parse(localStorage.getItem(key) || '{}');
      Object.values(progress).forEach(isCompleted => {
        if (isCompleted) totalXP += 30;
      });
    }
  }
  
  return totalXP;
};

// Get total XP across all subjects
const getTotalXP = () => {
  let totalXP = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('studylink_lesson_progress_')) {
      const progress = JSON.parse(localStorage.getItem(key) || '{}');
      Object.values(progress).forEach(isCompleted => {
        if (isCompleted) totalXP += 30;
      });
    }
  }
  return totalXP;
};

// Migrate old localStorage keys to new subject-based format
const migrateOldProgressKeys = () => {
  const oldKeys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    // Find old format keys (no subject prefix)
    if (key && key.startsWith('studylink_lesson_progress_') && !key.match(/studylink_lesson_progress_(math|reading|history|computer-science|science)_/)) {
      oldKeys.push(key);
    }
  }
  
  // Migrate each old key - assume they're all math for now since that's the only subject with content
  oldKeys.forEach(oldKey => {
    const courseId = oldKey.replace('studylink_lesson_progress_', '');
    const newKey = `studylink_lesson_progress_math_${courseId}`;
    
    // Only migrate if new key doesn't exist
    if (!localStorage.getItem(newKey)) {
      const data = localStorage.getItem(oldKey);
      if (data) {
        localStorage.setItem(newKey, data);
        console.log(`Migrated ${oldKey} → ${newKey}`);
      }
    }
    // Remove old key after migration
    localStorage.removeItem(oldKey);
  });
};

// Reset first 2 lessons of Algebra Unit 1
const resetAlgebraLessons = () => {
  const key = 'studylink_lesson_progress_math_algebra';
  const progress = JSON.parse(localStorage.getItem(key) || '{}');
  
  // Remove first 2 lessons from unit-1
  delete progress['unit-1-0'];
  delete progress['unit-1-1'];
  
  localStorage.setItem(key, JSON.stringify(progress));
  console.log('Reset first 2 lessons of Algebra Unit 1');
};

// Run migration and reset on app load
migrateOldProgressKeys();
resetAlgebraLessons();

/* ═══════════════════════════════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════════════════════════════ */

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Press+Start+2P&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:        #111418;
  --bg2:       #181c22;
  --bg3:       #1e2430;
  --card:      #1a1f2b;
  --card2:     #222840;
  --border:    rgba(255,255,255,0.08);
  --border2:   rgba(255,255,255,0.14);
  --primary:   #3b82f6;
  --primary2:  #2563eb;
  --lime:      #c8f135;
  --lime2:     #a8d420;
  --teal:      #2dd4bf;
  --coral:     #ff6b6b;
  --amber:     #fbbf24;
  --sky:       #60a5fa;
  --purple:    #a78bfa;
  --text:      #eef2f7;
  --muted:     #8899b0;
  --faint:     #2a3045;
  --font-head: 'Bebas Neue', cursive;
  --font-body: 'Outfit', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --radius:    12px;
  --radius-lg: 20px;
}

/* Home/Main Page Theme - Neon Green */
[data-subject="home"] {
  --primary:   #c8f135;
  --primary2:  #a8d420;
}

/* Math Theme - Neon Blue */
[data-subject="math"] {
  --primary:   #3b82f6;
  --primary2:  #2563eb;
}

/* Reading Theme - Neon Red */
[data-subject="reading"] {
  --primary:   #ef4444;
  --primary2:  #dc2626;
}

/* History Theme - Neon Yellow */
[data-subject="history"] {
  --primary:   #eab308;
  --primary2:  #ca8a04;
}

/* Computer Science Theme - Code Syntax Colors */
[data-subject="computer-science"] {
  --primary:   #a78bfa;
  --primary2:  #8b5cf6;
  --code-green: #4ade80;
  --code-blue: #60a5fa;
  --code-yellow: #fbbf24;
  --code-pink: #f472b6;
}

/* Computer Science - Code-like stat cards */
[data-subject="computer-science"] .stat-number {
  background: linear-gradient(135deg, #a78bfa 0%, #60a5fa 50%, #4ade80 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Computer Science - Multi-color logo */
[data-subject="computer-science"] .logo-mark {
  background: linear-gradient(90deg, #a78bfa 0%, #60a5fa 25%, #4ade80 50%, #fbbf24 75%, #f472b6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: codeShift 8s linear infinite;
  background-size: 200% 100%;
}

@keyframes codeShift {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}

/* Computer Science - Gradient avatar */
[data-subject="computer-science"] .avatar-circle {
  background: linear-gradient(135deg, #a78bfa 0%, #60a5fa 50%, #4ade80 100%);
}

/* Computer Science - XP pill gradient */
[data-subject="computer-science"] .xp-pill {
  border-image: linear-gradient(90deg, #a78bfa, #60a5fa, #4ade80) 1;
  color: #a78bfa;
}

/* Computer Science - Badges with code colors */
[data-subject="computer-science"] .badge-lime {
  background: linear-gradient(135deg, rgba(167,139,250,0.15) 0%, rgba(96,165,250,0.15) 100%);
  color: #a78bfa;
  border: 1px solid rgba(167,139,250,0.3);
}

/* Computer Science special styles use neon green buttons like all other subjects */

/* Science Theme - Neon Green */
[data-subject="science"] {
  --primary:   #22c55e;
  --primary2:  #16a34a;
}

[data-theme="light"] {
  --bg:        #e8ecf1;
  --bg2:       #f5f7fa;
  --bg3:       #dce1e8;
  --card:      #ffffff;
  --card2:     #f8fafc;
  --border:    rgba(0,0,0,0.08);
  --border2:   rgba(0,0,0,0.12);
  --text:      #0f172a;
  --muted:     #64748b;
  --faint:     #e2e8f0;
  --lime:      #22c55e;
  --lime2:     #16a34a;
  --teal:      #14b8a6;
  --coral:     #ef4444;
  --amber:     #f59e0b;
  --sky:       #3b82f6;
  --purple:    #8b5cf6;
}

/* Light theme with Math (Blue) */
[data-theme="light"][data-subject="math"] {
  --primary:   #3b82f6;
  --primary2:  #2563eb;
}

/* Light theme with Reading (Red) */
[data-theme="light"][data-subject="reading"] {
  --primary:   #ef4444;
  --primary2:  #dc2626;
}

/* Light theme with History (Yellow) */
[data-theme="light"][data-subject="history"] {
  --primary:   #eab308;
  --primary2:  #ca8a04;
}

/* Light theme with Computer Science (Code Syntax) */
[data-theme="light"][data-subject="computer-science"] {
  --primary:   #8b5cf6;
  --primary2:  #7c3aed;
  --code-green: #22c55e;
  --code-blue: #3b82f6;
  --code-yellow: #f59e0b;
  --code-pink: #ec4899;
}

/* Light theme Computer Science - Multi-color elements */
[data-theme="light"][data-subject="computer-science"] .stat-number {
  background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 50%, #22c55e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

[data-theme="light"][data-subject="computer-science"] .logo-mark {
  background: linear-gradient(90deg, #8b5cf6 0%, #3b82f6 25%, #22c55e 50%, #f59e0b 75%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: codeShift 8s linear infinite;
  background-size: 200% 100%;
}

[data-theme="light"][data-subject="computer-science"] .avatar-circle {
  background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 50%, #22c55e 100%);
}

[data-theme="light"][data-subject="computer-science"] .btn-lime {
  background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 50%, #22c55e 100%);
  color: #ffffff;
}

[data-theme="light"][data-subject="computer-science"] .btn-lime:hover {
  background: linear-gradient(135deg, #7c3aed 0%, #2563eb 50%, #16a34a 100%);
}

/* Light theme with Science (Green) */
[data-theme="light"][data-subject="science"] {
  --primary:   #22c55e;
  --primary2:  #16a34a;
}

[data-theme="light"] .geo-circle { 
  border-color: rgba(59,130,246,.08);
}
[data-theme="light"] .math-sym { 
  color: rgba(59,130,246,.06);
}
[data-theme="light"] .notif-dot { 
  border-color: var(--bg);
}
[data-theme="light"] .streak-cell { 
  background: #e2e8f0;
}
[data-theme="light"] .streak-cell.level-1 { 
  background: rgba(59,130,246,.25); 
}
[data-theme="light"] .streak-cell.level-2 { 
  background: rgba(59,130,246,.45); 
}
[data-theme="light"] .streak-cell.level-3 { 
  background: rgba(59,130,246,.65); 
}
[data-theme="light"] .streak-cell.level-4 { 
  background: var(--primary); 
}

/* ── Leaderboard Styles ── */
.lb-row {
  display: flex; 
  align-items: center; 
  gap: 12px;
  padding: 10px 12px; 
  border-radius: 10px;
  margin-bottom: 6px;
}

.lb-rank {
  font-size: 16px;
  font-weight: 700;
  min-width: 40px;
  font-family: var(--font-mono);
}

.lb-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
}

.lb-name {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.lb-pts {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  font-family: var(--font-mono);
}

/* ── Session Card Styles ── */
.session-card {
  background: var(--card); 
  border: 1px solid var(--border);
  border-radius: var(--radius); 
  padding: 16px 18px;
  display: flex; 
  align-items: center; 
  gap: 16px;
  margin-bottom: 10px;
}

.session-time-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 50px;
}

.session-time-h { 
  font-size: 18px; 
  font-weight: 700; 
  color: var(--primary); 
  font-family: var(--font-mono);
}

.session-divider {
  width: 1px;
  height: 50px;
  background: var(--border);
}

.session-info {
  flex: 1;
}

.session-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.session-meta {
  font-size: 12px;
  color: var(--muted);
  font-family: var(--font-mono);
}

/* ── Progress Bar Color Variants ── */
.progress-fill.lime {
  background: linear-gradient(90deg, var(--lime), #2dd4bf);
}

.progress-fill.teal {
  background: linear-gradient(90deg, #2dd4bf, #60a5fa);
}

.progress-fill.purple {
  background: linear-gradient(90deg, #a78bfa, #ec4899);
}

.progress-fill.coral {
  background: linear-gradient(90deg, #ff6b6b, #fbbf24);
}

[data-theme="light"] .hero-band {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
[data-theme="light"] .hero-band::before { 
  background: radial-gradient(circle, rgba(59,130,246,.08) 0%, transparent 70%);
}
[data-theme="light"] .hero-band::after { 
  background: radial-gradient(circle, rgba(20,184,166,.05) 0%, transparent 70%);
}
[data-theme="light"] .stat-card {
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
[data-theme="light"] .stat-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
[data-theme="light"] .card {
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
[data-theme="light"] .sidebar {
  background: #f5f7fa;
  box-shadow: 2px 0 8px rgba(0,0,0,0.04);
}
[data-theme="light"] .topbar {
  background: rgba(255,255,255,0.95);
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
[data-theme="light"] .nav-item.active {
  color: #ffffff;
  background: linear-gradient(135deg, var(--primary), var(--primary2));
  box-shadow: 0 2px 8px rgba(59,130,246,0.25);
}
[data-theme="light"] .btn-lime {
  background: var(--primary);
  color: #ffffff;
}
[data-theme="light"] .btn-lime:hover {
  background: var(--primary2);
  box-shadow: 0 4px 12px rgba(59,130,246,0.25);
}
[data-theme="light"] .btn-outline:hover {
  border-color: var(--primary);
  color: var(--primary);
}
[data-theme="light"] .badge-lime {
  background: rgba(59,130,246,0.12);
  color: var(--primary2);
  border-color: rgba(59,130,246,0.25);
}
[data-theme="light"] .badge-teal {
  background: rgba(59,130,246,0.12);
  color: var(--primary2);
  border-color: var(--primary);
}
[data-theme="light"] .avatar-circle {
  background: linear-gradient(135deg, var(--primary), #14b8a6);
  color: #ffffff;
}
[data-theme="light"] .avatar-rank {
  color: var(--primary2);
}
[data-theme="light"] .xp-pill {
  background: rgba(59,130,246,0.1);
  border-color: var(--primary);
  color: var(--primary2);
}
[data-theme="light"] .auth-container {
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
}
[data-theme="light"] .auth-left {
  background: linear-gradient(135deg, #e8ecf1 0%, #dce1e8 100%);
}
[data-theme="light"] .theme-toggle:hover,
[data-theme="light"] .notif-btn:hover,
[data-theme="light"] .logout-btn:hover {
  background: var(--faint);
}
[data-theme="light"] .hamburger:hover {
  color: var(--lime);
  background: var(--faint);
}

html { scroll-behavior: smooth; }
body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  min-height: 100vh;
  overflow-x: hidden;
}
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--lime); border-radius: 4px; }

.shell { display: flex; min-height: 100vh; }

/* Main Home Sidebar (Large version for blank page) */
.main-home-sidebar {
  width: 300px;
  min-height: 100vh;
  background: var(--bg2);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 200;
  transition: transform .3s cubic-bezier(.4, 0, .2, 1);
}
.main-home-sidebar.hidden {
  transform: translateX(-300px);
}

.main-logo-zone {
  padding: 42px 32px 32px;
  border-bottom: 1px solid var(--border);
}
.main-logo-mark {
  font-family: var(--font-head);
  font-size: 48px;
  color: var(--lime);
  line-height: 1;
}
.main-logo-sub {
  font-size: 14px;
  color: var(--muted);
  font-family: var(--font-mono);
  letter-spacing: 3px;
  margin-top: 6px;
  text-transform: uppercase;
}

.main-nav-section {
  padding: 24px 18px 0;
  flex: 1;
}
.main-nav-label {
  font-size: 12px;
  font-family: var(--font-mono);
  letter-spacing: 4px;
  color: var(--muted);
  text-transform: uppercase;
  padding: 0 12px;
  margin-bottom: 12px;
  margin-top: 24px;
}
.main-nav-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border-radius: 14px;
  cursor: pointer;
  margin-bottom: 4px;
  font-size: 18px;
  font-weight: 500;
  color: var(--muted);
  transition: all .18s ease;
}
.main-nav-item:hover {
  color: var(--text);
  background: var(--faint);
}
.main-nav-item.active {
  color: var(--bg);
  background: var(--lime);
  font-weight: 600;
}
.main-nav-item .main-icon {
  font-size: 22px;
}

.main-avatar-zone {
  padding: 24px;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 14px;
}
.main-avatar-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--lime), #2dd4bf);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 22px;
  color: var(--bg);
}
.main-avatar-info { min-width: 0; }
.main-avatar-name { font-size: 18px; font-weight: 600; }
.main-avatar-rank { font-size: 14px; color: var(--lime); font-family: var(--font-mono); }

.sidebar {
  width: 220px; min-height: 100vh;
  background: var(--bg2);
  border-right: 1px solid var(--border);
  display: flex; flex-direction: column;
  position: fixed; top: 0; left: 0; z-index: 200;
  transition: transform .3s cubic-bezier(.4,0,.2,1);
}
.sidebar.hidden { transform: translateX(-220px); }

.content-area {
  margin-left: 220px; flex: 1;
  transition: margin-left .3s cubic-bezier(.4,0,.2,1);
  min-height: 100vh;
}
.content-area.full { margin-left: 0; }

.logo-zone {
  padding: 28px 20px 20px;
  border-bottom: 1px solid var(--border);
}
.logo-mark {
  font-family: var(--font-head);
  font-size: 32px; letter-spacing: 1px;
  color: var(--primary); line-height: 1;
}
.logo-sub {
  font-size: 10px; color: var(--muted);
  font-family: var(--font-mono);
  letter-spacing: 2px;
  margin-top: 4px; text-transform: uppercase;
}

.nav-section { padding: 16px 12px 0; flex: 1; }
.nav-label {
  font-size: 9px; font-family: var(--font-mono);
  letter-spacing: 3px; color: var(--muted);
  text-transform: uppercase; padding: 0 8px;
  margin-bottom: 8px; margin-top: 16px;
}
.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: 10px;
  cursor: pointer; margin-bottom: 3px;
  font-size: 14px; font-weight: 500; color: var(--muted);
  transition: all .18s ease;
  border: 1px solid transparent;
}
.nav-item:hover {
  color: var(--text); background: var(--faint);
}
.nav-item.active {
  color: var(--bg); background: var(--primary);
  border-color: var(--primary2);
  font-weight: 600;
}
.nav-item .icon { font-size: 16px; flex-shrink: 0; }

.avatar-zone {
  padding: 16px;
  border-top: 1px solid var(--border);
  display: flex; align-items: center; gap: 10px;
}
.avatar-circle {
  width: 38px; height: 38px; border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--teal));
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 15px; color: var(--bg); flex-shrink: 0;
}
.avatar-info { min-width: 0; }
.avatar-name { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.avatar-rank { font-size: 10px; color: var(--primary); font-family: var(--font-mono); }

.topbar {
  height: 60px; display: flex; align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  background: var(--bg); 
  border-bottom: 1px solid var(--border);
  position: sticky; top: 0; z-index: 100;
  backdrop-filter: blur(12px);
}
.topbar-left { display: flex; align-items: center; gap: 16px; }
.hamburger {
  background: none; border: none; cursor: pointer;
  color: var(--muted); padding: 6px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  transition: color .2s; font-size: 20px;
}
.hamburger:hover { color: var(--primary); }
.page-title { font-family: var(--font-head); font-size: 22px; letter-spacing: 1px; }

.topbar-right { display: flex; align-items: center; gap: 12px; position: relative; }
.xp-pill {
  background: var(--faint); border: 1px solid var(--primary);
  border-radius: 100px; padding: 5px 12px;
  font-size: 12px; font-family: var(--font-mono);
  color: var(--primary); font-weight: 700;
}
.theme-toggle, .notif-btn, .logout-btn {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--card); border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 16px;
  transition: all .2s;
  position: relative;
}
.theme-toggle:hover { 
  background: var(--faint); 
  transform: rotate(180deg);
}
.notif-btn:hover, .logout-btn:hover { background: var(--faint); }
.notif-btn.active { background: var(--faint); border-color: var(--primary); }
.logout-btn:hover {
  background: rgba(255,107,107,.1);
  border-color: var(--coral);
  color: var(--coral);
}

.notif-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--coral);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 2px solid var(--bg);
}

.notif-panel {
  position: absolute;
  top: 50px;
  right: 0;
  width: 360px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  z-index: 200;
  animation: slideDown 0.2s ease;
  max-height: 500px;
  display: flex;
  flex-direction: column;
}

.notif-header {
  padding: 16px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notif-list {
  flex: 1;
  overflow-y: auto;
  max-height: 400px;
}

.notif-item {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
}

.notif-item:hover {
  background: var(--faint);
}

.notif-item.unread {
  background: rgba(59,130,246,0.05);
}

.notif-item.unread::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--primary);
}

.notif-item .notif-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary);
  flex-shrink: 0;
  margin-top: 6px;
  border: none;
  position: static;
}

.notif-footer {
  padding: 12px;
  border-top: 1px solid var(--border);
  text-align: center;
}

.notif-link {
  background: none;
  border: none;
  color: var(--primary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.notif-link:hover {
  background: var(--faint);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.notif-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--coral);
  position: absolute; top: 6px; right: 6px;
  border: 2px solid var(--bg);
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
}

@keyframes bounce {
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-8px); }
}

.page { padding: 32px 28px; max-width: 1200px; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.fade-up { animation: fadeUp .5s ease forwards; }
.fade-up-1 { animation-delay: .05s; opacity: 0; }
.fade-up-2 { animation-delay: .12s; opacity: 0; }
.fade-up-3 { animation-delay: .19s; opacity: 0; }
.fade-up-4 { animation-delay: .26s; opacity: 0; }

.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 24px;
}

.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.flex-between { display: flex; align-items: center; justify-content: space-between; }
.flex-row { display: flex; flex-direction: row; align-items: center; }
.gap-8 { gap: 8px; }
.mt-16 { margin-top: 16px; }
.mt-24 { margin-top: 24px; }
.mt-32 { margin-top: 32px; }
.mono { font-family: var(--font-mono); }

.h1 { font-family: var(--font-head); font-size: 48px; letter-spacing: 1px; line-height: 1.05; }
.h2 { font-family: var(--font-head); font-size: 32px; letter-spacing: 1px; }
.h3 { font-family: var(--font-head); font-size: 22px; letter-spacing: .5px; }
.h4 { font-size: 16px; font-weight: 600; }
.body { font-size: 14px; color: var(--muted); line-height: 1.6; }
.lime { color: var(--primary); }

.badge {
  display: inline-flex; align-items: center;
  padding: 3px 10px; border-radius: 100px;
  font-size: 11px; font-weight: 600; font-family: var(--font-mono);
}
.badge-lime { background: rgba(59,130,246,.15); color: var(--primary); border: 1px solid rgba(59,130,246,.3); }
.badge-teal { background: rgba(59,130,246,.15); color: var(--primary); border: 1px solid rgba(59,130,246,.3); }
.badge-coral { background: rgba(255,107,107,.15); color: var(--coral); border: 1px solid rgba(255,107,107,.3); }
.badge-amber { background: rgba(251,191,36,.15); color: var(--amber); border: 1px solid rgba(251,191,36,.3); }
.badge-sky { background: rgba(96,165,250,.15); color: var(--sky); border: 1px solid rgba(96,165,250,.3); }
.badge-purple { background: rgba(167,139,250,.15); color: var(--purple); border: 1px solid rgba(167,139,250,.3); }

.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 10px 20px; border-radius: 10px; border: none;
  font-family: var(--font-body); font-size: 14px; font-weight: 600;
  cursor: pointer; transition: all .18s ease;
}
.btn-lime { background: var(--primary); color: #fff; }
.btn-lime:hover { background: var(--primary2); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(59,130,246,.3); }
.btn-outline {
  background: transparent; color: var(--text);
  border: 1px solid var(--border2);
}
.btn-outline:hover { background: var(--faint); border-color: var(--primary); color: var(--primary); }
.btn-ghost {
  background: transparent; color: var(--text);
  border: none; padding: 8px 12px;
}
.btn-ghost:hover { background: var(--faint); }
.btn-sm { padding: 6px 12px; font-size: 12px; }

.stat-card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 20px;
  position: relative; overflow: hidden;
  transition: transform .2s;
}
.stat-card:hover { transform: translateY(-3px); }
.stat-card-glow {
  position: absolute; top: -30px; right: -30px;
  width: 120px; height: 120px; border-radius: 50%;
  opacity: .08; filter: blur(30px);
}
.stat-number {
  font-family: var(--font-head); font-size: 42px;
  line-height: 1; margin-top: 8px;
}
.stat-label { 
  font-size: 12px; 
  color: var(--muted); 
  margin-top: 6px; 
  font-family: var(--font-mono);
}

/* ── Card Styles ── */
.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 24px;
}

/* ── Progress Bar Styles ── */
.progress-bar {
  height: 6px; 
  background: var(--faint);
  border-radius: 100px; 
  overflow: hidden;
}

.progress-fill {
  height: 100%; 
  border-radius: 100px;
  background: linear-gradient(90deg, var(--lime), var(--teal));
  transition: width .6s cubic-bezier(.4,0,.2,1);
}

/* ── Activity Item Styles ── */
.activity-item {
  display: flex; 
  align-items: flex-start; 
  gap: 12px;
  padding: 12px 0; 
  border-bottom: 1px solid var(--border);
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-dot {
  width: 8px; 
  height: 8px; 
  border-radius: 50%;
  margin-top: 6px; 
  flex-shrink: 0;
}

.hero-band {
  background: linear-gradient(135deg, var(--bg2) 0%, var(--bg3) 100%);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 36px; position: relative; overflow: hidden;
  margin-bottom: 28px;
}
.hero-band::before {
  content: '';
  position: absolute; top: -60px; right: -60px;
  width: 240px; height: 240px; border-radius: 50%;
  background: radial-gradient(circle, rgba(59,130,246,.15) 0%, transparent 70%);
}

.geo-bg {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none; z-index: 0; overflow: hidden; opacity: .4;
}
.geo-circle {
  position: absolute; border-radius: 50%;
  border: 1px solid rgba(59,130,246,.08);
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
}

@keyframes floatSym {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-12px) rotate(5deg); }
}
.math-sym {
  position: absolute; font-family: var(--font-mono);
  color: rgba(59,130,246,.07); font-size: 28px;
  pointer-events: none; animation: floatSym ease-in-out infinite;
}

/* Subject dropdown */
.subject-dropdown {
  position: relative;
}
.subject-btn {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 8px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  transition: all 0.2s;
}
.subject-btn:hover {
  background: var(--faint);
  border-color: var(--primary);
}
.subject-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  min-width: 180px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  z-index: 200;
  overflow: hidden;
}
.subject-option {
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 500;
  border-bottom: 1px solid var(--border);
}
.subject-option:last-child {
  border-bottom: none;
}
.subject-option:hover {
  background: var(--faint);
}
.subject-option.active {
  background: rgba(59,130,246,0.1);
  color: var(--primary);
  font-weight: 600;
}
.subject-icon {
  font-size: 18px;
}

/* AUTH PAGE STYLES - GAMIFIED */
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #1a1f2b 0%, #2d1b3d 50%, #1f2937 100%);
}

/* Transition overlay for page changes */
.game-transition {
  position: fixed;
  inset: 0;
  background: #000;
  z-index: 9999;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.game-transition.active {
  opacity: 1;
  animation: pixelWipe 0.6s steps(8) forwards;
}

@keyframes pixelWipe {
  0% { 
    clip-path: polygon(0 0, 0 0, 0 100%, 0 100%);
  }
  100% { 
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }
}

/* Button press animation */
@keyframes buttonPress {
  0% { transform: scale(1); }
  50% { transform: scale(0.95); }
  100% { transform: scale(1); }
}

/* Screen flash effect */
@keyframes screenFlash {
  0%, 100% { opacity: 0; }
  50% { opacity: 0.3; }
}

/* Scan line effect */
.auth-page::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(to bottom, rgba(255,255,255,0.1), transparent);
  animation: scanline 3s linear infinite;
  pointer-events: none;
  z-index: 10;
}

@keyframes scanline {
  0% { transform: translateY(0); }
  100% { transform: translateY(100vh); }
}

.auth-container {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: 1100px;
  width: 100%;
  background: linear-gradient(135deg, rgba(30,30,50,0.95) 0%, rgba(40,30,50,0.95) 100%);
  border: 2px solid rgba(255,255,255,0.15);
  border-radius: 32px;
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(0,0,0,0.5), 0 0 100px rgba(168,85,247,0.2);
  animation: containerPulse 2s ease-in-out infinite;
}

@keyframes containerPulse {
  0%, 100% { box-shadow: 0 30px 80px rgba(0,0,0,0.5), 0 0 100px rgba(168,85,247,0.2); }
  50% { box-shadow: 0 30px 80px rgba(0,0,0,0.5), 0 0 120px rgba(168,85,247,0.3); }
}

.auth-left {
  padding: 60px;
  background: linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(236,72,153,0.15) 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-right: 2px solid rgba(255,255,255,0.1);
  position: relative;
  overflow: hidden;
}

.auth-left::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%);
  animation: pulse 4s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}

.auth-brand-name {
  font-family: 'Press Start 2P', cursive;
  font-size: 36px;
  letter-spacing: 3px;
  background: linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 12px;
  text-shadow: 
    3px 3px 0px rgba(0,0,0,0.8),
    0 0 20px rgba(251,191,36,0.5);
  animation: glitch 3s infinite;
  line-height: 1.4;
}

@keyframes glitch {
  0%, 90%, 100% { transform: translate(0, 0); }
  91% { transform: translate(-2px, 2px); }
  92% { transform: translate(2px, -2px); }
  93% { transform: translate(0, 0); }
}

.auth-right {
  padding: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: rgba(20,20,35,0.5);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.auth-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(30,30,50,0.6);
  border: 2px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 0 16px;
  transition: all 0.3s;
  backdrop-filter: blur(10px);
}

.auth-input-wrap:focus-within {
  border-color: rgba(251,191,36,0.5);
  background: rgba(40,40,60,0.8);
  box-shadow: 0 0 20px rgba(251,191,36,0.2);
  transform: translateY(-2px);
}

.auth-input-wrap input {
  flex: 1;
  background: none;
  border: none;
  padding: 14px 12px 14px 8px;
  font-size: 14px;
  color: #ffffff;
  outline: none;
}

.auth-input-wrap input::placeholder {
  color: rgba(255,255,255,0.4);
}

.auth-submit {
  background: linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ec4899 100%);
  color: #ffffff;
  border: none;
  padding: 16px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 8px;
  text-transform: uppercase;
  letter-spacing: 2px;
  box-shadow: 
    0 8px 20px rgba(251,191,36,0.3),
    inset 0 -4px 0 rgba(0,0,0,0.2),
    4px 4px 0px rgba(0,0,0,0.3);
  position: relative;
  overflow: hidden;
  font-family: 'Press Start 2P', cursive;
  line-height: 1.6;
}

.auth-submit::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  transition: left 0.4s;
}

.auth-submit::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255,255,255,0);
  transition: background 0.15s;
}

.auth-submit:hover::before {
  left: 100%;
}

.auth-submit:hover {
  transform: translateY(-3px);
  box-shadow: 
    0 12px 30px rgba(251,191,36,0.5),
    inset 0 -4px 0 rgba(0,0,0,0.2),
    6px 6px 0px rgba(0,0,0,0.4);
}

.auth-submit:active {
  animation: buttonPress 0.2s ease;
  transform: translateY(1px) scale(0.98);
  box-shadow: 
    0 2px 8px rgba(251,191,36,0.3),
    inset 0 -1px 0 rgba(0,0,0,0.2),
    1px 1px 0px rgba(0,0,0,0.3);
}

.auth-submit:active::after {
  background: rgba(255,255,255,0.2);
  animation: screenFlash 0.3s ease;
}

/* Input field focus effects */
.auth-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(30,30,50,0.6);
  border: 2px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 0 16px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.auth-input-wrap:focus-within {
  border-color: rgba(251,191,36,0.6);
  background: rgba(40,40,60,0.8);
  box-shadow: 
    0 0 20px rgba(251,191,36,0.3),
    inset 0 0 10px rgba(251,191,36,0.1);
  transform: translateY(-2px) scale(1.01);
}

.auth-input-wrap:focus-within::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 12px;
  padding: 2px;
  background: linear-gradient(45deg, #fbbf24, #f97316, #ec4899, #fbbf24);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0.5;
  animation: borderRotate 3s linear infinite;
}

@keyframes borderRotate {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}

@media (max-width: 900px) {
  .sidebar { transform: translateX(-220px); }
  .content-area { margin-left: 0; }
  .grid-4, .grid-2 { grid-template-columns: 1fr; }
  .auth-container { grid-template-columns: 1fr; }
  .auth-left { display: none; }
}
`;

/* ═══════════════════════════════════════════════════════════════════
   COMPONENTS
═══════════════════════════════════════════════════════════════════ */

function GeoBg() {
  return (
    <div className="geo-bg" aria-hidden>
      {[
        { size: 600, top: "5%", left: "60%", op: 1 },
        { size: 300, top: "50%", left: "10%", op: 0.7 },
        { size: 200, top: "80%", left: "70%", op: 0.5 },
      ].map((c, i) => (
        <div
          key={i}
          className="geo-circle"
          style={{
            width: c.size,
            height: c.size,
            top: c.top,
            left: c.left,
            opacity: c.op,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
      {["∑", "∫", "π", "∞", "√", "∂", "θ", "Δ", "≈", "∈"].map((sym, i) => (
        <div
          key={sym}
          className="math-sym"
          style={{
            top: `${10 + i * 9}%`,
            left: `${5 + ((i * 11) % 90)}%`,
            animationDuration: `${4 + i * 0.7}s`,
            animationDelay: `${i * 0.4}s`,
            fontSize: `${24 + ((i % 3) * 10)}px`,
          }}
        >
          {sym}
        </div>
      ))}
    </div>
  );
}

function Sidebar({ active, setActive, collapsed, user, onLogoClick, setPage, setShowProfilePage, onLogout, onShowLanguageSelectorModal }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { t } = useLanguage();
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showProfileMenu && !e.target.closest('.avatar-zone')) {
        setShowProfileMenu(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showProfileMenu]);
  
  const NAV_ITEMS = [
    { id: "dashboard", label: t("nav_dashboard"), icon: "📊" },
    { id: "schedule",  label: t("nav_schedule"),  icon: "📅" },
    { id: "courses",   label: t("nav_courses"),   icon: "📖" },
    { id: "resources", label: t("nav_resources"), icon: "📚" },
    { id: "community", label: t("nav_community"), icon: "💬" },
  ];

  const userInitials = user?.username ? user.username.substring(0, 2).toUpperCase() : "ME";

  const profileMenuItems = [
    { id: "profile",       label: t("menu_my_profile"),    icon: "👤" },
    { id: "settings",      label: t("menu_settings"),      icon: "⚙️" },
    { id: "analytics",     label: t("menu_analytics"),     icon: "📊" },
    { id: "language",      label: t("menu_language"),      icon: "🌐" },
    { id: "notifications", label: t("menu_notifications"), icon: "🔔" },
    { id: "help",          label: t("menu_help_support"),  icon: "❓" },
    { id: "divider", isDivider: true },
    { id: "logout",        label: t("menu_log_out"),       icon: "🚪" },
  ];

  return (
    <nav className={`sidebar ${collapsed ? "hidden" : ""}`}>
      <div 
        className="logo-zone" 
        onClick={onLogoClick}
        style={{ cursor: 'pointer', transition: 'background 0.2s' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(200,241,53,0.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <div className="logo-mark">StudyLink</div>
        <div className="logo-sub">Student Learning Hub</div>
      </div>

      <div className="nav-section">
        <div className="nav-label">Menu</div>
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
      </div>

      <div 
        className="avatar-zone"
        onClick={() => {
          console.log('Avatar clicked! Current state:', showProfileMenu);
          setShowProfileMenu(!showProfileMenu);
        }}
        style={{ cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(200,241,53,0.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <div className="avatar-circle">{userInitials}</div>
        <div className="avatar-info">
          <div className="avatar-name">{user?.username || "Math Student"}</div>
          <div className="avatar-rank">⚡ Level {user?.level || 1} · {user?.xp || 0} XP</div>
        </div>

        {/* Profile Dropdown Menu */}
        {showProfileMenu && (
          <div
            style={{
              position: 'absolute',
              bottom: '100%',
              left: 0,
              right: 0,
              marginBottom: 8,
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              zIndex: 1000,
              animation: 'slideDown 0.2s ease-out'
            }}
            onClick={(e) => {
              e.stopPropagation();
              console.log('Menu clicked');
            }}
          >
            {profileMenuItems.map((item, idx) => (
              item.isDivider ? (
                <div
                  key={item.id}
                  style={{
                    height: 1,
                    background: 'var(--border)',
                    margin: '8px 0'
                  }}
                />
              ) : (
                <div
                  key={item.id}
                  onClick={() => {
                    setShowProfileMenu(false);
                    
                    if (item.id === 'profile') {
                      setShowProfilePage(true);
                    } else if (item.id === 'analytics') {
                      setPage('analytics');
                      setActive('analytics');
                    } else if (item.id === 'help') {
                      setPage('help');
                      setActive('help');
                    } else if (item.id === 'settings') {
                      setPage('settings');
                      setActive('settings');
                    } else if (item.id === 'language') {
                      if (onShowLanguageSelectorModal) {
                        onShowLanguageSelectorModal();
                      }
                    } else if (item.id === 'logout') {
                      if (onLogout) {
                        onLogout();
                      }
                    }
                  }}
                  style={{
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    fontSize: 14,
                    fontWeight: 500,
                    color: item.id === 'logout' ? '#ef4444' : 'var(--text)',
                    cursor: 'pointer',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--faint)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

function TopBar({ page, collapsed, setCollapsed, theme, setTheme, onLogout, subject, setSubject }) {
  const [showSubjectMenu, setShowSubjectMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [subjectXP, setSubjectXP] = useState(0);

  // Update XP when subject changes
  useEffect(() => {
    const updateXP = () => {
      const xp = subject ? getSubjectXP(subject) : getTotalXP();
      setSubjectXP(xp);
    };
    
    updateXP();
    
    // Listen for custom event when lessons are completed
    window.addEventListener('xpUpdated', updateXP);
    
    return () => {
      window.removeEventListener('xpUpdated', updateXP);
    };
  }, [subject]);

  const labels = {
    dashboard: "Dashboard",
    schedule: "Schedule",
    resources: "Resources",
    community: "Community",
  };

  const subjects = {
    math: { name: "Math", icon: "🔢", color: "#3b82f6" },
    reading: { name: "Reading", icon: "📚", color: "#ef4444" },
    history: { name: "History", icon: "📜", color: "#eab308" },
    "computer-science": { name: "Computer Science", icon: "💻", color: "#a78bfa" },
    science: { name: "Science", icon: "🔬", color: "#22c55e" },
  };

  const notifications = [
    { id: 1, text: "New lesson available: Advanced Calculus", time: "5 min ago", unread: true },
    { id: 2, text: "Quiz reminder: Complete Algebra quiz by Friday", time: "1 hour ago", unread: true },
    { id: 3, text: "You earned the 'Week Warrior' badge!", time: "2 hours ago", unread: false },
    { id: 4, text: "New study group session tomorrow at 4 PM", time: "Yesterday", unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="topbar">
      <div className="topbar-left">
        <button
          className="hamburger"
          onClick={() => setCollapsed((c) => !c)}
          aria-label="Toggle sidebar"
        >
          {collapsed ? "☰" : "✕"}
        </button>
        <div className="page-title">{labels[page] || page}</div>
      </div>
      <div className="topbar-right">
        <div className="subject-dropdown">
          <button 
            className="subject-btn"
            onClick={() => setShowSubjectMenu(!showSubjectMenu)}
          >
            {subject ? (
              <>
                <span className="subject-icon">{subjects[subject].icon}</span>
                <span>{subjects[subject].name}</span>
              </>
            ) : (
              <span>Select Subject</span>
            )}
            <span style={{ fontSize: 10, opacity: 0.6 }}>▼</span>
          </button>
          {showSubjectMenu && (
            <>
              <div 
                style={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: 150
                }}
                onClick={() => setShowSubjectMenu(false)}
              />
              <div className="subject-menu">
                {Object.entries(subjects).map(([key, sub]) => (
                  <div
                    key={key}
                    className={`subject-option ${subject === key ? 'active' : ''}`}
                    onClick={() => {
                      setSubject(key);
                      setShowSubjectMenu(false);
                    }}
                  >
                    <span className="subject-icon">{sub.icon}</span>
                    <span>{sub.name}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="xp-pill">⚡ {subjectXP.toLocaleString()} XP</div>
        <button
          className="theme-toggle"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
        <div style={{ position: 'relative' }}>
          <button
            className="notif-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            🔔
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount}</span>
            )}
          </button>
          {showNotifications && (
            <>
              <div 
                style={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: 150
                }}
                onClick={() => setShowNotifications(false)}
              />
              <div className="notif-panel">
                <div className="notif-header">
                  <span style={{ fontWeight: 600, fontSize: 14 }}>Notifications</span>
                  {unreadCount > 0 && (
                    <span style={{ fontSize: 11, color: 'var(--primary)' }}>{unreadCount} new</span>
                  )}
                </div>
                <div className="notif-list">
                  {notifications.map((notif) => (
                    <div key={notif.id} className={`notif-item ${notif.unread ? 'unread' : ''}`}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: notif.unread ? 600 : 400 }}>
                          {notif.text}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                          {notif.time}
                        </div>
                      </div>
                      {notif.unread && (
                        <div className="notif-dot" />
                      )}
                    </div>
                  ))}
                </div>
                <div className="notif-footer">
                  <button className="notif-link">View all notifications</button>
                </div>
              </div>
            </>
          )}
        </div>
        <button
          className="logout-btn"
          onClick={onLogout}
          title="Logout"
        >
          🚪
        </button>
      </div>
    </div>
  );
}

/* ── MAIN HOME PAGE (Blank Page with Dashboard) ── */
function BlankPage() {
  const [userTotalXP, setUserTotalXP] = useState(0);

  // Update total XP on mount and when XP changes
  useEffect(() => {
    const updateTotalXP = () => {
      setUserTotalXP(getTotalXP());
    };
    
    updateTotalXP();
    
    // Listen for XP updates
    window.addEventListener('xpUpdated', updateTotalXP);
    
    return () => {
      window.removeEventListener('xpUpdated', updateTotalXP);
    };
  }, []);

  const [streakCells] = useState(() => {
    const cells = [];
    for (let i = 0; i < 84; i++) {
      const r = Math.random();
      cells.push(r > .7 ? "level-4" : r > .5 ? "level-3" : r > .3 ? "level-2" : r > .15 ? "level-1" : "");
    }
    for (let i = 70; i < 84; i++) cells[i] = i % 3 === 0 ? "level-3" : "level-4";
    return cells;
  });

  const COMPLETED_TOPICS = [
    { name: "Algebra Basics", pct: 100, color: "lime" },
    { name: "Calculus I", pct: 72, color: "teal" },
    { name: "Statistics", pct: 55, color: "purple" },
    { name: "Geometry", pct: 40, color: "" },
    { name: "Linear Algebra", pct: 20, color: "coral" },
  ];

  const ACTIVITY = [
    { text: "Completed 'Derivatives Deep Dive' lesson", time: "2h ago", dot: "#c8f135" },
    { text: "Scored 90% on Algebra Quiz", time: "Yesterday", dot: "#2dd4bf" },
    { text: "Joined Statistics Study Group", time: "2 days ago", dot: "#60a5fa" },
    { text: "Earned 'Geometry Master' badge", time: "3 days ago", dot: "#fbbf24" },
    { text: "Watched 'Chain Rule' video (12 min)", time: "4 days ago", dot: "#a78bfa" },
  ];

  const SESSIONS = [
    { id: 1, day: "MON", time: "4:00 PM", title: "Calculus: Derivatives Deep Dive", host: "Alex R.", attendees: 8, color: "#c8f135" },
    { id: 2, day: "MON", time: "6:30 PM", title: "Statistics Study Group", host: "Priya K.", attendees: 5, color: "#2dd4bf" },
    { id: 3, day: "TUE", time: "3:30 PM", title: "Algebra II: Quadratics", host: "Marcus T.", attendees: 12, color: "#a78bfa" },
  ];

  const LEADERBOARD = [
    { name: "Alex R.", pts: 4820, avatar: "AR", color: "#c8f135" },
    { name: "Priya K.", pts: 4210, avatar: "PK", color: "#60a5fa" },
    { name: "Marcus T.", pts: 3870, avatar: "MT", color: "#a78bfa" },
    { name: "You", pts: userTotalXP, avatar: "ME", color: "#2dd4bf", isMe: true },
    { name: "Lena S.", pts: 2990, avatar: "LS", color: "#fbbf24" },
    { name: "Omar J.", pts: 2750, avatar: "OJ", color: "#ff6b6b" },
  ];

  return (
    <div style={{
      padding: '32px clamp(24px, 5vw, 48px)',
      maxWidth: 1600,
      margin: '0 auto',
      width: '100%'
    }}>
      {/* Hero */}
      <div className="hero-band fade-up" style={{ marginBottom: 32 }}>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: 'flex', gap: 'clamp(8px, 1.5vw, 12px)', marginBottom: 'clamp(8px, 1.5vw, 12px)', flexWrap: 'wrap' }}>
            <span style={{
              padding: 'clamp(4px, 0.8vw, 6px) clamp(10px, 1.5vw, 14px)',
              background: 'rgba(200,241,53,0.15)',
              border: '1px solid rgba(200,241,53,0.3)',
              borderRadius: 'clamp(6px, 1vw, 8px)',
              fontSize: 'clamp(10px, 1.8vw, 12px)',
              fontWeight: 600,
              color: '#c8f135'
            }}>🔥 Top 10% this week</span>
            <span style={{
              padding: 'clamp(4px, 0.8vw, 6px) clamp(10px, 1.5vw, 14px)',
              background: 'rgba(200,241,53,0.15)',
              border: '1px solid rgba(200,241,53,0.3)',
              borderRadius: 'clamp(6px, 1vw, 8px)',
              fontSize: 'clamp(10px, 1.8vw, 12px)',
              fontWeight: 600,
              color: '#c8f135'
            }}>🔥 14 Day Streak</span>
          </div>
          <div style={{
            fontSize: 'clamp(28px, 5vw, 48px)',
            fontWeight: 700,
            lineHeight: 1.2
          }}>Welcome back,<br /><span className="lime">Student!</span></div>
          <div style={{
            marginTop: 'clamp(8px, 1.5vw, 10px)',
            fontSize: 'clamp(13px, 2vw, 15px)',
            color: 'var(--muted)',
            lineHeight: 1.6,
            maxWidth: 600
          }}>
            You've completed <strong style={{ color: "var(--text)" }}>3 lessons</strong> this week. 
            Your next tutoring session starts in <strong className="lime">2 hours</strong>. Keep it up!
          </div>
          <div style={{ display: 'flex', gap: 'clamp(8px, 1.5vw, 12px)', marginTop: 'clamp(16px, 2.5vw, 20px)', flexWrap: 'wrap' }}>
            <button style={{
              padding: 'clamp(10px, 1.5vw, 14px) clamp(18px, 2.5vw, 24px)',
              background: '#c8f135',
              color: '#0f1419',
              border: 'none',
              borderRadius: 'clamp(8px, 1.2vw, 10px)',
              fontSize: 'clamp(13px, 1.8vw, 14px)',
              fontWeight: 600,
              cursor: 'pointer'
            }}>Continue Learning →</button>
            <button style={{
              padding: 'clamp(10px, 1.5vw, 14px) clamp(18px, 2.5vw, 24px)',
              background: 'transparent',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: 'clamp(8px, 1.2vw, 10px)',
              fontSize: 'clamp(13px, 1.8vw, 14px)',
              fontWeight: 600,
              cursor: 'pointer'
            }}>View Schedule</button>
          </div>
        </div>
      </div>

      {/* Stat cards - Responsive Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
        gap: 'clamp(12px, 2vw, 20px)',
        marginBottom: 'clamp(20px, 3vw, 32px)'
      }} className="fade-up fade-up-1">
        {[
          { n: "14", label: "Day Streak", color: "#c8f135", glow: "#c8f135", icon: "🔥" },
          { n: "72%", label: "Calculus Progress", color: "#2dd4bf", glow: "#2dd4bf", icon: "📈" },
          { n: userTotalXP.toLocaleString(), label: "Total XP", color: "#a78bfa", glow: "#a78bfa", icon: "⚡" },
          { n: "8", label: "Sessions Joined", color: "#fbbf24", glow: "#fbbf24", icon: "🎓" },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'var(--card)',
            borderRadius: 'clamp(10px, 1.5vw, 14px)',
            padding: 'clamp(16px, 2.5vw, 24px)',
            border: '1px solid var(--border)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div className="stat-card-glow" style={{ background: s.glow }} />
            <div className="flex-between" style={{marginBottom: 'clamp(8px, 1.5vw, 12px)'}}>
              <span style={{ fontSize: 'clamp(20px, 3vw, 24px)' }}>{s.icon}</span>
              <span style={{
                padding: 'clamp(3px, 0.6vw, 4px) clamp(6px, 1vw, 10px)',
                background: `${s.color}18`,
                color: s.color,
                border: `1px solid ${s.color}40`,
                borderRadius: 'clamp(4px, 0.8vw, 6px)',
                fontSize: 'clamp(8px, 1.2vw, 10px)',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)'
              }}>THIS MONTH</span>
            </div>
            <div style={{ 
              fontSize: 'clamp(32px, 5vw, 48px)', 
              fontWeight: 800, 
              color: s.color,
              lineHeight: 1,
              marginBottom: 'clamp(4px, 0.8vw, 6px)'
            }}>{s.n}</div>
            <div style={{ 
              fontSize: 'clamp(11px, 1.6vw, 13px)', 
              color: 'var(--muted)',
              fontWeight: 500
            }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* My Topics + Recent Activity - Responsive Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))',
        gap: 24,
        marginBottom: 32
      }} className="fade-up fade-up-2">
        {/* Progress section */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: 20 }}>
            <div className="h3">My Topics</div>
            <span className="badge badge-lime">5 active</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
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
          <div className="h3" style={{ marginBottom: 16 }}>Recent Activity</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {ACTIVITY.map((a, i) => (
              <div className="activity-item" key={i}>
                <div className="activity-dot" style={{ background: a.dot }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4 }}>{a.text}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3, fontFamily: "var(--font-mono)" }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Streak heatmap */}
      <div className="card fade-up fade-up-3" style={{ marginBottom: 32 }}>
        <div className="flex-between" style={{ marginBottom: 16, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div className="h3">Study Streak</div>
            <div className="body" style={{ marginTop: 4 }}>84 days tracked · <span className="lime">🔥 14 active streak</span></div>
          </div>
          <div className="flex-row gap-8" style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
            <span>Less</span>
            {["", "level-1", "level-2", "level-3", "level-4"].map((l, i) => {
              const greenStyles = {
                '': { background: 'var(--faint)' },
                'level-1': { background: 'rgba(200,241,53,.25)' },
                'level-2': { background: 'rgba(200,241,53,.5)' },
                'level-3': { background: 'rgba(200,241,53,.75)' },
                'level-4': { background: '#c8f135' }
              };
              return <div key={i} className="streak-cell" style={{ width: 14, height: 14, ...greenStyles[l] }} />;
            })}
            <span>More</span>
          </div>
        </div>
        <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
          <div className="streak-grid">
            {streakCells.map((level, i) => {
              const greenStyles = {
                '': { background: 'var(--faint)' },
                'level-1': { background: 'rgba(200,241,53,.25)' },
                'level-2': { background: 'rgba(200,241,53,.5)' },
                'level-3': { background: 'rgba(200,241,53,.75)' },
                'level-4': { background: '#c8f135' }
              };
              return <div key={i} className="streak-cell" style={greenStyles[level] || {}} />;
            })}
          </div>
        </div>
      </div>

      {/* Today's Sessions + Leaderboard - Responsive Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))',
        gap: 24
      }} className="fade-up fade-up-4">
        <div className="card">
          <div className="flex-between" style={{ marginBottom: 16 }}>
            <div className="h3">Today's Sessions</div>
            <span className="badge badge-coral">2 Today</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {SESSIONS.slice(0, 3).map(s => (
              <div className="session-card card-sm" key={s.id} style={{ 
                borderLeft: `3px solid var(--primary)`,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 12
              }}>
                <div className="session-time-block" style={{ flexShrink: 0 }}>
                  <div className="session-time-h">{s.time.split(":")[0]}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>{s.time.split(" ")[1]}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>{s.day}</div>
                </div>
                <div className="session-divider" />
                <div className="session-info" style={{ flex: 1, minWidth: 0 }}>
                  <div className="session-title" style={{ 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>{s.title}</div>
                  <div className="session-meta">with {s.host} · {s.attendees} joining</div>
                </div>
                <button className="btn btn-lime btn-sm" style={{ flexShrink: 0 }}>Join</button>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex-between" style={{ marginBottom: 20 }}>
            <div className="h3">Leaderboard</div>
            <span className="badge badge-amber">Weekly</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {LEADERBOARD.map((l, i) => (
              <div 
                className={`lb-row ${l.isMe ? 'me' : ''}`}
                key={i}
              >
                <div className="lb-rank" style={{
                  color: i === 0 ? "#fbbf24" : i === 1 ? "#d4d4d8" : i === 2 ? "#cd7f32" : "var(--muted)"
                }}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                </div>
                <div className="lb-avatar" style={{ 
                  background: `${l.color}20`, 
                  color: l.color
                }}>{l.avatar}</div>
                <div className="lb-name">
                  {l.name}
                  {l.isMe && <span className="badge badge-lime" style={{ fontSize: 10, padding: '3px 8px' }}>YOU</span>}
                </div>
                <div className="lb-pts">{l.pts.toLocaleString()} XP</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── MAIN HOME SIDEBAR (Large version for blank page) ── */
function MainHomeSidebar({ collapsed, user, onLogoClick, setPage, setShowProfilePage, onLogout, onShowLanguageSelectorModal }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { t } = useLanguage();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showProfileMenu && !e.target.closest('.main-avatar-zone')) {
        setShowProfileMenu(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showProfileMenu]);

  const profileMenuItems = [
    { id: "profile",       label: t("menu_my_profile"),    icon: "👤" },
    { id: "settings",      label: t("menu_settings"),      icon: "⚙️" },
    { id: "analytics",     label: t("menu_analytics"),     icon: "📊" },
    { id: "language",      label: t("menu_language"),      icon: "🌐" },
    { id: "notifications", label: t("menu_notifications"), icon: "🔔" },
    { id: "help",          label: t("menu_help_support"),  icon: "❓" },
    { id: "divider", isDivider: true },
    { id: "logout",        label: t("menu_log_out"),       icon: "🚪" },
  ];

  return (
    <nav className={`main-home-sidebar ${collapsed ? "hidden" : ""}`}>
      <div 
        className="main-logo-zone"
        onClick={onLogoClick}
        style={{ cursor: 'pointer', transition: 'background 0.2s' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(200,241,53,0.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <div className="main-logo-mark">StudyLink</div>
        <div className="main-logo-sub">Learning Hub</div>
      </div>

      <div className="main-nav-section">
        <div className="main-nav-label">Main Menu</div>
        <div className="main-nav-item" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
          <span className="main-icon">📊</span>
          {t("nav_dashboard")}
        </div>
        <div className="main-nav-item" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
          <span className="main-icon">📅</span>
          {t("nav_schedule")}
        </div>
        <div className="main-nav-item" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
          <span className="main-icon">📚</span>
          {t("nav_resources")}
        </div>
        <div className="main-nav-item" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
          <span className="main-icon">💬</span>
          {t("nav_community")}
        </div>
        <div style={{ 
          marginTop: 24, 
          padding: '0 16px', 
          fontSize: 14, 
          color: 'var(--muted)',
          fontStyle: 'italic'
        }}>
          Select a subject to begin
        </div>
      </div>

      <div 
        className="main-avatar-zone"
        onClick={() => setShowProfileMenu(!showProfileMenu)}
        style={{ cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(200,241,53,0.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <div className="main-avatar-circle">
          {user?.username ? user.username.substring(0, 2).toUpperCase() : "ME"}
        </div>
        <div className="main-avatar-info">
          <div className="main-avatar-name">{user?.username || "Guest"}</div>
          <div className="main-avatar-rank">Level {user?.level || 1}</div>
        </div>

        {/* Profile Dropdown Menu */}
        {showProfileMenu && (
          <div
            style={{
              position: 'absolute',
              bottom: '100%',
              left: 0,
              right: 0,
              marginBottom: 8,
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              zIndex: 1000,
              animation: 'slideDown 0.2s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {profileMenuItems.map((item, idx) => (
              item.isDivider ? (
                <div
                  key={item.id}
                  style={{
                    height: 1,
                    background: 'var(--border)',
                    margin: '8px 0'
                  }}
                />
              ) : (
                <div
                  key={item.id}
                  onClick={() => {
                    setShowProfileMenu(false);
                    
                    if (item.id === 'profile') {
                      setShowProfilePage(true);
                    } else if (item.id === 'analytics') {
                      setPage('analytics');
                    } else if (item.id === 'help') {
                      setPage('help');
                    } else if (item.id === 'settings') {
                      setPage('settings');
                    } else if (item.id === 'language') {
                      if (onShowLanguageSelectorModal) {
                        onShowLanguageSelectorModal();
                      }
                    } else if (item.id === 'logout') {
                      if (onLogout) {
                        onLogout();
                      }
                    }
                  }}
                  style={{
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    fontSize: 14,
                    fontWeight: 500,
                    color: item.id === 'logout' ? '#ef4444' : 'var(--text)',
                    cursor: 'pointer',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--faint)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

/* ── DASHBOARD PAGE ── */
function DashboardPage({ subject }) {
  const subjectText = {
    math: 'Top 10% in Math this week',
    reading: 'Top 10% in Reading this week',
    history: 'Top 10% in History this week',
    'computer-science': 'Top 10% in Computer Science this week',
    science: 'Top 10% in Science this week'
  };

  return (
    <div className="page">
      <div className="hero-band fade-up">
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <span className="badge badge-lime">🔥 14 Day Streak</span>
            <span className="badge badge-lime">{subjectText[subject] || 'Top 10% this week'}</span>
          </div>
          <div className="h1">Welcome back,<br /><span className="lime">Student!</span></div>
          <div className="body" style={{ marginTop: 10, maxWidth: 480 }}>
            You've completed <strong style={{ color: "var(--text)" }}>3 lessons</strong> this week. 
            Your next tutoring session starts in <strong style={{ color: "var(--primary)" }}>2 hours</strong>. Keep it up!
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button className="btn btn-lime">Continue Learning →</button>
            <button className="btn btn-outline">View Schedule</button>
          </div>
        </div>
      </div>

      <div className="grid-4 fade-up fade-up-1">
        {[
          { n: "14", label: "Day Streak", icon: "🔥" },
          { n: "72%", label: "Progress", icon: "📈" },
          { n: "890", label: "XP This Week", icon: "⚡" },
          { n: "8", label: "Sessions Joined", icon: "🎓" },
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
            <div className="stat-number" style={{ color: "var(--primary)" }}>{s.n}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card mt-24 fade-up fade-up-2" style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
        <div className="h2">StudyLink</div>
        <div className="body" style={{ marginTop: 16, fontSize: 16 }}>
          You're now logged in! This is a complete working preview with:
        </div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: 20, 
          marginTop: 32,
          maxWidth: 600,
          margin: '32px auto 0'
        }}>
          {[
            { icon: "🔐", title: "Authentication System", desc: "Sign up, login, logout" },
            { icon: "🎨", title: "Light/Dark Theme", desc: "Toggle with sun/moon icon" },
            { icon: "👤", title: "User Profile", desc: "Shows in sidebar" },
            { icon: "📱", title: "Responsive Design", desc: "Works on all devices" }
          ].map((f, i) => (
            <div key={i} style={{
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: 20,
              textAlign: 'left'
            }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// CourseCard component with collapsible units
/* ── LESSON PAGE COMPONENT (Full Screen) ── */
function LessonPage({ lesson, onClose, onComplete }) {
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  // Question bank for different lessons
  const questionBank = {
    "Overview and history of algebra": [
      {
        id: 1,
        question: "What does the word 'algebra' come from?",
        options: [
          "Greek word meaning 'calculation'",
          "Arabic word meaning 'reunion of broken parts'",
          "Latin word meaning 'numbers'",
          "Egyptian word meaning 'balance'"
        ],
        correct: 1
      },
      {
        id: 2,
        question: "Who is considered the 'father of algebra'?",
        options: [
          "Pythagoras",
          "Euclid",
          "Al-Khwarizmi",
          "Newton"
        ],
        correct: 2
      },
      {
        id: 3,
        question: "What is a variable in algebra?",
        options: [
          "A number that never changes",
          "A symbol that represents an unknown value",
          "A mathematical operation",
          "A type of equation"
        ],
        correct: 1
      },
      {
        id: 4,
        question: "Which ancient civilization used algebraic methods for land measurement?",
        options: [
          "Romans",
          "Greeks",
          "Egyptians",
          "Vikings"
        ],
        correct: 2
      },
      {
        id: 5,
        question: "What is the main purpose of algebra?",
        options: [
          "To make math harder",
          "To solve problems using symbols and generalized methods",
          "To replace arithmetic",
          "To calculate pi"
        ],
        correct: 1
      }
    ],
    "Introduction to variables": [
      {
        id: 1,
        question: "Which letter is most commonly used as a variable in algebra?",
        options: [
          "a",
          "x",
          "z",
          "n"
        ],
        correct: 1
      },
      {
        id: 2,
        question: "In the expression '3x + 5', what is 'x'?",
        options: [
          "A constant",
          "A variable",
          "An operation",
          "A coefficient"
        ],
        correct: 1
      },
      {
        id: 3,
        question: "If x = 7, what is the value of 2x?",
        options: [
          "9",
          "14",
          "27",
          "72"
        ],
        correct: 1
      },
      {
        id: 4,
        question: "Can a variable represent more than one value?",
        options: [
          "No, it must always be the same number",
          "Yes, it can represent different values in different contexts",
          "Only in geometry",
          "Only negative numbers"
        ],
        correct: 1
      },
      {
        id: 5,
        question: "In 'y = 4', what role does 'y' play?",
        options: [
          "It's a number equal to 4",
          "It's a variable that represents the value 4",
          "It's a mathematical operation",
          "It's meaningless"
        ],
        correct: 1
      }
    ],
    "Introduction to phonics": [
      {
        id: 1,
        question: "What is phonics?",
        options: [
          "The study of silent letters",
          "The relationship between letters and sounds",
          "A type of reading comprehension",
          "The study of word meanings"
        ],
        correct: 1
      },
      {
        id: 2,
        question: "Which of these is a vowel?",
        options: [
          "B",
          "D",
          "A",
          "T"
        ],
        correct: 2
      },
      {
        id: 3,
        question: "What sound does the letter 'S' make in the word 'sun'?",
        options: [
          "/z/",
          "/s/",
          "/sh/",
          "/ch/"
        ],
        correct: 1
      },
      {
        id: 4,
        question: "How many sounds do you hear in the word 'cat'?",
        options: [
          "1",
          "2",
          "3",
          "4"
        ],
        correct: 2
      },
      {
        id: 5,
        question: "Why is learning phonics important?",
        options: [
          "To memorize every word",
          "To help decode and read new words",
          "To write faster",
          "To spell perfectly"
        ],
        correct: 1
      }
    ],
    // READING
    "Understanding main ideas": [
      {
        id: 1,
        question: "What is a main idea in a text?",
        options: [
          "A minor detail in the story",
          "The central point or message the author wants to convey",
          "The first sentence of each paragraph",
          "The title of the text"
        ],
        correct: 1
      },
      {
        id: 2,
        question: "Where is the main idea usually found in a paragraph?",
        options: [
          "Always in the first sentence",
          "Always in the last sentence",
          "Often in the topic sentence, but can appear anywhere",
          "Never explicitly stated"
        ],
        correct: 2
      },
      {
        id: 3,
        question: "What are supporting details?",
        options: [
          "Random facts in the text",
          "Information that helps explain or prove the main idea",
          "The author's personal opinions",
          "The chapter titles"
        ],
        correct: 1
      },
      {
        id: 4,
        question: "How can you identify the main idea?",
        options: [
          "Look for the longest sentence",
          "Find the most interesting detail",
          "Ask: What is this mostly about?",
          "Count how many times a word appears"
        ],
        correct: 2
      },
      {
        id: 5,
        question: "Can a text have more than one main idea?",
        options: [
          "No, there's always only one main idea",
          "Yes, especially in longer texts with multiple sections",
          "Only in fiction",
          "Only in poetry"
        ],
        correct: 1
      }
    ],
    // HISTORY
    "European exploration and colonization": [
      {
        id: 1,
        question: "Which explorer is credited with discovering America in 1492?",
        options: [
          "Ferdinand Magellan",
          "Christopher Columbus",
          "Vasco da Gama",
          "Marco Polo"
        ],
        correct: 1
      },
      {
        id: 2,
        question: "What was the main goal of European exploration?",
        options: [
          "To find new vacation spots",
          "To discover trade routes and resources",
          "To map the entire world",
          "To spread democracy"
        ],
        correct: 1
      },
      {
        id: 3,
        question: "Which country sponsored Christopher Columbus's voyage?",
        options: [
          "England",
          "France",
          "Spain",
          "Portugal"
        ],
        correct: 2
      },
      {
        id: 4,
        question: "What was the Columbian Exchange?",
        options: [
          "A stock market in Colombia",
          "The transfer of plants, animals, and diseases between the Old and New Worlds",
          "A peace treaty",
          "A type of ship"
        ],
        correct: 1
      },
      {
        id: 5,
        question: "Which European power colonized most of South America?",
        options: [
          "England",
          "France",
          "Spain",
          "Netherlands"
        ],
        correct: 2
      }
    ],
    "The American Revolution: Causes": [
      {
        id: 1,
        question: "What was 'taxation without representation'?",
        options: [
          "Free taxes for everyone",
          "Britain taxing colonists who had no say in Parliament",
          "A colonial fundraising event",
          "A type of tea"
        ],
        correct: 1
      },
      {
        id: 2,
        question: "What event involved colonists throwing tea into Boston Harbor?",
        options: [
          "The Tea Party Celebration",
          "The Boston Massacre",
          "The Boston Tea Party",
          "The Continental Congress"
        ],
        correct: 2
      },
      {
        id: 3,
        question: "What were the Intolerable Acts?",
        options: [
          "Acts of kindness by Britain",
          "Harsh laws Britain passed to punish colonists after the Boston Tea Party",
          "Colonial laws against British goods",
          "Acts performed in theaters"
        ],
        correct: 1
      },
      {
        id: 4,
        question: "Why did colonists protest the Stamp Act?",
        options: [
          "They didn't like stamps",
          "It required them to pay tax on paper goods without their consent",
          "It banned all paper products",
          "It was too expensive to mail letters"
        ],
        correct: 1
      },
      {
        id: 5,
        question: "What was the significance of 'No taxation without representation'?",
        options: [
          "It was a catchy slogan",
          "It expressed the colonial belief they shouldn't be taxed by a government they had no voice in",
          "It meant colonists refused to pay any taxes",
          "It was the title of a book"
        ],
        correct: 1
      }
    ],
    // COMPUTER SCIENCE
    "What is programming?": [
      {
        id: 1,
        question: "What is a programming language?",
        options: [
          "A language spoken by computers",
          "A set of instructions that tells a computer what to do",
          "The language computers speak to each other",
          "English translated for computers"
        ],
        correct: 1
      },
      {
        id: 2,
        question: "What is an algorithm?",
        options: [
          "A type of computer",
          "A step-by-step procedure to solve a problem",
          "A programming error",
          "A computer game"
        ],
        correct: 1
      },
      {
        id: 3,
        question: "Which of these is a programming language?",
        options: [
          "Microsoft Word",
          "Google Chrome",
          "Python",
          "Adobe Photoshop"
        ],
        correct: 2
      },
      {
        id: 4,
        question: "What does 'debugging' mean?",
        options: [
          "Removing insects from your computer",
          "Finding and fixing errors in code",
          "Deleting a program",
          "Installing antivirus software"
        ],
        correct: 1
      },
      {
        id: 5,
        question: "What is source code?",
        options: [
          "The original place code comes from",
          "The human-readable instructions written by programmers",
          "A secret code",
          "The power source for computers"
        ],
        correct: 1
      }
    ],
    // SCIENCE
    "What is life? Characteristics of living things": [
      {
        id: 1,
        question: "Which of these is NOT a characteristic of life?",
        options: [
          "Growth and development",
          "Response to stimuli",
          "Made of metal",
          "Reproduction"
        ],
        correct: 2
      },
      {
        id: 2,
        question: "What is metabolism?",
        options: [
          "The ability to move",
          "Chemical reactions that maintain life",
          "Breathing oxygen",
          "Eating food"
        ],
        correct: 1
      },
      {
        id: 3,
        question: "Which is an example of homeostasis?",
        options: [
          "Growing taller",
          "Sweating to cool down when hot",
          "Eating breakfast",
          "Running a race"
        ],
        correct: 1
      },
      {
        id: 4,
        question: "What does it mean when we say living things reproduce?",
        options: [
          "They make copies of themselves",
          "They eat other organisms",
          "They move from place to place",
          "They breathe air"
        ],
        correct: 0
      },
      {
        id: 5,
        question: "All living things are made of:",
        options: [
          "Plastic",
          "Cells",
          "Water only",
          "Minerals"
        ],
        correct: 1
      }
    ],
    "Introduction to cells": [
      {
        id: 1,
        question: "What is a cell?",
        options: [
          "A phone device",
          "The basic unit of life",
          "A prison room",
          "A type of battery"
        ],
        correct: 1
      },
      {
        id: 2,
        question: "What is the cell membrane?",
        options: [
          "The brain of the cell",
          "The outer boundary that controls what enters and exits the cell",
          "The cell's energy source",
          "The cell's waste disposal"
        ],
        correct: 1
      },
      {
        id: 3,
        question: "What does the nucleus contain?",
        options: [
          "Water",
          "Food",
          "DNA (genetic information)",
          "Oxygen"
        ],
        correct: 2
      },
      {
        id: 4,
        question: "What are mitochondria known as?",
        options: [
          "The control center",
          "The powerhouse of the cell",
          "The protein factory",
          "The waste disposal"
        ],
        correct: 1
      },
      {
        id: 5,
        question: "What is the difference between plant and animal cells?",
        options: [
          "There is no difference",
          "Plant cells have cell walls and chloroplasts; animal cells don't",
          "Animal cells are bigger",
          "Plant cells don't have nuclei"
        ],
        correct: 1
      }
    ]
  };

  // Get questions for current lesson
  const questions = questionBank[lesson.lesson.title] || [];

  const handleAnswer = (questionId, optionIndex) => {
    setAnswers({
      ...answers,
      [questionId]: optionIndex
    });
  };

  const handleSubmit = () => {
    let correctCount = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setShowResults(true);

    // If 100% correct, mark lesson as complete
    if (correctCount === questions.length) {
      setTimeout(() => {
        lesson.onComplete(true);
        onClose();
      }, 1500);
    }
  };

  const allAnswered = questions.every(q => answers[q.id] !== undefined);

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--bg)',
        zIndex: 300,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Top Header Bar */}
      <div style={{
        padding: '20px 32px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--card)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <div className="h3">{lesson.lesson.title}</div>
          <div className="body" style={{ marginTop: 4, fontSize: 13 }}>
            {lesson.unit.name}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '1px solid var(--border)',
            background: 'var(--bg2)',
            cursor: 'pointer',
            fontSize: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = 'var(--coral)';
            e.target.style.color = 'var(--coral)';
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = 'var(--border)';
            e.target.style.color = 'var(--text)';
          }}
        >
          ✕
        </button>
      </div>

      {/* Main Content - Split View */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        overflow: 'hidden'
      }}>
        {/* Left Side - Video */}
        <div style={{
          background: 'var(--bg2)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40
        }}>
          <div style={{
            width: '100%',
            maxWidth: 700,
            aspectRatio: '16/9',
            background: 'linear-gradient(135deg, var(--bg) 0%, var(--bg3) 100%)',
            borderRadius: 16,
            border: '2px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
            {/* Play Button */}
            <div style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: lesson.courseColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: `0 8px 24px ${lesson.courseColor}60`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = `0 12px 32px ${lesson.courseColor}80`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = `0 8px 24px ${lesson.courseColor}60`;
            }}
            >
              {/* Triangle Play Icon */}
              <div style={{
                width: 0,
                height: 0,
                borderLeft: `28px solid #fff`,
                borderTop: '18px solid transparent',
                borderBottom: '18px solid transparent',
                marginLeft: 8
              }} />
            </div>
            
            {/* Video Duration Badge */}
            <div style={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              background: '#c8f135',
              padding: '6px 12px',
              borderRadius: 6,
              fontSize: 13,
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: '#0f1419'
            }}>
              ⚡ 30 XP
            </div>
          </div>

          {/* Video Info */}
          <div style={{
            marginTop: 32,
            textAlign: 'center',
            maxWidth: 600
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📺</div>
            <div className="h4" style={{ marginBottom: 8 }}>Video Lesson</div>
            <div className="body" style={{ color: 'var(--muted)' }}>
              Watch the complete lesson to understand the fundamentals
            </div>
          </div>
        </div>

        {/* Right Side - Questions (Scrollable) */}
        <div style={{
          overflowY: 'auto',
          padding: 40
        }}>
          <div style={{ maxWidth: 600 }}>
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📝</div>
              <div className="h3" style={{ marginBottom: 8 }}>Practice Questions</div>
              <div className="body" style={{ color: 'var(--muted)' }}>
                {questions.length > 0 
                  ? "Answer all questions correctly to complete this lesson"
                  : "Questions for this lesson are coming soon. Click the close button to return."}
              </div>
            </div>

            {/* Questions */}
            {questions.length > 0 ? questions.map((q, idx) => (
              <div key={q.id} style={{
                marginBottom: 28,
                padding: 24,
                background: 'var(--card)',
                borderRadius: 12,
                border: '1px solid var(--border)'
              }}>
                <div style={{ 
                  fontSize: 15, 
                  fontWeight: 600, 
                  marginBottom: 18,
                  color: 'var(--text)'
                }}>
                  Question {idx + 1}: {q.question}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {q.options.map((option, optIdx) => {
                    const isSelected = answers[q.id] === optIdx;
                    const isCorrect = q.correct === optIdx;
                    const showCorrect = showResults && isCorrect;
                    const showWrong = showResults && isSelected && !isCorrect;

                    return (
                      <div
                        key={optIdx}
                        onClick={() => !showResults && handleAnswer(q.id, optIdx)}
                        style={{
                          padding: '14px 18px',
                          borderRadius: 10,
                          border: `2px solid ${
                            showCorrect ? lesson.courseColor :
                            showWrong ? 'var(--coral)' :
                            isSelected ? lesson.courseColor :
                            'var(--border2)'
                          }`,
                          background: showCorrect ? `${lesson.courseColor}15` :
                                     showWrong ? 'rgba(255,107,107,0.1)' :
                                     isSelected ? `${lesson.courseColor}08` : 'var(--bg2)',
                          cursor: showResults ? 'default' : 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 14
                        }}
                        onMouseEnter={(e) => {
                          if (!showResults && !isSelected) {
                            e.currentTarget.style.borderColor = 'var(--border)';
                          }
                        }}
                      >
                        <div style={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          border: `2px solid ${
                            showCorrect ? lesson.courseColor :
                            showWrong ? 'var(--coral)' :
                            isSelected ? lesson.courseColor : 'var(--border2)'
                          }`,
                          background: isSelected ? lesson.courseColor : 'transparent',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {isSelected && (
                            <div style={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              background: '#fff'
                            }} />
                          )}
                        </div>
                        <span style={{ fontSize: 14, flex: 1 }}>{option}</span>
                        {showCorrect && <span style={{ color: lesson.courseColor, fontSize: 18 }}>✓</span>}
                        {showWrong && <span style={{ color: 'var(--coral)', fontSize: 18 }}>✗</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )) : (
              <div style={{
                padding: 60,
                textAlign: 'center',
                background: 'var(--card)',
                borderRadius: 12,
                border: '1px solid var(--border)'
              }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>🚧</div>
                <div className="h4" style={{ marginBottom: 12 }}>Questions Coming Soon</div>
                <div className="body">
                  Practice questions for this lesson are being prepared.
                </div>
              </div>
            )}

            {/* Submit Button and Results - Only show if questions exist */}
            {questions.length > 0 && (
              <>
                {/* Submit Button */}
                {!showResults && (
                  <button
                    onClick={handleSubmit}
                    disabled={!allAnswered}
                    className="btn btn-lime"
                    style={{
                      width: '100%',
                      padding: '16px 24px',
                      fontSize: 16,
                      opacity: allAnswered ? 1 : 0.5,
                      cursor: allAnswered ? 'pointer' : 'not-allowed',
                      marginTop: 8
                    }}
                  >
                    Submit Answers
                  </button>
                )}

                {/* Results */}
                {showResults && (
                  <div style={{
                    padding: 32,
                    borderRadius: 12,
                    background: score === questions.length ? `${lesson.courseColor}15` : 'rgba(255,107,107,0.1)',
                    border: `2px solid ${score === questions.length ? lesson.courseColor : 'var(--coral)'}`,
                    textAlign: 'center',
                    marginTop: 8
                  }}>
                    <div style={{ fontSize: 64, marginBottom: 16 }}>
                      {score === questions.length ? '🎉' : '📚'}
                    </div>
                    <div className="h2" style={{ marginBottom: 12 }}>
                      Score: {score}/{questions.length}
                    </div>
                    {score === questions.length ? (
                      <div className="body" style={{ color: lesson.courseColor, fontSize: 16 }}>
                        Perfect! Lesson completed! ✓
                      </div>
                    ) : (
                      <div className="body" style={{ fontSize: 16 }}>
                        Review the material and try again to complete this lesson.
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── COURSE CARD COMPONENT ── */
function CourseCard({ course, index, onRemove, onOpenLesson }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedUnits, setExpandedUnits] = useState({});
  const [lessonProgress, setLessonProgress] = useState({});

  useEffect(() => {
    // Load lesson progress from localStorage
    const currentSubject = document.documentElement.getAttribute('data-subject') || 'math';
    const key = `studylink_lesson_progress_${currentSubject}_${course.id}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      setLessonProgress(JSON.parse(saved));
    }
  }, [course.id]);

  const saveLessonProgress = (unitId, lessonIndex, completed) => {
    const key = `${unitId}-${lessonIndex}`;
    const newProgress = {
      ...lessonProgress,
      [key]: completed
    };
    setLessonProgress(newProgress);
    
    // Get current subject from document
    const currentSubject = document.documentElement.getAttribute('data-subject') || 'math';
    
    // Store with subject prefix
    localStorage.setItem(`studylink_lesson_progress_${currentSubject}_${course.id}`, JSON.stringify(newProgress));
    
    // Dispatch event to update XP in TopBar
    window.dispatchEvent(new Event('xpUpdated'));
  };

  const isLessonCompleted = (unitId, lessonIndex) => {
    const key = `${unitId}-${lessonIndex}`;
    return lessonProgress[key] || false;
  };

  const getUnitCompletion = (unit) => {
    const totalLessons = unit.lessons.length;
    const completedLessons = unit.lessons.filter((_, idx) => 
      isLessonCompleted(unit.id, idx)
    ).length;
    return Math.round((completedLessons / totalLessons) * 100);
  };

  const toggleUnit = (unitId) => {
    setExpandedUnits(prev => ({
      ...prev,
      [unitId]: !prev[unitId]
    }));
  };

  const openLesson = (unit, lesson, lessonIndex) => {
    onOpenLesson({
      unit,
      lesson,
      lessonIndex,
      courseColor: course.color,
      courseId: course.id,
      onComplete: (completed) => {
        if (completed) {
          saveLessonProgress(unit.id, lessonIndex, true);
        }
      }
    });
  };

  const closeLesson = () => {
    // No longer needed - handled by parent
  };

  const handleLessonComplete = () => {
    // No longer needed - handled by parent
  };

  return (
    <div 
      className="card fade-up"
      style={{ 
        animationDelay: `${index * 0.05}s`,
        position: 'relative',
        borderLeft: `4px solid ${course.color}`,
        padding: '24px 28px'
      }}
    >
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* Icon Section */}
        <div style={{ 
          width: 64,
          height: 64,
          borderRadius: 14,
          background: `${course.color}15`,
          border: `2px solid ${course.color}40`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: 32
        }}>
          {course.icon}
        </div>

        {/* Content Section */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              {/* Clickable Course Title */}
              <h3 
                className="h3" 
                style={{ 
                  marginBottom: 6,
                  cursor: course.units && course.units.length > 0 ? 'pointer' : 'default',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'color 0.2s'
                }}
                onClick={() => course.units && course.units.length > 0 && setIsExpanded(!isExpanded)}
                onMouseEnter={(e) => {
                  if (course.units && course.units.length > 0) {
                    e.currentTarget.style.color = course.color;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text)';
                }}
              >
                {course.name}
                {course.units && course.units.length > 0 && (
                  <span style={{
                    fontSize: 14,
                    color: 'var(--muted)',
                    transition: 'transform 0.2s',
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}>
                    ▼
                  </span>
                )}
              </h3>
              <p className="body" style={{ marginBottom: 12 }}>{course.description}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className="badge" style={{
                  background: `${course.color}15`,
                  color: course.color,
                  border: `1px solid ${course.color}40`
                }}>
                  {course.difficulty}
                </span>
                <span className="badge" style={{
                  background: 'var(--faint)',
                  color: 'var(--muted)',
                  border: '1px solid var(--border2)'
                }}>
                  {course.duration}
                </span>
                {course.units && course.units.length > 0 && (
                  <span className="badge" style={{
                    background: 'var(--faint)',
                    color: 'var(--muted)',
                    border: '1px solid var(--border2)'
                  }}>
                    {course.units.length} units
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => onRemove(course.id)}
              style={{
                background: 'none',
                border: '1px solid var(--border2)',
                borderRadius: 8,
                width: 32,
                height: 32,
                cursor: 'pointer',
                color: 'var(--muted)',
                fontSize: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = 'var(--coral)';
                e.target.style.color = 'var(--coral)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = 'var(--border2)';
                e.target.style.color = 'var(--muted)';
              }}
            >
              ✕
            </button>
          </div>


          {/* Collapsible Units Section */}
          {isExpanded && course.units && (
            <div style={{ 
              marginTop: 20, 
              paddingTop: 20,
              borderTop: '1px solid var(--border)'
            }}>
              {course.units.map((unit, unitIndex) => (
                <div 
                  key={unit.id}
                  style={{
                    marginBottom: 12,
                    border: '1px solid var(--border2)',
                    borderRadius: 10,
                    overflow: 'hidden',
                    background: 'var(--faint)'
                  }}
                >
                  {/* Unit Header */}
                  <button
                    onClick={() => toggleUnit(unit.id)}
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      background: expandedUnits[unit.id] ? 'var(--bg2)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: course.color,
                        fontFamily: 'var(--font-mono)',
                        background: `${course.color}15`,
                        padding: '4px 10px',
                        borderRadius: 6
                      }}>
                        Unit {unitIndex + 1}
                      </span>
                      <span style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: 'var(--text)'
                      }}>
                        {unit.name}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{
                        fontSize: 12,
                        color: 'var(--muted)'
                      }}>
                        {unit.lessons.filter((_, idx) => isLessonCompleted(unit.id, idx)).length * 30} / {unit.lessons.length * 30} XP
                      </span>
                      <span style={{
                        color: 'var(--muted)',
                        fontSize: 12,
                        transition: 'transform 0.2s',
                        transform: expandedUnits[unit.id] ? 'rotate(180deg)' : 'rotate(0deg)'
                      }}>
                        ▼
                      </span>
                    </div>
                  </button>

                  {/* Unit Lessons */}
                  {expandedUnits[unit.id] && (
                    <div style={{
                      padding: '8px 18px 14px',
                      background: 'var(--bg)'
                    }}>
                      {unit.lessons.map((lesson, lessonIndex) => {
                        const isCompleted = isLessonCompleted(unit.id, lessonIndex);
                        return (
                          <div
                            key={lessonIndex}
                            onClick={() => openLesson(unit, lesson, lessonIndex)}
                            style={{
                              padding: '10px 12px',
                              borderRadius: 6,
                              marginBottom: 6,
                              background: isCompleted ? '#c8f13520' : 'var(--card)',
                              border: `1px solid ${isCompleted ? '#c8f13560' : 'var(--border2)'}`,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12,
                              transition: 'all 0.2s',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                              if (!isCompleted) {
                                e.currentTarget.style.borderColor = course.color;
                                e.currentTarget.style.background = `${course.color}08`;
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = isCompleted ? '#c8f13560' : 'var(--border2)';
                              e.currentTarget.style.background = isCompleted ? '#c8f13520' : 'var(--card)';
                            }}
                          >
                            <span style={{
                              fontSize: 11,
                              color: 'var(--muted)',
                              fontFamily: 'var(--font-mono)',
                              minWidth: 24
                            }}>
                              {lessonIndex + 1}.
                            </span>
                            <span style={{
                              fontSize: 13,
                              color: 'var(--text)',
                              flex: 1
                            }}>
                              {lesson.title}
                            </span>
                            {isCompleted && (
                              <span style={{ fontSize: 14, color: '#c8f135' }}>✓</span>
                            )}
                            <span style={{
                              fontSize: 11,
                              color: isCompleted ? '#c8f135' : 'var(--muted)',
                              fontFamily: 'var(--font-mono)',
                              fontWeight: isCompleted ? 600 : 400
                            }}>
                              30 XP
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── RESOURCES PAGE ── */
function ResourcesPage({ subject }) {
  const [activeTab, setActiveTab] = useState('practice-exams');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('title'); // title, difficulty, questions

  const subjectInfo = {
    math: { name: "Math", color: "#3b82f6" },
    reading: { name: "Reading", color: "#ef4444" },
    history: { name: "History", color: "#eab308" },
    "computer-science": { name: "Computer Science", color: "#a78bfa" },
    science: { name: "Science", color: "#22c55e" }
  };

  const currentSubject = subjectInfo[subject] || { name: "Subject", color: "#3b82f6" };

  // Practice Exams Data - EXPANDED
  const practiceExams = {
    math: [
      { id: 1, title: "Algebra I - Final Exam", questions: 50, duration: "90 min", difficulty: "Medium", topics: ["Linear Equations", "Quadratics", "Functions"] },
      { id: 2, title: "Algebra I - Midterm", questions: 35, duration: "60 min", difficulty: "Medium", topics: ["Variables", "Expressions", "Inequalities"] },
      { id: 3, title: "Geometry - Chapter 1-5", questions: 40, duration: "75 min", difficulty: "Medium", topics: ["Angles", "Triangles", "Proofs"] },
      { id: 4, title: "Calculus - Derivatives Quiz", questions: 20, duration: "45 min", difficulty: "Hard", topics: ["Limits", "Derivatives", "Chain Rule"] },
      { id: 5, title: "Pre-Algebra Practice", questions: 30, duration: "60 min", difficulty: "Easy", topics: ["Fractions", "Decimals", "Percentages"] },
      { id: 6, title: "Algebra II - Polynomial Functions", questions: 45, duration: "80 min", difficulty: "Hard", topics: ["Polynomials", "Rational Functions", "Exponentials"] },
      { id: 7, title: "Trigonometry Fundamentals", questions: 35, duration: "65 min", difficulty: "Medium", topics: ["Sin/Cos/Tan", "Unit Circle", "Identities"] },
      { id: 8, title: "Statistics & Probability", questions: 40, duration: "70 min", difficulty: "Medium", topics: ["Mean/Median", "Probability", "Distributions"] },
      { id: 9, title: "Calculus II - Integrals", questions: 30, duration: "90 min", difficulty: "Hard", topics: ["Integration", "U-Substitution", "Applications"] },
      { id: 10, title: "Mental Math Speed Test", questions: 25, duration: "20 min", difficulty: "Easy", topics: ["Arithmetic", "Estimation", "Patterns"] },
      { id: 11, title: "SAT Math Practice Test", questions: 58, duration: "80 min", difficulty: "Hard", topics: ["Algebra", "Geometry", "Data Analysis"] },
      { id: 12, title: "ACT Math Section", questions: 60, duration: "60 min", difficulty: "Hard", topics: ["Pre-Algebra", "Algebra", "Geometry"] },
    ],
    reading: [
      { id: 1, title: "Reading Comprehension - Advanced", questions: 25, duration: "45 min", difficulty: "Hard", topics: ["Analysis", "Inference", "Theme"] },
      { id: 2, title: "Vocabulary Builder", questions: 40, duration: "30 min", difficulty: "Medium", topics: ["Context Clues", "Word Roots", "Synonyms"] },
      { id: 3, title: "Literature Analysis Practice", questions: 20, duration: "60 min", difficulty: "Medium", topics: ["Characters", "Plot", "Symbolism"] },
      { id: 4, title: "Grammar & Mechanics", questions: 35, duration: "40 min", difficulty: "Easy", topics: ["Punctuation", "Sentence Structure", "Agreement"] },
      { id: 5, title: "Critical Reading Skills", questions: 30, duration: "50 min", difficulty: "Hard", topics: ["Main Ideas", "Author's Purpose", "Tone"] },
      { id: 6, title: "Poetry Analysis", questions: 20, duration: "45 min", difficulty: "Hard", topics: ["Figurative Language", "Structure", "Meaning"] },
      { id: 7, title: "Non-Fiction Comprehension", questions: 25, duration: "35 min", difficulty: "Medium", topics: ["Facts vs Opinions", "Evidence", "Arguments"] },
      { id: 8, title: "Vocabulary in Context", questions: 50, duration: "30 min", difficulty: "Easy", topics: ["Definitions", "Usage", "Synonyms"] },
    ],
    history: [
      { id: 1, title: "U.S. History - Colonial Era", questions: 30, duration: "50 min", difficulty: "Medium", topics: ["Colonies", "Revolution", "Founding"] },
      { id: 2, title: "World History - Ancient Civilizations", questions: 35, duration: "60 min", difficulty: "Medium", topics: ["Egypt", "Greece", "Rome"] },
      { id: 3, title: "20th Century History", questions: 40, duration: "70 min", difficulty: "Hard", topics: ["World Wars", "Cold War", "Modern Era"] },
      { id: 4, title: "American Revolution Deep Dive", questions: 45, duration: "75 min", difficulty: "Hard", topics: ["Causes", "Battles", "Aftermath"] },
      { id: 5, title: "Civil War Comprehensive", questions: 50, duration: "85 min", difficulty: "Hard", topics: ["Slavery", "Battles", "Reconstruction"] },
      { id: 6, title: "World War I & II", questions: 55, duration: "90 min", difficulty: "Hard", topics: ["Causes", "Major Events", "Outcomes"] },
      { id: 7, title: "Medieval Europe", questions: 30, duration: "55 min", difficulty: "Medium", topics: ["Feudalism", "Crusades", "Culture"] },
      { id: 8, title: "Renaissance & Reformation", questions: 35, duration: "60 min", difficulty: "Medium", topics: ["Art", "Science", "Religion"] },
      { id: 9, title: "Geography & Timeline Quiz", questions: 25, duration: "30 min", difficulty: "Easy", topics: ["Maps", "Dates", "Places"] },
    ],
    "computer-science": [
      { id: 1, title: "Python Fundamentals", questions: 30, duration: "45 min", difficulty: "Easy", topics: ["Syntax", "Variables", "Loops"] },
      { id: 2, title: "Data Structures Quiz", questions: 25, duration: "60 min", difficulty: "Hard", topics: ["Arrays", "Lists", "Trees"] },
      { id: 3, title: "Algorithm Practice", questions: 20, duration: "90 min", difficulty: "Hard", topics: ["Sorting", "Searching", "Recursion"] },
      { id: 4, title: "Object-Oriented Programming", questions: 35, duration: "70 min", difficulty: "Medium", topics: ["Classes", "Inheritance", "Polymorphism"] },
      { id: 5, title: "JavaScript Basics", questions: 30, duration: "50 min", difficulty: "Easy", topics: ["Variables", "Functions", "DOM"] },
      { id: 6, title: "Database Design", questions: 25, duration: "55 min", difficulty: "Medium", topics: ["SQL", "Normalization", "Queries"] },
      { id: 7, title: "Web Development HTML/CSS", questions: 20, duration: "40 min", difficulty: "Easy", topics: ["Tags", "Styling", "Layout"] },
      { id: 8, title: "Advanced Algorithms", questions: 15, duration: "120 min", difficulty: "Hard", topics: ["Dynamic Programming", "Graphs", "Optimization"] },
      { id: 9, title: "Computer Architecture", questions: 30, duration: "60 min", difficulty: "Medium", topics: ["CPU", "Memory", "Assembly"] },
    ],
    science: [
      { id: 1, title: "Biology - Cell Structure", questions: 30, duration: "45 min", difficulty: "Medium", topics: ["Organelles", "Membranes", "Processes"] },
      { id: 2, title: "Chemistry - Periodic Table", questions: 35, duration: "50 min", difficulty: "Medium", topics: ["Elements", "Compounds", "Reactions"] },
      { id: 3, title: "Physics - Motion & Forces", questions: 25, duration: "60 min", difficulty: "Hard", topics: ["Kinematics", "Newton's Laws", "Energy"] },
      { id: 4, title: "Biology - Genetics", questions: 40, duration: "70 min", difficulty: "Hard", topics: ["DNA", "Inheritance", "Mutations"] },
      { id: 5, title: "Chemistry - Stoichiometry", questions: 30, duration: "65 min", difficulty: "Hard", topics: ["Moles", "Balancing", "Calculations"] },
      { id: 6, title: "Physics - Electricity & Magnetism", questions: 35, duration: "75 min", difficulty: "Hard", topics: ["Circuits", "Fields", "Induction"] },
      { id: 7, title: "Earth Science Basics", questions: 25, duration: "40 min", difficulty: "Easy", topics: ["Rocks", "Weather", "Geology"] },
      { id: 8, title: "Ecology & Environment", questions: 30, duration: "50 min", difficulty: "Medium", topics: ["Ecosystems", "Food Webs", "Conservation"] },
      { id: 9, title: "Scientific Method & Lab Safety", questions: 20, duration: "30 min", difficulty: "Easy", topics: ["Hypothesis", "Experiments", "Safety"] },
      { id: 10, title: "Human Anatomy & Physiology", questions: 45, duration: "80 min", difficulty: "Medium", topics: ["Organs", "Systems", "Functions"] },
    ]
  };

  // Quick Questions Data - EXPANDED
  const quickQuestions = {
    math: [
      { id: 1, title: "5-Minute Algebra Warm-up", questions: 10, difficulty: "Easy" },
      { id: 2, title: "Geometry Quick Quiz", questions: 8, difficulty: "Medium" },
      { id: 3, title: "Calculus Lightning Round", questions: 12, difficulty: "Hard" },
      { id: 4, title: "Mental Math Challenge", questions: 15, difficulty: "Easy" },
      { id: 5, title: "Word Problems Practice", questions: 10, difficulty: "Medium" },
      { id: 6, title: "Fraction Speed Drill", questions: 12, difficulty: "Easy" },
      { id: 7, title: "Equation Solving Sprint", questions: 10, difficulty: "Medium" },
      { id: 8, title: "Trigonometry Quick Check", questions: 8, difficulty: "Hard" },
      { id: 9, title: "Statistics Basics", questions: 10, difficulty: "Easy" },
      { id: 10, title: "Probability Quick Quiz", questions: 12, difficulty: "Medium" },
    ],
    reading: [
      { id: 1, title: "Vocabulary Sprint", questions: 15, difficulty: "Easy" },
      { id: 2, title: "Quick Comprehension", questions: 8, difficulty: "Medium" },
      { id: 3, title: "Grammar Check", questions: 10, difficulty: "Easy" },
      { id: 4, title: "Main Idea Finder", questions: 8, difficulty: "Medium" },
      { id: 5, title: "Inference Practice", questions: 10, difficulty: "Hard" },
      { id: 6, title: "Context Clues", questions: 12, difficulty: "Easy" },
      { id: 7, title: "Author's Purpose Quiz", questions: 8, difficulty: "Medium" },
    ],
    history: [
      { id: 1, title: "Date Matching Quiz", questions: 12, difficulty: "Easy" },
      { id: 2, title: "Historical Figures", questions: 10, difficulty: "Medium" },
      { id: 3, title: "Events Timeline", questions: 8, difficulty: "Medium" },
      { id: 4, title: "Geography Quick Check", questions: 10, difficulty: "Easy" },
      { id: 5, title: "Cause & Effect Quiz", questions: 8, difficulty: "Hard" },
      { id: 6, title: "Document Analysis", questions: 6, difficulty: "Hard" },
    ],
    "computer-science": [
      { id: 1, title: "Syntax Check", questions: 10, difficulty: "Easy" },
      { id: 2, title: "Code Output Prediction", questions: 8, difficulty: "Medium" },
      { id: 3, title: "Debug Challenge", questions: 5, difficulty: "Hard" },
      { id: 4, title: "Variable Types Quiz", questions: 10, difficulty: "Easy" },
      { id: 5, title: "Loop Logic", questions: 8, difficulty: "Medium" },
      { id: 6, title: "Algorithm Efficiency", questions: 6, difficulty: "Hard" },
    ],
    science: [
      { id: 1, title: "Scientific Method Quiz", questions: 8, difficulty: "Easy" },
      { id: 2, title: "Formula Recall", questions: 12, difficulty: "Medium" },
      { id: 3, title: "Concept Check", questions: 10, difficulty: "Easy" },
      { id: 4, title: "Lab Safety Quick Quiz", questions: 8, difficulty: "Easy" },
      { id: 5, title: "Chemical Reactions", questions: 10, difficulty: "Medium" },
      { id: 6, title: "Physics Problem Solving", questions: 8, difficulty: "Hard" },
    ]
  };

  // Study Guides Data - EXPANDED
  const studyGuides = {
    math: [
      { id: 1, title: "Algebra I Complete Study Guide", pages: 45, topics: ["All Units"], format: "PDF" },
      { id: 2, title: "Geometry Formulas Cheat Sheet", pages: 8, topics: ["Formulas", "Theorems"], format: "PDF" },
      { id: 3, title: "Calculus Quick Reference", pages: 12, topics: ["Derivatives", "Integrals"], format: "PDF" },
      { id: 4, title: "Trigonometry Unit Circle Guide", pages: 6, topics: ["Sin/Cos/Tan", "Angles"], format: "PDF" },
      { id: 5, title: "Statistics & Probability Handbook", pages: 35, topics: ["Distributions", "Analysis"], format: "PDF" },
      { id: 6, title: "SAT Math Formula Sheet", pages: 10, topics: ["Key Formulas"], format: "PDF" },
    ],
    reading: [
      { id: 1, title: "Literary Devices Guide", pages: 20, topics: ["Metaphor", "Symbolism"], format: "PDF" },
      { id: 2, title: "Essay Writing Framework", pages: 15, topics: ["Structure", "Analysis"], format: "PDF" },
      { id: 3, title: "Grammar Rules Reference", pages: 25, topics: ["Punctuation", "Usage"], format: "PDF" },
      { id: 4, title: "Vocabulary Builder Workbook", pages: 40, topics: ["Word Lists", "Exercises"], format: "PDF" },
    ],
    history: [
      { id: 1, title: "Timeline of Major Events", pages: 10, topics: ["Chronology"], format: "PDF" },
      { id: 2, title: "Key Figures Reference", pages: 25, topics: ["Biographies"], format: "PDF" },
      { id: 3, title: "U.S. Constitution Study Guide", pages: 18, topics: ["Articles", "Amendments"], format: "PDF" },
      { id: 4, title: "World War II Comprehensive Guide", pages: 50, topics: ["Causes", "Events", "Outcomes"], format: "PDF" },
    ],
    "computer-science": [
      { id: 1, title: "Python Syntax Guide", pages: 18, topics: ["Syntax", "Examples"], format: "PDF" },
      { id: 2, title: "Algorithm Complexity Cheat Sheet", pages: 6, topics: ["Big O"], format: "PDF" },
      { id: 3, title: "Data Structures Handbook", pages: 30, topics: ["Arrays", "Trees", "Graphs"], format: "PDF" },
      { id: 4, title: "JavaScript ES6 Features", pages: 15, topics: ["New Syntax", "Arrow Functions"], format: "PDF" },
      { id: 5, title: "SQL Query Reference", pages: 12, topics: ["SELECT", "JOIN", "Optimization"], format: "PDF" },
    ],
    science: [
      { id: 1, title: "Biology Terminology", pages: 30, topics: ["Glossary"], format: "PDF" },
      { id: 2, title: "Chemistry Equations", pages: 12, topics: ["Reactions"], format: "PDF" },
      { id: 3, title: "Physics Constants & Formulas", pages: 8, topics: ["Key Values"], format: "PDF" },
      { id: 4, title: "Human Body Systems Guide", pages: 35, topics: ["Anatomy", "Physiology"], format: "PDF" },
      { id: 5, title: "Periodic Table Reference", pages: 6, topics: ["Elements", "Properties"], format: "PDF" },
    ]
  };

  // Filter and Sort Logic
  const filterAndSortExams = (examList) => {
    let filtered = examList;
    
    // Apply difficulty filter
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(exam => exam.difficulty === difficultyFilter);
    }
    
    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch(sortBy) {
        case 'difficulty':
          const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        case 'questions':
          return b.questions - a.questions;
        case 'title':
        default:
          return a.title.localeCompare(b.title);
      }
    });
    
    return filtered;
  };

  const filterQuestions = (questionList) => {
    if (difficultyFilter === 'all') return questionList;
    return questionList.filter(q => q.difficulty === difficultyFilter);
  };

  const exams = filterAndSortExams(practiceExams[subject] || []);
  const questions = filterQuestions(quickQuestions[subject] || []);
  const guides = studyGuides[subject] || [];

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Easy': return '#22c55e';
      case 'Medium': return '#eab308';
      case 'Hard': return '#ef4444';
      default: return 'var(--muted)';
    }
  };

  return (
    <div className="page">
      {/* Header */}
      <div className="fade-up">
        <div className="h2" style={{ marginBottom: 8 }}>{currentSubject.name} Resources</div>
        <div className="body" style={{ marginBottom: 32 }}>
          Practice exams, quick quizzes, and study materials to reinforce your learning
        </div>

        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: 8, 
          borderBottom: '2px solid var(--border)',
          marginBottom: 32 
        }}>
          <button
            onClick={() => setActiveTab('practice-exams')}
            style={{
              padding: '12px 24px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'practice-exams' ? `3px solid ${currentSubject.color}` : '3px solid transparent',
              color: activeTab === 'practice-exams' ? currentSubject.color : 'var(--muted)',
              fontWeight: activeTab === 'practice-exams' ? 700 : 500,
              fontSize: 15,
              cursor: 'pointer',
              marginBottom: -2,
              transition: 'all 0.2s'
            }}
          >
            📝 Practice Exams
          </button>
          <button
            onClick={() => setActiveTab('quick-questions')}
            style={{
              padding: '12px 24px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'quick-questions' ? `3px solid ${currentSubject.color}` : '3px solid transparent',
              color: activeTab === 'quick-questions' ? currentSubject.color : 'var(--muted)',
              fontWeight: activeTab === 'quick-questions' ? 700 : 500,
              fontSize: 15,
              cursor: 'pointer',
              marginBottom: -2,
              transition: 'all 0.2s'
            }}
          >
            ⚡ Quick Questions
          </button>
          <button
            onClick={() => setActiveTab('study-guides')}
            style={{
              padding: '12px 24px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'study-guides' ? `3px solid ${currentSubject.color}` : '3px solid transparent',
              color: activeTab === 'study-guides' ? currentSubject.color : 'var(--muted)',
              fontWeight: activeTab === 'study-guides' ? 700 : 500,
              fontSize: 15,
              cursor: 'pointer',
              marginBottom: -2,
              transition: 'all 0.2s'
            }}
          >
            📚 Study Guides
          </button>
        </div>

        {/* Filter & Sort Controls */}
        {(activeTab === 'practice-exams' || activeTab === 'quick-questions') && (
          <div style={{ 
            display: 'flex', 
            gap: 16, 
            alignItems: 'center',
            marginTop: 24,
            marginBottom: 20,
            flexWrap: 'wrap'
          }}>
            {/* Difficulty Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)' }}>
                Difficulty:
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                {['all', 'Easy', 'Medium', 'Hard'].map(level => (
                  <button
                    key={level}
                    onClick={() => setDifficultyFilter(level)}
                    style={{
                      padding: '6px 14px',
                      border: difficultyFilter === level ? `2px solid ${currentSubject.color}` : '1px solid var(--border)',
                      borderRadius: 8,
                      background: difficultyFilter === level ? `${currentSubject.color}15` : 'var(--bg)',
                      color: difficultyFilter === level ? currentSubject.color : 'var(--text)',
                      fontSize: 13,
                      fontWeight: difficultyFilter === level ? 600 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {level === 'all' ? 'All' : level}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort By (Practice Exams only) */}
            {activeTab === 'practice-exams' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)' }}>
                  Sort by:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    background: 'var(--bg)',
                    fontSize: 13,
                    color: 'var(--text)',
                    cursor: 'pointer'
                  }}
                >
                  <option value="title">Title (A-Z)</option>
                  <option value="difficulty">Difficulty</option>
                  <option value="questions">Questions (Most)</option>
                </select>
              </div>
            )}

            {/* Results Count */}
            <div style={{ 
              marginLeft: 'auto',
              fontSize: 13,
              color: 'var(--muted)',
              fontWeight: 500
            }}>
              {activeTab === 'practice-exams' ? exams.length : questions.length} results
            </div>
          </div>
        )}
      </div>

      {/* Practice Exams Tab */}
      {activeTab === 'practice-exams' && (
        <div className="fade-up fade-up-1">
          {exams.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
              <div className="h4" style={{ marginBottom: 8 }}>No exams found</div>
              <div className="body">Try adjusting your filters</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 16 }}>
            {exams.map((exam) => (
              <div 
                key={exam.id}
                className="card"
                style={{
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div className="h4" style={{ marginBottom: 8 }}>{exam.title}</div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
                      <span>📄 {exam.questions} questions</span>
                      <span>⏱️ {exam.duration}</span>
                      <span style={{ color: getDifficultyColor(exam.difficulty), fontWeight: 600 }}>
                        {exam.difficulty}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {exam.topics.map((topic, i) => (
                        <span
                          key={i}
                          style={{
                            padding: '4px 10px',
                            background: 'var(--faint)',
                            borderRadius: 6,
                            fontSize: 12,
                            color: 'var(--muted)'
                          }}
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    className="btn btn-lime btn-sm"
                    style={{ marginLeft: 16 }}
                  >
                    Start Exam
                  </button>
                </div>
              </div>
            ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Questions Tab */}
      {activeTab === 'quick-questions' && (
        <div className="fade-up fade-up-1">
          {questions.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
              <div className="h4" style={{ marginBottom: 8 }}>No quizzes found</div>
              <div className="body">Try adjusting your difficulty filter</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {questions.map((quiz) => (
              <div 
                key={quiz.id}
                className="card"
                style={{
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ marginBottom: 12 }}>
                  <div className="h4" style={{ marginBottom: 8 }}>{quiz.title}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)' }}>
                    <span>⚡ {quiz.questions} questions</span>
                    <span style={{ color: getDifficultyColor(quiz.difficulty), fontWeight: 600 }}>
                      {quiz.difficulty}
                    </span>
                  </div>
                </div>
                <button
                  className="btn btn-lime btn-sm"
                  style={{ width: '100%' }}
                >
                  Start Quiz
                </button>
              </div>
            ))}
            </div>
          )}
        </div>
      )}

      {/* Study Guides Tab */}
      {activeTab === 'study-guides' && (
        <div className="fade-up fade-up-1">
          <div style={{ display: 'grid', gap: 16 }}>
            {guides.map((guide) => (
              <div 
                key={guide.id}
                className="card"
                style={{
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="h4" style={{ marginBottom: 8 }}>{guide.title}</div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--muted)' }}>
                      <span>📄 {guide.pages} pages</span>
                      <span>📋 {guide.format}</span>
                    </div>
                  </div>
                  <button
                    className="btn btn-outline btn-sm"
                  >
                    📥 Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── COURSES PAGE (formerly ResourcesPage) ── */
function CoursesPage({ onOpenLesson }) {
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [currentSubject, setCurrentSubject] = useState("math");

  useEffect(() => {
    // Get current subject from document
    const subject = document.documentElement.getAttribute('data-subject') || 'math';
    setCurrentSubject(subject);
    
    const saved = localStorage.getItem(`studylink_selected_courses_${subject}`);
    if (saved) {
      const savedCourseIds = JSON.parse(saved).map(c => c.id);
      // Always use current course definitions, not cached data
      const currentCourses = (coursesBySubject[subject] || []).filter(c => savedCourseIds.includes(c.id));
      setSelectedCourses(currentCourses);
    } else {
      setSelectedCourses([]);
    }
  }, []);

  // Update courses when subject changes
  useEffect(() => {
    const handleSubjectChange = () => {
      const subject = document.documentElement.getAttribute('data-subject') || 'math';
      setCurrentSubject(subject);
      const saved = localStorage.getItem(`studylink_selected_courses_${subject}`);
      if (saved) {
        const savedCourseIds = JSON.parse(saved).map(c => c.id);
        // Always use current course definitions, not cached data
        const currentCourses = (coursesBySubject[subject] || []).filter(c => savedCourseIds.includes(c.id));
        setSelectedCourses(currentCourses);
      } else {
        setSelectedCourses([]);
      }
    };

    // Listen for subject changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-subject') {
          handleSubjectChange();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  const updateCourses = (courses) => {
    setSelectedCourses(courses);
    localStorage.setItem(`studylink_selected_courses_${currentSubject}`, JSON.stringify(courses));
  };

  // Subject-specific courses
  const coursesBySubject = {
    math: [
      {
        id: "algebra",
        name: "Algebra I",
        description: "Foundation of algebraic thinking",
        icon: "🔢",
        color: "#3b82f6",
        difficulty: "Beginner",
        duration: "32 weeks",
        units: [
          {
            id: "unit-1",
            name: "Algebra Foundations",
            lessons: [
              { title: "Overview and history of algebra", duration: "12 min" },
              { title: "Introduction to variables", duration: "15 min" },
              { title: "Substitution and evaluating expressions", duration: "18 min" },
              { title: "Combining like terms", duration: "20 min" },
              { title: "Introduction to equivalent expressions", duration: "16 min" },
              { title: "Division by zero", duration: "10 min" }
            ]
          },
          {
            id: "unit-2",
            name: "Solving Equations & Inequalities",
            lessons: [
              { title: "Linear equations with variables on both sides", duration: "22 min" },
              { title: "Linear equations with parentheses", duration: "18 min" },
              { title: "Analyzing the number of solutions to linear equations", duration: "20 min" },
              { title: "Linear equations with unknown coefficients", duration: "24 min" },
              { title: "Multi-step inequalities", duration: "25 min" },
              { title: "Compound inequalities", duration: "28 min" }
            ]
          },
          {
            id: "unit-3",
            name: "Working with Units",
            lessons: [
              { title: "Rate conversion", duration: "16 min" },
              { title: "Appropriate units", duration: "14 min" },
              { title: "Word problems with multiple units", duration: "20 min" }
            ]
          },
          {
            id: "unit-4",
            name: "Linear Equations & Graphs",
            lessons: [
              { title: "Two-variable linear equations intro", duration: "18 min" },
              { title: "Slope", duration: "22 min" },
              { title: "Horizontal & vertical lines", duration: "16 min" },
              { title: "x-intercepts and y-intercepts", duration: "20 min" },
              { title: "Applying intercepts and slope", duration: "24 min" },
              { title: "Modeling with linear equations and inequalities", duration: "26 min" }
            ]
          },
          {
            id: "unit-5",
            name: "Forms of Linear Equations",
            lessons: [
              { title: "Intro to slope-intercept form", duration: "18 min" },
              { title: "Graphing slope-intercept equations", duration: "22 min" },
              { title: "Writing slope-intercept equations", duration: "20 min" },
              { title: "Point-slope form", duration: "24 min" },
              { title: "Standard form", duration: "20 min" },
              { title: "Summary: Forms of two-variable linear equations", duration: "16 min" }
            ]
          },
          {
            id: "unit-6",
            name: "Systems of Equations",
            lessons: [
              { title: "Introduction to systems of equations", duration: "18 min" },
              { title: "Solving systems of equations with substitution", duration: "24 min" },
              { title: "Solving systems of equations with elimination", duration: "26 min" },
              { title: "Equivalent systems of equations", duration: "20 min" },
              { title: "Number of solutions to systems of equations", duration: "22 min" },
              { title: "Systems of equations word problems", duration: "28 min" }
            ]
          },
          {
            id: "unit-7",
            name: "Inequalities (Systems & Graphs)",
            lessons: [
              { title: "Checking solutions of two-variable inequalities", duration: "16 min" },
              { title: "Graphing two-variable inequalities", duration: "22 min" },
              { title: "Modeling with linear inequalities", duration: "20 min" }
            ]
          },
          {
            id: "unit-8",
            name: "Functions",
            lessons: [
              { title: "Evaluating functions", duration: "18 min" },
              { title: "Inputs and outputs of a function", duration: "16 min" },
              { title: "Functions and equations", duration: "20 min" },
              { title: "Interpreting function notation", duration: "18 min" },
              { title: "Introduction to the domain and range of a function", duration: "22 min" },
              { title: "Determining the domain of a function", duration: "20 min" },
              { title: "Recognizing functions", duration: "16 min" },
              { title: "Maximum and minimum points", duration: "18 min" },
              { title: "Intervals where a function is positive, negative, increasing, or decreasing", duration: "24 min" },
              { title: "Interpreting features of graphs", duration: "22 min" },
              { title: "Average rate of change", duration: "20 min" },
              { title: "Average rate of change word problems", duration: "26 min" },
              { title: "Intro to inverse functions", duration: "24 min" }
            ]
          },
          {
            id: "unit-9",
            name: "Sequences",
            lessons: [
              { title: "Introduction to arithmetic sequences", duration: "18 min" },
              { title: "Constructing arithmetic sequences", duration: "20 min" },
              { title: "Introduction to geometric sequences", duration: "18 min" },
              { title: "Constructing geometric sequences", duration: "22 min" },
              { title: "Modeling with sequences", duration: "24 min" },
              { title: "General sequences", duration: "20 min" }
            ]
          },
          {
            id: "unit-10",
            name: "Absolute Value & Piecewise Functions",
            lessons: [
              { title: "Graphs of absolute value functions", duration: "20 min" },
              { title: "Piecewise functions", duration: "24 min" }
            ]
          },
          {
            id: "unit-11",
            name: "Exponents & Radicals",
            lessons: [
              { title: "Exponent properties review", duration: "18 min" },
              { title: "Radicals", duration: "20 min" },
              { title: "Simplifying square roots", duration: "22 min" }
            ]
          },
          {
            id: "unit-12",
            name: "Exponential Growth & Decay",
            lessons: [
              { title: "Exponential vs. linear growth", duration: "20 min" },
              { title: "Exponential expressions", duration: "18 min" },
              { title: "Graphs of exponential growth", duration: "22 min" },
              { title: "Exponential vs. linear growth over time", duration: "20 min" },
              { title: "Exponential growth & decay", duration: "24 min" },
              { title: "Exponential functions from tables & graphs", duration: "22 min" },
              { title: "Exponential vs. linear models", duration: "20 min" }
            ]
          }
        ]
      },
      {
        id: "algebra2",
        name: "Algebra II",
        description: "Advanced algebraic concepts",
        icon: "📈",
        color: "#6366f1",
        difficulty: "Intermediate",
        duration: "32 weeks",
        units: []
      },
      {
        id: "geometry",
        name: "Geometry",
        description: "Shapes, proofs, and spatial reasoning",
        icon: "△",
        color: "#8b5cf6",
        difficulty: "Intermediate",
        duration: "32 weeks",
        units: []
      },
      {
        id: "precalc",
        name: "Pre-Calculus",
        description: "Bridge to calculus",
        icon: "📊",
        color: "#a78bfa",
        difficulty: "Advanced",
        duration: "32 weeks",
        units: []
      },
      {
        id: "calc1",
        name: "Calculus I",
        description: "Limits and derivatives",
        icon: "∫",
        color: "#c084fc",
        difficulty: "Advanced",
        duration: "32 weeks",
        units: []
      },
      {
        id: "calc2",
        name: "Calculus II",
        description: "Integration and series",
        icon: "∑",
        color: "#e879f9",
        difficulty: "Advanced",
        duration: "32 weeks",
        units: []
      }
    ],
    reading: [
      {
        id: "foundations",
        name: "Reading Foundations",
        description: "Essential reading skills",
        icon: "📖",
        color: "#ef4444",
        difficulty: "Beginner",
        duration: "24 weeks",
        units: [
          {
            id: "unit-1",
            name: "Phonics and Decoding",
            lessons: [
              { title: "Introduction to phonics", duration: "15 min" },
              { title: "Consonant sounds", duration: "18 min" },
              { title: "Vowel sounds and patterns", duration: "20 min" },
              { title: "Blending sounds to read words", duration: "22 min" }
            ]
          },
          {
            id: "unit-2",
            name: "Reading Comprehension Basics",
            lessons: [
              { title: "Understanding main ideas", duration: "20 min" },
              { title: "Making predictions while reading", duration: "18 min" },
              { title: "Understanding sequence of events", duration: "22 min" },
              { title: "Identifying supporting details", duration: "25 min" }
            ]
          }
        ]
      },
      {
        id: "literature",
        name: "Literature Analysis",
        description: "Analyzing literary works",
        icon: "📚",
        color: "#dc2626",
        difficulty: "Intermediate",
        duration: "32 weeks",
        units: []
      },
      {
        id: "critical",
        name: "Critical Reading",
        description: "Advanced comprehension",
        icon: "🔍",
        color: "#b91c1c",
        difficulty: "Advanced",
        duration: "28 weeks",
        units: []
      }
    ],
    history: [
      {
        id: "us-history",
        name: "U.S. History",
        description: "American historical timeline",
        icon: "🗽",
        color: "#eab308",
        difficulty: "Intermediate",
        duration: "36 weeks",
        units: [
          {
            id: "unit-1",
            name: "Colonial America",
            lessons: [
              { title: "European exploration and colonization", duration: "25 min" },
              { title: "The Thirteen Colonies", duration: "22 min" },
              { title: "Colonial life and economy", duration: "20 min" },
              { title: "Relations with Native Americans", duration: "24 min" }
            ]
          },
          {
            id: "unit-2",
            name: "The American Revolution",
            lessons: [
              { title: "The American Revolution: Causes", duration: "22 min" },
              { title: "Declaration of Independence", duration: "20 min" },
              { title: "Major battles and turning points", duration: "26 min" },
              { title: "Victory and the Treaty of Paris", duration: "24 min" }
            ]
          }
        ]
      },
      {
        id: "world-history",
        name: "World History",
        description: "Global civilizations",
        icon: "🌍",
        color: "#ca8a04",
        difficulty: "Intermediate",
        duration: "36 weeks",
        units: []
      }
    ],
    "computer-science": [
      {
        id: "intro-programming",
        name: "Intro to Programming",
        description: "Fundamentals of coding",
        icon: "💻",
        color: "#a78bfa",
        difficulty: "Beginner",
        duration: "24 weeks",
        units: [
          {
            id: "unit-1",
            name: "Programming Basics",
            lessons: [
              { title: "What is programming?", duration: "15 min" },
              { title: "Variables and data types", duration: "20 min" },
              { title: "Basic operators and expressions", duration: "18 min" },
              { title: "Input and output", duration: "16 min" }
            ]
          },
          {
            id: "unit-2",
            name: "Control Flow",
            lessons: [
              { title: "Conditional statements (if/else)", duration: "22 min" },
              { title: "Loops: while and for", duration: "25 min" },
              { title: "Nested loops and conditions", duration: "24 min" }
            ]
          }
        ]
      },
      {
        id: "data-structures",
        name: "Data Structures",
        description: "Organizing and storing data",
        icon: "🗂️",
        color: "#8b5cf6",
        difficulty: "Intermediate",
        duration: "28 weeks",
        units: []
      },
      {
        id: "algorithms",
        name: "Algorithms",
        description: "Problem-solving techniques",
        icon: "🧩",
        color: "#7c3aed",
        difficulty: "Advanced",
        duration: "28 weeks",
        units: []
      }
    ],
    science: [
      {
        id: "biology",
        name: "Biology",
        description: "Study of living organisms",
        icon: "🧬",
        color: "#22c55e",
        difficulty: "Intermediate",
        duration: "36 weeks",
        units: [
          {
            id: "unit-1",
            name: "Introduction to Biology",
            lessons: [
              { title: "What is life? Characteristics of living things", duration: "18 min" },
              { title: "The scientific method in biology", duration: "16 min" },
              { title: "Levels of biological organization", duration: "20 min" },
              { title: "Introduction to cells", duration: "22 min" }
            ]
          },
          {
            id: "unit-2",
            name: "Cell Structure and Function",
            lessons: [
              { title: "Prokaryotic vs eukaryotic cells", duration: "20 min" },
              { title: "Cell membrane and transport", duration: "24 min" },
              { title: "Organelles and their functions", duration: "26 min" },
              { title: "Cellular respiration basics", duration: "28 min" }
            ]
          }
        ]
      },
      {
        id: "chemistry",
        name: "Chemistry",
        description: "Matter and its interactions",
        icon: "⚗️",
        color: "#16a34a",
        difficulty: "Intermediate",
        duration: "36 weeks",
        units: []
      },
      {
        id: "physics",
        name: "Physics",
        description: "Laws of nature and energy",
        icon: "⚡",
        color: "#15803d",
        difficulty: "Advanced",
        duration: "36 weeks",
        units: []
      }
    ]
  };

  const availableCourses = coursesBySubject[currentSubject] || [];

  const handleAddCourse = (course) => {
    if (!selectedCourses.find(c => c.id === course.id)) {
      updateCourses([...selectedCourses, course]);
    }
  };

  const handleRemoveCourse = (courseId) => {
    updateCourses(selectedCourses.filter(c => c.id !== courseId));
  };

  return (
    <div className="page">
      <div className="fade-up">
        <div className="flex-between" style={{ marginBottom: 28 }}>
          <div>
            <div className="h2">My Courses</div>
            <div className="body" style={{ marginTop: 8 }}>
              Select and manage your learning path
            </div>
          </div>
          <button 
            className="btn btn-lime"
            onClick={() => setShowCourseModal(true)}
          >
            {selectedCourses.length > 0 ? "+ Add More Courses" : "Select Courses"}
          </button>
        </div>

        {selectedCourses.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>📚</div>
            <div className="h3">No Courses Selected</div>
            <div className="body" style={{ marginTop: 12, maxWidth: 500, margin: '12px auto 0' }}>
              Start your learning journey by selecting courses that interest you. 
              You can choose multiple courses and learn at your own pace.
            </div>
            <button 
              className="btn btn-lime"
              style={{ marginTop: 24 }}
              onClick={() => setShowCourseModal(true)}
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {selectedCourses.map((course, index) => (
              <CourseCard 
                key={course.id}
                course={course}
                index={index}
                onRemove={handleRemoveCourse}
                onOpenLesson={onOpenLesson}
              />
            ))}
          </div>
        )}
      </div>

      {showCourseModal && (
        <>
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 300,
              backdropFilter: 'blur(4px)'
            }}
            onClick={() => setShowCourseModal(false)}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: 900,
            maxHeight: '85vh',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            zIndex: 301,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              padding: '24px 28px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div className="h3">Select Courses</div>
                <div className="body" style={{ marginTop: 4 }}>
                  Choose courses to add to your learning path
                </div>
              </div>
              <button
                onClick={() => setShowCourseModal(false)}
                style={{
                  background: 'none',
                  border: '1px solid var(--border2)',
                  borderRadius: 10,
                  width: 40,
                  height: 40,
                  cursor: 'pointer',
                  color: 'var(--muted)',
                  fontSize: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--faint)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'none';
                }}
              >
                ✕
              </button>
            </div>

            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: 28
            }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
                gap: 16 
              }}>
                {availableCourses.map(course => {
                  const isSelected = selectedCourses.find(c => c.id === course.id);
                  return (
                    <div
                      key={course.id}
                      style={{
                        background: isSelected ? `${course.color}08` : 'var(--bg2)',
                        border: `1px solid ${isSelected ? course.color + '40' : 'var(--border)'}`,
                        borderRadius: 12,
                        padding: 20,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        position: 'relative'
                      }}
                      onClick={() => {
                        if (isSelected) {
                          handleRemoveCourse(course.id);
                        } else {
                          handleAddCourse(course);
                        }
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'var(--border2)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'var(--border)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      {isSelected && (
                        <div style={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: course.color,
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          fontWeight: 700
                        }}>
                          ✓
                        </div>
                      )}

                      <div style={{ 
                        fontSize: 36, 
                        marginBottom: 12,
                        opacity: isSelected ? 1 : 0.8
                      }}>
                        {course.icon}
                      </div>
                      <div style={{ 
                        fontSize: 16, 
                        fontWeight: 600, 
                        marginBottom: 6,
                        color: 'var(--text)'
                      }}>
                        {course.name}
                      </div>
                      <div style={{ 
                        fontSize: 13, 
                        color: 'var(--muted)', 
                        lineHeight: 1.4,
                        marginBottom: 12
                      }}>
                        {course.description}
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: 10,
                          padding: '2px 8px',
                          borderRadius: 100,
                          background: 'var(--faint)',
                          color: 'var(--muted)',
                          fontFamily: 'var(--font-mono)'
                        }}>
                          {course.difficulty}
                        </span>
                        <span style={{
                          fontSize: 10,
                          padding: '2px 8px',
                          borderRadius: 100,
                          background: 'var(--faint)',
                          color: 'var(--muted)',
                          fontFamily: 'var(--font-mono)'
                        }}>
                          {course.units?.length || 0} units
                        </span>
                        <span style={{
                          fontSize: 10,
                          padding: '2px 8px',
                          borderRadius: 100,
                          background: 'var(--faint)',
                          color: 'var(--muted)',
                          fontFamily: 'var(--font-mono)'
                        }}>
                          {course.duration}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{
              padding: '16px 28px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div className="body">
                {selectedCourses.length} course{selectedCourses.length !== 1 ? 's' : ''} selected
              </div>
              <button
                className="btn btn-lime"
                onClick={() => setShowCourseModal(false)}
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ── HOST SESSION PAGE ── */
function HostSessionPage({ subject, onBack, onSubmit, isMainHome, subjectInfo }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    subject: subject || 'math',
    topic: '',
    duration: 60,
    maxParticipants: 10,
    description: '',
    link: ''
  });

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Generate calendar days
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty slots for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days in month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  
  const days = getDaysInMonth(currentMonth);
  const monthName = monthNames[currentMonth.getMonth()];
  const year = currentMonth.getFullYear();

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const isDateDisabled = (date) => {
    if (!date) return true;
    return date < today;
  };

  const isDateSelected = (date) => {
    if (!date || !selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const handleDateClick = (date) => {
    if (!isDateDisabled(date)) {
      setSelectedDate(date);
    }
  };

  const timeSlots = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
    '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'
  ];

  const handleBookSession = () => {
    if (!formData.title || !formData.topic || !formData.link || !selectedDate || !selectedTime) {
      alert('Please fill in all required fields and select a date and time');
      return;
    }

    const dateStr = selectedDate.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
    
    const sessionData = {
      ...formData,
      time: `${dateStr} at ${selectedTime}`,
      date: selectedDate,
      timeSlot: selectedTime
    };

    onSubmit(sessionData);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--bg)',
      padding: '48px 64px',
      maxWidth: 1600,
      margin: '0 auto'
    }}>
      {/* Header */}
      <div className="fade-up" style={{ marginBottom: 48 }}>
        <button 
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary)',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 0',
            marginBottom: 20
          }}
        >
          ← Back to Community
        </button>
        <div className="h1" style={{ marginBottom: 12 }}>Host a Study Session</div>
        <div className="body" style={{ fontSize: 16, color: 'var(--muted)' }}>
          Schedule a collaborative learning session with fellow students
        </div>
      </div>

      {/* Two Column Layout - CALENDAR LEFT, FORM RIGHT */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '480px 1fr', 
        gap: 48,
        alignItems: 'start'
      }}>
        {/* LEFT: Calendar & Time Selection */}
        <div className="fade-up fade-up-1">
          <div className="card" style={{ padding: 32 }}>
            <div className="h3" style={{ marginBottom: 28 }}>Select Date & Time</div>
            
            {/* Calendar */}
            <div style={{ marginBottom: 28 }}>
              {/* Month Navigation */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 20
              }}>
                <button
                  onClick={previousMonth}
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    width: 40,
                    height: 40,
                    cursor: 'pointer',
                    fontSize: 18,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600
                  }}
                >
                  ←
                </button>
                <div style={{ fontWeight: 700, fontSize: 17 }}>
                  {monthName} {year}
                </div>
                <button
                  onClick={nextMonth}
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    width: 40,
                    height: 40,
                    cursor: 'pointer',
                    fontSize: 18,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600
                  }}
                >
                  →
                </button>
              </div>

              {/* Day Headers */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(7, 1fr)', 
                gap: 6,
                marginBottom: 10
              }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} style={{ 
                    textAlign: 'center', 
                    fontSize: 13, 
                    fontWeight: 700,
                    color: 'var(--muted)',
                    padding: '10px 0'
                  }}>
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(7, 1fr)', 
                gap: 6
              }}>
                {days.map((date, index) => {
                  const disabled = isDateDisabled(date);
                  const selected = isDateSelected(date);
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleDateClick(date)}
                      disabled={disabled}
                      style={{
                        aspectRatio: '1',
                        border: selected ? '2px solid var(--primary)' : '1px solid var(--border)',
                        borderRadius: 10,
                        background: selected ? 'var(--primary)' : disabled ? 'var(--faint)' : 'var(--bg)',
                        color: selected ? '#fff' : disabled ? 'var(--muted)' : 'var(--text)',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        fontSize: 15,
                        fontWeight: selected ? 700 : 500,
                        opacity: disabled ? 0.4 : 1,
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (!disabled && !selected) {
                          e.currentTarget.style.background = 'var(--primary)20';
                          e.currentTarget.style.borderColor = 'var(--primary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!disabled && !selected) {
                          e.currentTarget.style.background = 'var(--bg)';
                          e.currentTarget.style.borderColor = 'var(--border)';
                        }
                      }}
                    >
                      {date ? date.getDate() : ''}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div>
                <label style={{ display: 'block', fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
                  Select Time <span style={{ color: 'var(--coral)' }}>*</span>
                </label>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(2, 1fr)', 
                  gap: 10
                }}>
                  {timeSlots.map(time => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      style={{
                        padding: '12px 16px',
                        border: selectedTime === time ? '2px solid var(--primary)' : '1px solid var(--border)',
                        borderRadius: 10,
                        background: selectedTime === time ? 'var(--primary)20' : 'var(--bg)',
                        color: selectedTime === time ? 'var(--primary)' : 'var(--text)',
                        fontSize: 14,
                        fontWeight: selectedTime === time ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedTime !== time) {
                          e.currentTarget.style.background = 'var(--faint)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedTime !== time) {
                          e.currentTarget.style.background = 'var(--bg)';
                        }
                      }}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Session Details Form */}
        <div className="fade-up fade-up-2">
          <div className="card" style={{ padding: 32 }}>
            <div className="h3" style={{ marginBottom: 28 }}>Session Details</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Session Title */}
              <div>
                <label style={{ display: 'block', fontSize: 15, fontWeight: 600, marginBottom: 10 }}>
                  Session Title <span style={{ color: 'var(--coral)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Calculus Study Group"
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    background: 'var(--bg)',
                    fontSize: 15,
                    color: 'var(--text)'
                  }}
                />
              </div>

              {/* Subject */}
              {isMainHome ? (
                <div>
                  <label style={{ display: 'block', fontSize: 15, fontWeight: 600, marginBottom: 10 }}>
                    Subject <span style={{ color: 'var(--coral)' }}>*</span>
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      border: '1px solid var(--border)',
                      borderRadius: 10,
                      background: 'var(--bg)',
                      fontSize: 15,
                      color: 'var(--text)',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="math">Math</option>
                    <option value="reading">Reading</option>
                    <option value="history">History</option>
                    <option value="computer-science">Computer Science</option>
                    <option value="science">Science</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label style={{ display: 'block', fontSize: 15, fontWeight: 600, marginBottom: 10 }}>
                    Subject
                  </label>
                  <div style={{
                    width: '100%',
                    padding: '14px 18px',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    background: 'var(--faint)',
                    fontSize: 15,
                    color: 'var(--muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}>
                    <span>{subjectInfo[subject]?.name}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 14 }}>🔒</span>
                  </div>
                </div>
              )}

              {/* Topic */}
              <div>
                <label style={{ display: 'block', fontSize: 15, fontWeight: 600, marginBottom: 10 }}>
                  Topic <span style={{ color: 'var(--coral)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="e.g., Derivatives and Integrals"
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    background: 'var(--bg)',
                    fontSize: 15,
                    color: 'var(--text)'
                  }}
                />
              </div>

              {/* Duration */}
              <div>
                <label style={{ display: 'block', fontSize: 15, fontWeight: 600, marginBottom: 10 }}>
                  Duration
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    background: 'var(--bg)',
                    fontSize: 15,
                    color: 'var(--text)',
                    cursor: 'pointer'
                  }}
                >
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>

              {/* Max Participants */}
              <div>
                <label style={{ display: 'block', fontSize: 15, fontWeight: 600, marginBottom: 10 }}>
                  Max Participants
                </label>
                <input
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                  min="2"
                  max="50"
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    background: 'var(--bg)',
                    fontSize: 15,
                    color: 'var(--text)'
                  }}
                />
              </div>

              {/* Link */}
              <div>
                <label style={{ display: 'block', fontSize: 15, fontWeight: 600, marginBottom: 10 }}>
                  Meeting Link <span style={{ color: 'var(--coral)' }}>*</span>
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="e.g., https://meet.google.com/abc-defg-hij or https://zoom.us/j/123456789"
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    background: 'var(--bg)',
                    fontSize: 15,
                    color: 'var(--text)'
                  }}
                />
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
                  Google Meet, Zoom, or any video conferencing link
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: 15, fontWeight: 600, marginBottom: 10 }}>
                  Description (optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What will you cover in this session?"
                  rows={5}
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    background: 'var(--bg)',
                    fontSize: 15,
                    color: 'var(--text)',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    lineHeight: 1.6
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Book Button */}
      <div className="fade-up fade-up-3" style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <button 
          className="btn btn-outline"
          onClick={onBack}
        >
          Cancel
        </button>
        <button 
          className="btn btn-lime"
          onClick={handleBookSession}
          style={{ minWidth: 200 }}
        >
          📅 Book Session
        </button>
      </div>
    </div>
  );
}

/* ── COMMUNITY PAGE ── */
function CommunityPage({ subject }) {
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showHostPage, setShowHostPage] = useState(false);
  
  // All sessions stored globally
  const [allSessions, setAllSessions] = useState([
    {
      id: 1,
      title: "Calculus Study Group",
      host: "Alex R.",
      subject: "math",
      subjectName: "Math",
      topic: "Derivatives",
      time: "Today at 4:00 PM",
      date: new Date(),
      timeSlot: "4:00 PM",
      duration: 60,
      participants: 5,
      maxParticipants: 10,
      color: "#3b82f6",
      link: "https://meet.google.com/abc-defg-hij"
    },
    {
      id: 2,
      title: "Biology Review Session",
      host: "Priya K.",
      subject: "science",
      subjectName: "Science",
      topic: "Cell Structure",
      time: "Today at 6:30 PM",
      date: new Date(),
      timeSlot: "6:30 PM",
      duration: 90,
      participants: 3,
      maxParticipants: 8,
      color: "#22c55e",
      link: "https://zoom.us/j/123456789"
    },
    {
      id: 3,
      title: "US History Discussion",
      host: "Marcus T.",
      subject: "history",
      subjectName: "History",
      topic: "Colonial America",
      time: "Tomorrow at 3:30 PM",
      date: new Date(new Date().setDate(new Date().getDate() + 1)),
      timeSlot: "3:30 PM",
      duration: 60,
      participants: 7,
      maxParticipants: 12,
      color: "#eab308",
      link: "https://meet.google.com/xyz-abcd-efg"
    },
    {
      id: 4,
      title: "Algebra Homework Help",
      host: "Sarah L.",
      subject: "math",
      subjectName: "Math",
      topic: "Solving Equations",
      time: "Tomorrow at 5:00 PM",
      date: new Date(new Date().setDate(new Date().getDate() + 1)),
      timeSlot: "5:00 PM",
      duration: 45,
      participants: 2,
      maxParticipants: 6,
      color: "#3b82f6",
      link: "https://meet.google.com/math-help-123"
    },
    {
      id: 5,
      title: "Python Basics",
      host: "David M.",
      subject: "computer-science",
      subjectName: "Computer Science",
      topic: "Variables and Loops",
      time: "Today at 7:00 PM",
      date: new Date(),
      timeSlot: "7:00 PM",
      duration: 120,
      participants: 4,
      maxParticipants: 8,
      color: "#a78bfa",
      link: "https://zoom.us/j/pythonbasics"
    }
  ]);

  // Filter sessions based on current subject (null = Main Home = all subjects)
  const activeSessions = subject 
    ? allSessions.filter(session => session.subject === subject)
    : allSessions;

  // Determine if we're on Main Home (can host any subject) or subject page (only that subject)
  const isMainHome = !subject;

  const subjectInfo = {
    math: { name: "Math", color: "#3b82f6" },
    reading: { name: "Reading", color: "#ef4444" },
    history: { name: "History", color: "#eab308" },
    "computer-science": { name: "Computer Science", color: "#a78bfa" },
    science: { name: "Science", color: "#22c55e" }
  };

  const handleHostSession = (sessionData) => {
    const selectedSubject = sessionData.subject;
    const subjectData = subjectInfo[selectedSubject];
    
    if (!subjectData) {
      alert('Invalid subject selected');
      return;
    }

    const newSession = {
      id: Date.now(),
      title: sessionData.title,
      host: "You",
      subject: selectedSubject,
      subjectName: subjectData.name,
      topic: sessionData.topic,
      time: sessionData.time,
      participants: 1,
      maxParticipants: parseInt(sessionData.maxParticipants) || 10,
      color: subjectData.color
    };

    setAllSessions([newSession, ...allSessions]);
    setShowHostPage(false);
  };

  const handleJoinSession = (sessionId) => {
    // Find the session being joined
    const sessionToJoin = allSessions.find(s => s.id === sessionId);
    
    if (sessionToJoin) {
      // Save to localStorage for calendar with all existing data
      const calendarSessionId = `studylink_session_${Date.now()}`;
      const calendarSession = {
        id: calendarSessionId,
        ...sessionToJoin, // Include all session data (title, subject, topic, date, etc.)
        createdAt: new Date().toISOString()
      };
      
      console.log('Saving joined session to calendar:', calendarSession);
      localStorage.setItem(calendarSessionId, JSON.stringify(calendarSession));
    }
    
    // Update participant count in community state
    setAllSessions(allSessions.map(session => 
      session.id === sessionId 
        ? { ...session, participants: session.participants + 1 }
        : session
    ));
    setShowJoinModal(false);
  };

  return (
    <>
      {showHostPage && (
        <HostSessionPage
          subject={subject}
          isMainHome={isMainHome}
          subjectInfo={subjectInfo}
          onBack={() => setShowHostPage(false)}
          onSubmit={handleHostSession}
        />
      )}
      <div className="page">
      {/* Header */}
      <div className="fade-up">
        <div className="h2" style={{ marginBottom: 8 }}>
          {isMainHome ? 'Community' : `${subjectInfo[subject]?.name} Community`}
        </div>
        <div className="body" style={{ marginBottom: 32 }}>
          {isMainHome 
            ? 'Connect with fellow learners across all subjects, host study sessions, and collaborate on challenging topics'
            : `Join ${subjectInfo[subject]?.name} study groups and connect with peers learning the same material`
          }
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
          <button 
            className="btn btn-lime"
            onClick={() => setShowHostPage(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <span style={{ fontSize: 18 }}>📡</span>
            {isMainHome ? 'Host a Study Session' : `Host ${subjectInfo[subject]?.name} Session`}
          </button>
          <button 
            className="btn btn-outline"
            onClick={() => setShowJoinModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <span style={{ fontSize: 18 }}>🔍</span>
            Browse Sessions
          </button>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="fade-up fade-up-1">
        <div className="h3" style={{ marginBottom: 20 }}>
          {isMainHome ? 'All Active Sessions' : `${subjectInfo[subject]?.name} Study Sessions`}
        </div>
        {activeSessions.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📚</div>
            <div className="h4" style={{ marginBottom: 8 }}>No active sessions</div>
            <div className="body">
              {isMainHome 
                ? 'Be the first to host a study session!'
                : `Be the first to host a ${subjectInfo[subject]?.name} study session!`
              }
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {activeSessions.map(session => (
              <div 
                key={session.id}
                className="card"
                style={{
                  borderLeft: `4px solid ${session.color}`,
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ marginBottom: 12 }}>
                  <div style={{ 
                    display: 'inline-block',
                    padding: '4px 10px',
                    background: `${session.color}15`,
                    color: session.color,
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    marginBottom: 12
                  }}>
                    {session.subjectName}
                  </div>
                  <div className="h4" style={{ marginBottom: 6 }}>{session.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>
                    Topic: {session.topic}
                  </div>
                </div>

                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12,
                  paddingTop: 12,
                  borderTop: '1px solid var(--border)',
                  fontSize: 12,
                  color: 'var(--muted)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span>👤</span>
                    <span>{session.host}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span>👥</span>
                    <span>{session.participants}/{session.maxParticipants}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span>🕒</span>
                    <span>{session.time}</span>
                  </div>
                </div>

                <button 
                  className="btn btn-lime btn-sm"
                  style={{ width: '100%', marginTop: 16 }}
                  onClick={() => handleJoinSession(session.id)}
                  disabled={session.participants >= session.maxParticipants}
                >
                  {session.participants >= session.maxParticipants ? 'Full' : 'Join Session'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Join/Browse Sessions Modal */}
      {showJoinModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
          onClick={() => setShowJoinModal(false)}
        >
          <div 
            style={{
              background: 'var(--card)',
              borderRadius: 16,
              maxWidth: 700,
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto',
              padding: 32
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h3" style={{ marginBottom: 24 }}>
              {isMainHome ? 'Browse All Study Sessions' : `Browse ${subjectInfo[subject]?.name} Sessions`}
            </div>

            {activeSessions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
                <div className="body">No sessions available. Host one to get started!</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {activeSessions.map(session => (
                  <div 
                    key={session.id}
                    style={{
                      padding: 20,
                      border: '1px solid var(--border)',
                      borderLeft: `4px solid ${session.color}`,
                      borderRadius: 10,
                      background: 'var(--bg2)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ 
                          display: 'inline-block',
                          padding: '3px 8px',
                          background: `${session.color}15`,
                          color: session.color,
                          borderRadius: 4,
                          fontSize: 10,
                          fontWeight: 700,
                          marginBottom: 8
                        }}>
                          {session.subjectName}
                        </div>
                        <div className="h4">{session.title}</div>
                        <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
                          Topic: {session.topic}
                        </div>
                      </div>
                      <button 
                        className="btn btn-lime btn-sm"
                        onClick={() => handleJoinSession(session.id)}
                        disabled={session.participants >= session.maxParticipants}
                      >
                        {session.participants >= session.maxParticipants ? 'Full' : 'Join'}
                      </button>
                    </div>

                    <div style={{ 
                      display: 'flex', 
                      gap: 16, 
                      fontSize: 12, 
                      color: 'var(--muted)',
                      paddingTop: 12,
                      borderTop: '1px solid var(--border)'
                    }}>
                      <span>👤 {session.host}</span>
                      <span>👥 {session.participants}/{session.maxParticipants}</span>
                      <span>🕒 {session.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button 
              className="btn btn-outline"
              onClick={() => setShowJoinModal(false)}
              style={{ width: '100%', marginTop: 24 }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

/* ── AI CHATBOT ── */
function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: "Hi! 👋 I'm your StudyLink AI assistant. What would you like help with today?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: inputValue
    };
    setMessages([...messages, userMessage]);
    setInputValue('');

    // Simulate bot typing
    setIsTyping(true);
    
    // Simulate bot response after 1 second
    setTimeout(() => {
      const botResponses = [
        "I can help you with that! Let me explain...",
        "Great question! Here's what you need to know:",
        "That's a common question. Let me break it down for you:",
        "I'm here to help! Based on what you're asking:",
        "Let me guide you through this step by step:"
      ];
      
      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: botResponses[Math.floor(Math.random() * botResponses.length)] + " " + 
              "You can ask me about course content, study tips, lesson explanations, or any topic you're learning. Feel free to be specific!"
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary2) 100%)',
            border: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            zIndex: 999,
            transition: 'all 0.3s ease',
            animation: 'pulse 2s infinite'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }}
        >
          🤖
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 380,
            height: 550,
            background: 'var(--card)',
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 999,
            border: '1px solid var(--border)',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary2) 100%)',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#fff'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22
                }}
              >
                🤖
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>AI Assistant</div>
                <div style={{ fontSize: 12, opacity: 0.9 }}>
                  <span style={{ 
                    display: 'inline-block', 
                    width: 6, 
                    height: 6, 
                    borderRadius: '50%', 
                    background: '#4ade80',
                    marginRight: 6
                  }}></span>
                  Online
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: 8,
                width: 32,
                height: 32,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                color: '#fff',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              background: 'var(--bg)'
            }}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  display: 'flex',
                  justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    maxWidth: '75%',
                    padding: '12px 16px',
                    borderRadius: message.type === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: message.type === 'user' 
                      ? 'var(--primary)' 
                      : 'var(--card)',
                    color: message.type === 'user' ? '#fff' : 'var(--text)',
                    fontSize: 14,
                    lineHeight: 1.5,
                    boxShadow: message.type === 'user' 
                      ? 'none' 
                      : '0 2px 4px rgba(0,0,0,0.05)',
                    border: message.type === 'user' ? 'none' : '1px solid var(--border)'
                  }}
                >
                  {message.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '16px 16px 16px 4px',
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                >
                  <div style={{ display: 'flex', gap: 4 }}>
                    <span style={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      background: 'var(--muted)',
                      animation: 'bounce 1.4s infinite ease-in-out',
                      animationDelay: '0s'
                    }}></span>
                    <span style={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      background: 'var(--muted)',
                      animation: 'bounce 1.4s infinite ease-in-out',
                      animationDelay: '0.2s'
                    }}></span>
                    <span style={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      background: 'var(--muted)',
                      animation: 'bounce 1.4s infinite ease-in-out',
                      animationDelay: '0.4s'
                    }}></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: 16,
              borderTop: '1px solid var(--border)',
              background: 'var(--card)'
            }}
          >
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question..."
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  background: 'var(--bg)',
                  fontSize: 14,
                  color: 'var(--text)',
                  outline: 'none',
                  transition: 'border 0.2s'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                style={{
                  padding: '12px 20px',
                  background: inputValue.trim() ? 'var(--primary)' : 'var(--faint)',
                  border: 'none',
                  borderRadius: 12,
                  cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                  fontSize: 18,
                  transition: 'all 0.2s',
                  opacity: inputValue.trim() ? 1 : 0.5
                }}
                onMouseEnter={(e) => {
                  if (inputValue.trim()) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── SCHEDULE PAGE ── */
function SchedulePage({ subject }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'list'

  // Get all sessions from localStorage
  const getAllSessions = () => {
    const sessions = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('studylink_session_')) {
        try {
          const session = JSON.parse(localStorage.getItem(key));
          sessions.push(session);
        } catch (e) {
          console.error('Error parsing session:', e);
        }
      }
    }
    return sessions;
  };

  const allSessions = getAllSessions();

  // Filter by subject if on a subject page
  const filteredSessions = subject 
    ? allSessions.filter(s => s.subject === subject)
    : allSessions;

  const subjectInfo = {
    math: { name: "Math", color: "#3b82f6" },
    reading: { name: "Reading", color: "#ef4444" },
    history: { name: "History", color: "#eab308" },
    "computer-science": { name: "Computer Science", color: "#a78bfa" },
    science: { name: "Science", color: "#22c55e" }
  };

  // Calendar generation
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty slots for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days in month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  
  const days = getDaysInMonth(currentMonth);
  const monthName = monthNames[currentMonth.getMonth()];
  const year = currentMonth.getFullYear();

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  // Get sessions for a specific date
  const getSessionsForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toDateString();
    return filteredSessions.filter(session => {
      if (!session.date) return false;
      const sessionDate = new Date(session.date);
      return sessionDate.toDateString() === dateStr;
    });
  };

  const isToday = (date) => {
    if (!date) return false;
    return date.toDateString() === new Date().toDateString();
  };

  // Get upcoming sessions (sorted) for list view
  const upcomingSessions = filteredSessions
    .filter(session => session.date && new Date(session.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="page" style={{ padding: '32px 40px' }}>
      {/* Header */}
      <div className="fade-up" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <div className="h2" style={{ marginBottom: 8 }}>
              {subject ? `${subjectInfo[subject]?.name} Schedule` : 'My Schedule'}
            </div>
            <div className="body">
              All your upcoming study sessions and events
            </div>
          </div>
          
          {/* View Toggle */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setViewMode('month')}
              className={viewMode === 'month' ? 'btn btn-lime btn-sm' : 'btn btn-outline btn-sm'}
            >
              📅 Month
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'btn btn-lime btn-sm' : 'btn btn-outline btn-sm'}
            >
              📋 List
            </button>
          </div>
        </div>

        {/* Month Navigation - Only in Month View */}
        {viewMode === 'month' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <button
              onClick={previousMonth}
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                width: 44,
                height: 44,
                cursor: 'pointer',
                fontSize: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600
              }}
            >
              ←
            </button>
            <div style={{ fontWeight: 700, fontSize: 24, minWidth: 200, textAlign: 'center' }}>
              {monthName} {year}
            </div>
            <button
              onClick={nextMonth}
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                width: 44,
                height: 44,
                cursor: 'pointer',
                fontSize: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600
              }}
            >
              →
            </button>
          </div>
        )}
      </div>

      {/* MONTH VIEW */}
      {viewMode === 'month' && (
        <>
          <div className="fade-up fade-up-1">
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Day Headers */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(7, 1fr)',
                background: 'var(--faint)',
                borderBottom: '2px solid var(--border)'
              }}>
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                  <div key={day} style={{ 
                    textAlign: 'center', 
                    fontSize: 14, 
                    fontWeight: 700,
                    color: 'var(--text)',
                    padding: '16px 8px',
                    borderRight: day !== 'Saturday' ? '1px solid var(--border)' : 'none'
                  }}>
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid - Week by Week */}
              <div>
                {Array.from({ length: Math.ceil(days.length / 7) }, (_, weekIndex) => (
                  <div
                    key={weekIndex}
                    style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(7, 1fr)',
                      borderBottom: weekIndex < Math.ceil(days.length / 7) - 1 ? '1px solid var(--border)' : 'none'
                    }}
                  >
                    {days.slice(weekIndex * 7, (weekIndex + 1) * 7).map((date, dayIndex) => {
                      const sessionsForDay = getSessionsForDate(date);
                      const isTodayDate = isToday(date);
                      
                      return (
                        <div
                          key={dayIndex}
                          style={{
                            minHeight: 140,
                            padding: 12,
                            borderRight: (weekIndex * 7 + dayIndex) % 7 !== 6 ? '1px solid var(--border)' : 'none',
                            background: !date ? 'var(--faint)' : isTodayDate ? 'var(--primary)05' : 'var(--bg)',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          {date && (
                            <>
                              {/* Date Number */}
                              <div style={{ 
                                fontSize: 16, 
                                fontWeight: 600,
                                color: isTodayDate ? 'var(--primary)' : 'var(--text)',
                                marginBottom: 8,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6
                              }}>
                                {isTodayDate && (
                                  <div style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    background: 'var(--primary)'
                                  }} />
                                )}
                                {date.getDate()}
                              </div>

                              {/* Events for this day */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {sessionsForDay.map((session, idx) => (
                                  <div
                                    key={idx}
                                    style={{
                                      padding: '6px 8px',
                                      background: `${subjectInfo[session.subject]?.color || 'var(--primary)'}20`,
                                      border: `1px solid ${subjectInfo[session.subject]?.color || 'var(--primary)'}40`,
                                      borderRadius: 6,
                                      fontSize: 12,
                                      fontWeight: 600,
                                      color: subjectInfo[session.subject]?.color || 'var(--primary)',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.transform = 'scale(1.02)';
                                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.transform = 'scale(1)';
                                      e.currentTarget.style.boxShadow = 'none';
                                    }}
                                    title={`${session.title} - ${session.timeSlot}\n${session.topic}`}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                      <span>⏰</span>
                                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {session.timeSlot} {session.title}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Below Calendar */}
            <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
              {/* Total Sessions */}
              <div className="card">
                <div style={{ fontSize: 32, marginBottom: 8 }}>📅</div>
                <div className="h3" style={{ marginBottom: 4 }}>{filteredSessions.length}</div>
                <div style={{ fontSize: 14, color: 'var(--muted)' }}>Total Sessions</div>
              </div>

              {/* Upcoming This Month */}
              <div className="card">
                <div style={{ fontSize: 32, marginBottom: 8 }}>📆</div>
                <div className="h3" style={{ marginBottom: 4 }}>
                  {filteredSessions.filter(s => {
                    if (!s.date) return false;
                    const d = new Date(s.date);
                    return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
                  }).length}
                </div>
                <div style={{ fontSize: 14, color: 'var(--muted)' }}>This Month</div>
              </div>

              {/* By Subject */}
              {!subject && (
                <div className="card">
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📚</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {Object.entries(subjectInfo).map(([key, info]) => {
                      const count = allSessions.filter(s => s.subject === key).length;
                      if (count === 0) return null;
                      return (
                        <div key={key} style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: info.color, fontWeight: 600 }}>{info.name}</span>
                          <span>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="fade-up fade-up-1">
          {upcomingSessions.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>📅</div>
              <div className="h4" style={{ marginBottom: 8 }}>No upcoming sessions</div>
              <div className="body">Book a study session to get started!</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 16 }}>
              {upcomingSessions.map((session, idx) => (
                <div
                  key={idx}
                  className="card"
                  style={{
                    borderLeft: `4px solid ${subjectInfo[session.subject]?.color || 'var(--primary)'}`,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        background: `${subjectInfo[session.subject]?.color}15`,
                        color: subjectInfo[session.subject]?.color,
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 700,
                        marginBottom: 12
                      }}>
                        {subjectInfo[session.subject]?.name || session.subject}
                      </div>
                      <div className="h4" style={{ marginBottom: 6 }}>{session.title}</div>
                      <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 12 }}>
                        {session.topic}
                      </div>
                      <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--muted)' }}>
                        <span>📅 {new Date(session.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        <span>⏰ {session.timeSlot}</span>
                        <span>⏱️ {session.duration} min</span>
                        <span>👥 Max {session.maxParticipants}</span>
                      </div>
                    </div>
                    {session.link && (
                      <a
                        href={session.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-lime btn-sm"
                        style={{ marginLeft: 16, textDecoration: 'none' }}
                      >
                        🔗 Join Meeting
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── PROFILE PAGE ── */
function ProfilePage({ user }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    username: user?.username || 'Guest',
    email: user?.email || 'guest@studylink.com',
    bio: user?.bio || 'Learning every day!',
    joinedDate: user?.joinedDate || 'March 2026'
  });

  // Get total XP and calculate stats
  const totalXP = getTotalXP();
  const dayStreak = parseInt(localStorage.getItem('studylink_day_streak') || '0');
  const currentLeague = totalXP < 500 ? 'Bronze' : totalXP < 1000 ? 'Silver' : totalXP < 2000 ? 'Gold' : 'Diamond';
  const topFinishes = parseInt(localStorage.getItem('studylink_top_finishes') || '0');
  
  // Calculate time spent (mock for now - would track actual session time)
  const timeSpent = parseInt(localStorage.getItem('studylink_time_spent') || '0'); // in minutes
  const hoursSpent = Math.floor(timeSpent / 60);
  const minutesSpent = timeSpent % 60;

  // Achievement data
  const achievements = [
    { id: 1, name: "First Steps", icon: "🎯", description: "Complete your first lesson", unlocked: totalXP >= 30 },
    { id: 2, name: "Quick Learner", icon: "⚡", description: "Complete 5 lessons", unlocked: totalXP >= 150 },
    { id: 3, name: "Dedicated", icon: "🔥", description: "Maintain a 7-day streak", unlocked: dayStreak >= 7 },
    { id: 4, name: "Scholar", icon: "📚", description: "Earn 500 XP", unlocked: totalXP >= 500 },
    { id: 5, name: "Master", icon: "👑", description: "Earn 1000 XP", unlocked: totalXP >= 1000 },
    { id: 6, name: "Social Butterfly", icon: "💬", description: "Join 3 study sessions", unlocked: false },
    { id: 7, name: "Team Player", icon: "🤝", description: "Host a study session", unlocked: false },
    { id: 8, name: "Night Owl", icon: "🦉", description: "Study after 10 PM", unlocked: false },
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  const handleSaveProfile = () => {
    // Save to localStorage or backend
    localStorage.setItem('studylink_user_profile', JSON.stringify(editedUser));
    setIsEditing(false);
  };

  const getLeagueColor = (league) => {
    switch(league) {
      case 'Bronze': return '#cd7f32';
      case 'Silver': return '#c0c0c0';
      case 'Gold': return '#ffd700';
      case 'Diamond': return '#b9f2ff';
      default: return 'var(--muted)';
    }
  };

  const getLeagueEmoji = (league) => {
    switch(league) {
      case 'Bronze': return '🥉';
      case 'Silver': return '🥈';
      case 'Gold': return '🥇';
      case 'Diamond': return '💎';
      default: return '🏆';
    }
  };

  return (
    <div className="page" style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Profile Header */}
      <div className="fade-up">
        <div className="card" style={{ 
          padding: 0, 
          overflow: 'hidden',
          background: 'linear-gradient(135deg, var(--primary)15, var(--primary)05)'
        }}>
          <div style={{ padding: 40 }}>
            {/* Edit Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-outline btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  ✏️ Edit Profile
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="btn btn-outline btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="btn btn-lime btn-sm"
                  >
                    💾 Save
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
              {/* Avatar */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 48,
                  fontWeight: 700,
                  color: '#fff',
                  border: '4px solid var(--card)'
                }}>
                  {editedUser.username.substring(0, 2).toUpperCase()}
                </div>
                {isEditing && (
                  <button
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'var(--card)',
                      border: '2px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: 16
                    }}
                  >
                    📷
                  </button>
                )}
              </div>

              {/* User Info */}
              <div style={{ flex: 1 }}>
                {!isEditing ? (
                  <>
                    <div className="h2" style={{ marginBottom: 8 }}>{editedUser.username}</div>
                    <div style={{ fontSize: 15, color: 'var(--muted)', marginBottom: 16 }}>
                      @{editedUser.username.toLowerCase().replace(/\s/g, '')}
                    </div>
                    <div style={{ fontSize: 14, marginBottom: 16 }}>
                      {editedUser.bio}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                      📅 Joined {editedUser.joinedDate}
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: 'block' }}>
                        Username
                      </label>
                      <input
                        type="text"
                        value={editedUser.username}
                        onChange={(e) => setEditedUser({...editedUser, username: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid var(--border)',
                          borderRadius: 8,
                          background: 'var(--bg)',
                          color: 'var(--text)',
                          fontSize: 14
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: 'block' }}>
                        Email
                      </label>
                      <input
                        type="email"
                        value={editedUser.email}
                        onChange={(e) => setEditedUser({...editedUser, email: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid var(--border)',
                          borderRadius: 8,
                          background: 'var(--bg)',
                          color: 'var(--text)',
                          fontSize: 14
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: 'block' }}>
                        Bio
                      </label>
                      <textarea
                        value={editedUser.bio}
                        onChange={(e) => setEditedUser({...editedUser, bio: e.target.value})}
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid var(--border)',
                          borderRadius: 8,
                          background: 'var(--bg)',
                          color: 'var(--text)',
                          fontSize: 14,
                          resize: 'vertical'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Follow Stats (placeholder) */}
              <div style={{ display: 'flex', gap: 24 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>0</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>Following</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>0</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>Followers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="fade-up fade-up-1" style={{ marginTop: 32 }}>
        <div className="h3" style={{ marginBottom: 20 }}>📊 Statistics</div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
          {/* Day Streak */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ 
              fontSize: 48,
              opacity: dayStreak > 0 ? 1 : 0.3
            }}>
              🔥
            </div>
            <div>
              <div className="h2" style={{ marginBottom: 4 }}>{dayStreak}</div>
              <div style={{ fontSize: 14, color: 'var(--muted)' }}>Day streak</div>
            </div>
          </div>

          {/* Total XP */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ fontSize: 48 }}>⚡</div>
            <div>
              <div className="h2" style={{ marginBottom: 4 }}>{totalXP}</div>
              <div style={{ fontSize: 14, color: 'var(--muted)' }}>Total XP</div>
            </div>
          </div>

          {/* Current League */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ fontSize: 48 }}>{getLeagueEmoji(currentLeague)}</div>
            <div>
              <div className="h3" style={{ 
                marginBottom: 4,
                color: getLeagueColor(currentLeague)
              }}>
                {currentLeague}
              </div>
              <div style={{ fontSize: 14, color: 'var(--muted)' }}>Current league</div>
            </div>
          </div>

          {/* Top Finishes */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ 
              fontSize: 48,
              opacity: topFinishes > 0 ? 1 : 0.3
            }}>
              🏆
            </div>
            <div>
              <div className="h2" style={{ marginBottom: 4 }}>{topFinishes}</div>
              <div style={{ fontSize: 14, color: 'var(--muted)' }}>Top 3 finishes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity */}
      <div className="fade-up fade-up-2" style={{ marginTop: 32 }}>
        <div className="h3" style={{ marginBottom: 20 }}>⏱️ Activity</div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
          {/* Time Spent */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ fontSize: 48 }}>⏰</div>
              <div>
                <div className="h3" style={{ marginBottom: 4 }}>
                  {hoursSpent}h {minutesSpent}m
                </div>
                <div style={{ fontSize: 14, color: 'var(--muted)' }}>Time spent learning</div>
              </div>
            </div>
          </div>

          {/* Lessons Completed */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ fontSize: 48 }}>✅</div>
              <div>
                <div className="h3" style={{ marginBottom: 4 }}>{Math.floor(totalXP / 30)}</div>
                <div style={{ fontSize: 14, color: 'var(--muted)' }}>Lessons completed</div>
              </div>
            </div>
          </div>

          {/* Sessions Joined */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ fontSize: 48 }}>👥</div>
              <div>
                <div className="h3" style={{ marginBottom: 4 }}>
                  {getAllSessions().length}
                </div>
                <div style={{ fontSize: 14, color: 'var(--muted)' }}>Study sessions</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="fade-up fade-up-3" style={{ marginTop: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div className="h3">🏆 Achievements</div>
          <div style={{ fontSize: 14, color: 'var(--muted)' }}>
            {unlockedCount} of {achievements.length} unlocked
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="card"
              style={{
                opacity: achievement.unlocked ? 1 : 0.4,
                borderColor: achievement.unlocked ? 'var(--primary)' : 'var(--border)',
                borderWidth: achievement.unlocked ? 2 : 1,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {achievement.unlocked && (
                <div style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12
                }}>
                  ✓
                </div>
              )}
              <div style={{ fontSize: 48, marginBottom: 12, textAlign: 'center' }}>
                {achievement.icon}
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, textAlign: 'center' }}>
                {achievement.name}
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center' }}>
                {achievement.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subject Progress */}
      <div className="fade-up fade-up-4" style={{ marginTop: 32, marginBottom: 32 }}>
        <div className="h3" style={{ marginBottom: 20 }}>📚 Subject Progress</div>
        
        <div className="card">
          {[
            { id: 'math', name: 'Math', color: '#3b82f6', emoji: '🔢' },
            { id: 'reading', name: 'Reading', color: '#ef4444', emoji: '📚' },
            { id: 'history', name: 'History', color: '#eab308', emoji: '📜' },
            { id: 'computer-science', name: 'Computer Science', color: '#a78bfa', emoji: '💻' },
            { id: 'science', name: 'Science', color: '#22c55e', emoji: '🔬' }
          ].map((subject, idx) => {
            const subjectXP = getSubjectXP(subject.id);
            const percentage = totalXP > 0 ? Math.round((subjectXP / totalXP) * 100) : 0;
            
            return (
              <div
                key={subject.id}
                style={{
                  padding: '20px 0',
                  borderBottom: idx < 4 ? '1px solid var(--border)' : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 24 }}>{subject.emoji}</span>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{subject.name}</span>
                  </div>
                  <div style={{ fontWeight: 600, color: subject.color }}>
                    {subjectXP} XP ({percentage}%)
                  </div>
                </div>
                {/* Progress Bar */}
                <div style={{
                  width: '100%',
                  height: 8,
                  background: 'var(--faint)',
                  borderRadius: 4,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${percentage}%`,
                    height: '100%',
                    background: subject.color,
                    borderRadius: 4,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
  
  // Helper function to get all sessions
  function getAllSessions() {
    const sessions = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('studylink_session_')) {
        try {
          sessions.push(JSON.parse(localStorage.getItem(key)));
        } catch (e) {}
      }
    }
    return sessions;
  }
}

function SimplePage({ title, emoji, description }) {
  return (
    <div className="page">
      <div className="empty-state">
        <div className="empty-state-icon">{emoji}</div>
        <div className="empty-state-title">{title}</div>
        <div className="empty-state-desc">{description}</div>
      </div>
    </div>
  );
}

// Analytics Page
function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState('week');
  
  // Mock data for activity hours per day (last 7 days)
  const activityData = [
    { day: 'Mon', hours: 2.5 },
    { day: 'Tue', hours: 1.8 },
    { day: 'Wed', hours: 3.2 },
    { day: 'Thu', hours: 2.1 },
    { day: 'Fri', hours: 4.5 },
    { day: 'Sat', hours: 1.2 },
    { day: 'Sun', hours: 2.8 }
  ];

  const maxHours = Math.max(...activityData.map(d => d.hours));

  // Upcoming lessons
  const upcomingLessons = [
    { id: 1, subject: '🔢 Math', title: 'Advanced Calculus - Integration', date: 'Tomorrow', time: '2:00 PM', duration: '45 min', progress: 60 },
    { id: 2, subject: '📚 Reading', title: 'Literary Analysis Techniques', date: 'Mar 11', time: '10:00 AM', duration: '30 min', progress: 0 },
    { id: 3, subject: '📜 History', title: 'World War II - European Theater', date: 'Mar 12', time: '3:30 PM', duration: '60 min', progress: 0 },
    { id: 4, subject: '💻 CS', title: 'Data Structures - Binary Trees', date: 'Mar 13', time: '1:00 PM', duration: '50 min', progress: 25 },
    { id: 5, subject: '🔬 Science', title: 'Cellular Biology - Mitosis', date: 'Mar 14', time: '11:00 AM', duration: '40 min', progress: 0 }
  ];

  const totalHours = activityData.reduce((sum, d) => sum + d.hours, 0);
  const avgHours = (totalHours / activityData.length).toFixed(1);
  const mostActiveDay = activityData.reduce((max, d) => d.hours > max.hours ? d : max);

  return (
    <div className="page">
      <div style={{ marginBottom: 32 }}>
        <div className="h2" style={{ marginBottom: 8 }}>Analytics</div>
        <div className="body">Track your learning activity and progress</div>
      </div>

      {/* Stats Overview */}
      <div className="grid-4 fade-up">
        <div className="stat-card">
          <div className="stat-card-icon">⏰</div>
          <div className="stat-value">{totalHours.toFixed(1)}h</div>
          <div className="stat-label">Total This Week</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">📊</div>
          <div className="stat-value">{avgHours}h</div>
          <div className="stat-label">Daily Average</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">🔥</div>
          <div className="stat-value">{mostActiveDay.day}</div>
          <div className="stat-label">Most Active Day</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">📈</div>
          <div className="stat-value">{upcomingLessons.length}</div>
          <div className="stat-label">Upcoming Lessons</div>
        </div>
      </div>

      {/* Activity Graph */}
      <div className="card fade-up fade-up-1">
        <div className="card-header">
          <div className="card-title">Daily Activity</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['week', 'month', 'year'].map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                style={{
                  padding: '6px 14px',
                  background: timeframe === tf ? 'var(--primary)20' : 'var(--faint)',
                  border: timeframe === tf ? '1px solid var(--primary)' : '1px solid var(--border)',
                  borderRadius: 8,
                  color: timeframe === tf ? 'var(--primary)' : 'var(--text)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s'
                }}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 240, padding: '20px 0' }}>
          {activityData.map((data, idx) => (
            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: '100%',
                height: `${(data.hours / maxHours) * 180}px`,
                background: `linear-gradient(180deg, var(--primary) 0%, var(--primary2) 100%)`,
                borderRadius: '8px 8px 0 0',
                transition: 'all 0.3s',
                position: 'relative',
                minHeight: 20
              }}
              title={`${data.hours} hours`}>
                <div style={{
                  position: 'absolute',
                  top: -24,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--primary)'
                }}>
                  {data.hours}h
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>
                {data.day}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Lessons */}
      <div className="card fade-up fade-up-2">
        <div className="card-header">
          <div className="card-title">Upcoming Lessons</div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>{upcomingLessons.length} scheduled</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {upcomingLessons.map((lesson) => (
            <div key={lesson.id} style={{
              background: 'var(--faint)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: 20,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 20,
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.background = 'var(--primary)05';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.background = 'var(--faint)';
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <span style={{ fontSize: 20 }}>{lesson.subject.split(' ')[0]}</span>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
                    {lesson.title}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--muted)' }}>
                  <span>📅 {lesson.date}</span>
                  <span>⏰ {lesson.time}</span>
                  <span>⏱️ {lesson.duration}</span>
                </div>
                {lesson.progress > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                      <span style={{ color: 'var(--muted)' }}>Progress</span>
                      <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{lesson.progress}%</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: `${lesson.progress}%` }} />
                    </div>
                  </div>
                )}
              </div>
              <button className="btn btn-sm btn-primary">
                {lesson.progress > 0 ? 'Continue' : 'Start'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Help & Support Page
function HelpSupportPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  const categories = [
    { id: 'all', label: 'All', icon: '📚' },
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'lessons', label: 'Lessons', icon: '📖' },
    { id: 'billing', label: 'Billing', icon: '💳' },
    { id: 'technical', label: 'Technical', icon: '⚙️' }
  ];

  const faqs = [
    {
      id: 1,
      category: 'account',
      question: 'How do I change my password?',
      answer: 'Go to Settings from the profile menu in the sidebar, then click on "Security" tab. You can update your password there. Make sure to use a strong password with at least 8 characters including numbers and special characters.'
    },
    {
      id: 2,
      category: 'account',
      question: 'Can I change my username?',
      answer: 'Yes! Click on your profile in the sidebar, then click "My Profile". Click the edit button next to your username and save your changes. Note that your username must be unique and can only be changed once every 30 days.'
    },
    {
      id: 3,
      category: 'lessons',
      question: 'How do I track my progress?',
      answer: 'Your progress is automatically tracked as you complete lessons. Visit the Dashboard to see your overall progress, or check the Analytics page for detailed insights including daily activity, XP earned, and upcoming lessons.'
    },
    {
      id: 4,
      category: 'lessons',
      question: 'What happens if I miss a lesson?',
      answer: 'Don\'t worry! All lessons remain available for you to complete at your own pace. However, completing lessons on time helps maintain your streak and keeps you on track with your learning goals.'
    },
    {
      id: 5,
      category: 'lessons',
      question: 'How does the XP system work?',
      answer: 'You earn 30 XP for each lesson you complete with 100% accuracy. XP is tracked per subject and contributes to your overall level. The more XP you earn, the higher you climb in the leaderboard!'
    },
    {
      id: 6,
      category: 'billing',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers. All payments are processed securely through our payment partner.'
    },
    {
      id: 7,
      category: 'billing',
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes, you can cancel your subscription at any time from the Settings page. Your access will continue until the end of your current billing period. No refunds are provided for partial months.'
    },
    {
      id: 8,
      category: 'technical',
      question: 'The video player isn\'t working. What should I do?',
      answer: 'First, try refreshing the page. If that doesn\'t work, clear your browser cache and cookies. Make sure you\'re using an updated browser (Chrome, Firefox, Safari, or Edge). If issues persist, contact our support team.'
    },
    {
      id: 9,
      category: 'technical',
      question: 'Why can\'t I see my completed lessons?',
      answer: 'Make sure you\'re logged into the correct account. Your progress is saved automatically, but requires an internet connection. If you completed lessons as a guest, that progress won\'t transfer to your account.'
    },
    {
      id: 10,
      category: 'account',
      question: 'How do I delete my account?',
      answer: 'We\'re sorry to see you go! To delete your account, go to Settings → Account → Delete Account. Please note this action is permanent and cannot be undone. All your data, progress, and XP will be permanently deleted.'
    },
    {
      id: 11,
      category: 'lessons',
      question: 'Can I download lessons for offline viewing?',
      answer: 'Currently, offline viewing is only available for Premium subscribers. Visit your account settings to upgrade and unlock this feature along with other benefits.'
    },
    {
      id: 12,
      category: 'technical',
      question: 'How do I report a bug or technical issue?',
      answer: 'Use the feedback button in the bottom right corner of any page, or email us at support@studylink.com. Please include details about what happened, what device/browser you\'re using, and screenshots if possible.'
    }
  ];

  const filteredFAQs = selectedCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  return (
    <div className="page">
      <div style={{ marginBottom: 32 }}>
        <div className="h2" style={{ marginBottom: 8 }}>Help & Support</div>
        <div className="body">Find answers to common questions</div>
      </div>

      {/* Contact Cards */}
      <div className="grid-3 fade-up">
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Email Support</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
            Get help via email
          </div>
          <button className="btn btn-outline btn-sm">support@studylink.com</button>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Live Chat</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
            Chat with our team
          </div>
          <button className="btn btn-primary btn-sm">Start Chat</button>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Documentation</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
            Browse our guides
          </div>
          <button className="btn btn-outline btn-sm">View Docs</button>
        </div>
      </div>

      {/* Category Filters */}
      <div className="card fade-up fade-up-1">
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '10px 18px',
                background: selectedCategory === cat.id ? 'var(--primary)20' : 'var(--faint)',
                border: selectedCategory === cat.id ? '1px solid var(--primary)' : '1px solid var(--border)',
                borderRadius: 10,
                color: selectedCategory === cat.id ? 'var(--primary)' : 'var(--text)',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s'
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredFAQs.map((faq) => (
            <div key={faq.id} style={{
              background: expandedQuestion === faq.id ? 'var(--primary)05' : 'var(--faint)',
              border: '1px solid',
              borderColor: expandedQuestion === faq.id ? 'var(--primary)' : 'var(--border)',
              borderRadius: 12,
              overflow: 'hidden',
              transition: 'all 0.2s'
            }}>
              <div
                onClick={() => setExpandedQuestion(expandedQuestion === faq.id ? null : faq.id)}
                style={{
                  padding: '18px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 16
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
                  {faq.question}
                </div>
                <div style={{
                  fontSize: 20,
                  color: 'var(--muted)',
                  transition: 'transform 0.2s',
                  transform: expandedQuestion === faq.id ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>
                  ▼
                </div>
              </div>
              {expandedQuestion === faq.id && (
                <div style={{
                  padding: '0 20px 20px',
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: 'var(--muted)',
                  borderTop: '1px solid var(--border)',
                  paddingTop: 16
                }}>
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredFAQs.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-title">No questions found</div>
            <div className="empty-state-desc">Try selecting a different category</div>
          </div>
        )}
      </div>

      {/* Still Need Help */}
      <div className="card fade-up fade-up-2" style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🤝</div>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Still need help?</div>
        <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>
          Our support team is here to assist you
        </div>
        <button className="btn btn-primary">Contact Support</button>
      </div>
    </div>
  );
}

function AuthPage({ onLogin, onSkip }) {
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (isLogin) {
      if (!formData.username || !formData.password) {
        setError("Please fill in all fields");
        return;
      }
      triggerTransition(() => onLogin(formData.username, formData.password));
    } else {
      if (!formData.username || !formData.email || !formData.password) {
        setError("Please fill in all fields");
        return;
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
      triggerTransition(() => onLogin(formData.username, formData.email, formData.password, false));
    }
  };

  const handleGuestClick = () => {
    triggerTransition(() => onSkip());
  };

  const triggerTransition = (callback) => {
    setIsTransitioning(true);
    setTimeout(() => {
      callback();
      setTimeout(() => setIsTransitioning(false), 300);
    }, 600);
  };

  return (
    <div className="auth-page">
      <div className={`game-transition ${isTransitioning ? 'active' : ''}`} />
      <GeoBg />
      <div className="auth-container">
        <div className="auth-left">
          <div style={{ marginBottom: 60, position: 'relative', zIndex: 1 }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
              fontSize: 40,
              boxShadow: '0 10px 30px rgba(251,191,36,0.4)',
              animation: 'float 3s ease-in-out infinite'
            }}>🎮</div>
            <h1 className="auth-brand-name">STUDYLINK</h1>
            <p style={{ 
              fontSize: 10, 
              color: '#a78bfa',
              fontWeight: 400,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              fontFamily: "'Press Start 2P', cursive",
              textShadow: '2px 2px 0px rgba(0,0,0,0.5)',
              lineHeight: 1.8
            }}>
              Level Up Your Brain
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 28, position: 'relative', zIndex: 1 }}>
            {[
              { icon: '🏆', title: 'EARN REWARDS', desc: 'Collect XP and unlock achievements', color: '#fbbf24' },
              { icon: '⚡', title: 'POWER UP', desc: 'Build streaks and level up fast', color: '#a78bfa' },
              { icon: '🎯', title: 'COMPETE', desc: 'Challenge friends and top the leaderboard', color: '#ec4899' }
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: `linear-gradient(135deg, ${f.color}40 0%, ${f.color}20 100%)`,
                  border: `2px solid ${f.color}60`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 26,
                  flexShrink: 0,
                  boxShadow: `0 5px 15px ${f.color}30`
                }}>{f.icon}</div>
                <div>
                  <h3 style={{ 
                    fontSize: 10, 
                    fontWeight: 400, 
                    marginBottom: 8, 
                    color: '#ffffff',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    fontFamily: "'Press Start 2P', cursive",
                    textShadow: '2px 2px 0px rgba(0,0,0,0.5)',
                    lineHeight: 1.6
                  }}>{f.title}</h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="auth-right">
          <div style={{ maxWidth: 400, margin: '0 auto' }}>
            <div style={{ marginBottom: 36 }}>
              <h2 style={{ 
                fontSize: 18, 
                fontWeight: 400, 
                marginBottom: 12,
                color: '#ffffff',
                fontFamily: "'Press Start 2P', cursive",
                letterSpacing: '1px',
                lineHeight: 1.6,
                textShadow: '3px 3px 0px rgba(0,0,0,0.5), 0 0 10px rgba(168,85,247,0.5)'
              }}>
                {isLogin ? "WELCOME BACK!" : "JOIN THE GAME"}
              </h2>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                {isLogin ? "Continue your learning adventure" : "Create your account and start earning XP"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {error && (
                <div style={{
                  padding: '12px 16px',
                  background: 'rgba(255, 107, 107, 0.1)',
                  border: '1px solid rgba(255, 107, 107, 0.3)',
                  borderRadius: 10,
                  color: 'var(--coral)',
                  fontSize: 13
                }}>
                  {error}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                  Username
                </label>
                <div className="auth-input-wrap">
                  <span style={{ fontSize: 16 }}>👤</span>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                    Email
                  </label>
                  <div className="auth-input-wrap">
                    <span style={{ fontSize: 16 }}>📧</span>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                  Password
                </label>
                <div className="auth-input-wrap">
                  <span style={{ fontSize: 16 }}>🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 16
                    }}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-submit">
                {isLogin ? t("auth_sign_in") : t("auth_sign_up")}
              </button>

              <button
                type="button"
                onClick={handleGuestClick}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  fontSize: '10px',
                  fontWeight: 400,
                  marginTop: '12px',
                  background: 'linear-gradient(135deg, rgba(168,85,247,0.3) 0%, rgba(236,72,153,0.3) 100%)',
                  border: '3px solid rgba(168,85,247,0.6)',
                  color: '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  backdropFilter: 'blur(10px)',
                  fontFamily: "'Press Start 2P', cursive",
                  boxShadow: '4px 4px 0px rgba(0,0,0,0.3), inset 0 -3px 0 rgba(0,0,0,0.2)',
                  lineHeight: 1.6,
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, rgba(168,85,247,0.5) 0%, rgba(236,72,153,0.5) 100%)';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '6px 6px 0px rgba(0,0,0,0.4), 0 8px 20px rgba(168,85,247,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, rgba(168,85,247,0.3) 0%, rgba(236,72,153,0.3) 100%)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '4px 4px 0px rgba(0,0,0,0.3), inset 0 -3px 0 rgba(0,0,0,0.2)';
                }}
                onMouseDown={(e) => {
                  e.target.style.transform = 'translateY(1px) scale(0.98)';
                  e.target.style.boxShadow = '2px 2px 0px rgba(0,0,0,0.3)';
                }}
                onMouseUp={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '6px 6px 0px rgba(0,0,0,0.4), 0 8px 20px rgba(168,85,247,0.3)';
                }}
              >
                🎮 Play as Guest
              </button>
            </form>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              margin: '28px 0',
              color: 'rgba(255,255,255,0.3)',
              fontSize: 8
            }}>
              <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.1)' }} />
              <span style={{ 
                fontFamily: "'Press Start 2P', cursive", 
                letterSpacing: '2px',
                textShadow: '2px 2px 0px rgba(0,0,0,0.5)'
              }}>OR</span>
              <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.1)' }} />
            </div>

            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                {isLogin ? "New player?" : "Already have an account?"}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError("");
                    setFormData({ username: "", email: "", password: "" });
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
                    border: '3px solid #0891b2',
                    color: '#ffffff',
                    fontWeight: 400,
                    cursor: 'pointer',
                    marginLeft: 8,
                    fontSize: 10,
                    padding: '8px 16px',
                    borderRadius: '8px',
                    transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    boxShadow: '3px 3px 0px rgba(0,0,0,0.3), inset 0 -2px 0 rgba(0,0,0,0.2)',
                    fontFamily: "'Press Start 2P', cursive",
                    display: 'inline-block',
                    marginTop: '8px',
                    lineHeight: 1.6
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '5px 5px 0px rgba(0,0,0,0.4), 0 6px 16px rgba(20,184,166,0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '3px 3px 0px rgba(0,0,0,0.3), inset 0 -2px 0 rgba(0,0,0,0.2)';
                  }}
                  onMouseDown={(e) => {
                    e.target.style.transform = 'translateY(1px) scale(0.98)';
                    e.target.style.boxShadow = '1px 1px 0px rgba(0,0,0,0.3)';
                  }}
                  onMouseUp={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '5px 5px 0px rgba(0,0,0,0.4), 0 6px 16px rgba(20,184,166,0.5)';
                  }}
                >
                  {isLogin ? t("auth_sign_up") : t("auth_sign_in")}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   LANGUAGE SELECTOR MODAL
═══════════════════════════════════════════════════════════════════ */
function LanguageSelectorModal({ onClose }) {
  const { langCode, setLangCode, t } = useLanguage();
  const [hovered, setHovered] = useState(null);

  const handleSelect = (code) => {
    setLangCode(code);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(4px)'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: '32px',
          width: '90%',
          maxWidth: 560,
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
          position: 'relative'
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>
              🌐 {t('lang_modal_title')}
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'var(--faint)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--muted)',
                cursor: 'pointer',
                fontSize: 18,
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--border)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.background = 'var(--faint)'; }}
            >
              ✕
            </button>
          </div>
          <div style={{ fontSize: 14, color: 'var(--muted)' }}>{t('lang_modal_subtitle')}</div>
        </div>

        {/* Language Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 10
        }}>
          {LANGUAGES.map((lang) => {
            const isSelected = lang.code === langCode;
            const isHov = hovered === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                onMouseEnter={() => setHovered(lang.code)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 16px',
                  background: isSelected
                    ? 'var(--primary)'
                    : isHov
                    ? 'var(--faint)'
                    : 'transparent',
                  border: isSelected
                    ? '2px solid var(--primary)'
                    : '2px solid var(--border)',
                  borderRadius: 12,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  textAlign: 'left'
                }}
              >
                <span style={{ fontSize: 28, lineHeight: 1 }}>{lang.flag}</span>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: isSelected ? '#000' : 'var(--text)',
                    marginBottom: 2
                  }}>
                    {lang.nativeName}
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: isSelected ? 'rgba(0,0,0,0.7)' : 'var(--muted)'
                  }}>
                    {lang.name}
                  </div>
                </div>
                {isSelected && (
                  <span style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--primary)',
                    flexShrink: 0
                  }}>✓</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const [page, setPage] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [subject, setSubject] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [showProfilePage, setShowProfilePage] = useState(false);
  const [showLanguageSelectorModal, setShowLanguageSelectorModal] = useState(false);
  const { user, isAuthenticated, isLoading, login, signup, logout } = useAuth();
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (subject) {
      document.documentElement.setAttribute("data-subject", subject);
    } else {
      document.documentElement.setAttribute("data-subject", "home");
    }
  }, [theme, subject]);

  const handleAuth = (username, emailOrPassword, password, isLoginMode = true) => {
    if (isLoginMode) {
      const result = login(username, emailOrPassword);
      if (!result.success) {
        alert(result.error);
      }
    } else {
      const result = signup(username, emailOrPassword, password);
      if (!result.success) {
        alert(result.error);
      }
    }
  };

  const handleGuestMode = () => {
    setIsGuest(true);
  };

  const handleLogout = () => {
    logout();
    setIsGuest(false);
    setSubject(null);
  };

  const handleLogoClick = () => {
    setSubject(null);
    setPage("dashboard");
  };

  const handleSubjectSelect = (newSubject) => {
    setSubject(newSubject);
    setPage("dashboard");
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--text)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !isGuest) {
    return <AuthPage onLogin={handleAuth} onSkip={handleGuestMode} />;
  }

  const guestUser = {
    username: "Guest",
    xp: 0,
    level: 1,
    streak: 0
  };

  const currentUser = isGuest ? guestUser : user;

  // Show Host Session Page if active (full screen, no sidebar/topbar)
  // Show profile page if showProfilePage is true (full takeover, no sidebar/topbar)
  if (showProfilePage) {
    // Calculate user stats
    const totalXP = getTotalXP();
    const currentLevel = Math.floor(totalXP / 500) + 1;
    const xpInCurrentLevel = totalXP % 500;
    const xpToNextLevel = 500 - xpInCurrentLevel;
    const progressPercent = (xpInCurrentLevel / 500) * 100;
    
    // Determine league based on total XP
    let league = 'Bronze';
    let leagueEmoji = '🥉';
    let leagueColor = '#cd7f32';
    
    if (totalXP >= 5000) {
      league = 'Platinum';
      leagueEmoji = '⭐';
      leagueColor = '#e5e4e2';
    } else if (totalXP >= 3000) {
      league = 'Diamond';
      leagueEmoji = '💎';
      leagueColor = '#b9f2ff';
    } else if (totalXP >= 1500) {
      league = 'Gold';
      leagueEmoji = '🥇';
      leagueColor = '#ffd700';
    } else if (totalXP >= 500) {
      league = 'Silver';
      leagueEmoji = '🥈';
      leagueColor = '#c0c0c0';
    }

    // Calculate achievements
    const dayStreak = parseInt(localStorage.getItem('studylink_day_streak') || '14');
    const totalLessons = Math.floor(totalXP / 30);
    const totalSessions = parseInt(localStorage.getItem('studylink_sessions_joined') || '8');
    
    const achievements = [
      { id: 1, name: 'Scholar', desc: '100 XP earned', emoji: '📚', xp: 100, unlocked: totalXP >= 100 },
      { id: 2, name: 'Achiever', desc: '500 XP earned', emoji: '🎯', xp: 500, unlocked: totalXP >= 500 },
      { id: 3, name: 'Champion', desc: '1000 XP earned', emoji: '🏆', xp: 1000, unlocked: totalXP >= 1000 },
      { id: 4, name: 'Legend', desc: '2000 XP earned', emoji: '⭐', xp: 2000, unlocked: totalXP >= 2000 },
      { id: 5, name: 'Streak Master', desc: '7 day streak', emoji: '🔥', unlocked: dayStreak >= 7 },
      { id: 6, name: 'Social', desc: '3 sessions joined', emoji: '👥', unlocked: totalSessions >= 3 },
      { id: 7, name: 'Dedicated', desc: '10 lessons completed', emoji: '📖', unlocked: totalLessons >= 10 },
      { id: 8, name: 'Explorer', desc: '20 lessons completed', emoji: '🗺️', unlocked: totalLessons >= 20 },
    ];

    const unlockedCount = achievements.filter(a => a.unlocked).length;

    return (
      <>
        <GeoBg />
        <div style={{ 
          minHeight: '100vh', 
          padding: '40px 20px',
          maxWidth: 1000,
          margin: '0 auto',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Back Button */}
          <button
            onClick={() => setShowProfilePage(false)}
            style={{
              position: 'fixed',
              top: 20,
              left: 20,
              padding: '12px 20px',
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              color: 'var(--text)',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              zIndex: 100,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
          >
            ← Back
          </button>

          {/* HERO PROFILE CARD */}
          <div style={{
            background: `linear-gradient(135deg, ${leagueColor}15 0%, ${leagueColor}05 100%)`,
            border: `2px solid ${leagueColor}40`,
            borderRadius: 28,
            padding: 48,
            marginBottom: 32,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: `0 8px 32px ${leagueColor}20`
          }}>
            {/* Animated Background Particles */}
            <div style={{
              position: 'absolute',
              top: '10%',
              right: '10%',
              width: 300,
              height: 300,
              background: `radial-gradient(circle, ${leagueColor}20 0%, transparent 70%)`,
              borderRadius: '50%',
              filter: 'blur(60px)',
              animation: 'float 6s ease-in-out infinite',
              pointerEvents: 'none'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '15%',
              left: '5%',
              width: 200,
              height: 200,
              background: `radial-gradient(circle, ${leagueColor}15 0%, transparent 70%)`,
              borderRadius: '50%',
              filter: 'blur(40px)',
              animation: 'float 8s ease-in-out infinite',
              animationDelay: '1s',
              pointerEvents: 'none'
            }} />

            {/* Hero Content */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Main Avatar & Info */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, marginBottom: 32 }}>
                {/* Giant Animated Avatar */}
                <div style={{
                  position: 'relative'
                }}>
                  <div style={{
                    width: 140,
                    height: 140,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${leagueColor} 0%, ${leagueColor}cc 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 64,
                    fontWeight: 700,
                    color: '#fff',
                    border: `4px solid ${leagueColor}`,
                    boxShadow: `0 8px 32px ${leagueColor}40, 0 0 60px ${leagueColor}30`,
                    animation: 'avatarPulse 3s ease-in-out infinite',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    {currentUser?.username?.substring(0, 1).toUpperCase() || 'G'}
                  </div>
                  {/* Level Badge */}
                  <div style={{
                    position: 'absolute',
                    bottom: -10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '6px 16px',
                    background: 'var(--card)',
                    border: `2px solid ${leagueColor}`,
                    borderRadius: 20,
                    fontSize: 14,
                    fontWeight: 700,
                    color: leagueColor,
                    boxShadow: `0 4px 12px ${leagueColor}30`,
                    whiteSpace: 'nowrap',
                    zIndex: 2
                  }}>
                    Level {currentLevel}
                  </div>
                </div>

                {/* Epic Title */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    display: 'inline-block',
                    padding: '8px 20px',
                    background: `${leagueColor}20`,
                    border: `2px solid ${leagueColor}`,
                    borderRadius: 12,
                    marginBottom: 16,
                    boxShadow: `0 0 20px ${leagueColor}30`
                  }}>
                    <span style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: leagueColor,
                      textTransform: 'uppercase',
                      letterSpacing: 2
                    }}>
                      {leagueEmoji} {league} Champion
                    </span>
                  </div>

                  {/* Username */}
                  <div style={{
                    fontSize: 36,
                    fontWeight: 700,
                    color: 'var(--text)',
                    marginBottom: 8,
                    textShadow: `0 2px 10px ${leagueColor}30`
                  }}>
                    {currentUser?.username || 'Guest'}
                  </div>
                  
                  <div style={{ fontSize: 16, color: 'var(--muted)', marginBottom: 4 }}>
                    @{currentUser?.username?.toLowerCase().replace(/\s/g, '') || 'guest'}
                  </div>
                  
                  <div style={{ fontSize: 14, color: 'var(--muted)' }}>
                    Joined March 2026
                  </div>
                </div>
              </div>

              {/* XP Progress Bar to Next Level */}
              <div style={{
                background: 'var(--card)',
                border: `2px solid ${leagueColor}30`,
                borderRadius: 16,
                padding: 20,
                marginBottom: 24,
                boxShadow: `0 4px 16px ${leagueColor}15`
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12,
                  fontSize: 14,
                  fontWeight: 600
                }}>
                  <span style={{ color: 'var(--text)' }}>XP Progress</span>
                  <span style={{ color: leagueColor }}>
                    {xpInCurrentLevel} / 500 XP
                  </span>
                </div>
                
                <div style={{
                  width: '100%',
                  height: 16,
                  background: 'var(--faint)',
                  borderRadius: 20,
                  overflow: 'hidden',
                  position: 'relative',
                  border: `2px solid ${leagueColor}20`
                }}>
                  <div style={{
                    width: `${progressPercent}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${leagueColor} 0%, ${leagueColor}cc 100%)`,
                    borderRadius: 20,
                    boxShadow: `0 0 20px ${leagueColor}60`,
                    transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                      animation: 'shimmer 2s infinite'
                    }} />
                  </div>
                </div>
                
                <div style={{
                  fontSize: 12,
                  color: 'var(--muted)',
                  marginTop: 8,
                  textAlign: 'center'
                }}>
                  {xpToNextLevel} XP to Level {currentLevel + 1}
                </div>
              </div>

              {/* Quick Stats Row (Game HUD) */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: 12,
                marginBottom: 20
              }}>
                <div style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: '16px 12px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>🔥</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{dayStreak}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }}>Day Streak</div>
                </div>

                <div style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: '16px 12px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>⚡</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: leagueColor }}>{totalXP}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }}>Total XP</div>
                </div>

                <div style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: '16px 12px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>🏆</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{unlockedCount}/{achievements.length}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }}>Achievements</div>
                </div>

                <div style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: '16px 12px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>✅</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{totalLessons}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }}>Lessons</div>
                </div>
              </div>

              {/* Power-Up Badges Row */}
              <div style={{
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}>
                <div style={{
                  padding: '8px 16px',
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <span>👥</span>
                  <span>0 Following</span>
                </div>
                <div style={{
                  padding: '8px 16px',
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <span>💫</span>
                  <span>0 Followers</span>
                </div>
                <div style={{
                  padding: '8px 16px',
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <span>🎯</span>
                  <span>0 Top 3 Finishes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Section */}
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: 32,
            marginBottom: 32
          }}>
            <div className="h3" style={{ marginBottom: 24 }}>Activity</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>
              <div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>Time Spent</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>
                  {Math.floor(totalLessons * 15 / 60)}h {(totalLessons * 15) % 60}m
                </div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>Lessons Completed</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>
                  {totalLessons} <span style={{ fontSize: 13, color: 'var(--muted)' }}>({totalXP} XP)</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>Study Sessions</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>{totalSessions}</div>
              </div>
            </div>
          </div>

          {/* Achievements Grid */}
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: 32
          }}>
            <div className="h3" style={{ marginBottom: 24 }}>
              Achievements {unlockedCount > 0 && (
                <span style={{ fontSize: 16, color: 'var(--muted)', fontWeight: 400 }}>
                  ({unlockedCount}/{achievements.length} unlocked)
                </span>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 }}>
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  style={{
                    background: ach.unlocked ? 'var(--primary)10' : 'var(--faint)',
                    border: ach.unlocked ? '2px solid var(--primary)' : '1px solid var(--border)',
                    borderRadius: 16,
                    padding: 20,
                    textAlign: 'center',
                    opacity: ach.unlocked ? 1 : 0.5,
                    transition: 'all 0.3s',
                    cursor: ach.unlocked ? 'pointer' : 'default',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    if (ach.unlocked) {
                      e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {ach.unlocked && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      background: 'var(--primary)',
                      color: '#000',
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderBottomLeftRadius: 8
                    }}>
                      ✓
                    </div>
                  )}
                  <div style={{ fontSize: 48, marginBottom: 8 }}>{ach.emoji}</div>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: ach.unlocked ? 'var(--text)' : 'var(--muted)',
                    marginBottom: 4
                  }}>
                    {ach.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{ach.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <style>{`
          @keyframes avatarPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
        `}</style>
      </>
    );
  }

  if (!subject) {
    return (
      <>
        <GeoBg />
        <div className="shell" style={{ position: "relative", zIndex: 1 }}>
          <MainHomeSidebar
            collapsed={sidebarCollapsed}
            user={currentUser}
            onLogoClick={handleLogoClick}
            setPage={setPage}
            setShowProfilePage={setShowProfilePage}
            onLogout={handleLogout}
            onShowLanguageSelectorModal={() => setShowLanguageSelectorModal(true)}
          />
          <div className={`content-area ${sidebarCollapsed ? "full" : ""}`} style={{ marginLeft: sidebarCollapsed ? 0 : 300 }}>
            <TopBar
              page={page}
              collapsed={sidebarCollapsed}
              setCollapsed={setSidebarCollapsed}
              theme={theme}
              setTheme={setTheme}
              subject={subject}
              setSubject={handleSubjectSelect}
              onLogout={handleLogout}
            />
            <BlankPage />
          </div>
        </div>
        <AIChatbot />
        {showLanguageSelectorModal && (
          <LanguageSelectorModal onClose={() => setShowLanguageSelectorModal(false)} />
        )}
      </>
    );
  }

  // Subject pages (subject selected)
  const pages = {
    dashboard: () => <DashboardPage subject={subject} />,
    schedule: () => <SchedulePage subject={subject} />,
    courses: () => <CoursesPage onOpenLesson={setCurrentLesson} />,
    resources: () => <ResourcesPage subject={subject} />,
    community: () => <CommunityPage subject={subject} />,
    analytics: () => <AnalyticsPage />,
    help: () => <HelpSupportPage />,
    settings: () => <SimplePage title="Settings" emoji="⚙️" description="Manage your account settings" />,
  };
  const PageComponent = pages[page] || (() => <DashboardPage subject={subject} />);

  return (
    <>
      <GeoBg />
      <div className="shell" style={{ position: "relative", zIndex: 1 }}>
        <Sidebar
          active={page}
          setActive={setPage}
          collapsed={sidebarCollapsed}
          user={currentUser}
          onLogoClick={handleLogoClick}
          setPage={setPage}
          setShowProfilePage={setShowProfilePage}
          onLogout={handleLogout}
          onShowLanguageSelectorModal={() => setShowLanguageSelectorModal(true)}
        />
        <div className={`content-area ${sidebarCollapsed ? "full" : ""}`}>
          <TopBar
            page={page}
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
            theme={theme}
            setTheme={setTheme}
            subject={subject}
            setSubject={handleSubjectSelect}
            onLogout={handleLogout}
          />
          <PageComponent key={`${page}-${subject}`} />
        </div>
      </div>
      <AIChatbot />
      {showLanguageSelectorModal && (
        <LanguageSelectorModal onClose={() => setShowLanguageSelectorModal(false)} />
      )}
    </>
  );

}

export default function App() {
  return (
    <LanguageProvider>
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

        html {
          zoom: 1.2;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        :root {
          --bg: #0a0a0f;
          --card: #141420;
          --border: #2a2a3f;
          --text: #ffffff;
          --muted: #8e8ea0;
          --faint: #1a1a2e;
          --primary: #c8f135;
          --primary2: #a8d420;
        }

        [data-theme="light"] {
          --bg: #ffffff;
          --card: #f5f5f7;
          --border: #d1d1d6;
          --text: #000000;
          --muted: #6e6e73;
          --faint: #e5e5ea;
        }

        [data-theme="light"] .sidebar,
        [data-theme="light"] .main-home-sidebar {
          background: #f5f5f7;
          border-right-color: #d1d1d6;
        }

        [data-theme="light"] .logo-sub,
        [data-theme="light"] .main-logo-sub,
        [data-theme="light"] .nav-label,
        [data-theme="light"] .main-nav-label {
          color: #86868b;
        }

        [data-theme="light"] .nav-item,
        [data-theme="light"] .main-nav-item {
          color: #6e6e73;
        }

        [data-theme="light"] .avatar-name,
        [data-theme="light"] .main-avatar-name {
          color: #000000;
        }

        [data-subject="math"] { --primary: #3b82f6; --primary2: #2563eb; }
        [data-subject="reading"] { --primary: #ef4444; --primary2: #dc2626; }
        [data-subject="history"] { --primary: #eab308; --primary2: #ca8a04; }
        [data-subject="computer-science"] { --primary: #a78bfa; --primary2: #8b5cf6; }
        [data-subject="science"] { --primary: #22c55e; --primary2: #16a34a; }
        [data-subject="home"] { --primary: #c8f135; --primary2: #a8d420; }

        body {
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
        }

        .h1 { font-size: 36px; font-weight: 700; line-height: 1.2; }
        .h2 { font-size: 28px; font-weight: 700; line-height: 1.3; }
        .h3 { font-size: 22px; font-weight: 700; line-height: 1.4; }

        /* Animations */
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }

        /* Geometric Background */
        .geo-bg {
          position: fixed;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }

        .geo-circle {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, var(--primary)15 0%, transparent 70%);
          filter: blur(60px);
        }

        .math-sym {
          position: absolute;
          color: var(--primary);
          opacity: 0.08;
          font-weight: 700;
          animation: float 8s ease-in-out infinite;
        }

        /* Shell Layout */
        .shell {
          display: flex;
          min-height: 100vh;
        }

        /* Sidebar */
        .sidebar {
          width: 280px;
          background: #1a1d29;
          border-right: 1px solid #2a2d3a;
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          gap: 32px;
          position: fixed;
          left: 0;
          top: 0;
          height: 100vh;
          overflow-y: auto;
          transition: transform 0.3s ease;
          z-index: 100;
        }

        /* Dynamic sidebar coloring based on subject */
        [data-subject="home"] .sidebar .logo-mark,
        [data-subject="home"] .main-home-sidebar .main-logo-mark {
          color: #c8f135;
        }

        [data-subject="home"] .sidebar .nav-item.active,
        [data-subject="home"] .main-home-sidebar .main-nav-item.active {
          background: #c8f135;
          color: #0a0a0f;
        }

        [data-subject="home"] .sidebar .nav-item:hover,
        [data-subject="home"] .main-home-sidebar .main-nav-item:hover {
          background: rgba(200, 241, 53, 0.08);
          color: #c8f135;
        }

        [data-subject="home"] .sidebar .avatar-rank,
        [data-subject="home"] .main-home-sidebar .main-avatar-rank {
          color: #c8f135;
        }

        [data-subject="home"] .sidebar .avatar-zone,
        [data-subject="home"] .main-home-sidebar .main-avatar-zone {
          background: rgba(200, 241, 53, 0.08);
          border-color: rgba(200, 241, 53, 0.15);
        }

        [data-subject="home"] .sidebar .avatar-circle,
        [data-subject="home"] .main-home-sidebar .main-avatar-circle {
          background: linear-gradient(135deg, #c8f135 0%, #a8d420 100%);
        }

        /* Math - Blue */
        [data-subject="math"] .sidebar .logo-mark {
          color: #3b82f6;
        }

        [data-subject="math"] .sidebar .nav-item.active {
          background: #3b82f6;
          color: #ffffff;
        }

        [data-subject="math"] .sidebar .nav-item:hover {
          background: rgba(59, 130, 246, 0.08);
          color: #3b82f6;
        }

        [data-subject="math"] .sidebar .avatar-rank {
          color: #3b82f6;
        }

        [data-subject="math"] .sidebar .avatar-zone {
          background: rgba(59, 130, 246, 0.08);
          border-color: rgba(59, 130, 246, 0.15);
        }

        [data-subject="math"] .sidebar .avatar-circle {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        }

        /* Reading - Red */
        [data-subject="reading"] .sidebar .logo-mark {
          color: #ef4444;
        }

        [data-subject="reading"] .sidebar .nav-item.active {
          background: #ef4444;
          color: #ffffff;
        }

        [data-subject="reading"] .sidebar .nav-item:hover {
          background: rgba(239, 68, 68, 0.08);
          color: #ef4444;
        }

        [data-subject="reading"] .sidebar .avatar-rank {
          color: #ef4444;
        }

        [data-subject="reading"] .sidebar .avatar-zone {
          background: rgba(239, 68, 68, 0.08);
          border-color: rgba(239, 68, 68, 0.15);
        }

        [data-subject="reading"] .sidebar .avatar-circle {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        }

        /* History - Yellow */
        [data-subject="history"] .sidebar .logo-mark {
          color: #eab308;
        }

        [data-subject="history"] .sidebar .nav-item.active {
          background: #eab308;
          color: #0a0a0f;
        }

        [data-subject="history"] .sidebar .nav-item:hover {
          background: rgba(234, 179, 8, 0.08);
          color: #eab308;
        }

        [data-subject="history"] .sidebar .avatar-rank {
          color: #eab308;
        }

        [data-subject="history"] .sidebar .avatar-zone {
          background: rgba(234, 179, 8, 0.08);
          border-color: rgba(234, 179, 8, 0.15);
        }

        [data-subject="history"] .sidebar .avatar-circle {
          background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%);
        }

        /* Computer Science - Purple */
        [data-subject="computer-science"] .sidebar .logo-mark {
          color: #a78bfa;
        }

        [data-subject="computer-science"] .sidebar .nav-item.active {
          background: #a78bfa;
          color: #0a0a0f;
        }

        [data-subject="computer-science"] .sidebar .nav-item:hover {
          background: rgba(167, 139, 250, 0.08);
          color: #a78bfa;
        }

        [data-subject="computer-science"] .sidebar .avatar-rank {
          color: #a78bfa;
        }

        [data-subject="computer-science"] .sidebar .avatar-zone {
          background: rgba(167, 139, 250, 0.08);
          border-color: rgba(167, 139, 250, 0.15);
        }

        [data-subject="computer-science"] .sidebar .avatar-circle {
          background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
        }

        /* Science - Green */
        [data-subject="science"] .sidebar .logo-mark {
          color: #22c55e;
        }

        [data-subject="science"] .sidebar .nav-item.active {
          background: #22c55e;
          color: #0a0a0f;
        }

        [data-subject="science"] .sidebar .nav-item:hover {
          background: rgba(34, 197, 94, 0.08);
          color: #22c55e;
        }

        [data-subject="science"] .sidebar .avatar-rank {
          color: #22c55e;
        }

        [data-subject="science"] .sidebar .avatar-zone {
          background: rgba(34, 197, 94, 0.08);
          border-color: rgba(34, 197, 94, 0.15);
        }

        [data-subject="science"] .sidebar .avatar-circle {
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
        }

        .sidebar.hidden {
          transform: translateX(-100%);
        }

        .logo-zone {
          padding: 0;
          cursor: pointer;
          border-radius: 0;
          transition: opacity 0.2s;
        }

        .logo-zone:hover {
          opacity: 0.8;
        }

        .logo-mark {
          font-size: 32px;
          font-weight: 700;
          color: #c8f135;
          margin-bottom: 4px;
          letter-spacing: -1px;
          text-transform: uppercase;
          transition: color 0.3s ease;
        }

        .logo-sub {
          font-size: 11px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 3px;
          font-weight: 500;
        }

        .nav-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }

        .nav-label {
          font-size: 11px;
          font-weight: 600;
          color: #6b7280;
          padding: 0 0 12px 0;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 20px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          color: #9ca3af;
          font-size: 15px;
          font-weight: 500;
        }

        .nav-item:hover {
          background: rgba(200, 241, 53, 0.08);
          color: #c8f135;
        }

        .nav-item.active {
          background: #c8f135;
          color: #0a0a0f;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(200, 241, 53, 0.3);
        }

        .nav-item.disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .nav-item.disabled:hover {
          background: transparent;
          color: #9ca3af;
        }

        .icon {
          font-size: 20px;
          width: 24px;
          text-align: center;
          flex-shrink: 0;
        }

        .avatar-zone {
          margin-top: auto;
          padding: 16px;
          border-radius: 16px;
          background: rgba(200, 241, 53, 0.08);
          border: 1px solid rgba(200, 241, 53, 0.15);
          display: flex;
          align-items: center;
          gap: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .avatar-zone:hover {
          background: rgba(200, 241, 53, 0.12);
          border-color: rgba(200, 241, 53, 0.25);
        }

        .avatar-circle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #c8f135 0%, #a8d420 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: #0a0a0f;
          font-size: 18px;
          flex-shrink: 0;
          transition: background 0.3s ease;
        }

        .avatar-info {
          flex: 1;
          min-width: 0;
        }

        .avatar-name {
          font-size: 14px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .avatar-rank {
          font-size: 12px;
          color: #c8f135;
          font-weight: 600;
          transition: color 0.3s ease;
        }

        /* Main Home Sidebar (same styling as regular sidebar) */
        .main-home-sidebar {
          width: 280px;
          background: #1a1d29;
          border-right: 1px solid #2a2d3a;
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          gap: 32px;
          position: fixed;
          left: 0;
          top: 0;
          height: 100vh;
          overflow-y: auto;
          z-index: 100;
        }

        .main-logo-zone {
          padding: 0;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .main-logo-zone:hover {
          opacity: 0.8;
        }

        .main-logo-mark {
          font-size: 32px;
          font-weight: 700;
          color: #c8f135;
          margin-bottom: 4px;
          letter-spacing: -1px;
          text-transform: uppercase;
          transition: color 0.3s ease;
        }

        .main-logo-sub {
          font-size: 11px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 3px;
          font-weight: 500;
        }

        .main-nav-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }

        .main-nav-label {
          font-size: 11px;
          font-weight: 600;
          color: #6b7280;
          padding: 0 0 12px 0;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .main-nav-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 20px;
          border-radius: 12px;
          color: #9ca3af;
          font-size: 15px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .main-nav-item:hover {
          background: rgba(200, 241, 53, 0.08);
          color: #c8f135;
        }

        .main-nav-item.active {
          background: #c8f135;
          color: #0a0a0f;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(200, 241, 53, 0.3);
        }

        .main-icon {
          font-size: 20px;
          width: 24px;
          text-align: center;
          flex-shrink: 0;
        }

        .main-avatar-zone {
          margin-top: auto;
          padding: 16px;
          border-radius: 16px;
          background: rgba(200, 241, 53, 0.08);
          border: 1px solid rgba(200, 241, 53, 0.15);
          display: flex;
          align-items: center;
          gap: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .main-avatar-zone:hover {
          background: rgba(200, 241, 53, 0.12);
          border-color: rgba(200, 241, 53, 0.25);
        }

        .main-avatar-circle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #c8f135 0%, #a8d420 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: #0a0a0f;
          font-size: 18px;
          flex-shrink: 0;
          transition: background 0.3s ease;
        }

        .main-avatar-info {
          flex: 1;
          min-width: 0;
        }

        .main-avatar-name {
          font-size: 14px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .main-avatar-rank {
          font-size: 12px;
          color: #c8f135;
          font-weight: 600;
          transition: color 0.3s ease;
        }

        /* TopBar */
        .topbar {
          height: 70px;
          border-bottom: 1px solid var(--border);
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--card);
          position: sticky;
          top: 0;
          z-index: 50;
          gap: 16px;
        }

        .topbar-left {
          display: flex;
          align-items: center;
          gap: 20px;
          flex: 1;
          min-width: 0;
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .hamburger {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          cursor: pointer;
          font-size: 20px;
          transition: all 0.2s;
          background: var(--faint);
          border: 1px solid var(--border);
          color: var(--text);
          flex-shrink: 0;
        }

        .hamburger:hover {
          background: var(--border);
        }

        .page-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Subject Dropdown */
        .subject-dropdown {
          position: relative;
          flex-shrink: 0;
        }

        .subject-btn {
          padding: 8px 14px;
          background: var(--faint);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
          min-width: 140px;
          max-width: 160px;
          justify-content: space-between;
          white-space: nowrap;
        }

        .subject-btn:hover {
          background: var(--border);
          border-color: var(--primary);
        }

        .subject-icon {
          font-size: 16px;
          flex-shrink: 0;
        }

        .subject-menu {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 6px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
          z-index: 200;
          animation: slideDown 0.2s ease-out;
          min-width: 180px;
        }

        .subject-option {
          padding: 10px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text);
        }

        .subject-option:hover {
          background: var(--faint);
        }

        .subject-option.active {
          background: var(--primary)20;
          color: var(--primary);
          font-weight: 600;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* XP Pill - Enhanced */
        .xp-pill {
          padding: 8px 16px;
          background: linear-gradient(135deg, var(--primary)20 0%, var(--primary)10 100%);
          border: 2px solid var(--primary)40;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 700;
          color: var(--primary);
          display: inline-flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          flex-shrink: 0;
          box-shadow: 0 2px 8px var(--primary)15;
          transition: all 0.2s;
        }

        .xp-pill:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px var(--primary)20;
        }

        /* Theme Toggle */
        .theme-toggle {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: var(--faint);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 18px;
          transition: all 0.2s;
          color: var(--text);
          flex-shrink: 0;
        }

        .theme-toggle:hover {
          background: var(--border);
        }

        /* Notification Button */
        .notif-btn {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: var(--faint);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 18px;
          transition: all 0.2s;
          color: var(--text);
          flex-shrink: 0;
        }

        .notif-btn:hover {
          background: var(--border);
        }

        .notif-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          min-width: 18px;
          height: 18px;
          background: #ef4444;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
          color: #fff;
          border: 2px solid var(--card);
          padding: 0 4px;
        }

        /* Notification Panel */
        .notif-panel {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 360px;
          max-width: 90vw;
          max-height: 500px;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 12px;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
          z-index: 200;
          animation: slideDown 0.2s ease-out;
          display: flex;
          flex-direction: column;
        }

        .notif-header {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .notif-list {
          flex: 1;
          overflow-y: auto;
          max-height: 400px;
        }

        .notif-item {
          padding: 14px 20px;
          border-bottom: 1px solid var(--border);
          display: flex;
          gap: 12px;
          transition: background 0.2s;
          cursor: pointer;
        }

        .notif-item:hover {
          background: var(--faint);
        }

        .notif-item:last-child {
          border-bottom: none;
        }

        .notif-item.unread {
          background: var(--primary)05;
        }

        .notif-dot {
          width: 8px;
          height: 8px;
          background: var(--primary);
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 4px;
        }

        .notif-footer {
          padding: 12px 20px;
          border-top: 1px solid var(--border);
          text-align: center;
        }

        .notif-link {
          background: none;
          border: none;
          color: var(--primary);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          padding: 6px;
          transition: opacity 0.2s;
        }

        .notif-link:hover {
          opacity: 0.7;
        }

        /* Logout Button */
        .logout-btn {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: var(--faint);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 18px;
          transition: all 0.2s;
          color: var(--text);
          flex-shrink: 0;
        }

        .logout-btn:hover {
          background: #ef444415;
          border-color: #ef4444;
          color: #ef4444;
        }

        /* Responsive TopBar */
        @media (max-width: 900px) {
          .sidebar {
            transform: translateX(-100%);
          }

          .content-area {
            margin-left: 0 !important;
          }

          .main-home-sidebar {
            transform: translateX(-100%);
          }

          .page-title {
            font-size: 16px;
          }

          .subject-btn {
            min-width: 120px;
            max-width: 140px;
            padding: 8px 12px;
            font-size: 12px;
          }

          .xp-pill {
            padding: 6px 12px;
            font-size: 12px;
          }
        }

        @media (max-width: 640px) {
          .topbar {
            padding: 0 16px;
            height: 64px;
          }

          .topbar-left {
            gap: 12px;
          }

          .topbar-right {
            gap: 8px;
          }

          .page-title {
            display: none;
          }

          .subject-btn {
            min-width: 100px;
            padding: 8px 10px;
          }

          .hamburger,
          .theme-toggle,
          .notif-btn,
          .logout-btn {
            width: 36px;
            height: 36px;
            font-size: 16px;
          }
        }
          justify-content: center;
          cursor: pointer;
          font-size: 22px;
          transition: all 0.2s;
          color: var(--text);
        }

        .theme-toggle:hover {
          background: var(--border);
          transform: scale(1.05);
        }

        /* Notification Button */
        .notif-btn {
          position: relative;
          width: 46px;
          height: 46px;
          border-radius: 12px;
          background: var(--faint);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 22px;
          transition: all 0.2s;
          color: var(--text);
        }

        .notif-btn:hover {
          background: var(--border);
          transform: scale(1.05);
        }

        .notif-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          width: 22px;
          height: 22px;
          background: #ef4444;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          color: #fff;
          border: 2px solid var(--card);
        }

        /* Notification Panel */
        .notif-panel {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 400px;
          max-height: 500px;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 16px;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
          z-index: 200;
          animation: slideDown 0.2s ease-out;
          display: flex;
          flex-direction: column;
        }

        .notif-header {
          padding: 20px 24px 16px;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .notif-list {
          flex: 1;
          overflow-y: auto;
          max-height: 380px;
        }

        .notif-item {
          padding: 18px 24px;
          border-bottom: 1px solid var(--border);
          display: flex;
          gap: 14px;
          transition: background 0.2s;
          cursor: pointer;
        }

        .notif-item:hover {
          background: var(--faint);
        }

        .notif-item:last-child {
          border-bottom: none;
        }

        .notif-item.unread {
          background: var(--primary)05;
        }

        .notif-dot {
          width: 8px;
          height: 8px;
          background: var(--primary);
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 6px;
        }

        .notif-footer {
          padding: 14px 24px;
          border-top: 1px solid var(--border);
          text-align: center;
        }

        .notif-link {
          background: none;
          border: none;
          color: var(--primary);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          padding: 8px;
          transition: opacity 0.2s;
        }

        .notif-link:hover {
          opacity: 0.8;
        }

        /* Logout Button */
        .logout-btn {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          background: var(--faint);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 22px;
          transition: all 0.2s;
          color: var(--text);
        }

        .logout-btn:hover {
          background: #ef444420;
          border-color: #ef4444;
          color: #ef4444;
          transform: scale(1.05);
        }

        /* Content Area */
        .content-area {
          flex: 1;
          margin-left: 280px;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          transition: margin-left 0.3s ease;
        }

        .content-area.full {
          margin-left: 0;
        }

        .page {
          flex: 1;
          padding: 32px;
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
        }

        /* Buttons */
        .btn {
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-primary {
          background: var(--primary);
          color: #000;
        }

        .btn-primary:hover {
          background: var(--primary2);
          transform: translateY(-1px);
        }

        .btn-outline {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text);
        }

        .btn-outline:hover {
          background: var(--faint);
        }

        .btn-sm {
          padding: 8px 16px;
          font-size: 13px;
        }

        .btn-lime {
          background: var(--primary);
          color: #000;
        }

        /* Cards */
        .card {
          background: var(--card);
          border: 1px solid var(--border);
          borderRadius: 12px;
          padding: 24px;
        }

        /* Dropdown */
        .dropdown {
          position: relative;
        }

        .dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 8px;
          min-width: 200px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
          z-index: 1000;
        }

        .dropdown-item {
          padding: 10px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
        }

        .dropdown-item:hover {
          background: var(--faint);
        }

        .dropdown-divider {
          height: 1px;
          background: var(--border);
          margin: 8px 0;
        }

        /* Auth Page */
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #1a0b2e 0%, #2d1b4e 50%, #1a0b2e 100%);
        }

        .auth-brand-name {
          font-family: 'Press Start 2P', cursive;
          font-size: 24px;
          font-weight: 400;
          letter-spacing: 4px;
          background: linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 3px 3px 0px rgba(0,0,0,0.5);
          margin-bottom: 12px;
          line-height: 1.6;
        }

        .game-transition {
          position: fixed;
          inset: 0;
          background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
          z-index: 9999;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.6s ease;
        }

        .game-transition.active {
          opacity: 1;
        }

        .auth-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 1200px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          padding: 60px;
          align-items: center;
        }

        .auth-left {
          color: #fff;
        }

        .auth-right {
          background: rgba(20, 20, 32, 0.6);
          backdrop-filter: blur(20px);
          border: 2px solid rgba(168, 85, 247, 0.3);
          border-radius: 24px;
          padding: 48px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .auth-input-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          background: rgba(30, 30, 50, 0.5);
          border: 2px solid rgba(168, 85, 247, 0.3);
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .auth-input-wrap:focus-within {
          border-color: rgba(168, 85, 247, 0.6);
          background: rgba(30, 30, 50, 0.7);
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.2);
        }

        .auth-input-wrap input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #fff;
          font-size: 14px;
        }

        .auth-input-wrap input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        .auth-submit {
          width: 100%;
          padding: 16px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 400;
          margin-top: 12px;
          background: linear-gradient(135deg, #14f195 0%, #00d9ff 100%);
          border: 3px solid rgba(20, 241, 149, 0.6);
          color: #000;
          cursor: pointer;
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          text-transform: uppercase;
          letter-spacing: 2px;
          font-family: 'Press Start 2P', cursive;
          box-shadow: 4px 4px 0px rgba(0,0,0,0.3), inset 0 -3px 0 rgba(0,0,0,0.2);
          line-height: 1.6;
        }

        .auth-submit:hover {
          background: linear-gradient(135deg, #00d9ff 0%, #14f195 100%);
          transform: translateY(-2px);
          box-shadow: 6px 6px 0px rgba(0,0,0,0.4), 0 8px 20px rgba(20,241,149,0.4);
        }

        .auth-submit:active {
          transform: translateY(1px) scale(0.98);
          box-shadow: 2px 2px 0px rgba(0,0,0,0.3);
        }

        .auth-switch {
          text-align: center;
          margin-top: 24px;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.6);
        }

        .auth-switch button {
          background: none;
          border: none;
          color: var(--primary);
          cursor: pointer;
          font-weight: 600;
          text-decoration: underline;
        }

        /* Utility */
        .text-muted {
          color: var(--muted);
        }

        .text-primary {
          color: var(--primary);
        }

        @media (max-width: 968px) {
          .auth-container {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .auth-left {
            text-align: center;
          }

          .sidebar {
            transform: translateX(-100%);
          }

          .content-area {
            margin-left: 0;
          }
        }

        /* Dashboard & Page Content */
        .page {
          flex: 1;
          padding: 40px;
          max-width: 1600px;
          width: 100%;
          margin: 0 auto;
        }

        /* Hero Band */
        .hero-band {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 48px 40px;
          margin-bottom: 32px;
          position: relative;
          overflow: hidden;
        }

        .hero-band::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, var(--primary)15 0%, transparent 70%);
          border-radius: 50%;
          filter: blur(60px);
          pointer-events: none;
        }

        /* Badges */
        .badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          gap: 6px;
        }

        .badge-lime {
          background: var(--primary)20;
          border: 1px solid var(--primary)40;
          color: var(--primary);
        }

        /* Grid Layouts */
        .grid-4 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .grid-3 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        .grid-2 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        /* Dashboard Stat Cards */
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 24px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          border-color: var(--primary);
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, var(--primary)08 0%, transparent 60%);
          pointer-events: none;
        }

        .stat-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .stat-card-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-card-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          background: var(--primary)15;
          border: 1px solid var(--primary)30;
        }

        .stat-number {
          font-size: 40px;
          font-weight: 700;
          color: var(--primary);
          margin-bottom: 8px;
          line-height: 1;
        }

        .stat-label {
          font-size: 13px;
          color: var(--muted);
          font-weight: 500;
        }

        .stat-value {
          font-size: 36px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 8px;
          line-height: 1;
        }

        .stat-card-glow {
          position: absolute;
          top: -50%;
          right: -50%;
          width: 150px;
          height: 150px;
          border-radius: 50%;
          opacity: 0.06;
          filter: blur(40px);
          pointer-events: none;
        }

        /* Card Component */
        .card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 28px;
          margin-bottom: 24px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border);
        }

        .card-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
        }

        /* Spacing Utilities */
        .mt-24 {
          margin-top: 24px;
        }

        .mt-32 {
          margin-top: 32px;
        }

        .mb-24 {
          margin-bottom: 24px;
        }

        .mb-32 {
          margin-bottom: 32px;
        }

        /* Text Utilities */
        .lime {
          color: var(--primary);
        }

        .body {
          font-size: 15px;
          color: var(--muted);
          line-height: 1.6;
        }

        /* Flex Utilities */
        .flex-between {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        /* Animations */
        .fade-up {
          animation: fadeUp 0.6s ease-out;
        }

        .fade-up-1 {
          animation-delay: 0.1s;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .fade-up-2 {
          animation-delay: 0.2s;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Micro-Animations - Buttons */
        button {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        button:active {
          transform: scale(0.95);
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .btn:active {
          transform: translateY(0);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .btn-primary:hover,
        .btn-lime:hover {
          box-shadow: 0 4px 16px var(--primary)40;
        }

        /* Micro-Animations - Cards */
        .stat-card,
        .card,
        .course-card,
        .session-card,
        .exam-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .stat-card:hover,
        .course-card:hover,
        .session-card:hover,
        .exam-card:hover {
          transform: translateY(-6px) scale(1.02);
        }

        .card:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        /* Micro-Animations - Interactive Elements */
        .nav-item,
        .main-nav-item,
        .subject-option,
        .dropdown-item {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .nav-item:active,
        .subject-option:active {
          transform: scale(0.98);
        }

        /* Avatar Animations */
        .avatar-circle,
        .main-avatar-circle,
        .lb-avatar {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .avatar-zone:hover .avatar-circle,
        .main-avatar-zone:hover .main-avatar-circle {
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 4px 12px var(--primary)30;
        }

        .lb-avatar:hover {
          transform: scale(1.15) rotate(-5deg);
        }

        /* Badge Animations */
        .badge {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .badge:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 2px 8px currentColor;
        }

        /* TopBar Element Animations */
        .hamburger,
        .theme-toggle,
        .notif-btn,
        .logout-btn {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hamburger:active,
        .theme-toggle:active,
        .notif-btn:active,
        .logout-btn:active {
          transform: scale(0.9);
        }

        .theme-toggle:hover {
          transform: rotate(180deg) scale(1.1);
        }

        .notif-btn:hover {
          animation: wiggle 0.5s ease-in-out;
        }

        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-10deg); }
          75% { transform: rotate(10deg); }
        }

        /* XP Pill Animation */
        .xp-pill {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .xp-pill::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s;
        }

        .xp-pill:hover::before {
          left: 100%;
        }

        .xp-pill:active {
          transform: scale(0.95);
        }

        /* Progress Bar Animation */
        .progress-bar-fill {
          position: relative;
          animation: progressGrow 1s ease-out;
        }

        @keyframes progressGrow {
          from {
            width: 0;
          }
        }

        /* Input Focus Animations */
        input, textarea, select {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        input:focus, textarea:focus, select:focus {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px var(--primary)20;
        }

        /* Activity Item Animation */
        .activity-item {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .activity-icon {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .activity-item:hover .activity-icon {
          transform: scale(1.2) rotate(10deg);
        }

        /* Leaderboard Row Animation */
        .lb-row {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .lb-row:active {
          transform: scale(0.98);
        }

        /* Link Animations */
        a {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        a:hover {
          transform: translateX(2px);
        }

        /* Logo Animation */
        .logo-mark,
        .main-logo-mark {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .logo-zone:hover .logo-mark,
        .main-logo-zone:hover .main-logo-mark {
          transform: scale(1.05);
          text-shadow: 0 0 20px currentColor;
        }

        /* Notification Badge Pulse */
        .notif-badge {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }

        /* Dropdown Menu Animation */
        .dropdown-menu,
        .subject-menu,
        .notif-panel {
          animation: dropIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes dropIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Stat Number Count Animation */
        .stat-number,
        .stat-value {
          animation: countUp 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes countUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Icon Hover Effects */
        .icon {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: inline-block;
        }

        .nav-item:hover .icon,
        .main-nav-item:hover .icon {
          transform: scale(1.2) translateY(-2px);
        }

        /* Sidebar Transition */
        .sidebar,
        .main-home-sidebar {
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Page Title Animation */
        .page-title {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Hero Band Animation */
        .hero-band {
          animation: slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Loading Spinner */
        .loading-spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Shimmer Effect for Placeholders */
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        /* Glow Effect */
        .stat-card-glow {
          animation: glow 3s ease-in-out infinite;
        }

        @keyframes glow {
          0%, 100% {
            opacity: 0.05;
            transform: scale(1);
          }
          50% {
            opacity: 0.08;
            transform: scale(1.1);
          }
        }

        /* Scale on Load for Emojis */
        .stat-card-icon {
          animation: emojiPop 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes emojiPop {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        /* Hover Effect on Course/Exam Tags */
        .course-tag,
        .exam-tag {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .course-tag:hover,
        .exam-tag:hover {
          transform: translateY(-2px);
          background: var(--primary)20;
          color: var(--primary);
        }

        /* Difficulty Badge Animation */
        .difficulty-badge {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .difficulty-badge:hover {
          transform: scale(1.1) rotate(-3deg);
        }

        /* Answer Option Animation */
        .answer-option {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .answer-option:hover {
          transform: translateX(8px);
        }

        .answer-option.correct {
          animation: correctPulse 0.6s ease-out;
        }

        .answer-option.incorrect {
          animation: shake 0.5s ease-out;
        }

        @keyframes correctPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-10px);
          }
          75% {
            transform: translateX(10px);
          }
        }

        /* Tab Animation */
        .tab {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .tab::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 2px;
          background: var(--primary);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform: translateX(-50%);
        }

        .tab:hover::after {
          width: 100%;
        }

        .tab.active::after {
          width: 100%;
        }

        /* Chatbot Button Animation */
        .chatbot-button {
          animation: float 3s ease-in-out infinite;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .chatbot-button:hover {
          animation: none;
          transform: scale(1.15) rotate(10deg);
        }

        .chatbot-button:active {
          transform: scale(0.95);
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        /* Message Bubble Animation */
        .chatbot-message {
          animation: messageSlide 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes messageSlide {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Smooth Scroll */
        * {
          scroll-behavior: smooth;
        }

        /* Focus Visible for Accessibility */
        *:focus-visible {
          outline: 2px solid var(--primary);
          outline-offset: 2px;
          animation: focusPulse 0.6s ease-out;
        }

        @keyframes focusPulse {
          0% {
            outline-width: 0;
          }
          100% {
            outline-width: 2px;
          }
        }

        /* Progress Bars */
        .progress-bar-container {
          margin-top: 16px;
        }

        .progress-bar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          font-size: 13px;
          font-weight: 600;
        }

        .progress-bar-bg {
          width: 100%;
          height: 10px;
          background: var(--faint);
          border-radius: 10px;
          overflow: hidden;
          position: relative;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary) 0%, var(--primary2) 100%);
          border-radius: 10px;
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .progress-bar-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        /* Activity Feed */
        .activity-feed {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 24px;
        }

        .activity-item {
          display: flex;
          gap: 16px;
          padding: 16px 0;
          border-bottom: 1px solid var(--border);
          transition: all 0.2s;
        }

        .activity-item:hover {
          padding-left: 8px;
          background: var(--faint);
          margin: 0 -8px;
          padding-right: 8px;
          border-radius: 8px;
        }

        .activity-item:last-child {
          border-bottom: none;
        }

        .activity-icon {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
          background: var(--faint);
          border: 1px solid var(--border);
        }

        .activity-content {
          flex: 1;
          min-width: 0;
        }

        .activity-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 4px;
          line-height: 1.4;
        }

        .activity-time {
          font-size: 12px;
          color: var(--muted);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .page {
            padding: 24px 20px;
          }

          .hero-band {
            padding: 32px 24px;
          }

          .card {
            padding: 20px;
          }

          .grid-4,
          .grid-3,
          .grid-2,
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Leaderboard Styles */
        .lb-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 10px;
          transition: all 0.2s;
          background: var(--faint);
          border: 1px solid var(--border);
        }

        .lb-row:hover {
          transform: translateX(4px);
          background: var(--card);
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .lb-row.me {
          background: var(--primary)08;
          border: 1px solid var(--primary)30;
          box-shadow: 0 0 0 1px var(--primary)20;
        }

        .lb-row.me:hover {
          background: var(--primary)12;
          border-color: var(--primary)40;
        }

        .lb-rank {
          font-size: 16px;
          font-weight: 700;
          min-width: 36px;
          text-align: center;
          flex-shrink: 0;
        }

        .lb-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          flex-shrink: 0;
          border: 2px solid currentColor;
        }

        .lb-name {
          flex: 1;
          min-width: 0;
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .lb-pts {
          font-size: 14px;
          font-weight: 700;
          color: var(--primary);
          flex-shrink: 0;
          white-space: nowrap;
        }

        /* Badge Variations */
        .badge-amber {
          background: #fbbf2420;
          border: 1px solid #fbbf2440;
          color: #fbbf24;
        }

        .badge-teal {
          background: #2dd4bf20;
          border: 1px solid #2dd4bf40;
          color: #2dd4bf;
        }

        .badge-purple {
          background: #a78bfa20;
          border: 1px solid #a78bfa40;
          color: #a78bfa;
        }

        .badge-coral {
          background: #ff6b6b20;
          border: 1px solid #ff6b6b40;
          color: #ff6b6b;
        }

        /* Course Cards */
        .course-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        .course-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .course-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
          border-color: var(--primary);
        }

        .course-badge {
          display: inline-block;
          padding: 4px 12px;
          background: var(--primary)20;
          border: 1px solid var(--primary)40;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          color: var(--primary);
          margin-bottom: 12px;
        }

        .course-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 8px;
          color: var(--text);
        }

        .course-desc {
          font-size: 13px;
          color: var(--muted);
          margin-bottom: 16px;
          line-height: 1.6;
        }

        .course-meta {
          display: flex;
          gap: 16px;
          font-size: 12px;
          color: var(--muted);
        }

        /* Session Cards */
        .session-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 16px;
          transition: all 0.3s ease;
        }

        .session-card:hover {
          border-color: var(--primary);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .session-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .session-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 4px;
        }

        .session-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          font-size: 13px;
          color: var(--muted);
          margin-bottom: 12px;
        }

        .session-meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .session-actions {
          display: flex;
          gap: 8px;
        }

        /* Calendar */
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;
          margin-top: 16px;
        }

        .calendar-day {
          aspect-ratio: 1;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .calendar-day:hover {
          background: var(--faint);
          border-color: var(--primary);
        }

        .calendar-day.today {
          background: var(--primary);
          color: #000;
          border-color: var(--primary);
        }

        .calendar-day.has-event {
          position: relative;
        }

        .calendar-day.has-event::after {
          content: '';
          position: absolute;
          bottom: 4px;
          width: 4px;
          height: 4px;
          background: var(--primary);
          border-radius: 50%;
        }

        /* Tabs */
        .tabs {
          display: flex;
          gap: 8px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 24px;
        }

        .tab {
          padding: 12px 20px;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          color: var(--muted);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tab:hover {
          color: var(--text);
        }

        .tab.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }

        /* Exam Cards */
        .exam-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
        }

        .exam-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .exam-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text);
        }

        .difficulty-badge {
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
        }

        .difficulty-badge.easy {
          background: #22c55e20;
          color: #22c55e;
          border: 1px solid #22c55e40;
        }

        .difficulty-badge.medium {
          background: #eab30820;
          color: #eab308;
          border: 1px solid #eab30840;
        }

        .difficulty-badge.hard {
          background: #ef444420;
          color: #ef4444;
          border: 1px solid #ef444440;
        }

        .exam-meta {
          display: flex;
          gap: 16px;
          font-size: 13px;
          color: var(--muted);
          margin-bottom: 12px;
        }

        .exam-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .exam-tag {
          padding: 4px 10px;
          background: var(--faint);
          border-radius: 6px;
          font-size: 11px;
          color: var(--muted);
        }

        /* XP Pill */
        .xp-pill {
          padding: 8px 16px;
          background: var(--primary)20;
          border: 1px solid var(--primary)40;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 700;
          color: var(--primary);
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        /* Theme Toggle */
        .theme-toggle {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: var(--faint);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 18px;
          transition: all 0.2s;
        }

        .theme-toggle:hover {
          background: var(--border);
        }

        /* Subject Dropdown */
        .subject-dropdown {
          position: relative;
        }

        .subject-btn {
          padding: 8px 16px;
          background: var(--faint);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .subject-btn:hover {
          background: var(--border);
        }

        /* Notification Bell */
        .notification-bell {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: var(--faint);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 18px;
          transition: all 0.2s;
        }

        .notification-bell:hover {
          background: var(--border);
        }

        .notification-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 18px;
          height: 18px;
          background: #ef4444;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
          color: #fff;
        }

        /* Logout Button */
        .logout-btn {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: var(--faint);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 18px;
          transition: all 0.2s;
          color: var(--text);
        }

        .logout-btn:hover {
          background: #ef444420;
          border-color: #ef4444;
          color: #ef4444;
        }

        /* Lesson Page */
        .lesson-container {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 24px;
          height: calc(100vh - 40px);
          padding: 20px;
        }

        .lesson-video {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
        }

        .lesson-video-placeholder {
          flex: 1;
          background: var(--bg);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          margin-bottom: 20px;
        }

        .lesson-questions {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 24px;
          overflow-y: auto;
        }

        .question-card {
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .question-text {
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 16px;
          color: var(--text);
        }

        .answer-option {
          padding: 12px 16px;
          background: var(--card);
          border: 2px solid var(--border);
          border-radius: 8px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
        }

        .answer-option:hover {
          border-color: var(--primary);
          background: var(--primary)10;
        }

        .answer-option.selected {
          border-color: var(--primary);
          background: var(--primary)20;
        }

        .answer-option.correct {
          border-color: #22c55e;
          background: #22c55e20;
        }

        .answer-option.incorrect {
          border-color: #ef4444;
          background: #ef444420;
        }

        /* Empty States */
        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-state-icon {
          font-size: 64px;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .empty-state-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
          color: var(--text);
        }

        .empty-state-desc {
          font-size: 14px;
          color: var(--muted);
        }

        /* Loading States */
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--faint);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Scrollbar Styling */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: var(--bg);
        }

        ::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: var(--muted);
        }

        /* ChatBot */
        .chatbot-button {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary2) 100%);
          border: none;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          z-index: 1000;
          transition: all 0.3s;
        }

        .chatbot-button:hover {
          transform: scale(1.1);
          box-shadow: 0 12px 32px rgba(0,0,0,0.4);
        }

        .chatbot-window {
          position: fixed;
          bottom: 100px;
          right: 24px;
          width: 380px;
          height: 550px;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 16px;
          box-shadow: 0 12px 48px rgba(0,0,0,0.3);
          display: flex;
          flex-direction: column;
          z-index: 1000;
        }

        .chatbot-header {
          padding: 20px;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .chatbot-messages {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
        }

        .chatbot-message {
          margin-bottom: 16px;
        }

        .chatbot-message.user {
          text-align: right;
        }

        .chatbot-message-bubble {
          display: inline-block;
          padding: 12px 16px;
          border-radius: 12px;
          max-width: 80%;
          font-size: 14px;
          line-height: 1.5;
        }

        .chatbot-message.user .chatbot-message-bubble {
          background: var(--primary);
          color: #000;
        }

        .chatbot-message.bot .chatbot-message-bubble {
          background: var(--faint);
          color: var(--text);
        }

        .chatbot-input-area {
          padding: 20px;
          border-top: 1px solid var(--border);
          display: flex;
          gap: 12px;
        }

        .chatbot-input {
          flex: 1;
          padding: 12px 16px;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text);
          font-size: 14px;
          outline: none;
        }

        .chatbot-input:focus {
          border-color: var(--primary);
        }

        .chatbot-send {
          padding: 12px 20px;
          background: var(--primary);
          border: none;
          border-radius: 8px;
          color: #000;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .chatbot-send:hover {
          background: var(--primary2);
        }
      `}</style>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </>
    </LanguageProvider>
  );
}