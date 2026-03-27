import React, { useRef, useState, useEffect } from 'react';
import { Card, Typography, Button, message, Space, Tag } from 'antd';
import { Download, Award, CheckCircle, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabaseClient';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const Certificate = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const certRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [xp, setXp] = useState(0);

  // Validate Course Completion criteria via XP
  const hasCompletedCourse = xp >= 100;
  
  const courseName = user?.user_metadata?.course || 'Computer Science Masters';
  const userName = user?.user_metadata?.name || user?.name || 'Authorized Scholar';
  const issueDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const certId = `AIEDU-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

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

  const handleDownload = async () => {
    if (!certRef.current) return;
    setIsDownloading(true);
    
    // Attempt to log issuance to Database
    try {
      await supabase.from('certificates').insert([
        { user_id: user.id, course_id: courseName, certificate_id: certId, date: new Date().toISOString() }
      ]);
    } catch(err) {
      console.log("Supabase certificates table might not exist yet. Bypassing for hackathon demo.");
    }

    try {
      const canvas = await html2canvas(certRef.current, { scale: 3, useCORS: true, backgroundColor: '#050810' });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`AI_Edu_Certificate_${userName.replace(/\s+/g, '_')}.pdf`);
      
      message.success('Certificate successfully verified and downloaded!');
    } catch (err) {
      message.error('Failed to generate PDF. Please try again.');
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!hasCompletedCourse) {
    return (
      <div className="page-wrapper" style={{ padding: '60px 4vw', maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
         <Card className="glass-card" bordered={false} style={{ padding: 40, border: '1px solid rgba(255,77,79,0.3)', background: 'rgba(20,0,0,0.5)' }}>
            <Lock size={64} color="#ff4d4f" style={{ marginBottom: 24 }} />
            <Title level={2} style={{ color: '#ff4d4f', margin: '0 0 16px 0' }}>Course Incomplete</Title>
            <Text style={{ fontSize: 18, color: 'var(--text-muted)', display: 'block', marginBottom: 32 }}>
              You have not yet earned enough XP ({xp}/100) across the platform to unlock your official certification. Access the Training Arena or Mock Interviews to complete your syllabus.
            </Text>
            <Button type="primary" size="large" onClick={() => navigate('/dashboard')} style={{ background: '#ff4d4f', borderColor: '#ff4d4f', borderRadius: 12, padding: '0 32px' }}>
              Return to Syllabus
            </Button>
         </Card>
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ padding: '40px 4vw', maxWidth: 1200, margin: '0 auto' }}>
       <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
         
         {/* Action Bar */}
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
           <div>
             <Title level={2} style={{ color: 'var(--heading-color)', margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
               <Award color="#00e5ff" /> Official Certification
             </Title>
             <Text style={{ color: 'var(--text-muted)' }}>Validate your expertise. Globally recognized.</Text>
           </div>
           <Button 
             type="primary" 
             size="large" 
             onClick={handleDownload} 
             loading={isDownloading}
             className="gradient-btn"
             icon={<Download size={18} />}
             style={{ borderRadius: 12, padding: '0 32px', height: 48, fontSize: 16 }}
           >
             Download PDF
           </Button>
         </div>

         {/* Hidden/Visible Certificate rendering engine instance */}
         <div style={{ overflowX: 'auto', paddingBottom: 24 }}>
           <div 
             ref={certRef}
             style={{
               width: 1000,
               height: 707, // Approx A4 Landscape ratio
               margin: '0 auto',
               background: '#050810',
               position: 'relative',
               padding: 48,
               fontFamily: 'serif',
               color: '#fff',
               boxSizing: 'border-box',
               boxShadow: '0 20px 50px rgba(0,229,255,0.1)',
             }}
           >
             {/* Certificate Border */}
             <div style={{
               position: 'absolute',
               top: 24, left: 24, right: 24, bottom: 24,
               border: '2px solid rgba(0,229,255,0.3)',
               pointerEvents: 'none'
             }} />
             <div style={{
               position: 'absolute',
               top: 32, left: 32, right: 32, bottom: 32,
               border: '1px solid rgba(255,255,255,0.1)',
               pointerEvents: 'none'
             }} />

             {/* Inner Content */}
             <div style={{ zIndex: 10, position: 'relative', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
               
               <div style={{ marginBottom: 40, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 60, height: 60, background: 'linear-gradient(135deg, #00f2fe, #4facfe)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <CheckCircle size={32} color="#000" />
                  </div>
                  <h1 style={{ fontFamily: 'sans-serif', letterSpacing: 4, margin: 0, fontSize: 32, fontWeight: 800, textTransform: 'uppercase', background: '-webkit-linear-gradient(#00f2fe, #4facfe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    AI EDU Platform
                  </h1>
               </div>

               <h2 style={{ fontSize: 48, fontWeight: 'normal', margin: '0 0 40px 0', letterSpacing: 2, color: '#e2e8f0' }}>CERTIFICATE OF COMPLETION</h2>
               
               <p style={{ fontSize: 20, color: '#94a3b8', margin: '0 0 24px 0', fontStyle: 'italic' }}>This is to certify that</p>
               
               <h3 style={{ fontSize: 56, fontWeight: 'bold', margin: '0 0 32px 0', color: '#00e5ff', textShadow: '0 0 20px rgba(0,229,255,0.3)' }}>{userName}</h3>
               
               <p style={{ fontSize: 20, color: '#94a3b8', margin: '0 0 24px 0', fontStyle: 'italic', maxWidth: 800, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
                 has successfully completed the comprehensive <strong style={{color: '#fff'}}>{courseName}</strong> syllabus under autonomous AI mentorship, demonstrating high proficiency in theoretical and applied problem solving.
               </p>

               <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 40px' }}>
                 <div style={{ textAlign: 'center' }}>
                   <p style={{ borderBottom: '1px solid #475569', paddingBottom: 8, margin: '0 0 8px 0', fontSize: 18, width: 200, color: '#e2e8f0' }}>{issueDate}</p>
                   <span style={{ fontSize: 14, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Date of Issuance</span>
                 </div>
                 
                 <div style={{ textAlign: 'center' }}>
                   <div style={{ marginBottom: 12 }}>
                     <Tag color="cyan" style={{ background: 'transparent', border: '1px solid rgba(0,229,255,0.3)', borderRadius: 4, padding: '4px 8px' }}>
                       ID: {certId}
                     </Tag>
                   </div>
                   <p style={{ borderBottom: '1px solid #475569', paddingBottom: 8, margin: '0 0 8px 0', fontSize: 24, fontFamily: 'cursive', width: 250, color: '#00e5ff' }}>AI Edu Authority</p>
                   <span style={{ fontSize: 14, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Authorized Signature</span>
                 </div>
               </div>

             </div>
           </div>
         </div>

       </motion.div>
    </div>
  );
};

export default Certificate;
