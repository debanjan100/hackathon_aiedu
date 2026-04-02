import React, { useState, useEffect } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
} from 'recharts';
import { motion, useInView } from 'framer-motion';
import { Flame, Zap, Trophy, Code2, TrendingUp, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

/* ── Weekly Progress Data (Line chart) ── */
const WEEKLY_PROGRESS = [
  { week: 'W1', problems: 8,  accuracy: 62 },
  { week: 'W2', problems: 12, accuracy: 68 },
  { week: 'W3', problems: 10, accuracy: 71 },
  { week: 'W4', problems: 18, accuracy: 75 },
  { week: 'W5', problems: 22, accuracy: 78 },
  { week: 'W6', problems: 15, accuracy: 80 },
  { week: 'W7', problems: 25, accuracy: 82 },
  { week: 'W8', problems: 20, accuracy: 85 },
];

/* ── Accuracy per Topic (Bar chart) ── */
const TOPIC_ACCURACY = [
  { topic: 'Arrays', accuracy: 88, color: '#49eef8' },
  { topic: 'Strings', accuracy: 72, color: '#d5baff' },
  { topic: 'Trees', accuracy: 55, color: '#4ade80' },
  { topic: 'Graphs', accuracy: 42, color: '#f59e0b' },
  { topic: 'DP', accuracy: 35, color: '#ef4444' },
  { topic: 'Sorting', accuracy: 82, color: '#60a5fa' },
];

/* ── AI Insights ── */
const AI_INSIGHTS = [
  { type: 'strong', topic: 'Arrays', message: 'Your Array skills are top-tier! 85% mastery — keep challenging yourself with Hard problems.', color: '#10b981', emoji: '💪' },
  { type: 'strong', topic: 'Hashing', message: 'Excellent hash map usage! Consider exploring rolling hash and Bloom filters next.', color: '#10b981', emoji: '⭐' },
  { type: 'weak', topic: 'Graphs', message: 'Graphs need attention — focus on BFS/DFS and practice 3 graph problems daily.', color: '#f59e0b', emoji: '⚠️' },
  { type: 'weak', topic: 'Dynamic Programming', message: 'DP is your biggest gap. Start with 1D bottom-up problems, then work to 2D.', color: '#ef4444', emoji: '🚨' },
];

const TOPIC_MASTERY = [
  { topic: 'Arrays',   score: 85 },
  { topic: 'Strings',  score: 60 },
  { topic: 'Trees',    score: 50 },
  { topic: 'Graphs',   score: 40 },
  { topic: 'DP',       score: 35 },
  { topic: 'Sorting',  score: 75 },
  { topic: 'Greedy',   score: 55 },
  { topic: 'Pointers', score: 70 },
];

const DIFF_DATA = [
  { name: 'Easy',   value: 42, color: '#10b981' },
  { name: 'Medium', value: 28, color: '#f59e0b' },
  { name: 'Hard',   value: 7,  color: '#ef4444' },
];

const RECENT_SUBMISSIONS = [
  { problem: 'Two Sum',                difficulty: 'Easy',   lang: 'Python',     status: 'Accepted',     time: '28ms'  },
  { problem: 'Merge Intervals',        difficulty: 'Medium', lang: 'C++',        status: 'Accepted',     time: '56ms'  },
  { problem: 'LRU Cache',              difficulty: 'Hard',   lang: 'Python',     status: 'Wrong Answer', time: '—'     },
  { problem: 'Valid Parentheses',      difficulty: 'Easy',   lang: 'JavaScript', status: 'Accepted',     time: '32ms'  },
  { problem: 'Reverse Linked List',    difficulty: 'Easy',   lang: 'Python',     status: 'Accepted',     time: '24ms'  },
  { problem: 'Binary Tree Height',     difficulty: 'Medium', lang: 'Java',       status: 'Accepted',     time: '44ms'  },
  { problem: 'Dijkstra\'s Algorithm',  difficulty: 'Hard',   lang: 'C++',        status: 'TLE',          time: '>2s'   },
  { problem: 'Missing Number',         difficulty: 'Easy',   lang: 'Python',     status: 'Accepted',     time: '20ms'  },
  { problem: 'Word Break',             difficulty: 'Medium', lang: 'Python',     status: 'Wrong Answer', time: '—'     },
  { problem: 'Jump Game',              difficulty: 'Medium', lang: 'Python',     status: 'Accepted',     time: '48ms'  },
];

/* ── Activity Heatmap — 26 weeks × 7 days ── */
const generateHeatmap = () =>
  Array.from({ length: 26 }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const daysAgo = (25 - w) * 7 + (6 - d);
      if (daysAgo > 180) return 0;
      return Math.random() > 0.55 ? Math.floor(Math.random() * 5) + 1 : 0;
    })
  );

const HEATMAP = generateHeatmap();

const getHeatColor = (val) => {
  if (val === 0) return 'var(--surface-container-highest, rgba(255,255,255,0.06))';
  if (val === 1) return 'rgba(0,216,214,0.2)';
  if (val === 2) return 'rgba(0,216,214,0.4)';
  if (val === 3) return 'rgba(0,216,214,0.6)';
  return 'var(--primary, #00d8d6)';
};

const statusColor = (s) => s === 'Accepted' ? '#10b981' : s === 'TLE' ? '#f59e0b' : '#ef4444';
const diffColor   = (d) => d === 'Easy' ? '#10b981' : d === 'Medium' ? '#f59e0b' : '#ef4444';

const cardBase = {
  background: 'rgba(17,24,39,0.8)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(73,238,248,0.08)',
  borderRadius: '1.5rem',
  padding: 28,
  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  transition: 'all 0.3s ease',
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { delay, duration: 0.5, type: 'spring' },
});

/* ── Scroll-triggered Animated Number ── */
const AnimatedStat = ({ value, color, isString = false }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = React.useState(0);
  React.useEffect(() => {
    if (!isInView || isString) return;
    const num = typeof value === 'number' ? value : parseInt(value);
    if (isNaN(num)) return;
    let start = 0;
    const step = Math.ceil(num / 40);
    const t = setInterval(() => {
      start = Math.min(start + step, num);
      setCount(start);
      if (start >= num) clearInterval(t);
    }, 25);
    return () => clearInterval(t);
  }, [isInView, value, isString]);
  return <span ref={ref} style={{ color }}>{isString ? value : count}</span>;
};

/* ── Custom Radar tick ── */
const CustomRadarTick = ({ x, y, payload }) => (
  <text x={x} y={y} textAnchor="middle" fill="var(--on-surface-muted, #94a3b8)" fontSize={11} fontWeight={500}>{payload.value}</text>
);

const Analytics = () => {
  const { user } = useAuth();
  const [xp, setXp] = useState(0);
  const [loading, setLoading] = useState(true);
  const currentStreak = 5;
  const longestStreak = 12;
  const totalSolved = DIFF_DATA.reduce((a, b) => a + b.value, 0);

  useEffect(() => {
    if (user?.id) {
      supabase.from('progress').select('xp_gained').eq('user_id', user.id)
        .then(({ data }) => {
          if (data?.length) setXp(data.reduce((a, c) => a + (c.xp_gained || 0), 0));
          setLoading(false);
        }).catch(() => setLoading(false));
    } else {
      setXp(350);
      setLoading(false);
    }
  }, [user]);

  const level = Math.floor(xp / 100) + 1;
  const xpInLevel = xp % 100;
  const xpForNext = 100;

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 20px 60px', color: 'var(--on-surface)' }}>

      {/* Header */}
      <motion.div {...fadeUp(0)} style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 900, margin: 0, letterSpacing: '-0.02em', color: 'var(--on-surface)' }}>Analytics Dashboard</h2>
        <p style={{ color: 'var(--on-surface-muted)', margin: '6px 0 0', fontSize: 15 }}>Your complete coding journey at a glance.</p>
      </motion.div>

      {/* ── TOP STAT CARDS ── */}
      <div className="analytics-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { icon: <Code2 size={20} color="#10b981" />, label: 'Problems Solved', value: totalSolved, color: '#10b981' },
          { icon: <Flame size={20} color="#f59e0b" />, label: 'Current Streak',  value: `${currentStreak}d`, color: '#f59e0b' },
          { icon: <Trophy size={20} color="#a855f7" />, label: 'Longest Streak', value: `${longestStreak}d`, color: '#a855f7' },
          { icon: <Zap size={20} color="var(--primary)" />, label: 'Total XP',  value: xp, color: 'var(--primary)' },
          { icon: <TrendingUp size={20} color="#60a5fa" />, label: 'Level',      value: `Lv ${level}`, color: '#60a5fa' },
          { icon: <Clock size={20} color="#fb7185" />, label: 'Study Hours',     value: '84h', color: '#fb7185' },
        ].map((s, i) => (
          <motion.div key={s.label} {...fadeUp(0.05 * i)} whileHover={{ y: -4, boxShadow: `0 12px 40px ${s.color}20`, borderColor: `${s.color}30` }} style={{ ...cardBase, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, background: `radial-gradient(circle, ${s.color}12, transparent 70%)`, pointerEvents: 'none' }} />
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `${s.color}15`, border: `1px solid ${s.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--on-surface-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontSize: 26, fontWeight: 900 }}><AnimatedStat value={s.value} color={s.color} isString={typeof s.value === 'string'} /></div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── MAIN CHART GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 20 }}>

        {/* Radar — Topic Mastery */}
        <motion.div {...fadeUp(0.15)} style={{ ...cardBase }}>
          <h3 style={{ margin: '0 0 18px', fontWeight: 700, fontSize: 15, color: 'var(--on-surface)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--secondary, #d5baff)' }} />
            Topic Mastery
          </h3>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={TOPIC_MASTERY} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="topic" tick={<CustomRadarTick />} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Mastery" dataKey="score" stroke="#d5baff" fill="#d5baff" fillOpacity={0.25} strokeWidth={2} dot={{ r: 3, fill: '#d5baff' }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 12, color: '#fff', fontSize: 12 }} formatter={(v) => [`${v}%`, 'Mastery']} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Doughnut — Problems by Difficulty */}
        <motion.div {...fadeUp(0.2)} style={{ ...cardBase, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 18px', fontWeight: 700, fontSize: 15, color: 'var(--on-surface)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
            Problems by Difficulty
          </h3>
          <div style={{ flex: 1, minHeight: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={DIFF_DATA} dataKey="value" cx="50%" cy="50%" innerRadius="45%" outerRadius="70%" paddingAngle={4} stroke="none">
                  {DIFF_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 12, color: '#fff', fontSize: 12 }} />
                <Legend iconType="circle" formatter={(v) => <span style={{ color: 'var(--on-surface-muted)', fontSize: 12 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 8 }}>
            {DIFF_DATA.map(d => (
              <div key={d.name} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: d.color }}>{d.value}</div>
                <div style={{ fontSize: 11, color: 'var(--on-surface-muted)' }}>{d.name}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* XP Progress + Streak */}
        <motion.div {...fadeUp(0.25)} style={{ ...cardBase, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* XP Bar */}
          <div>
            <h3 style={{ margin: '0 0 14px', fontWeight: 700, fontSize: 15, color: 'var(--on-surface)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)' }} />
              XP Progress — Level {level}
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--on-surface-muted)' }}>{xpInLevel} XP</span>
              <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700 }}>{xpForNext - xpInLevel} XP to Lv {level + 1}</span>
            </div>
            <div style={{ height: 12, background: 'var(--surface-container-highest, rgba(255,255,255,0.06))', borderRadius: 6, overflow: 'hidden' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${xpInLevel}%` }} transition={{ duration: 1.2, ease: 'easeOut' }}
                style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--secondary))', borderRadius: 6, boxShadow: '0 0 12px rgba(0,216,214,0.5)' }} />
            </div>
            <div style={{ marginTop: 10, fontSize: 13, color: 'var(--on-surface-muted)' }}>Total XP: <strong style={{ color: 'var(--on-surface)' }}>{xp}</strong></div>
          </div>

          {/* Streak */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 20 }}>
            <h3 style={{ margin: '0 0 14px', fontWeight: 700, fontSize: 15, color: 'var(--on-surface)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Flame size={16} color="#f59e0b" /> Solve Streaks
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[{ label: 'Current Streak', value: currentStreak, color: '#f59e0b', icon: '🔥' }, { label: 'Longest Streak', value: longestStreak, color: '#a855f7', icon: '🏆' }].map(s => (
                <div key={s.label} style={{ background: 'var(--surface-container)', borderRadius: 14, padding: '14px 16px', textAlign: 'center', border: `1px solid ${s.color}25` }}>
                  <div style={{ fontSize: 28 }}>{s.icon}</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: s.color, lineHeight: 1.2 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--on-surface-muted)', marginTop: 3 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── ACTIVITY HEATMAP ── */}
      <motion.div {...fadeUp(0.3)} style={{ ...cardBase, marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 18px', fontWeight: 700, fontSize: 15, color: 'var(--on-surface)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)' }} />
          Activity Heatmap — Last 6 Months
        </h3>
        <div style={{ overflowX: 'auto', paddingBottom: 6 }}>
          <div style={{ display: 'flex', gap: 3, minWidth: 560 }}>
            {HEATMAP.map((week, wi) => (
              <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {week.map((day, di) => (
                  <div
                    key={di}
                    title={day > 0 ? `${day} problem${day > 1 ? 's' : ''} solved` : 'No activity'}
                    style={{ width: 12, height: 12, borderRadius: 2, background: getHeatColor(day), cursor: 'default', transition: 'transform 0.15s', flexShrink: 0 }}
                    onMouseEnter={e => e.target.style.transform = 'scale(1.4)'}
                    onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
          <span style={{ fontSize: 11, color: 'var(--on-surface-muted)' }}>Less</span>
          {[0, 1, 2, 3, 4].map(v => <div key={v} style={{ width: 10, height: 10, borderRadius: 2, background: getHeatColor(v) }} />)}
          <span style={{ fontSize: 11, color: 'var(--on-surface-muted)' }}>More</span>
        </div>
      </motion.div>

      {/* ── RECENT SUBMISSIONS TABLE ── */}
      <motion.div {...fadeUp(0.35)} style={{ ...cardBase }}>
        <h3 style={{ margin: '0 0 18px', fontWeight: 700, fontSize: 15, color: 'var(--on-surface)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#60a5fa' }} />
          Recent Submissions
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                {['Problem', 'Difficulty', 'Language', 'Status', 'Time'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--on-surface-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECENT_SUBMISSIONS.map((s, i) => (
                <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.04 * i }}
                  style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-container, rgba(255,255,255,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '10px 12px', fontSize: 13, color: 'var(--on-surface)', fontWeight: 500 }}>{s.problem}</td>
                  <td style={{ padding: '10px 12px' }}><span style={{ background: `${diffColor(s.difficulty)}18`, color: diffColor(s.difficulty), borderRadius: 9999, padding: '2px 9px', fontSize: 11, fontWeight: 700 }}>{s.difficulty}</span></td>
                  <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--on-surface-muted)' }}>{s.lang}</td>
                  <td style={{ padding: '10px 12px' }}><span style={{ color: statusColor(s.status), fontSize: 12, fontWeight: 700 }}>{s.status}</span></td>
                  <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--on-surface-muted)', fontFamily: 'monospace' }}>{s.time}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ── PROGRESS LINE CHART + BAR CHART GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20, marginBottom: 20 }}>
        {/* Progress Over Time (Area Chart) */}
        <motion.div {...fadeUp(0.4)} style={{ ...cardBase }}>
          <h3 style={{ margin: '0 0 18px', fontWeight: 700, fontSize: 15, color: 'var(--on-surface)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#49eef8' }} />
            Progress Over Time
          </h3>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={WEEKLY_PROGRESS} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                <defs>
                  <linearGradient id="colorProblems" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#49eef8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#49eef8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d5baff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#d5baff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 12, color: '#fff', fontSize: 12 }} />
                <Area type="monotone" dataKey="problems" stroke="#49eef8" fill="url(#colorProblems)" strokeWidth={2} dot={{ r: 3, fill: '#49eef8' }} name="Problems Solved" />
                <Area type="monotone" dataKey="accuracy" stroke="#d5baff" fill="url(#colorAccuracy)" strokeWidth={2} dot={{ r: 3, fill: '#d5baff' }} name="Accuracy %" />
                <Legend iconType="circle" formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{v}</span>} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Accuracy per Topic (Bar Chart) */}
        <motion.div {...fadeUp(0.45)} style={{ ...cardBase }}>
          <h3 style={{ margin: '0 0 18px', fontWeight: 700, fontSize: 15, color: 'var(--on-surface)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
            Accuracy by Topic
          </h3>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TOPIC_ACCURACY} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="topic" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 12, color: '#fff', fontSize: 12 }} formatter={(v) => [`${v}%`, 'Accuracy']} />
                <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
                  {TOPIC_ACCURACY.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* ── AI INSIGHTS ── */}
      <motion.div {...fadeUp(0.5)} style={{ ...cardBase, marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 18px', fontWeight: 700, fontSize: 15, color: 'var(--on-surface)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#4ade80' }} />
          🧠 AI-Powered Insights
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
          {AI_INSIGHTS.map((insight, i) => (
            <motion.div
              key={insight.topic}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              style={{
                display: 'flex', gap: 12, padding: '16px 18px', borderRadius: 14,
                background: `${insight.color}08`,
                border: `1px solid ${insight.color}20`,
                alignItems: 'flex-start',
              }}
            >
              <span style={{ fontSize: 22, flexShrink: 0 }}>{insight.emoji}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: insight.color, marginBottom: 4 }}>
                  {insight.type === 'strong' ? '🟢 Strong' : '🟡 Needs Work'}: {insight.topic}
                </div>
                <div style={{ fontSize: 12, color: 'var(--on-surface-muted)', lineHeight: 1.6 }}>{insight.message}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;
