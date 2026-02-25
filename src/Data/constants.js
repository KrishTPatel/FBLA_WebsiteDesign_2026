// src/data/constants.js

export const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "⬡" },
  { id: "schedule",  label: "Schedule",  icon: "◷" },
  { id: "resources", label: "Resources", icon: "◈" },
  { id: "community", label: "Community", icon: "◉" },
];

export const generateStreak = () => {
  const cells = [];
  for (let i = 0; i < 84; i++) {
    const r = Math.random();
    cells.push(r > .7 ? "level-4" : r > .5 ? "level-3" : r > .3 ? "level-2" : r > .15 ? "level-1" : "");
  }
  return cells;
};

export const STREAK_DATA = generateStreak();

export const TOPICS = ["All", "Calculus", "Algebra", "Geometry", "Statistics", "Linear Algebra"];

export const ACTIVITY = [
  { text: "Completed 'Derivatives' lesson", time: "2h ago", dot: "var(--lime)" },
  { text: "Scored 90% on Algebra Quiz", time: "Yesterday", dot: "var(--teal)" },
];

export const COMPLETED_TOPICS = [
  { name: "Algebra", pct: 100, color: "lime" },
  { name: "Calculus", pct: 72, color: "teal" },
];