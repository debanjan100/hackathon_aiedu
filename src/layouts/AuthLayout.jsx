import React from 'react';
import { Row, Col, Typography } from 'antd';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';

const { Title, Text } = Typography;

const AuthLayout = () => {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  return (
    <Row className="animated-auth-bg" style={{ minHeight: '100vh', width: '100%' }}>
      {/* Left Panel: Static across routes */}
      <Col xs={0} md={12} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 6vw', overflow: 'hidden' }}>
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ maxWidth: 560 }}
        >
          {/* Image with Glowing border */}
          <div style={{
            borderRadius: 24,
            overflow: 'hidden',
            boxShadow: '0 0 40px rgba(0, 255, 255, 0.15), inset 0 0 20px rgba(0, 255, 255, 0.05)',
            border: '1px solid rgba(0, 255, 255, 0.2)',
            marginBottom: 32,
            background: 'rgba(255,255,255,0.02)'
          }}>
            <img src="/images/ai-learning.png" alt="AI Learning" style={{ width: '100%', display: 'block', border: '5px solid transparent' }} />
          </div>

          <Title level={2} style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 700, margin: '0 0 16px 0' }}>
            Your Personal AI Tutor
          </Title>
          <Text style={{ color: '#94a3b8', fontSize: '16px', display: 'block', marginBottom: 24, lineHeight: 1.6 }}>
            Adaptive learning paths, real-time AI mentorship, and career-focused DSA practice — all in one place.
          </Text>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
             <div className="auth-feature-pill">⚡ Smart Learning Paths</div>
             <div className="auth-feature-pill">🤖 AI Chatbot Support</div>
             <div className="auth-feature-pill">📊 Progress Analytics</div>
          </div>
        </motion.div>
      </Col>

      {/* Right Panel: Outlet for Login/Signup Form */}
      <Col xs={24} md={12} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, position: 'relative' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={shouldReduceMotion ? { opacity: 0, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{ width: '100%', maxWidth: 480 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </Col>
    </Row>
  );
};

export default AuthLayout;
