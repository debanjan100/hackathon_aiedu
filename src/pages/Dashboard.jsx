import React, { useState, useEffect, useRef } from 'react';
import { Typography, Button, Tooltip, Badge } from 'antd';
import { TrendingUp, Award, Clock, BookOpen, Activity, ChevronRight, Zap, PlayCircle, Calendar, Target, Flame, Brain, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import PaymentModal from '../components/PaymentModal';
import Leaderboard from '../components/Leaderboard';
import GreetingBanner from '../components/GreetingBanner';
import toast from 'react-hot-toast';

const { Title, Text } = Typography;

// ── Daily Challenge (one per day of week) ──
const DAILY_CHALLENGES = [
  { name: 'Two Sum',                     difficulty: 'Easy',   day: 0 },
  { name: 'Valid Parentheses',           difficulty: 'Easy',   day: 1 },
  { name: 'Merge Intervals',             difficulty: 'Medium', day: 2 },
  { name: 'LRU Cache',                   difficulty: 'Medium', day: 3 },
  { name: 'Word Break',                  difficulty: 'Medium', day: 4 },
  { name: 'Trapping Rain Water',         difficulty: 'Hard',   day: 5 },
  { name: 'Median of Two Sorted Arrays', difficulty: 'Hard',   day: 6 },
];

const STUDY_TIPS = [
  '💡 Practice sliding window problems daily — they appear in 30% of interviews.',
  '💡 Always clarify edge cases (empty array, single element) before coding.',
  '💡 Time complexity matters more than space in most interviews.',
  '💡 Draw the recursion tree for any DP problem before coding.',
  '💡 Binary search works on any monotonic function, not just sorted arrays.',
  '💡 Hash maps reduce O(n²) solutions to O(n) — use them aggressively.',
  '💡 For graph problems, always ask: directed or undirected? Weighted?',
];

// ── Countdown to midnight IST ──
const useMidnightCountdown = () => {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      const midnight = new Date(ist);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight - ist;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return timeLeft;
};

const getDayOfWeek = () => {
  const ist = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  return ist.getDay();
};

const getTodayKey = () => {
  const ist = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  return `${ist.getFullYear()}-${ist.getMonth()}-${ist.getDate()}`;
};

/** Circular progress ring — SVG-based */
const CircleProgress = ({ percent, size = 100, strokeWidth = 8, color = '#00D8D6', label, sublabel, tooltipText }) => {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;
  return (
    <Tooltip title={tooltipText} color="#121224">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Track — uses CSS variable so it's visible in light mode */}
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--progress-track, rgba(255,255,255,0.08))" strokeWidth={strokeWidth} />
          <motion.circle
            cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={color} strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - dash }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <div style={{ textAlign: 'center', marginTop: -4 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--on-surface)' }}>{label}</div>
          {sublabel && <div style={{ fontSize: 11, color: 'var(--on-surface-muted)', marginTop: 2 }}>{sublabel}</div>}
        </div>
      </div>
    </Tooltip>
  );
};

const BigCircleProgress = ({ percent }) => {
  const size = 180, strokeWidth = 12, r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--progress-track, rgba(255,255,255,0.08))" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="var(--primary)" strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          filter="url(#glow)"
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 32, fontWeight: 800, color: 'var(--primary)' }}>{percent}%</span>
      </div>
    </div>
  );
};

/* ── DSA Topics for rings ── */
const DSA_TOPICS = [
  { name: 'Arrays',  score: 75, color: '#00D8D6', tip: 'Master pointers to reach 100%' },
  { name: 'Graphs',  score: 40, color: '#7C3AED', tip: 'Focus on BFS/DFS traversal' },
  { name: 'Hashing', score: 90, color: '#0EA5E9', tip: 'Excellent collision handling skills' },
];

/* ── Quick Stats Bar ── */
const QuickStatsBar = ({ xp, streak }) => {
  const stats = [
    { icon: '🔥', value: `${streak}-day`, label: 'streak' },
    { icon: '⚡', value: `${xp} XP`, label: 'today' },
    { icon: '✅', value: '0', label: 'solved today' },
    { icon: '📚', value: '2', label: 'topics reviewed' },
  ];
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          whileHover={{ scale: 1.05 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--surface-container)',
            border: '1px solid var(--border-color)',
            borderRadius: 9999,
            padding: '8px 16px',
            cursor: 'default',
            transition: 'all 0.2s ease',
          }}
        >
          <span style={{ fontSize: 16 }}>{s.icon}</span>
          <span style={{ fontWeight: 700, color: 'var(--on-surface)', fontSize: 14 }}>{s.value}</span>
          <span style={{ color: 'var(--on-surface-muted)', fontSize: 13 }}>{s.label}</span>
        </motion.div>
      ))}
    </div>
  );
};

/* ── Study Tip Banner ── */
const StudyTipBanner = () => {
  const todayKey = `tip-dismissed-${getTodayKey()}`;
  const [visible, setVisible] = useState(() => !localStorage.getItem(todayKey));
  const dayIdx = getDayOfWeek();
  const tip = STUDY_TIPS[dayIdx];
  if (!visible) return null;
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, padding: '12px 16px', marginBottom: 24, borderRadius: 12,
        background: 'rgba(245,158,11,0.08)',
        border: '1px solid rgba(245,158,11,0.25)',
        borderLeft: '4px solid #F59E0B',
      }}
    >
      <span style={{ color: 'var(--on-surface)', fontSize: 14, flex: 1 }}>{tip}</span>
      <button
        onClick={() => { setVisible(false); localStorage.setItem(todayKey, '1'); }}
        style={{ background: 'none', border: 'none', color: 'var(--on-surface-muted)', cursor: 'pointer', fontSize: 18, lineHeight: 1, flexShrink: 0 }}
      >×</button>
    </motion.div>
  );
};

/* ── Streak Reminder Banner ── */
const StreakReminderBanner = ({ navigate, streak }) => {
  const bannerKey = `streak-banner-dismissed-${getTodayKey()}`;
  const solvedKey = `solved-today-${getTodayKey()}`;
  const [dismissed, setDismissed] = useState(() => !!localStorage.getItem(bannerKey));
  const solvedToday = parseInt(localStorage.getItem(solvedKey) || '0');

  // Auto-dismiss success banner after 5s
  useEffect(() => {
    if (solvedToday > 0 && !dismissed) {
      const t = setTimeout(() => setDismissed(true), 5000);
      return () => clearTimeout(t);
    }
  }, [solvedToday, dismissed]);

  if (dismissed) return null;

  const isGood = solvedToday > 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, padding: '12px 18px', marginBottom: 20, borderRadius: 14,
        background: isGood ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.07)',
        border: `1px solid ${isGood ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.25)'}`,
        borderLeft: `4px solid ${isGood ? '#10b981' : '#ef4444'}`,
      }}
    >
      <span style={{ fontSize: 15, flex: 1, color: 'var(--on-surface)' }}>
        {isGood
          ? `✅ Great work today! Your ${streak}-day streak is safe.`
          : `🔥 Keep your streak alive! You haven't solved a problem today.`
        }
      </span>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        {!isGood && (
          <button
            onClick={() => navigate('/dashboard/practice')}
            style={{
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#ef4444', borderRadius: 9999, padding: '4px 14px', fontWeight: 700,
              fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >Solve Now</button>
        )}
        <button
          onClick={() => { setDismissed(true); localStorage.setItem(bannerKey, '1'); }}
          style={{ background: 'none', border: 'none', color: 'var(--on-surface-muted)', cursor: 'pointer', fontSize: 16 }}
        >×</button>
      </div>
    </motion.div>
  );
};


/* ── Daily Challenge Card ── */
const DailyChallengeCard = ({ navigate, cardStyle }) => {
  const dayIdx = getDayOfWeek();
  const challenge = DAILY_CHALLENGES[dayIdx];
  const todayKey = `challenge-done-${getTodayKey()}`;
  const [done, setDone] = useState(() => !!localStorage.getItem(todayKey));
  const [xpPop, setXpPop] = useState(false);
  const countdown = useMidnightCountdown();

  // Deterministic "solvers today" count based on date seed
  const seed = new Date().toDateString().split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const solversToday = 127 + (seed % 73);

  const diffColor = challenge.difficulty === 'Easy' ? '#10B981' : challenge.difficulty === 'Medium' ? '#F59E0B' : '#EF4444';
  const diffBg = challenge.difficulty === 'Easy' ? 'rgba(16,185,129,0.12)' : challenge.difficulty === 'Medium' ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)';

  const handleSolve = () => {
    setDone(true);
    setXpPop(true);
    localStorage.setItem(todayKey, '1');
    setTimeout(() => setXpPop(false), 2500);
    setTimeout(() => navigate('/dashboard/practice'), 400);
  };

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } } }}
      whileHover={{ y: -4 }}
      style={{
        ...cardStyle,
        background: 'var(--surface-container-lowest)',
        border: '2px solid transparent',
        backgroundClip: 'padding-box',
        position: 'relative',
        overflow: 'visible',
      }}
    >
      {/* Animated gradient border */}
      <div style={{
        position: 'absolute', inset: -2, borderRadius: '1.5rem', zIndex: -1,
        background: 'linear-gradient(135deg, var(--primary), var(--secondary), var(--primary))',
        backgroundSize: '200% 200%',
        animation: 'gradientSpin 4s linear infinite',
        opacity: 0.6,
      }} />
      <style>{`@keyframes gradientSpin { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }`}</style>

      {/* +50 XP popup */}
      <AnimatePresence>
        {xpPop && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.8 }}
            animate={{ opacity: 1, y: -40, scale: 1.1 }}
            exit={{ opacity: 0, y: -80, scale: 0.8 }}
            style={{ position: 'absolute', top: 20, right: 20, background: 'linear-gradient(135deg, #faad14, #ff6b35)', color: '#000', borderRadius: 9999, padding: '4px 14px', fontWeight: 900, fontSize: 14, zIndex: 20 }}
          >
            +50 XP 🎉
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Target size={18} color="var(--primary)" />
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--on-surface)' }}>🎯 Daily Challenge</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--on-surface-muted)', fontFamily: 'monospace', background: 'var(--surface-container)', padding: '3px 9px', borderRadius: 9999 }}>
          ⏰ {countdown}
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--on-surface)', marginBottom: 8 }}>{challenge.name}</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ background: diffBg, color: diffColor, border: `1px solid ${diffColor}44`, borderRadius: 9999, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
            {challenge.difficulty}
          </span>
          <span style={{ fontSize: 11, color: 'var(--on-surface-muted)' }}>+50 XP Bonus</span>
          <span style={{ fontSize: 11, color: 'var(--on-surface-muted)' }}>👥 {solversToday} solved today</span>
        </div>
      </div>

      {done ? (
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10B981', fontWeight: 700, fontSize: 14, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 9999, padding: '8px 16px' }}>
          ✅ Completed! +50 XP earned today.
        </motion.div>
      ) : (
        <Button
          type="primary"
          style={{ background: 'linear-gradient(135deg, var(--primary-container), var(--primary))', border: 'none', borderRadius: 9999, fontWeight: 700, color: '#003333', height: 38 }}
          onClick={handleSolve}
        >
          Solve Challenge +50 XP →
        </Button>
      )}
    </motion.div>
  );
};

/* ── Smart Path Roadmap ── */
const ROADMAP_STEPS = [
  { topic: 'Arrays',         pct: 75, next: 'Sliding Window',  icon: '📦', navTopic: 'Arrays' },
  { topic: 'Sliding Window', pct: 55, next: 'Two Pointers',    icon: '🪟', navTopic: 'Arrays' },
  { topic: 'Two Pointers',   pct: 40, next: 'Binary Search',   icon: '👆👆', navTopic: 'Pointers' },
  { topic: 'Binary Search',  pct: 30, next: 'Hash Maps',       icon: '🔍', navTopic: 'Sorting' },
  { topic: 'Hash Maps',      pct: 20, next: 'Trees & Graphs',  icon: '🗺️', navTopic: 'Graphs' },
];

const SmartPathCard = ({ navigate, cardStyle, shouldReduceMotion, hoverEffect, cardVariant }) => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div variants={cardVariant} whileHover={shouldReduceMotion ? {} : hoverEffect} style={cardStyle}>
      <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--on-surface)', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Smart Path Analysis
        <span style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate('/dashboard/analytics')}>Deep Dive →</span>
      </div>

      {/* Topic rings */}
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start', marginBottom: 20 }}>
        {DSA_TOPICS.map((t) => (
          <motion.div key={t.name} whileHover={{ scale: 1.05 }} style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard/practice')}>
            <CircleProgress percent={t.score} size={80} strokeWidth={5} color={t.color} label={`${t.score}%`} sublabel={t.name} tooltipText={t.tip} />
          </motion.div>
        ))}
      </div>

      {/* Roadmap nodes */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 14 }}>
        <div style={{ fontSize: 12, color: 'var(--on-surface-muted)', fontWeight: 600, marginBottom: 10 }}>📍 Recommended Learning Path</div>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: 36, borderRadius: 10, background: 'var(--surface-container-high)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
            {ROADMAP_STEPS.map((step, i) => (
              <motion.div
                key={step.topic}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -2 }}
                onClick={() => navigate('/dashboard/practice')}
                style={{
                  flexShrink: 0,
                  padding: '8px 12px',
                  borderRadius: 10,
                  background: step.pct >= 70 ? 'rgba(0,216,214,0.1)' : step.pct >= 40 ? 'rgba(213,186,255,0.08)' : 'var(--surface-container)',
                  border: `1px solid ${step.pct >= 70 ? 'rgba(0,216,214,0.3)' : 'var(--border-color)'}`,
                  cursor: 'pointer',
                  textAlign: 'center',
                  minWidth: 80,
                }}>
                <div style={{ fontSize: 14 }}>{step.icon}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--on-surface)', marginTop: 3 }}>{step.topic}</div>
                <div style={{ height: 3, borderRadius: 2, background: 'var(--border-color)', marginTop: 5, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${step.pct}%`, background: step.pct >= 70 ? 'var(--primary)' : '#d5baff', borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: 9, color: 'var(--on-surface-muted)', marginTop: 2 }}>{step.pct}%</div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

/* ── Main Dashboard ── */
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(5);
  const [isPremiumActive, setIsPremiumActive] = useState(
    user?.user_metadata?.isPremium === true || user?.isPremium === true
  );
  const [problemSets, setProblemSets] = useState([]);
  const shouldReduceMotion = useReducedMotion();
  const milestoneShownRef = useRef(false);

  useEffect(() => {
    if (user?.id) {
      supabase.from('progress').select('xp_gained').eq('user_id', user.id)
        .then(({ data }) => {
          if (data?.length) {
            const total = data.reduce((a, c) => a + (c.xp_gained || 0), 0);
            setXp(total);
            // XP Milestone toast
            if (!milestoneShownRef.current) {
              const milestones = [50, 100, 200, 500];
              const lastKey = 'last-milestone-shown';
              const lastShown = parseInt(localStorage.getItem(lastKey) || '0');
              const crossed = milestones.filter(m => total >= m && m > lastShown).pop();
              if (crossed) {
                const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'you';
                toast(`🎉 You crossed ${crossed} XP! Keep it up, ${firstName}!`, {
                  style: { background: '#121224', color: '#00D8D6', border: '1px solid rgba(0,216,214,0.4)', fontWeight: 600 },
                  duration: 5000,
                });
                localStorage.setItem(lastKey, String(crossed));
                milestoneShownRef.current = true;
              }
            }
          }
        });

      supabase.from('problem_sets').select('*').eq('user_id', user.id).order('last_activity', { ascending: false })
        .then(({ data }) => { if (data) setProblemSets(data); });

      supabase.from('profiles').select('streak').eq('id', user.id).single()
        .then(({ data }) => { if (data?.streak) setStreak(data.streak); });
    }
  }, [user]);

  const level = user?.user_metadata?.skillLevel || 'Intermediate';
  const dailyGoalXP = 150;
  const todayXP = 45;
  const goalPercent = Math.min((todayXP / dailyGoalXP) * 100, 100);

  // Heatmap
  const weeks = Array.from({ length: 4 }).map(() =>
    Array.from({ length: 7 }).map(() => Math.random() > 0.6 ? Math.floor(Math.random() * 4) + 1 : 0)
  );

  const cardStyle = {
    background: 'rgba(17,24,39,0.75)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(73,238,248,0.08)',
    borderRadius: '1.5rem',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    height: '100%',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    overflow: 'hidden',
  };

  const hoverEffect = {
    y: -4,
    boxShadow: '0 16px 40px rgba(0, 216, 214, 0.12)',
    borderColor: 'rgba(73,238,248,0.2)',
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const cardVariant = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', paddingBottom: 60 }}>
      {/* ── Greeting Banner ── */}
      <GreetingBanner />

      {/* ── Streak Reminder Banner ── */}
      <StreakReminderBanner navigate={navigate} streak={streak} />

      {/* ── Quick Stats Bar ── */}
      <QuickStatsBar xp={todayXP} streak={streak} />

      {/* ── Study Tip of the Day ── */}
      <StudyTipBanner />


      <motion.div
        className="dashboard-grid"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {/* ── CARD 1: OVERALL PROGRESS & XP ── */}
        <motion.div variants={cardVariant} whileHover={shouldReduceMotion ? {} : hoverEffect} style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--on-surface)' }}>Mastery & XP Tracker</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 28, flex: 1 }}>
            <BigCircleProgress percent={70} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <Title level={3} style={{ color: 'var(--on-surface)', margin: '0 0 4px 0', fontWeight: 800 }}>{level} Level</Title>
              <Text style={{ color: 'var(--on-surface-muted)', fontSize: 15 }}>70% Overall Mastery</Text>

              <div style={{ marginTop: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--on-surface)', fontWeight: 600 }}>Daily Goal</span>
                  <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700 }}>{todayXP} / {dailyGoalXP} XP</span>
                </div>
                <div style={{ height: 8, background: 'var(--progress-track, rgba(255,255,255,0.05))', borderRadius: 4, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${goalPercent}%` }} transition={{ duration: 1, delay: 0.5 }}
                    style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--secondary))', borderRadius: 4 }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── CARD 2: NEXT TOPIC & STREAK ── */}
        <motion.div variants={cardVariant} whileHover={shouldReduceMotion ? {} : hoverEffect} style={cardStyle}>
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--on-surface)', marginBottom: 20 }}>Activity & Next Steps</div>

          <div style={{ background: 'rgba(0, 153, 170, 0.06)', border: '1px solid rgba(0, 153, 170, 0.2)', padding: 16, borderRadius: 16, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, background: 'var(--primary)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={24} color="#003333" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: 'var(--on-surface-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Next Recommended Topic</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--on-surface)' }}>Dynamic Programming - Base</div>
                <div style={{ fontSize: 13, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                   <Clock size={12} /> ~45 mins est.
                </div>
              </div>
              <Button type="primary" shape="circle" icon={<PlayCircle size={20} />} style={{ background: 'var(--secondary)', border: 'none', width: 40, height: 40 }} onClick={() => navigate('/dashboard/practice')} />
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 14, color: 'var(--on-surface)', fontWeight: 600 }}>30-Day Streak</span>
              <span style={{ fontSize: 12, color: 'var(--on-surface-muted)' }}>🔥 {streak} days active</span>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {weeks.map((week, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {week.map((day, j) => (
                    <Tooltip key={`${i}-${j}`} title={day > 0 ? `${day} activities` : 'No activity'}>
                      <div style={{ width: 14, height: 14, borderRadius: 3, background: day === 0 ? 'var(--progress-track, rgba(255,255,255,0.05))' : day < 3 ? 'rgba(0,153,170,0.3)' : day < 5 ? 'rgba(0,153,170,0.6)' : 'var(--primary)' }} />
                    </Tooltip>
                  ))}
                </div>
              ))}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                 <div style={{ textAlign: 'center' }}>
                   <Calendar size={32} color="var(--on-surface-muted)" style={{ marginBottom: 4, opacity: 0.3 }} />
                   <div style={{ fontSize: 10, color: 'var(--on-surface-muted)' }}>Consistency mapping</div>
                 </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── CARD 3: SMART PATH (RINGS + ROADMAP) ── */}
        <SmartPathCard navigate={navigate} cardStyle={cardStyle} shouldReduceMotion={shouldReduceMotion} hoverEffect={hoverEffect} cardVariant={cardVariant} />


        {/* ── CARD 4: LEADERBOARD ── */}
        <motion.div variants={cardVariant} whileHover={shouldReduceMotion ? {} : hoverEffect} style={{ ...cardStyle }}>
           <Leaderboard />
        </motion.div>

        {/* ── CARD 5: DAILY CHALLENGE ── */}
        <DailyChallengeCard navigate={navigate} cardStyle={cardStyle} />

        {/* ── CARD 6: PROBLEM SETS (full width) ── */}
        <motion.div variants={cardVariant} whileHover={shouldReduceMotion ? {} : hoverEffect} style={{ ...cardStyle, gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--on-surface)' }}>Recommended Problem Sets</span>
            <Button type="link" style={{ color: 'var(--primary)' }} onClick={() => navigate('/dashboard/practice')}>View All</Button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            {problemSets.map((item) => {
              const diffColor = item.difficulty === 'Easy' ? '#10b981' : item.difficulty === 'Medium' ? '#f59e0b' : '#ef4444';
              return (
              <motion.div
                key={item.id}
                whileHover={{ background: 'var(--surface-container-high)' }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px',
                  borderRadius: 16, background: 'var(--surface-container)', border: '1px solid var(--border-color)',
                  cursor: 'pointer', transition: 'background 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Activity size={18} color={diffColor} />
                  </div>
                  <div>
                    <div style={{ color: 'var(--on-surface)', fontWeight: 600, fontSize: 14 }}>{item.title}</div>
                    <div style={{ color: 'var(--on-surface-muted)', fontSize: 12, marginTop: 4 }}>
                      {new Date(item.last_activity).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <Badge count={item.difficulty} style={{ backgroundColor: `${diffColor}20`, color: diffColor, borderColor: diffColor, fontWeight: 700 }} />
                  <Button type="primary" size="small" style={{ background: 'var(--secondary)', border: 'none', borderRadius: 10 }}>Solve Now</Button>
                </div>
              </motion.div>
            )})}
            {problemSets.length === 0 && (
               <div style={{ color: 'var(--on-surface-muted)', padding: 12 }}>No custom problem sets loaded yet. Start practicing to see them here!</div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* ── Premium Banner ── */}
      {!isPremiumActive && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          style={{
            background: 'linear-gradient(45deg, rgba(124, 58, 237, 0.08), rgba(0, 153, 170, 0.08))',
            border: '1px solid rgba(124, 58, 237, 0.25)',
            borderRadius: '1.5rem',
            padding: '24px 32px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: 32, flexWrap: 'wrap', gap: 16
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Award size={24} color="var(--primary)" />
              <span style={{ color: 'var(--on-surface)', fontWeight: 800, fontSize: 20 }}>Upgrade to Premium</span>
            </div>
            <Text style={{ color: 'var(--on-surface-variant)', fontSize: 15 }}>
              Unlock 1-on-1 AI mock interviews, deep-dive analytics, and exclusive DSA sets.
            </Text>
          </div>
          <PaymentModal
            user={user}
            onSuccess={() => setIsPremiumActive(true)}
            buttonProps={{
              size: 'large',
              style: { background: 'var(--primary)', color: '#003333', border: 'none', fontWeight: 800, borderRadius: 9999, height: 48, padding: '0 32px' }
            }}
          />
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
