import React, { useState } from 'react';
import { Typography, Button, Avatar, Dropdown } from 'antd';
import { Menu as MenuIcon, X, Sparkles, Play, Pause, RefreshCw, Sun, Moon, LogOut, User } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const { Title } = Typography;

const TopNav = ({
  user,
  handleLogout,
  menuItems,
  location,
  navigate,
  timer,
  isTimerActive,
  setIsTimerActive,
  setTimer,
  isDark,
  toggleTheme,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const userMenu = {
    items: [
      { key: 'profile', label: <span onClick={() => navigate('/dashboard/profile')}><User size={14} style={{ marginRight: 8 }} />Profile</span> },
      { key: 'logout', label: <span onClick={handleLogout}><LogOut size={14} style={{ marginRight: 8, color: '#ff4d4f' }} /><span style={{ color: '#ff4d4f' }}>Logout</span></span> }
    ]
  };

  const desktopNavVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: shouldReduceMotion ? 0 : i * 0.05, duration: 0.3 }
    })
  };

  return (
    <>
      <header className="top-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
            <Sparkles size={24} color="var(--primary-color)" />
            <Title level={4} style={{ margin: 0, color: 'var(--text-color)', fontWeight: 800, whiteSpace: 'nowrap', letterSpacing: '-0.03em' }}>
              <span style={{ color: 'var(--primary-color)' }}>Cognify</span>X AI
            </Title>
          </div>

          {/* Desktop Nav Items */}
          <nav className="desktop-only" style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            {menuItems.map((item, i) => {
              const isActive = location.pathname === item.key;
              return (
                <motion.div
                  key={item.key}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={desktopNavVariants}
                  style={{ position: 'relative' }}
                >
                  <div
                    className="top-nav-item"
                    onClick={() => navigate(item.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      color: isActive ? 'var(--text-color)' : 'var(--text-muted)',
                      fontWeight: isActive ? 600 : 500,
                      cursor: 'pointer',
                      padding: '8px 4px',
                      transition: 'color 0.2s ease',
                    }}
                  >
                    {React.cloneElement(item.icon, { size: 16, color: isActive ? 'var(--primary-color)' : 'currentColor' })}
                    <span>{item.label}</span>
                  </div>
                  {/* Sliding Underline Effect */}
                  {isActive && (
                    <motion.div
                      layoutId={shouldReduceMotion ? undefined : "activeNavIndicator"}
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 2,
                        background: 'var(--primary-color)',
                        boxShadow: '0 0 8px var(--primary-color)',
                        borderRadius: 2
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.div>
              );
            })}
          </nav>
        </div>

        {/* Right Side Tools & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Timer Tool */}
          <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', background: 'var(--card-bg)', padding: '4px 12px', borderRadius: 20, border: '1px solid var(--border-color)' }}>
            <span style={{ fontFamily: 'monospace', fontSize: 16, color: 'var(--primary-color)', marginRight: 8 }}>
              {String(Math.floor(timer / 60)).padStart(2, '0')}:{String(timer % 60).padStart(2, '0')}
            </span>
            <Button type="text" size="small" icon={isTimerActive ? <Pause size={14} color="#faad14"/> : <Play size={14} color="#52c41a"/>} onClick={() => setIsTimerActive(!isTimerActive)} />
            <Button type="text" size="small" icon={<RefreshCw size={14} color="var(--text-muted)"/>} onClick={() => { setIsTimerActive(false); setTimer(0); }} />
          </div>

          <Button type="text" onClick={toggleTheme} icon={isDark ? <Sun size={18} color="#faad14" /> : <Moon size={18} color="#0f172a" />} />

          <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <Avatar style={{ background: 'linear-gradient(135deg, #00f2fe, #4facfe)', color: '#000', fontWeight: 'bold' }}>
                {user?.name?.[0]?.toUpperCase() || user?.user_metadata?.name?.[0]?.toUpperCase() || 'U'}
              </Avatar>
              <span className="desktop-only" style={{ color: 'var(--text-color)', fontWeight: 500 }}>
                {user?.name?.split(' ')[0] || user?.user_metadata?.name?.split(' ')[0] || 'User'}
                {(user?.isPremium || user?.user_metadata?.isPremium) && <span style={{ marginLeft: 6 }} title="Premium Active">👑</span>}
              </span>
            </div>
          </Dropdown>

          {/* Mobile Menu Toggle */}
          <Button
            className="mobile-only"
            type="text"
            icon={mobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ color: 'var(--text-color)' }}
          />
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="mobile-drawer"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3, ease: 'easeInOut' }}
          >
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.key;
                return (
                  <div
                    key={item.key}
                    onClick={() => {
                      navigate(item.key);
                      setMobileMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      borderRadius: 12,
                      background: isActive ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                      color: isActive ? 'var(--primary-color)' : 'var(--text-color)',
                      fontWeight: isActive ? 600 : 500,
                      cursor: 'pointer',
                      boxShadow: isActive ? 'inset 2px 0 0 var(--primary-color)' : 'none'
                    }}
                  >
                    {React.cloneElement(item.icon, { size: 18, color: isActive ? 'var(--primary-color)' : 'var(--text-muted)' })}
                    <span style={{ fontSize: 16 }}>{item.label}</span>
                  </div>
                );
              })}
              
              <div style={{ height: 1, background: 'var(--border-color)', margin: '8px 0' }} />
              
              {/* Mobile Timer display */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Focus Timer:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                   <span style={{ fontFamily: 'monospace', fontSize: 16, color: 'var(--primary-color)' }}>
                    {String(Math.floor(timer / 60)).padStart(2, '0')}:{String(timer % 60).padStart(2, '0')}
                  </span>
                  <Button type="text" size="small" icon={isTimerActive ? <Pause size={14} color="#faad14"/> : <Play size={14} color="#52c41a"/>} onClick={() => setIsTimerActive(!isTimerActive)} />
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TopNav;
