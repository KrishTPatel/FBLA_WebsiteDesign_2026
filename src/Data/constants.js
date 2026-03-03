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

export const SESSIONS = [
  { id: 1, day: "MON", date: "17", time: "4:00 PM", title: "Calculus: Derivatives Deep Dive", host: "Alex R.", type: "Tutoring", color: "#c8f135", attendees: 8, topic: "Calculus" },
  { id: 2, day: "MON", date: "17", time: "6:30 PM", title: "Statistics Study Group", host: "Priya K.", type: "Group Study", color: "#2dd4bf", attendees: 5, topic: "Statistics" },
  { id: 3, day: "TUE", date: "18", time: "3:30 PM", title: "Algebra II: Quadratics & Parabolas", host: "Marcus T.", type: "Tutoring", color: "#a78bfa", attendees: 12, topic: "Algebra" },
  { id: 4, day: "WED", date: "19", time: "5:00 PM", title: "Geometry Proof Workshop", host: "Lena S.", type: "Workshop", color: "#fbbf24", attendees: 7, topic: "Geometry" },
  { id: 5, day: "THU", date: "20", time: "4:00 PM", title: "Linear Algebra Basics", host: "Omar J.", type: "Tutoring", color: "#ff6b6b", attendees: 10, topic: "Linear Algebra" },
  { id: 6, day: "FRI", date: "21", time: "2:00 PM", title: "Problem Solving Marathon", host: "Zoe W.", type: "Group Study", color: "#60a5fa", attendees: 20, topic: "Mixed" },
  { id: 7, day: "SAT", date: "22", time: "11:00 AM", title: "SAT Math Prep Session", host: "David M.", type: "Workshop", color: "#c8f135", attendees: 15, topic: "Test Prep" },
];

export const RESOURCES = [
  { id: 1, type: "lesson", title: "Introduction to Derivatives", desc: "Master the foundational rules of differentiation with step-by-step worked examples.", emoji: "📐", color: "#c8f135", bg: "rgba(200,241,53,.12)", difficulty: "Intermediate", duration: "25 min", xp: 120, topic: "Calculus" },
  { id: 2, type: "video", title: "Visualizing the Chain Rule", desc: "An animated walkthrough showing how the chain rule works geometrically.", emoji: "🎬", color: "#60a5fa", bg: "rgba(96,165,250,.12)", difficulty: "Intermediate", duration: "12 min", xp: 80, topic: "Calculus" },
  { id: 3, type: "quiz", title: "Algebra Foundations Quiz", desc: "Test your knowledge of linear equations, inequalities, and factoring.", emoji: "🧪", color: "#a78bfa", bg: "rgba(167,139,250,.12)", difficulty: "Beginner", duration: "10 min", xp: 60, topic: "Algebra" },
  { id: 4, type: "lesson", title: "Matrix Multiplication", desc: "Understand matrix operations and their real-world applications in transformations.", emoji: "🔢", color: "#2dd4bf", bg: "rgba(45,212,191,.12)", difficulty: "Advanced", duration: "30 min", xp: 150, topic: "Linear Algebra" },
  { id: 5, type: "download", title: "Geometry Formula Sheet", desc: "A comprehensive printable reference for area, perimeter, and volume formulas.", emoji: "📄", color: "#fbbf24", bg: "rgba(251,191,36,.12)", difficulty: "All Levels", duration: "Reference", xp: 20, topic: "Geometry" },
  { id: 6, type: "video", title: "Normal Distribution Explained", desc: "From bell curves to z-scores — statistics made intuitive with real data examples.", emoji: "📊", color: "#ff6b6b", bg: "rgba(255,107,107,.12)", difficulty: "Intermediate", duration: "18 min", xp: 90, topic: "Statistics" },
];

export const QUIZ_QUESTIONS = [
  {
    q: "What is the derivative of f(x) = 3x² + 2x − 5?",
    opts: ["6x + 2", "3x + 2", "6x − 5", "x² + 2"],
    answer: 0,
    explanation: "Using the power rule: d/dx(3x²) = 6x, d/dx(2x) = 2, d/dx(−5) = 0. So f'(x) = 6x + 2."
  },
  {
    q: "Which of the following is the quadratic formula?",
    opts: [
      "x = (−b ± √(b²−4ac)) / 2a",
      "x = (b ± √(b²+4ac)) / 2a",
      "x = (−b ± √(b²−4ac)) / a",
      "x = −b/2a"
    ],
    answer: 0,
    explanation: "The quadratic formula solves ax² + bx + c = 0 and gives x = (−b ± √(b²−4ac)) / 2a."
  },
  {
    q: "What is the area of a circle with radius r?",
    opts: ["πr²", "2πr", "πr", "2πr²"],
    answer: 0,
    explanation: "The area of a circle is A = πr². Note: 2πr is the circumference!"
  },
];

export const LEADERBOARD = [
  { name: "Alex R.", pts: 4820, avatar: "AR", color: "#c8f135" },
  { name: "Priya K.", pts: 4210, avatar: "PK", color: "#60a5fa" },
  { name: "Marcus T.", pts: 3870, avatar: "MT", color: "#a78bfa" },
  { name: "You", pts: 3240, avatar: "ME", color: "#2dd4bf", isMe: true },
  { name: "Lena S.", pts: 2990, avatar: "LS", color: "#fbbf24" },
  { name: "Omar J.", pts: 2750, avatar: "OJ", color: "#ff6b6b" },
];

export const COMPLETED_TOPICS = [
  { name: "Algebra Basics", pct: 100, color: "lime" },
  { name: "Calculus I", pct: 72, color: "teal" },
  { name: "Statistics", pct: 55, color: "purple" },
  { name: "Geometry", pct: 40, color: "" },
  { name: "Linear Algebra", pct: 20, color: "coral" },
];

export const ACTIVITY = [
  { text: "Completed 'Derivatives Deep Dive' lesson", time: "2h ago", dot: "#c8f135", icon: "✓" },
  { text: "Scored 90% on Algebra Quiz", time: "Yesterday", dot: "#2dd4bf", icon: "★" },
  { text: "Joined Statistics Study Group", time: "2 days ago", dot: "#60a5fa", icon: "◎" },
  { text: "Earned 'Geometry Master' badge", time: "3 days ago", dot: "#fbbf24", icon: "◆" },
  { text: "Watched 'Chain Rule' video (12 min)", time: "4 days ago", dot: "#a78bfa", icon: "▶" },
];

export const NOTIFICATIONS = [
  {
    id: 1,
    type: "session",
    icon: "🎓",
    bg: "rgba(200,241,53,.12)",
    color: "#c8f135",
    title: "Session starting soon",
    desc: "Your Calculus session with Mr. Thompson starts in 1 hour",
    time: "58 min ago",
    unread: true,
    action: "View Session"
  },
  {
    id: 2,
    type: "achievement",
    icon: "🏆",
    bg: "rgba(251,191,36,.12)",
    color: "#fbbf24",
    title: "New achievement unlocked!",
    desc: "You've earned the 'Geometry Master' badge for completing 10 geometry lessons",
    time: "2 hours ago",
    unread: true,
    action: "View Badge"
  },
  {
    id: 3,
    type: "message",
    icon: "💬",
    bg: "rgba(96,165,250,.12)",
    color: "#60a5fa",
    title: "New message from Alex R.",
    desc: "Hey! Want to join the study group for tomorrow's calculus exam?",
    time: "3 hours ago",
    unread: true,
    action: "Reply"
  },
  {
    id: 4,
    type: "reminder",
    icon: "⏰",
    bg: "rgba(167,139,250,.12)",
    color: "#a78bfa",
    title: "Daily goal reminder",
    desc: "You're 50 XP away from completing your daily goal. Keep going!",
    time: "5 hours ago",
    unread: false,
    action: "Continue"
  },
  {
    id: 5,
    type: "resource",
    icon: "📚",
    bg: "rgba(45,212,191,.12)",
    color: "#2dd4bf",
    title: "New resource available",
    desc: "Marcus T. just uploaded 'Advanced Integration Techniques' video",
    time: "Yesterday",
    unread: false,
    action: "Watch Now"
  },
  {
    id: 6,
    type: "streak",
    icon: "🔥",
    bg: "rgba(255,107,107,.12)",
    color: "#ff6b6b",
    title: "Streak milestone!",
    desc: "Congratulations! You've maintained a 14-day study streak",
    time: "Yesterday",
    unread: false,
    action: "Share"
  },
  {
    id: 7,
    type: "group",
    icon: "👥",
    bg: "rgba(200,241,53,.12)",
    color: "#c8f135",
    title: "Group study invitation",
    desc: "Priya K. invited you to join 'Statistics Study Group' this Friday",
    time: "2 days ago",
    unread: false,
    action: "Accept"
  },
];