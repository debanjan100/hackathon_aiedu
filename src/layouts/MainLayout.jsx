import React, { useState, useRef, useEffect } from 'react';
import { Layout, Menu, Typography, Button, FloatButton, Drawer, Input, Spin, Avatar, Dropdown, message } from 'antd';
import { 
  LayoutDashboard, 
  User, 
  BrainCircuit, 
  BarChart2, 
  Menu as MenuIcon,
  Send,
  Sparkles,
  LogOut,
  Calendar,
  Play,
  Pause,
  RefreshCw,
  Moon,
  Sun,
  Compass
} from 'lucide-react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const getSmartAIResponse = (input) => {
  const lowerInput = input.toLowerCase();
  if (lowerInput.includes('stack')) return "A Stack is LIFO (Last In First Out). Think of stacking plates — you always pick from the top! 🍽️";
  if (lowerInput.includes('queue')) return "A Queue is FIFO (First In First Out). Like a ticket counter — first come, first served! 🎫";
  if (lowerInput.includes('linked list')) return "A Linked List is a series of nodes, each pointing to the next. Unlike arrays, they're dynamic in size! 🔗";
  if (lowerInput.includes('tree')) return "A Tree in DSA represents hierarchical data. We have Root, Nodes, and Leaves. Need help with traversal (Inorder, Preorder, Postorder)? 🌳";
  if (lowerInput.includes('recursion')) return "Recursion is when a function calls itself with a smaller problem until reaching a base case! 🔄";
  if (lowerInput.includes('react')) return "React uses a Virtual DOM to optimize rendering. Key concepts: JSX, Components, Props, State, Hooks! ⚛️";
  if (lowerInput.includes('graph')) return "Graphs have vertices (nodes) and edges. Traversal: BFS (queue-based) and DFS (stack-based). Used in maps, social networks! 🗺️";
  if (lowerInput.includes('sql')) return "SQL is the language for relational databases. Key commands: SELECT, INSERT, UPDATE, DELETE, and JOIN! 🗃️";
  if (lowerInput.includes('machine learning') || lowerInput.includes('ml')) return "Machine Learning teaches computers to learn from data. 3 key types: Supervised, Unsupervised, and Reinforcement Learning! 🤖";
  return "Great question! I'm your AI Tutor. Ask me about DSA (Trees, Stacks, Graphs), React, SQL, Machine Learning, or any Class 11/12 topic! 💡";
};

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Timer State
  const [timer, setTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const messagesEndRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [messages, setMessages] = useState([
    { sender: 'ai', text: `Hi ${user?.name || 'there'}! 👋 I'm your AI Tutor. Ask me anything about DSA, React, SQL, or your Class 11/12 topics!` }
  ]);

  // Timer Effect
  useEffect(() => {
    let interval;
    if (isTimerActive) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const typeEffect = (fullString) => {
    let index = 0;
    setMessages((prev) => [...prev, { sender: 'ai', text: '', isTyping: true }]);
    const interval = setInterval(() => {
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { ...newMessages[newMessages.length - 1], text: fullString.substring(0, index + 1) };
        return newMessages;
      });
      index++;
      if (index === fullString.length) { clearInterval(interval); setMessages((prev) => { const nm = [...prev]; nm[nm.length - 1].isTyping = false; return nm; }); }
    }, 22);
  };

  const handleSendMessage = async () => {
    if (!chatInput) return;

    const userMsg = { sender: "user", text: chatInput };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: chatInput })
      });

      const data = await res.json();
      setIsTyping(false);

      setMessages(prev => [
        ...prev,
        { sender: "ai", text: data.reply }
      ]);

    } catch {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        { sender: "ai", text: "Server error 😓" }
      ]);
    }

    setChatInput("");
  };

  const handleLogout = () => { logout(); message.success('Logged out!'); navigate('/login'); };

  const userMenu = { items: [
    { key: 'profile', label: <span onClick={() => navigate('/profile')}><User size={14} style={{ marginRight: 8 }} />Profile</span> },
    { key: 'logout', label: <span onClick={handleLogout}><LogOut size={14} style={{ marginRight: 8, color: '#ff4d4f' }} /><span style={{ color: '#ff4d4f' }}>Logout</span></span> }
  ]};

  const menuItems = [
    { key: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { key: '/dashboard/roadmap', icon: <Compass size={18} />, label: 'Smart Path' },
    { key: '/dashboard/planner', icon: <Calendar size={18} />, label: 'Study Planner' },
    { key: '/dashboard/assessment', icon: <BrainCircuit size={18} />, label: 'Skill Assessment' },
    { key: '/dashboard/analytics', icon: <BarChart2 size={18} />, label: 'Analytics' },
    { key: '/dashboard/profile', icon: <User size={18} />, label: 'Profile' },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} theme="dark">
        <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '64px' }}>
          {!collapsed ? (
            <Title level={4} style={{ margin: 0, color: '#00f2fe', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={20} /> AI Edu
            </Title>
          ) : <Sparkles color="#00f2fe" />}
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]} items={menuItems} onClick={({ key }) => navigate(key)} />
      </Sider>
      <Layout style={{ background: 'transparent' }}>
        <Header style={{ padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1, background: 'var(--card-bg)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(0,242,254,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button type="text" icon={<MenuIcon size={20} color="var(--text-color)" />} onClick={() => setCollapsed(!collapsed)} style={{ marginRight: 16 }} />
            <Title level={5} style={{ margin: 0, color: 'var(--text-color)' }}>AI Skill Development</Title>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* LeetCode Style Study Timer */}
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.1)', padding: '4px 12px', borderRadius: 20, border: '1px solid rgba(0,242,254,0.3)' }}>
              <span style={{ fontFamily: 'monospace', fontSize: 16, color: '#00f2fe', marginRight: 8 }}>
                {String(Math.floor(timer / 60)).padStart(2, '0')}:{String(timer % 60).padStart(2, '0')}
              </span>
              <Button type="text" size="small" icon={isTimerActive ? <Pause size={14} color="#faad14"/> : <Play size={14} color="#52c41a"/>} onClick={() => setIsTimerActive(!isTimerActive)} />
              <Button type="text" size="small" icon={<RefreshCw size={14} color="#94a3b8"/>} onClick={() => { setIsTimerActive(false); setTimer(0); }} />
            </div>

            {/* Theme Toggle */}
            <Button type="text" onClick={toggleTheme} icon={isDark ? <Sun size={18} color="#faad14" /> : <Moon size={18} color="#0f172a" />} />

            <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <Avatar style={{ background: 'linear-gradient(135deg, #00f2fe, #4facfe)', color: '#000', fontWeight: 'bold' }}>
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </Avatar>
                <span style={{ color: 'var(--text-color)' }}>{user?.name || 'User'}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, borderRadius: 8, overflow: 'auto' }}>
          <Outlet />
        </Content>
      </Layout>

      {/* Floating AI Robot Button */}
      <div
        className="chatbot-pulse"
        style={{ position: 'fixed', right: 24, bottom: 24, width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)', boxShadow: '0 0 24px rgba(0,242,254,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, transition: 'transform 0.3s', overflow: 'hidden' }}
        onClick={() => setChatOpen(true)}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.12)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        title="AI Tutor"
      >
        <img src="/images/ai-robot.png" alt="AI Robot" style={{ width: 44, height: 44, objectFit: 'contain' }} />
      </div>

      <Drawer
        rootClassName="glass-drawer"
        title={<><Sparkles size={18} style={{ marginRight: 8, verticalAlign: 'middle', color: '#00f2fe' }}/>AI Chat Tutor</>}
        placement="right" onClose={() => setChatOpen(false)} open={chatOpen} width={380}
        styles={{ body: { display: 'flex', flexDirection: 'column', padding: 0 } }}
      >
        <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {messages.map((msg, idx) => (
            <div key={idx} className={msg.sender === 'user' ? 'chat-message chat-user' : 'chat-message chat-ai'}>
              {msg.text}{msg.isTyping && <span style={{ animation: 'blink 1s step-end infinite' }}>|</span>}
            </div>
          ))}
          {isTyping && <div className="chat-message chat-ai" style={{ width: 50, textAlign: 'center' }}><Spin size="small" /></div>}
          <div ref={messagesEndRef} />
        </div>
        <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 8 }}>
          <Input
            style={{ borderRadius: 20, background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none' }}
            placeholder="Ask a doubt..." value={chatInput}
            onChange={(e) => setChatInput(e.target.value)} onPressEnter={handleSendMessage}
            disabled={isTyping || messages[messages.length - 1]?.isTyping}
          />
          <Button className="gradient-btn" shape="circle" icon={<Send size={16} />} onClick={handleSendMessage}
            disabled={!chatInput.trim() || isTyping || messages[messages.length - 1]?.isTyping} />
        </div>
      </Drawer>
    </Layout>
  );
};

export default MainLayout;
