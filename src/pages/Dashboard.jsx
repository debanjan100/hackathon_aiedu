import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Progress, List, Tag, Badge, Button, message } from 'antd';
import { TrendingUp, Award, Calendar, ChevronRight, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabaseClient';
import PaymentModal from '../components/PaymentModal';
import Leaderboard from '../components/Leaderboard';

const { Title, Text } = Typography;

const Dashboard = () => {
  const { user, login, token } = useAuth();
  const navigate = useNavigate();
  const [xp, setXp] = useState(0);

  // Local state to keep UI updated instantly after payment success
  const [isPremiumActive, setIsPremiumActive] = useState(user?.user_metadata?.isPremium === true || user?.isPremium === true);

  const shouldReduceMotion = useReducedMotion();
  const buttonHoverProps = shouldReduceMotion ? {} : { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 } };

  useEffect(() => {
    if (user?.id) {
      supabase.from('progress').select('xp_gained').eq('user_id', user.id)
        .then(({ data }) => {
          if (data && data.length > 0) {
            const totalXp = data.reduce((acc, curr) => acc + (curr.xp_gained || 0), 0);
            setXp(totalXp);
          }
        })
        .catch(err => console.error(err));
    }
  }, [user]);

  const major = user?.user_metadata?.course || 'Computer Science';

  let topicScores = [];
  let dashboardHeroImage = "";
  let dashboardTagline = "";
  let dashboardThemeColor = "";

  if (major.includes('Pre-Med')) {
    topicScores = [
      { name: 'Anatomy 101: Skeletal System', score: 35, path: 'anatomy-1' },
      { name: 'Clinical Diagnostics', score: 85, path: 'diagnostics' },
      { name: 'Pharmacology Fundamentals', score: 60, path: 'pharma' }
    ];
    dashboardHeroImage = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=800&auto=format&fit=crop";
    dashboardTagline = "Ready to continue your medical diagnostic training?";
    dashboardThemeColor = "#10b981";
  } else if (major.includes('Business')) {
    topicScores = [
      { name: 'Macroeconomics: Market Trends', score: 20, path: 'macro' },
      { name: 'Startup Case Studies', score: 92, path: 'startups' },
      { name: 'Corporate Finance', score: 45, path: 'finance' }
    ];
    dashboardHeroImage = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop";
    dashboardTagline = "Ready to evaluate today's corporate environments?";
    dashboardThemeColor = "#f59e0b";
  } else if (major.includes('Law')) {
    topicScores = [
      { name: 'Constitutional Law', score: 55, path: 'con-law' },
      { name: 'Ethics & Liability', score: 70, path: 'ethics' }
    ];
    dashboardHeroImage = "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800&auto=format&fit=crop";
    dashboardTagline = "Ready to defend your legal logic in court?";
    dashboardThemeColor = "#8b5cf6";
  } else if (major.includes('Humanities')) {
    topicScores = [
      { name: 'Western Philosophy', score: 80, path: 'philosophy' },
      { name: 'Modern Literature Analysis', score: 40, path: 'literature' }
    ];
    dashboardHeroImage = "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop";
    dashboardTagline = "Ready to deconstruct classical literature?";
    dashboardThemeColor = "#ec4899";
  } else {
    topicScores = [
      { name: 'Trees & Graphs', score: 35, path: 'trees' },
      { name: 'Arrays & Hashing', score: 85, path: 'arrays' },
      { name: 'React Hooks', score: 60, path: 'react' }
    ];
    dashboardHeroImage = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop";
    dashboardTagline = "Ready to continue your AI-powered coding journey?";
    dashboardThemeColor = "#00f2fe";
  }

  const getRecommendation = (score) => {
    if (score < 50) return { text: 'Focus here: Fundamentals needed.', color: '#ff4d4f' };
    if (score < 80) return { text: 'Doing well! Practice harder problems.', color: '#faad14' };
    return { text: 'Excellent! Ready for mock interviews.', color: '#52c41a' };
  };

  return (
    <div className="dashboard-grid" style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 40 }}>
      {/* Welcome Banner */}
      <Row gutter={[24, 24]} align="middle" style={{ marginBottom: 32, padding: '32px 40px', background: `linear-gradient(135deg, ${dashboardThemeColor}22 0%, ${dashboardThemeColor}05 100%)`, borderRadius: 24, border: `1px solid ${dashboardThemeColor}33` }}>
        <Col xs={24} md={16}>
          <Title level={2} style={{ color: 'var(--heading-color)', margin: 0 }}>
            Welcome back, {user?.user_metadata?.name?.split(' ')[0] || 'Demo User'}! 🚀
          </Title>
          <Text style={{ color: 'var(--text-secondary)', fontSize: 16 }}>
            {dashboardTagline}
          </Text>
          <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
            <Tag color="purple" style={{ padding: '6px 16px', fontSize: 14, borderRadius: 12, border: 'none', background: 'var(--card-bg)' }}>
              {major} Track
            </Tag>
            <motion.div {...buttonHoverProps} style={{ display: 'inline-block' }}>
              <Button type="primary" size="large" className="gradient-btn" style={{ background: dashboardThemeColor, borderColor: dashboardThemeColor, borderRadius: 8, padding: '0 32px' }} onClick={() => navigate('/dashboard/course/practice')}>
                Access Training Arena
              </Button>
            </motion.div>
          </div>
        </Col>
        <Col xs={24} md={8} style={{ textAlign: 'center' }}>
          <img src={dashboardHeroImage} alt={`${major} Theme`} style={{ maxWidth: '100%', height: 160, objectFit: 'cover', filter: `drop-shadow(0 10px 20px ${dashboardThemeColor}66)`, borderRadius: 16, border: `2px solid ${dashboardThemeColor}44` }} />
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Progress Overview & Streaks */}
        <Col xs={24} md={8}>
          <Card className="glass-card" title={<span style={{ color: 'var(--text-color)' }}>Overall Progress</span>} bordered={false}>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Progress type="circle" percent={70} size={180} strokeColor={{ '0%': dashboardThemeColor, '100%': '#fff' }}
                trailColor="var(--border-color)"
                format={percent => <span style={{ color: 'var(--text-color)', fontSize: 22, fontWeight: 700 }}>{percent}%</span>} />
              
              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 12 }}>
                <div>
                  <Text style={{ color: 'var(--text-secondary)' }} strong>Level: </Text>
                  <Tag style={{ background: `${dashboardThemeColor}22`, color: dashboardThemeColor, border: `1px solid ${dashboardThemeColor}44`, borderRadius: 12, fontWeight: 600 }}>
                    {user?.user_metadata?.skillLevel || 'Intermediate'}
                  </Tag>
                </div>
                <div>
                  <Text style={{ color: 'var(--text-secondary)' }} strong>Streak: </Text>
                  <Tag color="orange" style={{ borderRadius: 12, fontWeight: 600 }}>🔥 5 Days</Tag>
                </div>
              </div>
            </div>
            <Row gutter={[16, 16]} className="dashboard-stats-row" style={{ marginTop: 24, textAlign: 'center', background: 'rgba(255,255,255,0.02)', padding: '16px 0', borderRadius: 16 }}>
              <Col span={8}>
                <Title level={4} style={{ margin: 0, color: '#00f2fe' }}>12</Title>
                <Text style={{ color: '#94a3b8', fontSize: 12 }}>Lessons</Text>
              </Col>
              <Col span={8}>
                <Title level={4} style={{ margin: 0, color: '#faad14' }}>4</Title>
                <Text style={{ color: '#94a3b8', fontSize: 12 }}>Badges</Text>
              </Col>
              <Col span={8}>
                <Title level={4} style={{ margin: 0, color: '#52c41a' }}>14h</Title>
                <Text style={{ color: '#94a3b8', fontSize: 12 }}>Time</Text>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* New Premium Leaderboard */}
        <Col xs={24} md={8}>
          <Leaderboard />
        </Col>

        {/* AI Personalized Recommendations */}
        <Col xs={24} md={8}>
          <Card className="glass-card"
            title={<><TrendingUp size={18} style={{ marginRight: 8, verticalAlign: 'middle', color: dashboardThemeColor }} /><span style={{ color: 'var(--text-color)' }}>Smart Path</span></>}
            bordered={false}
          >
            <List
              itemLayout="horizontal"
              dataSource={topicScores}
              renderItem={item => {
                const rec = getRecommendation(item.score);
                return (
                  <List.Item
                    actions={[
                      <motion.div {...buttonHoverProps} style={{ display: 'inline-block' }}>
                        <Button className="gradient-btn" size="small" style={{ borderRadius: 8, padding: '0 16px' }} onClick={() => navigate(`/dashboard/course/${item.path}`)}>
                          Start
                        </Button>
                      </motion.div>
                    ]}
                    style={{ borderBottom: '1px solid var(--border-color)' }}
                  >
                    <List.Item.Meta
                      avatar={<Progress type="dashboard" percent={item.score} size={44} showInfo={false} strokeColor={rec.color} trailColor="var(--border-color)" />}
                      title={<span style={{ color: 'var(--text-color)' }}>{item.name}</span>}
                      description={<span style={{ color: rec.color, fontSize: 12 }}>→ {rec.text}</span>}
                    />
                  </List.Item>
                );
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Premium Course Upsell Box or Success Teal Box */}
      {!isPremiumActive ? (
        <Card className="glass-card" style={{ marginTop: 24, background: 'rgba(0,0,0,0.2)' }} bordered={false}>
          <Row justify="space-between" align="middle" className="mobile-stack">
            <Col>
              <Title level={4} style={{ color: '#faad14', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Award size={20} /> Upgrade to AI Premium
              </Title>
              <Text style={{ color: '#94a3b8' }}>Get access to 1-on-1 AI mock interviews and unlimited course downloads.</Text>
            </Col>
            <Col>
              <motion.div {...buttonHoverProps} style={{ display: 'inline-block' }}>
                <PaymentModal
                  user={user}
                  onSuccess={() => setIsPremiumActive(true)}
                  buttonProps={{
                    size: 'large',
                    style: { background: '#faad14', color: '#000', border: 'none', fontWeight: 'bold', borderRadius: 8 }
                  }}
                />
              </motion.div>
            </Col>
          </Row>
        </Card>
      ) : (
        <Card className="glass-card" style={{ marginTop: 24, background: 'rgba(0, 229, 255, 0.05)', border: '1px solid rgba(0, 229, 255, 0.3)', boxShadow: '0 0 20px rgba(0, 229, 255, 0.1)' }} bordered={false}>
          <Row justify="space-between" align="middle" className="mobile-stack">
            <Col>
              <Title level={4} style={{ color: '#00e5ff', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                ✨ AI Premium Active
              </Title>
              <Text style={{ color: '#94a3b8' }}>Enjoy unlimited access to all courses, 1-on-1 AI mentorship, and exclusive DSA problem sets.</Text>
            </Col>
            <Col>
               <motion.div {...buttonHoverProps}>
                 <Button type="primary" size="large" onClick={() => navigate('/mock-interview')} className="gradient-btn" style={{ fontSize: 16, height: 48, borderRadius: 12, padding: '0 24px', display: 'flex', alignItems: 'center', gap: 8 }}>
                   <Mic size={18} /> Enter Mock Interview
                 </Button>
               </motion.div>
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
