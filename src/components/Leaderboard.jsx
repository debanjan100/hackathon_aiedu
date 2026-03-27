import React, { useState, useEffect } from 'react';
import { Avatar, Button, Tag, Tooltip } from 'antd';
import { Crown, Trophy, Star, TrendingUp, User, ChevronDown, ChevronUp, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../config/supabaseClient';
import { useAuth } from '../context/AuthContext';

const MOCK_LEADERS = [
  { id: 'u1', name: 'Arjun Singh', points: 4820, streak: 12, badge: 'Expert', avatar: '🧑‍💻' },
  { id: 'u2', name: 'Priya Sharma', points: 4350, streak: 8, badge: 'Pro', avatar: '👩‍🎓' },
  { id: 'u3', name: 'Rafi Khan', points: 3910, streak: 5, badge: 'Pro', avatar: '👨‍🔬' },
  { id: 'u4', name: 'Sneha Patel', points: 3400, streak: 3, badge: 'Intermediate', avatar: '👩‍💼' },
  { id: 'u5', name: 'Dev Mehta', points: 2950, streak: 7, badge: 'Intermediate', avatar: '👨‍🏫' },
  { id: 'u6', name: 'Anjali Roy', points: 2200, streak: 2, badge: 'Beginner', avatar: '👩‍🎨' },
  { id: 'u7', name: 'Vikram Nair', points: 1800, streak: 1, badge: 'Beginner', avatar: '🧑‍🚀' },
];

const BADGE_CONFIG = {
  Expert: { color: '#a855f7', bg: 'rgba(168,85,247,0.15)', icon: <Crown size={11} /> },
  Pro: { color: '#faad14', bg: 'rgba(250,173,20,0.15)', icon: <Star size={11} /> },
  Intermediate: { color: '#06b6d4', bg: 'rgba(6,182,212,0.15)', icon: <TrendingUp size={11} /> },
  Beginner: { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', icon: <User size={11} /> },
};

const RANK_STYLES = {
  1: { glow: 'rgba(250,173,20,0.5)', border: '#faad14', size: 80, zIndex: 2, top: 0, label: '🥇', labelColor: '#faad14' },
  2: { glow: 'rgba(148,163,184,0.35)', border: '#94a3b8', size: 68, zIndex: 1, top: 20, label: '🥈', labelColor: '#94a3b8' },
  3: { glow: 'rgba(205,127,50,0.35)', border: '#cd7f32', size: 68, zIndex: 1, top: 20, label: '🥉', labelColor: '#cd7f32' },
};

function PodiumUser({ user: u, rank }) {
  const s = RANK_STYLES[rank];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1, type: 'spring', stiffness: 120 }}
      whileHover={{ scale: 1.05 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', marginTop: s.top, zIndex: s.zIndex, flex: 1 }}
    >
      <div style={{ position: 'relative' }}>
        <div style={{
          width: s.size, height: s.size, borderRadius: '50%',
          background: `linear-gradient(135deg, ${s.border}33, ${s.border}11)`,
          border: `2px solid ${s.border}`,
          boxShadow: `0 0 18px ${s.glow}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: s.size * 0.42
        }}>
          {u.avatar}
        </div>
        <div style={{ position: 'absolute', bottom: -6, right: -6, fontSize: 18 }}>{s.label}</div>
      </div>
      <p style={{ color: '#e2e8f0', fontWeight: 700, margin: '12px 0 2px 0', fontSize: 13, textAlign: 'center', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name.split(' ')[0]}</p>
      <p style={{ color: s.labelColor, fontWeight: 800, margin: 0, fontSize: 15 }}>{u.points.toLocaleString()}</p>
      <Tag style={{ marginTop: 4, border: `1px solid ${BADGE_CONFIG[u.badge]?.color}`, background: BADGE_CONFIG[u.badge]?.bg, color: BADGE_CONFIG[u.badge]?.color, borderRadius: 12, fontSize: 10, padding: '0 6px' }}>
        {BADGE_CONFIG[u.badge]?.icon} {u.badge}
      </Tag>
    </motion.div>
  );
}

const Leaderboard = () => {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState(MOCK_LEADERS);
  const [showAll, setShowAll] = useState(false);
  const [userPoints, setUserPoints] = useState(0);

  useEffect(() => {
    if (user?.id) {
      supabase.from('progress').select('xp_gained').eq('user_id', user.id)
        .then(({ data }) => {
          if (data && data.length > 0) {
            const total = data.reduce((a, c) => a + (c.xp_gained || 0), 0);
            setUserPoints(total);
          }
        });
    }
  }, [user]);

  const userName = user?.user_metadata?.name || user?.name || 'You';
  const currentUserRank = leaders.filter(l => l.points > userPoints).length + 1;
  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);
  const displayList = showAll ? rest : rest.slice(0, 3);

  const podiumOrder = [top3[1], top3[0], top3[2]]; // Silver, Gold, Bronze for visual arrangement

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: 24,
        overflow: 'hidden',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Header */}
      <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Trophy size={20} color="#faad14" />
          <span style={{ color: 'var(--text-color)', fontWeight: 700, fontSize: 16 }}>Global Leaderboard</span>
        </div>
        <Tag style={{ background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.25)', color: '#00e5ff', borderRadius: 20, fontSize: 11 }}>Live</Tag>
      </div>

      {/* Podium */}
      <div style={{ padding: '24px 16px 20px', background: 'linear-gradient(180deg, rgba(250,173,20,0.04) 0%, transparent 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 16, minHeight: 170 }}>
          {[2, 1, 3].map((rank) => (
            <PodiumUser key={rank} user={top3[rank - 1]} rank={rank} />
          ))}
        </div>
      </div>

      {/* Your Rank Card */}
      <div style={{ margin: '0 16px 16px', padding: '14px 16px', background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#00f2fe,#4facfe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#000', fontSize: 15 }}>
            {userName[0]?.toUpperCase()}
          </div>
          <div>
            <p style={{ margin: 0, color: '#00e5ff', fontWeight: 700, fontSize: 14 }}>{userName.split(' ')[0]} (You)</p>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 12 }}>Rank #{currentUserRank}</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, color: '#00e5ff', fontWeight: 800, fontSize: 18 }}>{userPoints.toLocaleString()}</p>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 11 }}>points</p>
        </div>
      </div>

      {/* Ranked List */}
      <div style={{ padding: '0 16px' }}>
        <AnimatePresence>
          {displayList.map((u, i) => {
            const rank = i + 4;
            return (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ delay: i * 0.05 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 8px', borderBottom: '1px solid var(--border-color)', borderRadius: 8 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 22, textAlign: 'center', color: 'var(--text-muted)', fontWeight: 700, fontSize: 13 }}>#{rank}</span>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{u.avatar}</div>
                  <div>
                    <p style={{ margin: 0, color: 'var(--text-color)', fontWeight: 600, fontSize: 13 }}>{u.name}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Flame size={10} color="#ff7c47" />
                      <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{u.streak} day streak</span>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, color: BADGE_CONFIG[u.badge]?.color, fontWeight: 700, fontSize: 14 }}>{u.points.toLocaleString()}</p>
                  <Tag style={{ border: `1px solid ${BADGE_CONFIG[u.badge]?.color}`, background: BADGE_CONFIG[u.badge]?.bg, color: BADGE_CONFIG[u.badge]?.color, borderRadius: 10, fontSize: 10, padding: '0 5px' }}>
                    {u.badge}
                  </Tag>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* View More Toggle */}
      <div style={{ padding: '12px 16px 20px', textAlign: 'center' }}>
        <Button
          type="text"
          onClick={() => setShowAll(v => !v)}
          style={{ color: 'var(--primary-color)', fontWeight: 600, fontSize: 13 }}
          icon={showAll ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        >
          {showAll ? 'Show Less' : 'View Full Leaderboard'}
        </Button>
      </div>
    </motion.div>
  );
};

export default Leaderboard;
