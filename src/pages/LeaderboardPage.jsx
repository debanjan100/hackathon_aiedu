import React, { useState, useEffect, useMemo } from 'react';
import { Button, Select, Tooltip } from 'antd';
import { Trophy, Crown, Flame, Zap, Brain, Star, Swords, TrendingUp, TrendingDown, Minus, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

/* ── Extended Mock Data ── */
const BASE_LEADERS = [
  { id: 'u1',  name: 'Arjun Singh',    xp: 4820, streak: 12, problemsSolved: 142, avatar: '🧑‍💻', topTopic: 'Dynamic Programming', change: 0,  level: 18 },
  { id: 'u2',  name: 'Priya Sharma',   xp: 4350, streak: 8,  problemsSolved: 128, avatar: '👩‍🎓', topTopic: 'Arrays',              change: 1,  level: 16 },
  { id: 'u3',  name: 'Rafi Khan',      xp: 3910, streak: 5,  problemsSolved: 115, avatar: '👨‍🔬', topTopic: 'Graphs',              change: -1, level: 15 },
  { id: 'u4',  name: 'Sneha Patel',    xp: 3400, streak: 3,  problemsSolved:  98, avatar: '👩‍💼', topTopic: 'Strings',             change: 2,  level: 13 },
  { id: 'u5',  name: 'Dev Mehta',      xp: 2950, streak: 7,  problemsSolved:  87, avatar: '👨‍🏫', topTopic: 'Trees',               change: 0,  level: 11 },
  { id: 'u6',  name: 'Anjali Roy',     xp: 2200, streak: 2,  problemsSolved:  65, avatar: '👩‍🎨', topTopic: 'Arrays',              change: -2, level: 9  },
  { id: 'u7',  name: 'Vikram Nair',    xp: 1800, streak: 14, problemsSolved:  52, avatar: '🧑‍🚀', topTopic: 'Sorting',             change: 3,  level: 7  },
  { id: 'u8',  name: 'Meera Iyer',     xp: 1650, streak: 4,  problemsSolved:  48, avatar: '👩‍🔬', topTopic: 'Strings',             change: 0,  level: 7  },
  { id: 'u9',  name: 'Karan Gupta',    xp: 1400, streak: 6,  problemsSolved:  41, avatar: '🧑‍💼', topTopic: 'Hash Maps',           change: -1, level: 6  },
  { id: 'u10', name: 'Tanya Mishra',   xp: 1200, streak: 3,  problemsSolved:  37, avatar: '👩‍💻', topTopic: 'Two Pointers',        change: 1,  level: 5  },
  { id: 'u11', name: 'Rohit Verma',    xp:  950, streak: 1,  problemsSolved:  29, avatar: '👨‍🎓', topTopic: 'Binary Search',       change: 0,  level: 4  },
  { id: 'u12', name: 'Sana Sheikh',    xp:  800, streak: 9,  problemsSolved:  24, avatar: '👩‍🏫', topTopic: 'Greedy',              change: 2,  level: 3  },
  { id: 'u13', name: 'Asher Pinto',    xp:  650, streak: 0,  problemsSolved:  19, avatar: '🧑‍🎨', topTopic: 'Pointers',            change: -3, level: 3  },
  { id: 'u14', name: 'Divya Reddy',    xp:  500, streak: 2,  problemsSolved:  14, avatar: '👩‍🚀', topTopic: 'Arrays',              change: 0,  level: 2  },
  { id: 'u15', name: 'Chris Mathew',   xp:  320, streak: 0,  problemsSolved:   8, avatar: '🧑‍🔬', topTopic: 'Strings',             change: -1, level: 1  },
];

const TIME_FILTERS = ['All Time', 'This Month', 'This Week', 'Today'];
const TOPIC_FILTERS = ['Overall', 'Arrays', 'Strings', 'Dynamic Programming', 'Graphs', 'Trees', 'Sorting', 'Greedy', 'Hash Maps'];

/* ── Badge System ── */
const getBadge = (u, rank) => {
  if (rank <= 10)    return { icon: '🏆', label: 'Top 10',           color: '#faad14', bg: 'rgba(250,173,20,0.12)'   };
  if (u.streak >= 7) return { icon: '🔥', label: 'On Fire',          color: '#ff6b35', bg: 'rgba(255,107,53,0.12)'   };
  if (u.problemsSolved >= 50 && u.xp > 1000) return { icon: '⚡', label: 'Speed Coder', color: '#00D8D6', bg: 'rgba(0,216,214,0.1)' };
  if (u.problemsSolved >= 20) return { icon: '🧠', label: 'Algo Master', color: '#a855f7', bg: 'rgba(168,85,247,0.12)' };
  return { icon: '⭐', label: 'Rising Star', color: '#64748b', bg: 'rgba(100,116,139,0.1)' };
};

const getXpMultiplier = (filter) => {
  if (filter === 'Today')      return 0.02;
  if (filter === 'This Week')  return 0.15;
  if (filter === 'This Month') return 0.5;
  return 1;
};

const RANK_PODIUM = {
  1: { glow: 'rgba(250,173,20,0.5)',   border: '#faad14', size: 92, emoji: '👑', label: '1st', ht: 120, pfColor: '#facc15' },
  2: { glow: 'rgba(192,192,192,0.4)',  border: '#c0c0c0', size: 76, emoji: '🥈', label: '2nd', ht: 90,  pfColor: '#c0c0c0' },
  3: { glow: 'rgba(205,127,50,0.4)',   border: '#cd7f32', size: 76, emoji: '🥉', label: '3rd', ht: 70,  pfColor: '#cd7f32' },
};

const PodiumCard = ({ u, rank, solved }) => {
  const s = RANK_PODIUM[rank];
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: rank * 0.1, type: 'spring' }}
      whileHover={{ y: -6, scale: 1.03 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, maxWidth: 160 }}
    >
      <div style={{ fontSize: 22, marginBottom: 6 }}>{s.emoji}</div>
      <div style={{
        width: s.size, height: s.size, borderRadius: '50%',
        background: `linear-gradient(135deg, ${s.border}30, ${s.border}08)`,
        border: `2.5px solid ${s.border}`,
        boxShadow: `0 0 28px ${s.glow}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: s.size * 0.42,
      }}>
        {u.avatar}
      </div>
      <div style={{ marginTop: 10, fontWeight: 800, color: 'var(--on-surface)', fontSize: 13, textAlign: 'center', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {u.name.split(' ')[0]}
      </div>
      <div style={{ color: s.pfColor, fontWeight: 900, fontSize: 16, marginTop: 2 }}>{solved.toLocaleString()} XP</div>
      <div style={{ color: 'var(--on-surface-muted)', fontSize: 11, marginTop: 1 }}>{u.problemsSolved} solved</div>
      {/* Podium platform */}
      <div style={{
        marginTop: 10, width: '100%', height: s.ht,
        background: `linear-gradient(180deg, ${s.border}20, ${s.border}08)`,
        border: `1px solid ${s.border}30`,
        borderRadius: '10px 10px 0 0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: s.pfColor, fontSize: 13, fontWeight: 700,
      }}>
        {s.label}
      </div>
    </motion.div>
  );
};

const ChangeIcon = ({ change }) => {
  if (change > 0)  return <span style={{ color: '#10b981', fontSize: 11, display: 'flex', alignItems: 'center', gap: 2 }}><TrendingUp size={10} />+{change}</span>;
  if (change < 0)  return <span style={{ color: '#ef4444', fontSize: 11, display: 'flex', alignItems: 'center', gap: 2 }}><TrendingDown size={10} />{change}</span>;
  return <span style={{ color: '#7a8a8b', fontSize: 11 }}><Minus size={10} /></span>;
};

const ProfileTooltip = ({ u, badge }) => (
  <div style={{ width: 200, padding: 4 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
      <div style={{ fontSize: 28 }}>{u.avatar}</div>
      <div>
        <div style={{ fontWeight: 700, color: '#fff', fontSize: 13 }}>{u.name}</div>
        <div style={{ color: '#00D8D6', fontSize: 11 }}>Level {u.level}</div>
      </div>
    </div>
    <div style={{ fontSize: 11, color: '#bac9ca', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div>🎯 Top: <strong style={{ color: '#fff' }}>{u.topTopic}</strong></div>
      <div>🔥 Streak: <strong style={{ color: '#ff6b35' }}>{u.streak} days</strong></div>
      <div>📚 Solved: <strong style={{ color: '#00D8D6' }}>{u.problemsSolved} problems</strong></div>
      <div style={{ marginTop: 6, background: `${badge.bg}`, border: `1px solid ${badge.color}30`, borderRadius: 8, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 5 }}>
        <span>{badge.icon}</span><span style={{ color: badge.color, fontWeight: 700 }}>{badge.label}</span>
      </div>
    </div>
  </div>
);

const LeaderboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [timeFilter, setTimeFilter] = useState('All Time');
  const [topicFilter, setTopicFilter] = useState('Overall');
  const [userPoints, setUserPoints] = useState(0);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (user?.id) {
      supabase.from('progress').select('xp_gained').eq('user_id', user.id)
        .then(({ data }) => { if (data?.length) setUserPoints(data.reduce((a, c) => a + (c.xp_gained || 0), 0)); });
    }
  }, [user]);

  const leaders = useMemo(() => {
    const mult = getXpMultiplier(timeFilter);
    return BASE_LEADERS
      .map(u => ({ ...u, xp: Math.floor(u.xp * mult), problemsSolved: Math.floor(u.problemsSolved * mult) }))
      .sort((a, b) => b.xp - a.xp);
  }, [timeFilter]);

  const userName = user?.user_metadata?.name || user?.name || 'You';
  const userRank = leaders.filter(l => l.xp > userPoints).length + 1;
  const topXp = leaders[0]?.xp || 1;
  const xpToNext = userRank > 1 ? (leaders[userRank - 2]?.xp || 0) - userPoints : 0;

  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);
  const displayed = showAll ? rest : rest.slice(0, 8);

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', paddingBottom: 60 }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Trophy size={26} color="#faad14" />
          <h2 style={{ margin: 0, color: 'var(--on-surface)', fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em' }}>Global Leaderboard</h2>
          <span style={{ background: 'rgba(0,216,214,0.1)', border: '1px solid rgba(0,216,214,0.3)', color: '#00D8D6', borderRadius: 9999, fontSize: 11, padding: '3px 10px', fontWeight: 700 }}>🔴 Live</span>
        </div>
        <p style={{ margin: 0, color: 'var(--on-surface-muted)', fontSize: 14 }}>Compete with CognifyX learners worldwide. Rise through the ranks.</p>
      </motion.div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
        {/* Time Tabs */}
        <div style={{ display: 'flex', background: 'var(--surface-container)', borderRadius: 12, padding: 4, gap: 2 }}>
          {TIME_FILTERS.map(f => (
            <button key={f} onClick={() => setTimeFilter(f)} style={{
              padding: '6px 14px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
              background: timeFilter === f ? 'var(--primary)' : 'transparent',
              color: timeFilter === f ? '#002022' : 'var(--on-surface-muted)',
              transition: 'all 0.2s', fontFamily: 'Inter, sans-serif',
            }}>
              {f}
            </button>
          ))}
        </div>
        {/* Topic filter */}
        <Select value={topicFilter} onChange={setTopicFilter} popupClassName="dark-select-popup"
          style={{ width: 180, height: 36 }} size="small">
          {TOPIC_FILTERS.map(t => <Option key={t} value={t}>{t}</Option>)}
        </Select>
      </div>

      {/* My Rank Widget (shows if user outside top 3) */}
      {userRank > 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ background: 'rgba(0,216,214,0.06)', border: '1px solid rgba(0,216,214,0.25)', borderRadius: 18, padding: '14px 20px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, #00D8D6, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#002022', fontWeight: 800, fontSize: 17 }}>
                {userName[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ color: '#00D8D6', fontWeight: 700, fontSize: 14 }}>{userName.split(' ')[0]} (You)</div>
                <div style={{ color: 'var(--on-surface-muted)', fontSize: 12 }}>Rank #{userRank}</div>
              </div>
            </div>
            <div style={{ flex: 1, maxWidth: 280 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--on-surface-muted)', marginBottom: 5 }}>
                <span>{userPoints} XP</span>
                <span>{xpToNext > 0 ? `${xpToNext} XP to Rank #${userRank - 1}` : 'Top rank!'}</span>
              </div>
              <div style={{ height: 6, background: 'var(--surface-container-highest)', borderRadius: 3, overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((userPoints / topXp) * 100, 100)}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, #00D8D6, #7C3AED)', borderRadius: 3 }} />
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#00D8D6', fontWeight: 900, fontSize: 22 }}>{userPoints.toLocaleString()}</div>
              <div style={{ color: 'var(--on-surface-muted)', fontSize: 11 }}>XP</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Podium — order: #2, #1, #3 */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ background: 'linear-gradient(180deg, var(--surface-container) 0%, var(--surface-container-low) 100%)', borderRadius: 24, padding: '32px 24px 0', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 12 }}>
          {[top3[1], top3[0], top3[2]].filter(Boolean).map((u, i) => {
            const rank = i === 0 ? 2 : i === 1 ? 1 : 3;
            return <PodiumCard key={u.id} u={u} rank={rank} solved={u.xp} />;
          })}
        </div>
      </motion.div>

      {/* Full Rankings Table */}
      <div style={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--border-color)', borderRadius: 24, overflow: 'hidden' }}>
        {/* Table Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '50px 44px 1fr 100px 90px 80px 100px 80px 100px', gap: 0, padding: '10px 16px', borderBottom: '1px solid var(--border-color)', background: 'var(--surface-container)' }}>
          {['Rank', '', 'Player', 'Solved', 'XP', 'Streak', 'Badge', 'Δ', ''].map((h, i) => (
            <div key={i} style={{ fontSize: 11, fontWeight: 700, color: 'var(--on-surface-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
          ))}
        </div>

        <AnimatePresence>
          {displayed.map((u, i) => {
            const rank = i + 4;
            const badge = getBadge(u, rank);
            const isMe = u.name === userName;

            return (
              <motion.div
                key={`${u.id}-${timeFilter}`}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ delay: i * 0.04 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '50px 44px 1fr 100px 90px 80px 100px 80px 100px',
                  gap: 0,
                  padding: '12px 16px',
                  borderTop: '1px solid rgba(59,73,74,0.1)',
                  background: isMe ? 'rgba(0,216,214,0.06)' : 'transparent',
                  boxShadow: isMe ? 'inset 0 0 0 1px rgba(0,216,214,0.2)' : 'none',
                  transition: 'background 0.15s',
                  alignItems: 'center',
                }}
                onMouseEnter={e => { if (!isMe) e.currentTarget.style.background = 'var(--surface-container)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = isMe ? 'rgba(0,216,214,0.06)' : 'transparent'; }}
              >
                {/* Rank */}
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--on-surface-muted)' }}>#{rank}</div>

                {/* Avatar */}
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                  {u.avatar}
                </div>

                {/* Name */}
                <Tooltip title={<ProfileTooltip u={u} badge={badge} />} color="#0d1117" overlayInnerStyle={{ padding: 14, background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14 }}>
                  <div style={{ cursor: 'pointer' }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: isMe ? '#00D8D6' : 'var(--on-surface)' }}>
                      {u.name} {isMe && <span style={{ fontSize: 10, background: 'rgba(0,216,214,0.15)', color: '#00D8D6', borderRadius: 9999, padding: '1px 6px', marginLeft: 4 }}>YOU</span>}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--on-surface-muted)' }}>Lv {u.level} · {u.topTopic}</div>
                  </div>
                </Tooltip>

                {/* Solved */}
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--on-surface)' }}>{u.problemsSolved}</div>

                {/* XP */}
                <div style={{ fontWeight: 800, fontSize: 13, color: '#00D8D6' }}>{u.xp.toLocaleString()}</div>

                {/* Streak */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: u.streak >= 7 ? '#ff6b35' : 'var(--on-surface-muted)' }}>
                  <Flame size={11} /> {u.streak}d
                </div>

                {/* Badge */}
                <div style={{ background: badge.bg, border: `1px solid ${badge.color}30`, borderRadius: 9999, padding: '2px 8px', fontSize: 10, fontWeight: 700, color: badge.color, display: 'inline-flex', alignItems: 'center', gap: 3, whiteSpace: 'nowrap' }}>
                  {badge.icon} {badge.label}
                </div>

                {/* Change */}
                <ChangeIcon change={u.change} />

                {/* Challenge Button */}
                <Button
                  size="small"
                  onClick={() => navigate('/dashboard/practice')}
                  style={{ borderRadius: 9999, fontSize: 10, fontWeight: 700, border: '1px solid rgba(0,216,214,0.25)', color: '#00D8D6', background: 'rgba(0,216,214,0.06)', height: 28, padding: '0 10px' }}
                >
                  ⚔ Challenge
                </Button>
              </motion.div>
            );
          })}
        </AnimatePresence>

        <div style={{ padding: '16px 24px', textAlign: 'center', borderTop: '1px solid rgba(59,73,74,0.1)' }}>
          <Button type="text" onClick={() => setShowAll(v => !v)}
            style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 13 }}>
            {showAll ? '↑ Show Less' : `↓ View All ${rest.length} Rankings`}
          </Button>
        </div>
      </div>

      {/* Badge Legend */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        style={{ marginTop: 20, background: 'var(--surface-container)', borderRadius: 18, padding: '14px 20px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--on-surface-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Badge Legend</div>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {[
            { icon: '🏆', label: 'Top 10', desc: 'In top 10 all-time', color: '#faad14' },
            { icon: '🔥', label: 'On Fire', desc: '7-day streak', color: '#ff6b35' },
            { icon: '⚡', label: 'Speed Coder', desc: '50+ solved & 1000+ XP', color: '#00D8D6' },
            { icon: '🧠', label: 'Algo Master', desc: '20+ problems solved', color: '#a855f7' },
            { icon: '⭐', label: 'Rising Star', desc: 'Keep grinding!', color: '#64748b' },
          ].map(b => (
            <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>{b.icon}</span>
              <span style={{ color: b.color, fontWeight: 700, fontSize: 12 }}>{b.label}</span>
              <span style={{ color: 'var(--on-surface-muted)', fontSize: 11 }}>— {b.desc}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default LeaderboardPage;
