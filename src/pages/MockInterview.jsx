import React, { useState, useEffect, useRef } from 'react';
import { Typography, Select, Button, Input, Card, Row, Col, Progress, Tag, message } from 'antd';
import { Mic, MicOff, Send, Clock, Award, ShieldAlert, Cpu, Lock, PlayCircle, Loader2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { sendChatMessage } from '../lib/chatApi';
import PaymentModal from '../components/PaymentModal';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const NUM_QUESTIONS = 3;
const TIME_LIMIT_MINS = 10;

const MockInterview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Guard check: is user premium?
  const isPremium = user?.isPremium || user?.user_metadata?.isPremium;

  // Global states
  const [phase, setPhase] = useState('setup'); // setup, interviewing, loading, feedback, finished
  const [topic, setTopic] = useState('Data Structures & Algorithms');
  const [difficulty, setDifficulty] = useState('Medium');
  
  // Interview run states
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const [questionText, setQuestionText] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_MINS * 60);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  // Result sets
  const [feedbacks, setFeedbacks] = useState([]);
  const [totalScore, setTotalScore] = useState(0);

  // Speech Synth
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = window.speechSynthesis.getVoices().find(v => v.lang.includes('en') && v.name.includes('Google')) || null;
      utterance.pitch = 1;
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Timer Effect
  useEffect(() => {
    let timer;
    if (phase === 'interviewing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && phase === 'interviewing') {
      message.warning("Time's up! Forcing autosubmit...");
      handleSubmitAnswer();
    }
    return () => clearInterval(timer);
  }, [phase, timeLeft]);

  // Voice Recognition Init
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
        }
        if (finalTranscript) setUserAnswer(prev => prev + ' ' + finalTranscript);
      };
      
      recognition.onerror = (event) => {
        console.error("Speech reco error:", event.error);
        setIsRecording(false);
      };
      
      recognition.onend = () => setIsRecording(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      message.error("Speech Recognition is not supported in your browser.");
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setUserAnswer('');
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const xaiChat = (systemContent, userContent) =>
    sendChatMessage({ message: userContent, context: systemContent });

  const fetchQuestion = async (qNum) => {
    setPhase('loading');
    setQuestionText('');
    setUserAnswer('');
    
    try {
      const prompt = `You are a strict technical interviewer. The applicant has chosen the topic "${topic}" at "${difficulty}" difficulty. 
Generate Interview Question #${qNum} out of ${NUM_QUESTIONS}. 
Respond STRICTLY with ONLY the question text. Do not include pleasantries, introductory text, formatting, or labels. Make it sound like spoken dialogue.`;

      const qText = await xaiChat('Act as a voice AI interviewer.', prompt);

      setQuestionText(qText.trim());
      setPhase('interviewing');
      speak(qText.trim());
    } catch(err) {
      message.error("Interviewer connection failed: " + err.message);
      console.error(err);
      setPhase('setup');
    }
  };

  const handleStart = () => {
    setCurrentQuestionNumber(1);
    setFeedbacks([]);
    setTotalScore(0);
    setTimeLeft(TIME_LIMIT_MINS * 60);
    fetchQuestion(1);
  };

  const handleSubmitAnswer = async () => {
    if (isRecording) recognitionRef.current.stop();
    if (!userAnswer.trim()) {
      message.warning('Please provide an answer before submitting.');
      return;
    }
    
    setPhase('loading');

    try {
      const prompt = `Evaluate the following answer given by an applicant for an interview on "${topic}".
Question Asked: "${questionText}"
Applicant Answer: "${userAnswer}"

Evaluate for correctness, clarity, and efficiency. Give a strict integer score out of 10.
Return ONLY raw JSON in the exact following schema, do not use backticks:
{
  "score": <integer from 0 to 10>,
  "feedback": "A concise, conversational 3-4 sentence feedback addressing their strengths and flaws.",
  "correct_answer": "Brief, ideal baseline answer."
}`;

      const reply = await xaiChat('Return pure JSON strictly matching the schema without markdown.', prompt);
      
      const payloadString = reply.replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();
      const result = JSON.parse(payloadString);
      
      const newFeedbacks = [...feedbacks, { q: questionText, a: userAnswer, ...result }];
      setFeedbacks(newFeedbacks);
      
      if (currentQuestionNumber >= NUM_QUESTIONS) {
        // Calculate Total Score
        const combinedScore = newFeedbacks.reduce((acc, curr) => acc + curr.score, 0);
        setTotalScore(combinedScore);
        
        // Progress DB update (awarding 100 XP per successful interview point)
        supabase.from('progress').insert([
           { user_id: user.id, topic: 'Mock Interview', xp_gained: combinedScore * 10 }
        ]).then(()=>{}).catch(()=>{});

        // Trigger Synthesis for final congrats
        speak(`Interview complete. You scored ${combinedScore} out of ${NUM_QUESTIONS * 10}. Your detailed report is ready.`);
        setPhase('finished');
      } else {
        // Next Question Feedback screen before proceeding
        speak(`You scored ${result.score} out of 10. ${result.feedback}`);
        setPhase('feedback');
      }

    } catch(err) {
      message.error("Failed to evaluate answer.");
      console.error(err);
      setPhase('interviewing');
    }
  };

  const nextQuestion = () => {
    setCurrentQuestionNumber(prev => prev + 1);
    fetchQuestion(currentQuestionNumber + 1);
  };

  const renderBadge = () => {
    const ratio = totalScore / (NUM_QUESTIONS * 10);
    if (ratio >= 0.8) return { label: 'Expert', color: '#00e5ff', icon: <Award /> };
    if (ratio >= 0.5) return { label: 'Intermediate', color: '#faad14', icon: <ShieldAlert /> };
    return { label: 'Beginner', color: '#ff4d4f', icon: <Cpu /> };
  };

  // --- RENDERS ---

  if (!isPremium) {
    return (
      <div className="page-wrapper" style={{ padding: '60px 4vw', maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
        <Card className="glass-card" bordered={false} style={{ padding: 40, border: '1px solid rgba(255,215,0,0.3)', background: 'rgba(20,20,20,0.8)' }}>
           <Lock size={64} color="#faad14" style={{ marginBottom: 24 }} />
           <Title level={2} style={{ color: '#faad14', margin: '0 0 16px 0' }}>Premium Access Required</Title>
           <Text style={{ fontSize: 18, color: 'var(--text-muted)', display: 'block', marginBottom: 32 }}>
             The AI Mock Interview Room is an exclusive feature. Simulate high-pressure technical interviews with our vocal GPT engine.
           </Text>
           <PaymentModal 
              user={user} 
              onSuccess={() => window.location.reload()} 
              buttonProps={{ size: 'large', style: { width: 250, height: 50, fontSize: 18, fontWeight: 'bold' } }}
           />
        </Card>
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ padding: '40px 4vw', maxWidth: 1000, margin: '0 auto' }}>
      <AnimatePresence mode="wait">
        
        {/* SETUP PHASE */}
        {phase === 'setup' && (
          <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Card className="glass-card auth-card-body" bordered={false}>
              <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <Cpu size={48} color="#00e5ff" style={{ marginBottom: 16 }} />
                <Title level={2} style={{ color: 'var(--heading-color)', margin: 0 }}>AI Mock Interview Room</Title>
                <Text style={{ color: 'var(--text-muted)' }}>Configure your technical simulation parameters.</Text>
              </div>

              <Row gutter={[24, 24]} className="mobile-stack">
                <Col xs={24} md={12}>
                  <label style={{ color: 'var(--text-color)', fontWeight: 600, display: 'block', marginBottom: 8 }}>Target Domain</label>
                  <Select value={topic} onChange={setTopic} size="large" style={{ width: '100%' }} dropdownStyle={{ background: '#1e293b' }}>
                    <Option value="Data Structures & Algorithms">Data Structures & Algorithms</Option>
                    <Option value="Database Management Systems">Database Management Systems</Option>
                    <Option value="Operating Systems">Operating Systems</Option>
                    <Option value="Frontend Web Development">Frontend Web Development</Option>
                    <Option value="System Design">System Design</Option>
                  </Select>
                </Col>
                <Col xs={24} md={12}>
                  <label style={{ color: 'var(--text-color)', fontWeight: 600, display: 'block', marginBottom: 8 }}>Difficulty</label>
                  <Select value={difficulty} onChange={setDifficulty} size="large" style={{ width: '100%' }} dropdownStyle={{ background: '#1e293b' }}>
                    <Option value="Easy">Intern / Junior</Option>
                    <Option value="Medium">Mid-Level Engineer</Option>
                    <Option value="Hard">Senior Staff Engineer</Option>
                  </Select>
                </Col>
              </Row>

              <div style={{ marginTop: 40, textAlign: 'center' }}>
                <Button type="primary" size="large" onClick={handleStart} className="gradient-btn mobile-w-full" icon={<PlayCircle size={20}/>} style={{ height: 56, fontSize: 18, padding: '0 40px', borderRadius: 16 }}>
                  Start Simulator ({TIME_LIMIT_MINS}:00)
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* LOADING PHASE */}
        {phase === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center', padding: '100px 0' }}>
            <Loader2 size={48} color="#00e5ff" className="spin-animation" style={{ marginBottom: 24, animation: 'spin 2s linear infinite' }} />
            <Title level={4} style={{ color: 'var(--text-color)' }}>
              {questionText ? 'Evaluating your response tensors...' : 'Synthesizing technical scenario...'}
            </Title>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          </motion.div>
        )}

        {/* INTERVIEWING PHASE */}
        {phase === 'interviewing' && (
          <motion.div key="interviewing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
             <Card className="glass-card" bordered={false} bodyStyle={{ padding: 0 }}>
               {/* Header Bar */}
               <div style={{ padding: '20px 24px', background: 'rgba(0,0,0,0.5)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="mobile-stack">
                 <Tag color="cyan" style={{ fontSize: 16, padding: '4px 12px', borderRadius: 20 }}>Question {currentQuestionNumber} of {NUM_QUESTIONS}</Tag>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: timeLeft < 60 ? '#ff4d4f' : '#00e5ff', textShadow: timeLeft < 60 ? '0 0 10px rgba(255,77,79,0.5)' : '0 0 10px rgba(0,229,255,0.5)' }}>
                   <Clock size={20} />
                   <span style={{ fontSize: 24, fontWeight: 'bold', fontFamily: 'monospace' }}>
                     {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
                   </span>
                 </div>
               </div>

               {/* Interaction Zone */}
               <div style={{ padding: '32px 24px' }}>
                 <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #00f2fe, #4facfe)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Cpu size={24} color="#000" />
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', padding: 20, borderRadius: '0 20px 20px 20px', flex: 1 }}>
                       <Text style={{ fontSize: 18, color: 'var(--text-color)', lineHeight: 1.6 }}>{questionText}</Text>
                    </div>
                 </div>

                 <div style={{ position: 'relative' }}>
                   <TextArea 
                     rows={6}
                     placeholder="Type your answer here or tap the microphone to speak..." // eslint-disable-next-line
                     value={userAnswer}
                     onChange={(e) => setUserAnswer(e.target.value)}
                     style={{ background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: 16, borderRadius: 16, padding: 16, paddingBottom: 60 }}
                   />
                   <div style={{ position: 'absolute', bottom: 12, right: 12, left: 12, display: 'flex', justifyContent: 'space-between' }}>
                     <Button 
                        type="dashed" 
                        shape="circle" 
                        size="large"
                        onClick={toggleRecording}
                        style={{ border: isRecording ? '2px solid #ff4d4f' : '1px dashed #94a3b8', color: isRecording ? '#ff4d4f' : '#94a3b8', background: isRecording ? 'rgba(255,77,79,0.1)' : 'transparent' }}
                        icon={isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                     />
                     <Button type="primary" size="large" onClick={handleSubmitAnswer} style={{ borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                       Submit Answer <Send size={16} />
                     </Button>
                   </div>
                 </div>
               </div>
             </Card>
          </motion.div>
        )}

        {/* FEEDBACK PHASE (Interim) */}
        {phase === 'feedback' && (
          <motion.div key="feedback" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card className="glass-card auth-card-body" bordered={false} style={{ textAlign: 'center' }}>
               <Title level={3} style={{ color: 'var(--text-color)', marginBottom: 24 }}>Question Evaluated</Title>
               
               <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 100, height: 100, borderRadius: '50%', background: 'rgba(0,229,255,0.1)', border: '2px solid #00e5ff', marginBottom: 24 }}>
                 <span style={{ fontSize: 36, fontWeight: 'bold', color: '#00e5ff' }}>{feedbacks[currentQuestionNumber - 1]?.score}<span style={{fontSize: 20, color: 'var(--text-muted)'}}>/10</span></span>
               </div>
               
               <Paragraph style={{ fontSize: 18, color: 'var(--text-muted)', maxWidth: 600, margin: '0 auto 32px auto', lineHeight: 1.6 }}>
                 "{feedbacks[currentQuestionNumber - 1]?.feedback}"
               </Paragraph>

               <Button type="primary" size="large" onClick={nextQuestion} style={{ borderRadius: 12, padding: '0 32px' }}>
                 Proceed to Question {currentQuestionNumber + 1}
               </Button>
            </Card>
          </motion.div>
        )}

        {/* FINISHED PHASE */}
        {phase === 'finished' && (
          <motion.div key="finished" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="glass-card auth-card-body" bordered={false} style={{ textAlign: 'center', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 8, background: renderBadge().color }} />
              
              <div style={{ marginBottom: 32, marginTop: 16 }}>
                 <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 80, height: 80, borderRadius: '50%', background: `${renderBadge().color}20`, color: renderBadge().color, marginBottom: 16 }}>
                   {React.cloneElement(renderBadge().icon, { size: 40 })}
                 </div>
                 <Title level={2} style={{ color: 'var(--heading-color)', margin: 0 }}>Simulation Complete</Title>
                 <Tag color="magenta" style={{ marginTop: 12, padding: '6px 16px', borderRadius: 20, fontSize: 16, border: `1px solid ${renderBadge().color}`, color: renderBadge().color, background: 'transparent' }}>
                    {renderBadge().label} Class
                 </Tag>
              </div>

              <Row gutter={[24, 24]} style={{ marginBottom: 40 }}>
                <Col xs={24} md={12}>
                  <div style={{ padding: 24, background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid var(--border-color)', height: '100%' }}>
                     <Text style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 16, fontSize: 16 }}>Total Score</Text>
                     <Title style={{ color: '#00e5ff', margin: 0, fontSize: 48 }}>{totalScore} <span style={{fontSize: 20, color: '#475569'}}>/ {NUM_QUESTIONS * 10}</span></Title>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div style={{ padding: 24, background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid var(--border-color)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                     <Text style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 16, fontSize: 16 }}>Performance Output</Text>
                     <Text style={{ color: 'var(--text-color)', fontSize: 16 }}>Your XP has been permanently synchronized. Review your detailed question logs below.</Text>
                  </div>
                </Col>
              </Row>

              {/* Log Timeline */}
              <div style={{ textAlign: 'left' }}>
                <Title level={4} style={{ color: 'var(--heading-color)', marginBottom: 24 }}>Detailed Post-Mortem</Title>
                {feedbacks.map((f, i) => (
                  <div key={i} style={{ marginBottom: 24, padding: 20, background: 'rgba(0,0,0,0.3)', borderRadius: 16, borderLeft: `4px solid ${f.score >= 7 ? '#52c41a' : f.score >= 4 ? '#faad14' : '#ff4d4f'}` }}>
                     <Text strong style={{ display: 'block', color: 'var(--primary-color)', marginBottom: 8 }}>Q{i+1}: {f.q}</Text>
                     <Text style={{ display: 'block', color: 'var(--text-color)', marginBottom: 16, fontStyle: 'italic' }}>Your Answer: "{f.a}"</Text>
                     <Row gutter={16}>
                       <Col xs={24} md={20}>
                         <Text style={{ color: 'var(--text-secondary)' }}>Feedback: {f.feedback}</Text><br/>
                         <Text style={{ color: '#52c41a', display: 'block', marginTop: 8 }}>Optimal Baseline: {f.correct_answer}</Text>
                       </Col>
                       <Col xs={24} md={4} style={{ textAlign: 'right' }}>
                         <Tag color={f.score >= 7 ? 'success' : f.score >= 4 ? 'warning' : 'error'} style={{ fontSize: 16, padding: '4px 12px', borderRadius: 12 }}>{f.score}/10</Tag>
                       </Col>
                     </Row>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 40, borderTop: '1px solid var(--border-color)', paddingTop: 24 }}>
                <Space size="middle" className="mobile-stack mobile-w-full">
                  <Button type="primary" size="large" className="gradient-btn mobile-w-full" onClick={handleStart} icon={<RefreshCw size={18}/>} style={{ borderRadius: 12 }}>
                    Retake Simulator
                  </Button>
                  <Button size="large" className="mobile-w-full" onClick={() => navigate('/dashboard')} style={{ background: 'transparent', color: 'var(--text-color)', borderRadius: 12, borderColor: 'var(--text-muted)' }}>
                    Return to Dashboard
                  </Button>
                </Space>
              </div>
            </Card>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default MockInterview;
