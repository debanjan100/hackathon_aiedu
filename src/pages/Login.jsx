import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Divider, message as antMessage } from 'antd';
import { Sparkles, Mail, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, useReducedMotion } from 'framer-motion';

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      antMessage.success('Welcome back! Redirecting to dashboard...', 2);
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (err) {
      antMessage.error(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
    >
      <Card
        bordered={false}
        className="glass-card auth-card-body"
        style={{
          width: '100%',
          maxWidth: 480,
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 24,
        }}
        bodyStyle={{ padding: 'var(--card-padding, 48px)' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <motion.div
            animate={shouldReduceMotion ? {} : { rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            style={{ display: 'inline-block', marginBottom: 16 }}
          >
            <Sparkles size={40} color="#00e5ff" />
          </motion.div>
          <Title level={2} style={{ color: '#fff', fontSize: '2rem', fontWeight: 700, margin: '0 0 8px 0' }}>
            Welcome Back
          </Title>
          <Text style={{ color: '#8892a4', fontSize: '16px' }}>
            Sign in to start your learning journey
          </Text>
        </div>

        <Form name="login" layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Please enter a valid email!' }]}>
            <motion.div whileFocus={shouldReduceMotion ? {} : { scale: 1.01 }}>
              <Input
                className="auth-input"
                prefix={<Mail size={16} color="#64748b" style={{ marginRight: 8 }} />}
                placeholder="Email address"
                size="large"
                style={{ borderRadius: 12, height: 48 }}
              />
            </motion.div>
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Please enter your password!' }]}>
            <motion.div whileFocus={shouldReduceMotion ? {} : { scale: 1.01 }}>
              <Input.Password
                className="auth-input"
                prefix={<Lock size={16} color="#64748b" style={{ marginRight: 8 }} />}
                placeholder="Password"
                size="large"
                style={{ borderRadius: 12, height: 48 }}
              />
            </motion.div>
          </Form.Item>
          
          <Text style={{ color: '#64748b', fontSize: 13, display: 'block', textAlign: 'center', marginBottom: 24 }}>
            Demo: <strong style={{ color: '#00e5ff' }}>demo@aiedu.com</strong> / <strong style={{ color: '#00e5ff' }}>password123</strong>
          </Text>

          <Form.Item style={{ marginBottom: 24 }}>
            <motion.div
              whileHover={shouldReduceMotion ? {} : { scale: 1.02, boxShadow: "0 0 20px rgba(0,198,255,0.4)" }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
              style={{ borderRadius: 12 }}
            >
              <Button
                htmlType="submit"
                block
                loading={loading}
                style={{
                  background: 'linear-gradient(135deg, #00c6ff, #0072ff, #7b2ff7)',
                  border: 'none',
                  color: 'white',
                  borderRadius: 12,
                  height: 52,
                  fontSize: 16,
                  fontWeight: 700
                }}
              >
                Sign In
              </Button>
            </motion.div>
          </Form.Item>
        </Form>

        <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#8892a4', margin: '24px 0' }}>
          or continue with
        </Divider>
        
        <Link to="/signup" style={{ textDecoration: 'none' }}>
          <motion.div
            whileHover={shouldReduceMotion ? {} : { backgroundColor: 'rgba(0,229,255,0.08)' }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
            style={{
              border: '1px solid rgba(0,229,255,0.4)',
              borderRadius: 12,
              height: 52,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00e5ff',
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
          >
            Create a Free Account
          </motion.div>
        </Link>
      </Card>
    </motion.div>
  );
};

export default Login;
