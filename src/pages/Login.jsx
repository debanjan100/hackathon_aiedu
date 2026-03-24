import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Divider, message as antMessage, Row, Col } from 'antd';
import { Sparkles, Mail, Lock, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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
    <Row style={{ minHeight: '100vh', background: '#0f172a' }}>
      {/* Left: Hero Illustration */}
      <Col
        xs={0} md={12}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,242,254,0.1) 0%, rgba(79,172,254,0.05) 100%)' }} />
        <div style={{ textAlign: 'center', zIndex: 1, padding: 48 }}>
          <img src="/images/ai-learning.png" alt="AI Learning" style={{ maxWidth: 460, width: '100%', filter: 'drop-shadow(0 0 40px rgba(0,242,254,0.4))' }} />
          <Title level={2} style={{ color: 'var(--text-color)', marginTop: 32 }}>Learn Smarter with AI</Title>
          <Text style={{ color: '#94a3b8', fontSize: 16 }}>Adaptive lessons. Personalized to you.</Text>
        </div>
      </Col>

      {/* Right: Form */}
      <Col xs={24} md={12} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Card
          className="glass-card"
          bordered={false}
          style={{ width: '100%', maxWidth: 440, background: 'rgba(255,255,255,0.04)' }}
        >
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <Sparkles size={40} color="#00f2fe" style={{ marginBottom: 12 }} />
            <Title level={3} style={{ color: 'var(--text-color)', margin: 0 }}>Welcome Back</Title>
            <Text style={{ color: '#94a3b8' }}>Sign in to your AI Edu account</Text>
          </div>

          <Form name="login" layout="vertical" onFinish={onFinish} autoComplete="off">
            <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Please enter a valid email!' }]}>
              <Input
                prefix={<Mail size={16} color="#64748b" />}
                placeholder="Email address"
                size="large"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 10 }}
              />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: 'Please enter your password!' }]}>
              <Input.Password
                prefix={<Lock size={16} color="#64748b" />}
                placeholder="Password"
                size="large"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 10 }}
              />
            </Form.Item>
            <Form.Item>
              <Button className="gradient-btn" htmlType="submit" size="large" block loading={loading} style={{ borderRadius: 10, height: 48, fontSize: 16 }}>
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <Text style={{ color: '#64748b', fontSize: 12, display: 'block', textAlign: 'center', marginBottom: 16 }}>
            Demo: <strong style={{ color: '#00f2fe' }}>demo@aiedu.com</strong> / <strong style={{ color: '#00f2fe' }}>password123</strong>
          </Text>

          <Divider style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
            <Text style={{ color: '#64748b' }}>New here?</Text>
          </Divider>
          <Link to="/signup">
            <Button block size="large" ghost style={{ borderColor: 'rgba(0,242,254,0.4)', color: '#00f2fe', borderRadius: 10, height: 44 }}>
              Create a Free Account
            </Button>
          </Link>
        </Card>
      </Col>
    </Row>
  );
};

export default Login;
