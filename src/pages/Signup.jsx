import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Divider, message as antMessage, Row, Col, Select } from 'antd';
import { Sparkles, Mail, Lock, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    // Mock success: log them in immediately
    const userData = { name: values.name, email: values.email, skillLevel: values.skillLevel || 'Beginner' };
    login(userData, 'new-mock-jwt-token');
    antMessage.success('Account created! Welcome to AI Edu 🎓', 2);
    setTimeout(() => navigate('/assessment'), 500);
  };

  return (
    <Row style={{ minHeight: '100vh', background: '#0f172a' }}>
      <Col xs={0} md={12} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(79,172,254,0.1) 0%, rgba(0,242,254,0.05) 100%)' }} />
        <div style={{ textAlign: 'center', zIndex: 1, padding: 48 }}>
          <img src="/images/ai-learning.png" alt="AI Learning" style={{ maxWidth: 460, width: '100%', filter: 'drop-shadow(0 0 40px rgba(79,172,254,0.4))' }} />
          <Title level={2} style={{ color: '#fff', marginTop: 32 }}>Your Personal AI Tutor</Title>
          <Text style={{ color: '#94a3b8', fontSize: 16 }}>Adaptive learning paths, built for you.</Text>
        </div>
      </Col>

      <Col xs={24} md={12} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Card className="glass-card" bordered={false} style={{ width: '100%', maxWidth: 440, background: 'rgba(255,255,255,0.04)' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <Sparkles size={40} color="#00f2fe" style={{ marginBottom: 12 }} />
            <Title level={3} style={{ color: '#fff', margin: 0 }}>Create Account</Title>
            <Text style={{ color: '#94a3b8' }}>🎓 Start your learning journey</Text>
          </div>

          <Form name="signup" layout="vertical" onFinish={onFinish}>
            <Form.Item name="name" rules={[{ required: true, message: 'Please enter your name!' }]}>
              <Input prefix={<User size={16} color="#64748b" />} placeholder="Full Name" size="large"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 10 }} />
            </Form.Item>
            <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Please enter a valid email!' }]}>
              <Input prefix={<Mail size={16} color="#64748b" />} placeholder="Email address" size="large"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 10 }} />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, min: 6, message: 'Password must be at least 6 characters!' }]}>
              <Input.Password prefix={<Lock size={16} color="#64748b" />} placeholder="Password (min 6 chars)" size="large"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 10 }} />
            </Form.Item>
            <Form.Item name="course" rules={[{ required: true, message: 'Please select your class/level!' }]}>
              <Select placeholder="Select your class / level" size="large" style={{ borderRadius: 10 }}>
                <Select.Option value="class11">Class 11 (PCM / CS)</Select.Option>
                <Select.Option value="class12">Class 12 (PCM / CS)</Select.Option>
                <Select.Option value="btech">B.Tech / College CS</Select.Option>
                <Select.Option value="other">Other</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Button className="gradient-btn" htmlType="submit" size="large" block loading={loading} style={{ borderRadius: 10, height: 48, fontSize: 16 }}>
                Create My Account
              </Button>
            </Form.Item>
          </Form>

          <Divider style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <Text style={{ color: '#64748b' }}>Already registered?</Text>
          </Divider>
          <Link to="/login">
            <Button block size="large" ghost style={{ borderColor: 'rgba(0,242,254,0.4)', color: '#00f2fe', borderRadius: 10, height: 44 }}>
              Sign In Instead
            </Button>
          </Link>
        </Card>
      </Col>
    </Row>
  );
};

export default Signup;
