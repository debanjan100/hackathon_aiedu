import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Select, Progress, List, Tag, Badge, Button, message } from 'antd';
import { TrendingUp, Award, Calendar, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabaseClient';

const { Title, Text } = Typography;

const Dashboard = () => {
  const { user, login, token } = useAuth();
  const navigate = useNavigate();
  const [xp, setXp] = useState(0);

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

  // Phase 18: Universal Education Overhaul
  // Dynamically configure the dashboard payload based on the user's Academic Major
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
    dashboardThemeColor = "#10b981"; // Emerald
  } else if (major.includes('Business')) {
    topicScores = [
      { name: 'Macroeconomics: Market Trends', score: 20, path: 'macro' },
      { name: 'Startup Case Studies', score: 92, path: 'startups' },
      { name: 'Corporate Finance', score: 45, path: 'finance' }
    ];
    dashboardHeroImage = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop";
    dashboardTagline = "Ready to evaluate today's corporate environments?";
    dashboardThemeColor = "#f59e0b"; // Amber
  } else if (major.includes('Law')) {
    topicScores = [
      { name: 'Constitutional Law', score: 55, path: 'con-law' },
      { name: 'Ethics & Liability', score: 70, path: 'ethics' }
    ];
    dashboardHeroImage = "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800&auto=format&fit=crop";
    dashboardTagline = "Ready to defend your legal logic in court?";
    dashboardThemeColor = "#8b5cf6"; // Violet
  } else if (major.includes('Humanities')) {
    topicScores = [
      { name: 'Western Philosophy', score: 80, path: 'philosophy' },
      { name: 'Modern Literature Analysis', score: 40, path: 'literature' }
    ];
    dashboardHeroImage = "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop";
    dashboardTagline = "Ready to deconstruct classical literature?";
    dashboardThemeColor = "#ec4899"; // Pink
  } else {
    // Default: Computer Science
    topicScores = [
      { name: 'Trees & Graphs', score: 35, path: 'trees' },
      { name: 'Arrays & Hashing', score: 85, path: 'arrays' },
      { name: 'React Hooks', score: 60, path: 'react' }
    ];
    dashboardHeroImage = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop";
    dashboardTagline = "Ready to continue your AI-powered coding journey?";
    dashboardThemeColor = "#00f2fe"; // Cyan
  }

  const getRecommendation = (score) => {
    if (score < 50) return { text: 'Focus here: Fundamentals needed.', color: '#ff4d4f' };
    if (score < 80) return { text: 'Doing well! Practice harder problems.', color: '#faad14' };
    return { text: 'Excellent! Ready for mock interviews.', color: '#52c41a' };
  };

  const handlePremium = async () => {
    try {
      // Direct integration with the Supabase Serverless payment module
      const { data: orderData, error: orderErr } = await supabase.functions.invoke('payment', {
        body: { action: 'create-order' }
      });
      if (orderErr) throw orderErr;

      const options = {
        key: 'rzp_test_mock', // using mock key for the checkout widget demo
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'AI Edu Premium',
        description: 'Lifetime Mock Interviews',
        order_id: orderData.id,
        handler: async function (response) {
           const { data: verificationData, error: verifyErr } = await supabase.functions.invoke('payment', {
             body: { action: 'verify-payment', ...response, userId: user?.id }
           });
           
           if (!verifyErr && verificationData?.success) {
               // Update actual database user
               await supabase.from('users').update({ isPremium: true }).eq('id', user.id);
               message.success('Premium Unlocked! 🎉');
               if (login && token) {
                 login({ ...user, isPremium: true }, token);
               }
           } else {
               message.error('Payment verification failed securely.');
           }
        },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: '#00f2fe' }
      };
      
      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch(err) {
      message.error("Could not initiate payment system on edge.");
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 40 }}>
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
            <Button type="primary" size="large" className="gradient-btn" style={{ background: dashboardThemeColor, borderColor: dashboardThemeColor, borderRadius: 8, padding: '0 32px' }} onClick={() => navigate('/dashboard/course/practice')}>
              Access Training Arena
            </Button>
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
              <Progress type="circle" percent={70} strokeColor={{ '0%': dashboardThemeColor, '100%': '#fff' }}
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
            <Row gutter={16} style={{ marginTop: 16, textAlign: 'center' }}>
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

        {/* Dynamic Leaderboard */}
        <Col xs={24} md={8}>
          <Card className="glass-card" title={<span style={{ color: 'var(--text-color)' }}>🏆 Global Leaderboard</span>} bordered={false}>
             <List
              itemLayout="horizontal"
              dataSource={[
                { name: 'Alice', xp: '14,200', rank: 1, color: '#faad14' },
                { name: 'Bob', xp: '12,400', rank: 2, color: '#d4af37' },
                { name: 'Charlie', xp: '10,100', rank: 3, color: '#cd7f32' },
                { name: user?.user_metadata?.name || 'You', xp: xp.toLocaleString(), rank: 42, color: dashboardThemeColor }
              ]}
              renderItem={item => (
                <List.Item style={{ borderBottom: '1px solid var(--border-color)', padding: '12px 0' }}>
                  <List.Item.Meta
                    avatar={
                      <div style={{ width: 32, height: 32, borderRadius: 16, background: `linear-gradient(135deg, ${item.color}, #000)`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {item.rank}
                      </div>
                    }
                    title={<span style={{ color: 'var(--text-color)' }}>{item.name} {item.rank === 1 && '👑'}</span>}
                    description={<span style={{ color: item.color }}>{item.xp} XP</span>}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* AI Personalized Recommendations */}
        <Col xs={24} md={8}>
          <Card className="glass-card"
            title={<><TrendingUp size={18} style={{ marginRight: 8, verticalAlign: 'middle', color: dashboardThemeColor }}/><span style={{ color: 'var(--text-color)' }}>Smart Path</span></>}
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
                      <Button className="gradient-btn" size="small" style={{ borderRadius: 8, padding: '0 16px' }} onClick={() => navigate(`/dashboard/course/${item.path}`)}>
                        Start
                      </Button>
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

      {/* Premium Course Upsell Box */}
      {!user?.isPremium && (
        <Card className="glass-card" style={{ marginTop: 24, background: 'rgba(0,0,0,0.2)' }} bordered={false}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={4} style={{ color: '#faad14', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Award size={20} /> Upgrade to AI Premium
              </Title>
              <Text style={{ color: '#94a3b8' }}>Get access to 1-on-1 AI mock interviews and unlimited course downloads.</Text>
            </Col>
            <Col>
              <Button size="large" onClick={handlePremium} style={{ background: '#faad14', color: '#000', border: 'none', fontWeight: 'bold', borderRadius: 8 }}>
                Get Premium - ₹499
              </Button>
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
