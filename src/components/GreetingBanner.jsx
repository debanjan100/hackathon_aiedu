import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const getISTTime = () => {
  const d = new Date();
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  return new Date(utc + (3600000 * 5.5)); // IST is +5:30
};

const getGreetingFields = () => {
  const now = new Date();
  const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const hours = ist.getHours();

  if (hours >= 5 && hours < 12) return { text: "Good Morning", emoji: "☀️" };
  if (hours >= 12 && hours < 17) return { text: "Good Afternoon", emoji: "🌤️" };
  if (hours >= 17 && hours < 21) return { text: "Good Evening", emoji: "🌆" };
  return { text: "Good Night", emoji: "🌙" };
};

const GreetingBanner = () => {


  const { user } = useAuth();
  const [greeting, setGreeting] = useState(getGreetingFields());

  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getGreetingFields());
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const nameVal = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Explorer';
  const firstName = nameVal.split(' ')[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        background: 'linear-gradient(135deg, rgba(0,153,170,0.08), rgba(124,58,237,0.08))',
        border: '1px solid rgba(0,153,170,0.2)',
        borderRadius: 'var(--radius-card)',
        padding: '24px 32px',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '28px'
      }}
    >
      <div className="ai-pulse-dot" style={{ width: 150, height: 150, top: -50, right: -20, background: 'var(--primary)', filter: 'blur(50px)', opacity: 0.15 }}></div>
      <div className="ai-pulse-dot" style={{ width: 150, height: 150, bottom: -50, left: 100, background: 'var(--secondary)', filter: 'blur(60px)', opacity: 0.1, animationDelay: '1s' }}></div>

      <div style={{ position: 'relative', zIndex: 10 }}>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.02em', color: 'var(--on-surface)' }}>
          {greeting.text},{' '}
          <span className="text-gradient">{firstName}</span>{' '}
          {greeting.emoji}
        </h1>
        <p style={{ color: 'var(--on-surface-muted)', margin: 0, fontSize: 16 }}>
          Ready to continue your learning journey today?
        </p>
      </div>
    </motion.div>
  );
};

export default GreetingBanner;
