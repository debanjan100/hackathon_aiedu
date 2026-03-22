import React, { useState } from 'react';
import { Row, Col, Card, Typography, Select, Progress, List, Tag, Badge, Button } from 'antd';
import { TrendingUp, Award, Calendar, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const topicScores = [
    { name: 'Trees & Graphs', score: 35, path: 'trees' },
    { name: 'Arrays & Hashing', score: 85, path: 'arrays' },
    { name: 'React Hooks', score: 60, path: 'react' }
  ];

  const getRecommendation = (score) => {
    if (score < 50) return { text: 'Focus here: Fundamentals needed.', color: '#ff4d4f' };
    if (score < 80) return { text: 'Doing well! Practice harder problems.', color: '#faad14' };
    return { text: 'Excellent! Ready for mock interviews.', color: '#52c41a' };
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 40 }}>
      {/* Welcome Banner */}
      <Row gutter={[24, 24]} align="middle" style={{ marginBottom: 32, padding: '32px 40px', background: 'linear-gradient(135deg, rgba(0,242,254,0.1) 0%, rgba(79,172,254,0.05) 100%)', borderRadius: 24, border: '1px solid rgba(0,242,254,0.2)' }}>
        <Col xs={24} md={16}>
          <Title level={2} style={{ color: 'var(--heading-color)', margin: 0 }}>
            Welcome back, {user?.name?.split(' ')[0] || 'Demo User'}! 🚀
          </Title>
          <Text style={{ color: 'var(--text-secondary)', fontSize: 16 }}>
            Ready to continue your AI-powered learning journey?
          </Text>
          <div style={{ marginTop: 24 }}>
            <Button type="primary" size="large" className="gradient-btn" style={{ borderRadius: 8, padding: '0 32px' }} onClick={() => navigate('/dashboard/course/practice')}>
              Resume Lesson
            </Button>
          </div>
        </Col>
        <Col xs={24} md={8} style={{ textAlign: 'center' }}>
          <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop" alt="Data Science Graphs" style={{ maxWidth: '100%', height: 160, objectFit: 'cover', filter: 'drop-shadow(0 10px 20px rgba(0,242,254,0.4))', borderRadius: 16, border: '2px solid rgba(0,242,254,0.3)' }} />
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Progress Overview & Streaks */}
        <Col xs={24} md={8}>
          <Card className="glass-card" title={<span style={{ color: 'var(--text-color)' }}>Overall Progress</span>} bordered={false}>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Progress type="circle" percent={70} strokeColor={{ '0%': '#00f2fe', '100%': '#4facfe' }}
                trailColor="rgba(255,255,255,0.1)"
                format={percent => <span style={{ color: 'var(--text-color)', fontSize: 22, fontWeight: 700 }}>{percent}%</span>} />
              
              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 12 }}>
                <div>
                  <Text style={{ color: 'var(--text-secondary)' }} strong>Level: </Text>
                  <Tag style={{ background: 'rgba(0,242,254,0.15)', color: '#00f2fe', border: '1px solid rgba(0,242,254,0.3)', borderRadius: 12, fontWeight: 600 }}>
                    {user?.skillLevel || 'Intermediate'}
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
                { name: 'Alice JS', xp: '14,200', rank: 1, color: '#faad14' },
                { name: 'Bob React', xp: '12,400', rank: 2, color: '#d4af37' },
                { name: 'Charlie Code', xp: '10,100', rank: 3, color: '#cd7f32' },
                { name: user?.name || 'You', xp: '8,450', rank: 42, color: '#00f2fe' }
              ]}
              renderItem={item => (
                <List.Item style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '12px 0' }}>
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
            title={<><TrendingUp size={18} style={{ marginRight: 8, verticalAlign: 'middle', color: '#00f2fe' }}/><span style={{ color: 'var(--text-color)' }}>Smart Path</span></>}
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
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <List.Item.Meta
                      avatar={<Progress type="dashboard" percent={item.score} size={44} showInfo={false} strokeColor={rec.color} trailColor="rgba(255,255,255,0.1)" />}
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
      <Card className="glass-card" style={{ marginTop: 24, background: 'rgba(0,0,0,0.2)' }} bordered={false}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ color: '#faad14', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Award size={20} /> Upgrade to AI Premium
            </Title>
            <Text style={{ color: '#94a3b8' }}>Get access to 1-on-1 AI mock interviews and unlimited course downloads.</Text>
          </Col>
          <Col>
            <Button size="large" style={{ background: '#faad14', color: '#000', border: 'none', fontWeight: 'bold', borderRadius: 8 }}>
              Get Premium - ₹499
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Dashboard;
