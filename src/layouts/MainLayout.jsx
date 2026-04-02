import React, { useState, useRef, useEffect } from 'react';
import { Layout, Input, Button, Drawer, Avatar, Dropdown, message, Typography } from 'antd';
import {
  LayoutDashboard, User, BarChart2, Send, Sparkles, LogOut,
  Calendar, Play, Pause, RefreshCw, Moon, Sun, Compass, Code,
  Trophy, Menu as MenuIcon, X, Search, BookOpen, Video,
} from 'lucide-react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabaseClient';
import { sendChatMessage } from '../lib/chatApi';

const { Content } = Layout;
const { Title } = Typography;

const NAV_ITEMS = [
  { key: '/dashboard',             icon: <LayoutDashboard size={16} />, label: 'Overview'        },
  { key: '/dashboard/planner',     icon: <Calendar size={16} />,        label: 'Study Planner'   },
  { key: '/dashboard/practice',    icon: <Code size={16} />,            label: 'Practice Room'   },
  { key: '/dashboard/videos',      icon: <Video size={16} />,           label: 'Learning Videos' },
  { key: '/dashboard/resources',   icon: <BookOpen size={16} />,        label: 'Resources'       },
  { key: '/dashboard/analytics',   icon: <BarChart2 size={16} />,       label: 'Analytics'       },
  { key: '/dashboard/leaderboard', icon: <Trophy size={16} />,          label: 'Leaderboard'     },
  { key: '/dashboard/profile',     icon: <User size={16} />,            label: 'Profile'         },
];

const MainLayout = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [timer, setTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const { isDark, toggleTheme } = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const messagesEndRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [messages, setMessages] = useState([
    { sender: 'ai', text: `Hi ${user?.user_metadata?.name?.split(' ')[0] || 'there'}! 👋 I'm your AI Tutor. Ask me anything about DSA, coding, or your study materials!`, time: new Date() }
  ]);

  // Pomodoro XP timer
  useEffect(() => {
    let interval;
    if (isTimerActive) {
      interval = setInterval(() => {
        setTimer(t => {
          const newT = t + 1;
          if (newT > 0 && newT % 60 === 0 && user?.id) {
            supabase.from('progress').insert({ user_id: user.id, xp_gained: 10 })
              .then(() => message.success('Stayed focused! +10 XP 🔥'))
              .catch(() => null);
          }
          return newT;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessageLogic = async (textToSend, currentMessages) => {
    setIsTyping(true);
    setMessages(currentMessages);
    try {
      const history = currentMessages
        .filter(m => !m.text.startsWith('System Hint:'))
        .slice(-10)
        .map(m => ({ role: m.sender === 'ai' ? 'assistant' : 'user', content: m.text }));

      const reply = await sendChatMessage({
        message: textToSend,
        context: 'You are CognifyX AI Tutor — an expert DSA and coding mentor. Help students understand Data Structures, Algorithms, and coding concepts clearly. Keep answers concise, use examples, and be encouraging.',
        history
      });

      setIsTyping(false);
      setMessages(prev => [...prev, { sender: 'ai', text: reply, time: new Date() }]);
    } catch (err) {
      console.error('AI Chat error:', err);
      setIsTyping(false);
      // Show friendly fallback instead of raw error
      const friendlyMsg = err.message?.includes('429')
        ? '⚠️ AI is temporarily busy (rate limit). Please wait a moment and try again.'
        : err.message?.includes('Network')
        ? '⚠️ Network error — check your connection and try again.'
        : err.message?.startsWith('⚠️')
        ? err.message
        : '⚠️ AI is temporarily unavailable. Please try again shortly.';
      setMessages(prev => [...prev, { sender: 'ai', text: friendlyMsg, time: new Date(), isError: true }]);
    }
  };


  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = { sender: 'user', text: chatInput, time: new Date() };
    setChatInput('');
    handleSendMessageLogic(chatInput, [...messages, userMsg]);
  };

  const handleLogout = () => { logout(); message.success('Logged out!'); navigate('/login'); };

  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const userInitial = userName[0]?.toUpperCase() || 'U';

  const userMenu = {
    items: [
      { key: 'profile', label: <span onClick={() => navigate('/dashboard/profile')}><User size={14} style={{ marginRight: 8 }} />Profile</span> },
      { key: 'logout',  label: <span onClick={handleLogout}><LogOut size={14} style={{ marginRight: 8, color: '#ff4d4f' }} /><span style={{ color: '#ff4d4f' }}>Logout</span></span> }
    ]
  };

  const isPracticeRoom = location.pathname === '/dashboard/practice';

  return (
    <>
      {/* ── Top Navigation Bar ── */}
      <header className="top-nav">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
            onClick={() => navigate('/dashboard')}
          >
            <motion.div
              animate={shouldReduceMotion ? {} : { rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
            >
              <Sparkles size={22} color="var(--primary)" />
            </motion.div>
            <Title level={4} style={{ margin: 0, fontWeight: 800, color: 'var(--on-surface)', letterSpacing: '-0.03em', whiteSpace: 'nowrap' }}>
              <span style={{ color: 'var(--primary)' }}>Cognify</span>X AI
            </Title>
          </div>

          {/* Desktop nav tabs */}
          <nav className="desktop-only" style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {NAV_ITEMS.map(item => {
              const isActive = location.pathname === item.key;
              return (
                <motion.div
                  key={item.key}
                  onClick={() => navigate(item.key)}
                  whileHover={shouldReduceMotion ? {} : { y: -1 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '7px 12px', borderRadius: 9999,
                    background: isActive ? 'var(--surface-container-high)' : 'transparent',
                    color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    boxShadow: isActive ? '0 0 0 1px rgba(73,238,248,0.25)' : 'none',
                  }}
                >
                  <span style={{ color: isActive ? 'var(--primary)' : 'inherit', filter: isActive ? 'drop-shadow(0 0 4px var(--primary))' : 'none' }}>
                    {item.icon}
                  </span>
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId={shouldReduceMotion ? undefined : 'nav-pill'}
                      style={{
                        position: 'absolute', bottom: -1, left: '50%', transform: 'translateX(-50%)',
                        width: 20, height: 2, borderRadius: 2,
                        background: 'var(--primary)',
                        boxShadow: '0 0 6px var(--primary)',
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.div>
              );
            })}
          </nav>
        </div>

        {/* Right tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Timer */}
          <div className="desktop-only" style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'var(--surface-container)', padding: '4px 10px',
            borderRadius: 9999, fontFamily: 'monospace', fontSize: 14, color: 'var(--primary)',
          }}>
            <span>{String(Math.floor(timer / 60)).padStart(2, '0')}:{String(timer % 60).padStart(2, '0')}</span>
            <Button type="text" size="small" icon={isTimerActive ? <Pause size={12} color="#faad14" /> : <Play size={12} color="#52c41a" />} onClick={() => setIsTimerActive(v => !v)} />
            <Button type="text" size="small" icon={<RefreshCw size={12} color="var(--on-surface-muted)" />} onClick={() => { setIsTimerActive(false); setTimer(0); }} />
          </div>

          {/* Theme toggle */}
          <Button type="text" onClick={toggleTheme} icon={isDark ? <Sun size={17} color="#faad14" /> : <Moon size={17} color="var(--on-surface)" />} />

          {/* User avatar dropdown */}
          <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <Avatar size={34} style={{ background: 'linear-gradient(135deg, var(--primary-container), var(--primary))', color: '#002022', fontWeight: 800, flexShrink: 0 }}>
                {userInitial}
              </Avatar>
              <span className="desktop-only" style={{ color: 'var(--on-surface)', fontWeight: 500, fontSize: 13 }}>
                {userName.split(' ')[0]}
                {(user?.isPremium || user?.user_metadata?.isPremium) && <span style={{ marginLeft: 4 }}>👑</span>}
              </span>
            </div>
          </Dropdown>

          {/* Mobile hamburger */}
          <Button
            className="mobile-only"
            type="text"
            icon={mobileMenuOpen ? <X size={22} /> : <MenuIcon size={22} />}
            onClick={() => setMobileMenuOpen(v => !v)}
            style={{ color: 'var(--on-surface)' }}
          />
        </div>
      </header>

      {/* ── Mobile Drawer Menu ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="mobile-drawer"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.25, ease: 'easeInOut' }}
          >
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {NAV_ITEMS.map(item => {
                const isActive = location.pathname === item.key;
                return (
                  <div
                    key={item.key}
                    onClick={() => { navigate(item.key); setMobileMenuOpen(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 16px', borderRadius: 12,
                      background: isActive ? 'rgba(73,238,248,0.08)' : 'transparent',
                      color: isActive ? 'var(--primary)' : 'var(--on-surface)',
                      fontWeight: isActive ? 600 : 500, cursor: 'pointer',
                      boxShadow: isActive ? 'inset 3px 0 0 var(--primary)' : 'none',
                    }}
                  >
                    <span style={{ color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)' }}>{item.icon}</span>
                    {item.label}
                  </div>
                );
              })}
              <div style={{ height: 1, background: 'rgba(59,73,74,0.2)', margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px' }}>
                <span style={{ color: 'var(--on-surface-muted)', fontSize: 13 }}>Focus Timer</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'monospace', color: 'var(--primary)' }}>
                  <span>{String(Math.floor(timer / 60)).padStart(2, '0')}:{String(timer % 60).padStart(2, '0')}</span>
                  <Button type="text" size="small" icon={isTimerActive ? <Pause size={13} color="#faad14" /> : <Play size={13} color="#52c41a" />} onClick={() => setIsTimerActive(v => !v)} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Page Content ── */}
      <Layout style={{ background: 'transparent', paddingTop: 64 }}>
        <Content style={{ margin: isPracticeRoom ? 0 : '24px auto', padding: isPracticeRoom ? 0 : '0 24px', maxWidth: isPracticeRoom ? '100%' : 1400, width: '100%', minHeight: 280 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="page-transition-wrapper"
            >
              <Outlet context={{ openMockInterview: () => setChatOpen(true) }} />
            </motion.div>
          </AnimatePresence>
        </Content>
      </Layout>

      {/* ── Floating AI Tutor Button ── */}
      <motion.div
        className="chatbot-pulse"
        onClick={() => setChatOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="AI Quick Chat"
        style={{
          position: 'fixed', right: 24, bottom: 24, width: 60, height: 60, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary-container), var(--primary))',
          boxShadow: '0 0 24px rgba(73,238,248,0.5)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, overflow: 'hidden',
        }}
      >
        <img
          src="/images/ai-robot.png" alt="AI"
          onError={e => { e.target.style.display = 'none'; e.target.parentNode.innerHTML += '<span style="font-size:26px">🤖</span>'; }}
          style={{ width: 40, height: 40, objectFit: 'contain' }}
        />
      </motion.div>
      <div style={{
        position: 'fixed', right: 92, bottom: 36,
        background: 'var(--surface-container-high)',
        borderRadius: 9999, padding: '5px 12px',
        fontSize: 12, fontWeight: 600, color: 'var(--on-surface)',
        pointerEvents: 'none', zIndex: 199, whiteSpace: 'nowrap',
      }}>
        AI Quick Chat
      </div>

      {/* ── AI Tutor Drawer ── */}
      <Drawer
        rootClassName="glass-drawer"
        title={
          <><Sparkles size={16} style={{ marginRight: 8, verticalAlign: 'middle', color: 'var(--primary)' }} />
          <strong style={{ color: 'var(--primary)' }}>CognifyX</strong><span style={{ color: 'var(--on-surface)' }}> AI Tutor</span></>
        }
        placement="right"
        onClose={() => setChatOpen(false)}
        open={chatOpen}
        width={400}
        styles={{ body: { display: 'flex', flexDirection: 'column', padding: 0 } }}
      >
        <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {messages.map((msg, idx) => {
            if (msg.text.startsWith('System Hint:')) return null;
            const timeStr = msg.time ? new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25 }}
                className={msg.sender === 'user' ? 'chat-message chat-user' : 'chat-message chat-ai'}
                style={msg.isError ? { border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.08)' } : {}}
              >
                {msg.text}
                {timeStr && <div style={{ fontSize: 10, opacity: 0.5, marginTop: 6, textAlign: msg.sender === 'user' ? 'right' : 'left' }}>{timeStr}</div>}
              </motion.div>
            );
          })}
          {isTyping && (
            <div className="chat-message chat-ai" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '12px 16px' }}>
              <span className="typing-dot" style={{ '--i': 0 }} />
              <span className="typing-dot" style={{ '--i': 1 }} />
              <span className="typing-dot" style={{ '--i': 2 }} />
              <span style={{ fontSize: 12, color: 'var(--on-surface-muted)', marginLeft: 8 }}>AI is thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div style={{ padding: 16, borderTop: '1px solid rgba(59,73,74,0.2)', display: 'flex', gap: 8 }}>
          <Input
            style={{ borderRadius: 9999 }}
            placeholder="Ask a doubt..."
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onPressEnter={handleSendMessage}
            disabled={isTyping}
          />
          <Button
            className="gradient-btn"
            shape="circle"
            icon={<Send size={16} />}
            onClick={handleSendMessage}
            disabled={!chatInput.trim() || isTyping}
          />
        </div>
      </Drawer>
    </>
  );
};

export default MainLayout;
