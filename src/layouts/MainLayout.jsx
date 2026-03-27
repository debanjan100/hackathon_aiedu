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
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../config/supabaseClient';
import TopNav from '../components/TopNav';

const { Content } = Layout;
const { Title } = Typography;

const MainLayout = () => {
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
    { sender: 'ai', text: `Hi ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm your AI Tutor. Ask me anything about DSA, React, SQL, or your Class 11/12 topics!` }
  ]);

  // Timer Effect containing Pomodoro XP Logic (every 60s)
  useEffect(() => {
    let interval;
    if (isTimerActive) {
      interval = setInterval(() => {
        setTimer(t => {
          const newT = t + 1;
          if (newT > 0 && newT % 60 === 0 && user?.id) {
             axios.post("http://localhost:5000/progress/add", { userId: user.id, amount: 10 })
                  .then(() => message.success('Stayed focused! +10 XP 🔥'))
                  .catch(() => null);
          }
          return newT;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessageLogic = async (textToSend, currentMessages) => {
    setIsTyping(true);
    setMessages(currentMessages);
    
    // Map existing history to Gemini structured content
    const contents = currentMessages.map(msg => ({
      role: msg.sender === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    try {
      let responseText = "";
      // If deployed with Supabase, hit the Edge Function
      if (import.meta.env.VITE_SUPABASE_URL) {
         const { data, error } = await supabase.functions.invoke('chat', {
            body: { message: textToSend, context: "Act as an incredibly intelligent DSA and tech mentor. Answer concisely." }
         });
         
         if (error) throw error;
         if (data.error) throw new Error(data.error); // Catch explicit 200-level edge exits
         
         responseText = data.reply;
      } else {
         // Local fallback
         const res = await axios.post("http://localhost:5000/chat", { contents });
         responseText = res.data.reply;
      }
      
      setIsTyping(false);
      setMessages(prev => [...prev, { sender: "ai", text: responseText }]);
    } catch (err) {
      setIsTyping(false);
      setMessages(prev => [...prev, { sender: "ai", text: `Connection Error: ${err.message || 'Unknown network error. Check console.'}` }]);
    }
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = { sender: "user", text: chatInput };
    setChatInput("");
    handleSendMessageLogic(chatInput, [...messages, userMsg]);
  };

  const openMockInterview = (topic) => {
    setChatOpen(true);
    const prompt = `System Hint: Start a mock DSA interview with me on the topic of ${topic}. Act strictly as a FAANG interviewer. Ask me one technical interview question on this topic. Do not provide code solutions yourself. Evaluate my logic. Keep it conversational.`;
    const newMsg = { sender: 'user', text: prompt };
    handleSendMessageLogic(prompt, [...messages, newMsg]);
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
    { key: '/dashboard/analytics', icon: <BarChart2 size={18} />, label: 'Analytics' },
    { key: '/dashboard/profile', icon: <User size={18} />, label: 'Profile' },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
      <TopNav
        user={user}
        handleLogout={handleLogout}
        menuItems={menuItems}
        location={location}
        navigate={navigate}
        timer={timer}
        isTimerActive={isTimerActive}
        setIsTimerActive={setIsTimerActive}
        setTimer={setTimer}
        isDark={isDark}
        toggleTheme={toggleTheme}
      />
      <Layout style={{ background: 'transparent', paddingTop: 64 }}>
        <Content style={{ margin: '24px auto', padding: '0 24px', maxWidth: 1400, width: '100%', minHeight: 280, borderRadius: 8, overflow: 'visible' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="page-transition-wrapper"
            >
              <Outlet context={{ openMockInterview }} />
            </motion.div>
          </AnimatePresence>
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
        title={<><Sparkles size={18} style={{ marginRight: 8, verticalAlign: 'middle', color: 'var(--primary-color)'}}/><strong style={{color:'var(--primary-color)'}}>CognifyX</strong> AI Tutor</>}
        placement="right" onClose={() => setChatOpen(false)} open={chatOpen} width={400}
        styles={{ body: { display: 'flex', flexDirection: 'column', padding: 0 } }}
      >
        <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {messages.map((msg, idx) => {
            // Hide the system prompt from the user interface
            if (msg.text.startsWith('System Hint:')) return null;
            return (
              <div key={idx} className={msg.sender === 'user' ? 'chat-message chat-user' : 'chat-message chat-ai'}>
                {msg.text}{msg.isTyping && <span style={{ animation: 'blink 1s step-end infinite' }}>|</span>}
              </div>
            );
          })}
          {isTyping && <div className="chat-message chat-ai" style={{ width: 50, textAlign: 'center' }}><Spin size="small" /></div>}
          <div ref={messagesEndRef} />
        </div>
        <div style={{ padding: 16, borderTop: '1px solid var(--border-color)', display: 'flex', gap: 8 }}>
          <Input
            style={{ borderRadius: 20, background: 'var(--bg-primary)', color: 'var(--text-color)', border: '1px solid var(--border-color)' }}
            placeholder="Ask a doubt..." value={chatInput}
            onChange={(e) => setChatInput(e.target.value)} onPressEnter={handleSendMessage}
            disabled={isTyping}
          />
          <Button className="gradient-btn" shape="circle" icon={<Send size={16} />} onClick={handleSendMessage}
            disabled={!chatInput.trim() || isTyping} />
        </div>
      </Drawer>
    </Layout>
  );
};

export default MainLayout;
