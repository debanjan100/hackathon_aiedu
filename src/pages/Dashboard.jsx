import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Progress, List, Tag, Button, message, Divider } from 'antd';
import { Award, Target, Clock, Zap, BookOpen, Quote, CheckCircle, Play, Pause, RotateCcw, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabaseClient';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const QUOTES = [
  { text: "The future belongs to those who learn more skills and combine them in creative ways.", author: "Robert Greene" },
  { text: "Standardization breeds mediocrity. Orthogonality breeds genius.", author: "Naval Ravikant" },
  { text: "Do not wait to strike till the iron is hot; but make it hot by striking.", author: "William Butler Yeats" },
  { text: "The man who moves a mountain begins by carrying away small stones.", author: "Confucius" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "Your problem is to bridge the gap which exists between where you are now and the goal you intend to reach.", author: "Earl Nightingale" },
  { text: "What we fear of doing most is usually what we most need to do.", author: "Tim Ferriss" },
];

const getDailyQuote = () => {
  const dayString = new Date().toDateString();
  let hash = 0;
  for (let i = 0; i < dayString.length; i++) hash = dayString.charCodeAt(i) + ((hash << 5) - hash);
  return QUOTES[Math.abs(hash) % QUOTES.length];
};

const Dashboard = () => {
  const { user, login, token } = useAuth();
  const navigate = useNavigate();
  const [xp, setXp] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [activeNode, setActiveNode] = useState(null);

  // Pomodoro State
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    if (user?.id) {
       // Fetch XP
       supabase.from('progress').select('xp_gained').eq('user_id', user.id).then(({ data }) => {
         if (data && data.length > 0) setXp(data.reduce((acc, curr) => acc + (curr.xp_gained || 0), 0));
       });
       
       // Fetch Today's Tasks
       const today = dayjs().format('YYYY-MM-DD');
       supabase.from('tasks').select('*').eq('user_id', user.id).eq('date', today).then(({data}) => {
         if (data) setTasks(data);
       });

       // Hydrate Active Trajectory Node
       const nodes = user?.user_metadata?.roadmap_nodes;
       if (nodes && nodes.length > 0) {
          const nextTarget = nodes.find(n => n.status !== 'completed');
          setActiveNode(nextTarget || nodes[nodes.length - 1]);
       }
    }
  }, [user]);

  // Pomodoro Timer Engine
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (isActive && timeLeft === 0) {
      clearInterval(interval);
      setIsActive(false);
      handlePomodoroComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handlePomodoroComplete = async () => {
    if (!isBreak) {
      message.success('Deep Work Session Complete! +10 XP Gained.');
      if (user) {
        await supabase.from('progress').insert([{ user_id: user.id, xp_gained: 10 }]);
        setXp(x => x + 10);
      }
      setTimeLeft(5 * 60); // 5 min break
      setIsBreak(true);
    } else {
      message.success('Break time is over. Back to work!');
      setTimeLeft(25 * 60);
      setIsBreak(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handlePremium = async () => {
    try {
      const { data: orderData, error: orderErr } = await supabase.functions.invoke('payment', { body: { action: 'create-order' } });
      if (orderErr) throw orderErr;
      const options = {
        key: 'rzp_test_mock', amount: orderData.amount, currency: orderData.currency,
        name: 'AI Edu Premium', description: 'Lifetime Mock Interviews', order_id: orderData.id,
        handler: async function (response) {
           const { data: verificationData, error: verifyErr } = await supabase.functions.invoke('payment', {
             body: { action: 'verify-payment', ...response, userId: user?.id }
           });
           if (!verifyErr && verificationData?.success) {
               await supabase.from('users').update({ isPremium: true }).eq('id', user.id);
               message.success('Premium Unlocked! 🎉');
               if (login && token) login({ ...user, isPremium: true }, token);
           } else message.error('Payment verification failed securely.');
        },
        prefill: { name: user?.user_metadata?.name, email: user?.email },
        theme: { color: '#00f2fe' }
      };
      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch { message.error("Could not initiate payment system on edge."); }
  };

  const dailyQuote = getDailyQuote();
  const major = user?.user_metadata?.course || 'Computer Science';
  const themeColor = major.includes('Pre-Med') ? '#10b981' : major.includes('Business') ? '#f59e0b' : major.includes('Law') ? '#8b5cf6' : major.includes('Humanities') ? '#ec4899' : '#00f2fe';

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 40 }}>
      {/* OS Welcome Header */}
      <motion.div variants={itemVariants} style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 24 }}>
        <div>
          <Title level={2} style={{ color: 'var(--text-color)', margin: 0, fontWeight: 800, letterSpacing: '-0.5px' }}>
            Welcome back, <span style={{ color: themeColor }}>{user?.user_metadata?.name?.split(' ')[0] || 'Architect'}</span>.
          </Title>
          <Text style={{ color: '#94a3b8', fontSize: 16 }}>Ready to enter Flow State and accelerate your {major} trajectory?</Text>
        </div>
        <div style={{ textAlign: 'right' }}>
           <Tag color="purple" style={{ padding: '6px 16px', borderRadius: 20, background: `${themeColor}22`, color: themeColor, border: 'none', fontWeight: 600 }}>
             Level: {user?.user_metadata?.skillLevel || 'Intermediate'}
           </Tag>
           <Title level={4} style={{ color: '#fff', margin: '8px 0 0 0' }}>{xp.toLocaleString()} <span style={{ color: '#94a3b8', fontSize: 14 }}>XP</span></Title>
        </div>
      </motion.div>

      <Row gutter={[24, 24]}>
        {/* LEFT COLUMN: Deep Work Engine & Current Trajectory */}
        <Col xs={24} md={15}>
          {/* Active Node Hook */}
          <motion.div variants={itemVariants} whileHover={{ y: -4 }}>
            <Card style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '24px', backdropFilter: 'blur(24px)' }} bodyStyle={{ padding: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text style={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Target size={14} color={themeColor} /> Active Roadmap Objective
                  </Text>
                  <Title level={3} style={{ color: '#fff', margin: '8px 0' }}>
                    {activeNode ? activeNode.title : 'Build Your Career Matrix'}
                  </Title>
                  <Text style={{ color: '#64748b' }}>
                    {activeNode && user?.user_metadata?.roadmap_career ? `Pursuing ${user.user_metadata.roadmap_career.title}` : 'Initialize your roadmap to unlock dynamic modules.'}
                  </Text>
                </div>
                <div>
                  <Button 
                    type="primary" 
                    size="large"
                    icon={activeNode ? <Play size={18} /> : <BookOpen size={18} />}
                    onClick={() => {
                       if (activeNode) {
                         if (activeNode.type === 'Capstone Board') navigate('/dashboard/roadmap');
                         else navigate('/dashboard/course/sandbox-' + encodeURIComponent(activeNode.title.toLowerCase().replace(/\s+/g, '-')));
                       } else navigate('/dashboard/roadmap');
                    }}
                    style={{ height: 56, borderRadius: 16, background: activeNode ? `linear-gradient(135deg, ${themeColor}, #000)` : 'var(--bg-secondary)', border: `1px solid ${themeColor}44`, color: '#fff', fontWeight: 600, padding: '0 32px' }}
                  >
                    {activeNode ? 'Initialize Sandbox' : 'Open Matrix'}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Pomodoro Flow Engine */}
          <motion.div variants={itemVariants} whileHover={{ y: -4 }} style={{ marginTop: 24 }}>
            <Card style={{ background: '#0a0a0a', border: `1px solid ${isBreak ? '#10b981' : themeColor}44`, borderRadius: 32, overflow: 'hidden', position: 'relative' }} bodyStyle={{ padding: 48, zIndex: 2, position: 'relative', textAlign: 'center' }}>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 300, height: 300, background: isBreak ? '#10b981' : themeColor, filter: 'blur(150px)', opacity: isActive ? 0.3 : 0.1, transition: 'opacity 0.5s ease', zIndex: 0 }} />
              
              <Tag style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', padding: '6px 16px', borderRadius: 20, marginBottom: 24, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>
                <Clock size={12} style={{ marginRight: 6, verticalAlign: 'middle' }}/>
                {isBreak ? 'Recovery Phase' : 'Deep Work Session'}
              </Tag>
              
              <div style={{ fontSize: 96, fontWeight: 800, color: '#fff', fontFamily: 'JetBrains Mono, monospace', lineHeight: 1, marginBottom: 40, textShadow: '0 10px 30px rgba(0,0,0,0.5)', fontVariantNumeric: 'tabular-nums' }}>
                {formatTime(timeLeft)}
              </div>

              <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                <Button 
                  shape="circle" 
                  size="large" 
                  style={{ width: 64, height: 64, background: isActive ? 'rgba(255,255,255,0.1)' : themeColor, border: 'none', color: isActive ? '#fff' : '#000' }}
                  onClick={() => setIsActive(!isActive)}
                >
                  {isActive ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: 4 }}/>}
                </Button>
                <Button 
                  shape="circle" 
                  size="large" 
                  style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}
                  onClick={() => { setIsActive(false); setTimeLeft(isBreak ? 5 * 60 : 25 * 60); }}
                >
                  <RotateCcw size={24} />
                </Button>
              </div>
            </Card>
          </motion.div>
        </Col>

        {/* RIGHT COLUMN: Tasks & Upsell */}
        <Col xs={24} md={9}>
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <Card title={<><CheckCircle size={18} style={{ marginRight: 8, verticalAlign: 'middle', color: '#10b981' }}/><span style={{ color: 'var(--text-color)' }}>Today's Agenda</span></>} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, height: '100%', minHeight: 400 }} bodyStyle={{ padding: '0 24px 24px 24px' }} bordered={false}>
              {tasks.length > 0 ? (
                <List
                  dataSource={tasks}
                  renderItem={item => (
                    <List.Item style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '16px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 4, background: item.color === 'processing' ? themeColor : '#10b981' }} />
                        <Text style={{ color: '#e2e8f0', fontSize: 15 }}>{item.text}</Text>
                      </div>
                    </List.Item>
                  )}
                />
              ) : (
                <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748b' }}>
                  <CheckCircle size={48} opacity={0.2} style={{ display: 'block', margin: '0 auto 16px' }} />
                  <Text style={{ color: '#64748b' }}>No deadlines scheduled for today.</Text><br/>
                  <Button type="link" onClick={() => navigate('/dashboard/planner')} style={{ color: themeColor, marginTop: 8 }}>Open Study Planner →</Button>
                </div>
              )}
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* BOTTOM BAR: Motivational Quote */}
      <motion.div variants={itemVariants} style={{ marginTop: 24 }}>
        <Card style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ width: 48, height: 48, borderRadius: 24, background: `${themeColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Quote size={20} color={themeColor} />
            </div>
            <div>
               <Title level={5} style={{ color: '#e2e8f0', margin: '0 0 8px 0', fontWeight: 400, fontStyle: 'italic' }}>"{dailyQuote.text}"</Title>
               <Text style={{ color: '#64748b', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>— {dailyQuote.author}</Text>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Premium Protocol */}
      {!user?.isPremium && (
        <motion.div variants={itemVariants} style={{ marginTop: 24 }}>
          <Card style={{ background: 'linear-gradient(90deg, #1e1b4b 0%, #312e81 100%)', border: '1px solid #4f46e5', borderRadius: 16 }} bodyStyle={{ padding: '24px 32px' }}>
            <Row justify="space-between" align="middle">
              <Col>
                <Title level={4} style={{ color: '#818cf8', margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Award size={20} color="#818cf8"/> AI Premium Protocol
                </Title>
                <Text style={{ color: '#c7d2fe' }}>Unlock unlimited Mock FAANG Interviews and dedicated Cloud infrastructure.</Text>
              </Col>
              <Col>
                <Button size="large" onClick={handlePremium} style={{ background: '#4f46e5', color: '#fff', border: 'none', fontWeight: 600, borderRadius: 8, padding: '0 32px' }}>
                  Upgrade Intelligence - ₹499
                </Button>
              </Col>
            </Row>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Dashboard;
