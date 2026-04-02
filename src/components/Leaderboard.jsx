import React, { useState, useEffect } from 'react';
import { Trophy, ArrowUp, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/* ── Mock Data ── */
const MOCK_LEADERS = [
  { id: 'u1', name: 'Arjun Singh',  points: 4820, streak: 12, trend: 'up' },
  { id: 'u2', name: 'Priya Sharma', points: 4350, streak: 8,  trend: 'up' },
  { id: 'u3', name: 'Rafi Khan',    points: 3910, streak: 5,  trend: 'down' },
  { id: 'u4', name: 'Sneha Patel',  points: 3400, streak: 3,  trend: 'up' },
  { id: 'u5', name: 'Dev Mehta',    points: 2950, streak: 7,  trend: 'down' },
];

const RANK_MEDALS = [
  { bg: 'linear-gradient(135deg, #FFDF73 0%, #D4AF37 100%)', shadow: 'rgba(212, 175, 55, 0.4)' }, // Gold
  { bg: 'linear-gradient(135deg, #E2E2E2 0%, #A6A6A6 100%)', shadow: 'rgba(166, 166, 166, 0.4)' }, // Silver
  { bg: 'linear-gradient(135deg, #E69D66 0%, #CD7F32 100%)', shadow: 'rgba(205, 127, 50, 0.4)' },  // Bronze
];

const Leaderboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leaders, setLeaders] = useState([]);
  const [userLeaderData, setUserLeaderData] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data } = await supabase
        .from('leaderboard')
        .select('*')
        .order('points', { ascending: false })
        .limit(10);
      
      if (data) setLeaders(data);

      if (user?.id) {
        const { data: myData } = await supabase
          .from('leaderboard')
          .select('*')
          .eq('user_id', user.id)
          .single();
        if (myData) setUserLeaderData(myData);
      }
    };
    fetchLeaderboard();
  }, [user]);

  const top3 = leaders.slice(0, 3);
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'You';
  const userRank = userLeaderData?.rank || '-';
  const userPoints = userLeaderData?.points || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div style={{ padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Trophy size={18} color="#00D8D6" />
          <span style={{ color: 'var(--on-surface)', fontWeight: 700, fontSize: 16 }}>Top Scholars</span>
        </div>
      </div>

      <div style={{ padding: '0 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(leaders.length > 0 ? leaders.slice(0, 3) : MOCK_LEADERS.slice(0, 3)).map((u, i) => {
          const medal = RANK_MEDALS[i];
          const isUp = u.trend === 'up';
          return (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ x: 4, background: 'var(--surface-container-high)' }}
              style={{
                display: 'flex', alignItems: 'center', padding: '12px',
                background: 'var(--surface-container)', borderRadius: 12,
                cursor: 'pointer', transition: 'all 0.2s ease',
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: '50%', background: medal.bg,
                boxShadow: `0 4px 12px ${medal.shadow}`, display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: '#000',
                fontWeight: 900, fontSize: 14, flexShrink: 0
              }}>
                {['🥇','🥈','🥉'][i]}
              </div>

              <div style={{ flex: 1, marginLeft: 16 }}>
                <div style={{ color: 'var(--on-surface)', fontWeight: 600, fontSize: 14 }}>{u.full_name || u.name || 'Anonymous'}</div>
                <div style={{ color: 'var(--on-surface-muted)', fontSize: 12 }}>{(u.points || 0).toLocaleString()} XP</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: isUp ? '#10b981' : '#ef4444' }}>
                {isUp ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Current User Row */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        style={{
          margin: '16px', padding: '16px',
          background: 'rgba(0, 153, 170, 0.08)',
          border: '1px solid rgba(0, 153, 170, 0.3)',
          boxShadow: '0 0 20px rgba(0, 153, 170, 0.1)',
          borderRadius: 16, display: 'flex', alignItems: 'center'
        }}
      >
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: '#003333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>
          {userRank}
        </div>
        <div style={{ flex: 1, marginLeft: 16 }}>
          <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 14 }}>{userName.split(' ')[0]} (You)</div>
          <div style={{ color: 'var(--on-surface-muted)', fontSize: 12 }}>{userPoints.toLocaleString()} XP</div>
        </div>
        <div style={{ color: 'var(--primary)' }}>
          <Trophy size={20} />
        </div>
      </motion.div>

      {/* View Full Leaderboard Link */}
      <div
        onClick={() => navigate('/dashboard/leaderboard')}
        style={{ textAlign: 'center', padding: '8px 16px 16px', color: 'var(--primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: 0.8 }}
      >
        View Full Leaderboard →
      </div>
    </motion.div>
  );
};

export default Leaderboard;
