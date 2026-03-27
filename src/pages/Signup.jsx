import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Divider, message as antMessage, Select } from 'antd';
import { Sparkles, Mail, Lock, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, useReducedMotion } from 'framer-motion';

const { Title, Text } = Typography;

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const data = await signup(values.email, values.password, values.name);
      if (data?.user && !data?.session) {
        antMessage.warning('Account created, but Email Confirmation is enabled in your Supabase project! Please check your email or disable it in Supabase Settings.', 6);
      } else {
        antMessage.success('Account created! Welcome to AI Edu 🎓', 2);
        setTimeout(() => navigate('/dashboard'), 500);
      }
    } catch (err) {
      antMessage.error(err.message || 'Failed to create account. Please try again.');
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
            Create Account
          </Title>
          <Text style={{ color: '#8892a4', fontSize: '16px' }}>
            Start your learning journey
          </Text>
        </div>

        <Form name="signup" layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" rules={[{ required: true, message: 'Please enter your name!' }]}>
            <motion.div whileFocus={shouldReduceMotion ? {} : { scale: 1.01 }}>
              <Input
                className="auth-input"
                prefix={<User size={16} color="#64748b" style={{ marginRight: 8 }} />}
                placeholder="Full Name"
                size="large"
                style={{ borderRadius: 12, height: 48 }}
              />
            </motion.div>
          </Form.Item>
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
          <Form.Item name="password" rules={[{ required: true, min: 6, message: 'Password must be at least 6 characters!' }]}>
            <motion.div whileFocus={shouldReduceMotion ? {} : { scale: 1.01 }}>
              <Input.Password
                className="auth-input"
                prefix={<Lock size={16} color="#64748b" style={{ marginRight: 8 }} />}
                placeholder="Password (min 6 chars)"
                size="large"
                style={{ borderRadius: 12, height: 48 }}
              />
            </motion.div>
          </Form.Item>
          <Form.Item name="course" rules={[{ required: true, message: 'Please select your class/level!' }]}>
             <Select placeholder="Select your class / level" size="large" style={{ borderRadius: 12, height: 48 }} dropdownClassName="dark-select-popup">
                <Select.Option value="class11">Class 11 (PCM / CS)</Select.Option>
                <Select.Option value="class12">Class 12 (PCM / CS)</Select.Option>
                <Select.Option value="btech">B.Tech / College CS</Select.Option>
                <Select.Option value="other">Other</Select.Option>
             </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 24, marginTop: 8 }}>
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
                Create My Account
              </Button>
            </motion.div>
          </Form.Item>
        </Form>

        <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#8892a4', margin: '24px 0' }}>
          or continue with
        </Divider>
        
        <Link to="/login" style={{ textDecoration: 'none' }}>
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
            Sign In Instead
          </motion.div>
        </Link>
      </Card>
    </motion.div>
  );
};

export default Signup;
