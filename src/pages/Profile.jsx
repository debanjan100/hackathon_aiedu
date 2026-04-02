import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Select, Button, Typography, Upload, Avatar, Tag, Modal, Popconfirm, Tooltip } from 'antd';
import { User, BookOpen, GraduationCap, Camera, Award, Github, Linkedin, AlertTriangle, Trash2, Mail, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import GreetingBanner from '../components/GreetingBanner';

const { Title, Text } = Typography;

const InputWrapper = ({ children, label, extra }) => (
  <div style={{ marginBottom: 24, flex: 1 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
      <span style={{ color: '#7a8a8b', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</span>
      {extra && <span style={{ color: '#00D8D6', fontSize: 11 }}>{extra}</span>}
    </div>
    {children}
  </div>
);

const GlassCard = ({ title, children, icon }) => (
  <div style={{
    background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: 32,
    marginBottom: 24, position: 'relative', overflow: 'hidden'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
      {icon}
      <h3 style={{ margin: 0, color: '#e2e2e2', fontSize: 18, fontWeight: 700 }}>{title}</h3>
    </div>
    {children}
  </div>
);

const Profile = () => {
  const { user, isMockMode, logout } = useAuth();
  const [form] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userPoints, setUserPoints] = useState(0);

  // 1. Fetch Profile On Mount
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      try {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        
        if (profile?.xp) setUserPoints(profile.xp);
        if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);

        form.setFieldsValue({
          name: profile?.full_name || user?.user_metadata?.full_name || '',
          age: profile?.age || null,
          course: profile?.department || '',
          github: profile?.github_url || '',
          linkedin: profile?.linkedin_url || '',
          skillLevel: profile?.skill_level || 'Beginner'
        });
      } catch (err) {
        console.error("Fetch profile error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, form]);

  const onFinish = async (values) => {
    setSaving(true);
    const toastId = toast.loading("Saving profile settings...");

    try {
      const upsertData = {
        id: user.id,
        full_name: values.name,
        age: values.age,
        department: values.course,
        skill_level: values.skillLevel,
        github_url: values.github,
        linkedin_url: values.linkedin,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase.from('profiles').upsert(upsertData);

      if (error) throw error;
      await supabase.auth.updateUser({ data: { full_name: values.name } });

      toast.success("Profile saved successfully ✅", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error(`❌ ${err.message || 'Failed to save. Please try again'}`, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (info) => {
    if (info.file.status === 'done' || info.file.originFileObj) {
      const file = info.file.originFileObj;
      const reader = new FileReader();
      reader.onload = (e) => setAvatarUrl(e.target.result);
      reader.readAsDataURL(file);

      // Upload to Supabase Storage
      if (user) {
        const toastId = toast.loading("Uploading avatar...");
        const ext = file.name.split('.').pop();
        const fileName = `${user.id}.${ext}`;
        try {
          await supabase.storage.from('avatars').upload(fileName, file, { upsert: true });
          const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
          await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', user.id);
          toast.success("Avatar updated!", { id: toastId });
        } catch (e) {
          toast.error("Failed to upload avatar.", { id: toastId });
        }
      }
    }
  };

  const handleDeleteAccount = async () => {
    const toastId = toast.loading("Deleting account...");
    try {
      // Typically needs Edge Function for Admin Auth to delete a user, but we'll run standard
      await supabase.from('profiles').delete().eq('id', user.id);
      await logout();
      toast.success("Account successfully deleted.", { id: toastId });
    } catch (e) {
      toast.error("Failed to delete account.", { id: toastId });
    }
  };

  const nameVal = form.getFieldValue('name') || user?.user_metadata?.full_name || user?.email?.split('@')[0];
  const skillVal = form.getFieldValue('skillLevel') || 'Beginner';
  const colorMap = { 'Beginner': '#10b981', 'Intermediate': '#f59e0b', 'Advanced': '#ef4444' };

  if (loading) return null;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 60 }}>
      <GreetingBanner />
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32, marginTop: 32 }}>
        
        {/* ── LEFT PANEL (1/3 Width Equivalent) ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, flex: 1 }}>
          <div style={{
            background: 'var(--surface-container-low)', padding: 40, borderRadius: 32,
            border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
          }}>
            <Upload showUploadList={false} beforeUpload={() => false} onChange={handleAvatarChange}>
              <div style={{ position: 'relative', cursor: 'pointer', marginBottom: 24 }}>
                <div className="ai-pulse-dot" style={{ position: 'absolute', inset: -10, background: '#00D8D6', filter: 'blur(20px)', opacity: 0.3 }} />
                <Avatar
                  size={140}
                  src={avatarUrl}
                  style={{
                    border: '4px solid #1f2937',
                    background: 'linear-gradient(135deg, #00D8D6, #7C3AED)',
                    color: '#fff', fontWeight: 800, fontSize: 48,
                    boxShadow: '0 0 30px rgba(0, 216, 214, 0.4)',
                    position: 'relative'
                  }}
                >
                  {!avatarUrl && nameVal?.[0]?.toUpperCase()}
                </Avatar>
                <div style={{
                  position: 'absolute', bottom: 0, right: 0, background: '#111827',
                  border: '2px solid #374151', borderRadius: '50%', width: 40, height: 40,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)', transition: 'all 0.2s'
                }}>
                  <Camera size={18} color="#00D8D6" />
                </div>
              </div>
            </Upload>
            
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 8px 0' }}>{nameVal}</h2>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 24 }}>
              <Tag color={colorMap[skillVal]} style={{ borderRadius: 12, padding: '4px 12px', fontWeight: 700, border: 'none' }}>
                {skillVal.toUpperCase()}
              </Tag>
            </div>

            <div style={{ display: 'flex', gap: 16, width: '100%' }}>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 16 }}>
                <Flame size={20} color="#f59e0b" style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>12</div>
                <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>DAY STREAK</div>
              </div>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 16 }}>
                <Award size={20} color="#00D8D6" style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{userPoints}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>TOTAL XP</div>
              </div>
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} style={{
            background: 'linear-gradient(135deg, rgba(0, 216, 214, 0.1), rgba(124, 58, 237, 0.1))',
            border: '1px solid rgba(0, 216, 214, 0.3)', padding: 24, borderRadius: 24,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 0 30px rgba(0, 216, 214, 0.1)'
          }}
          onClick={() => {
            toast.success("Downloading Certificate...");
            const a = document.createElement("a");
            a.href = "/certificate.png"; a.download = "CognifyX_Certificate.png";
            a.click();
          }}>
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                 <Award color="#00D8D6" /> Get Certified
              </div>
              <div style={{ color: '#9ca3af', fontSize: 13, marginTop: 4 }}>Claim your completion badge</div>
            </div>
            <div style={{ fontSize: 24 }}>→</div>
          </motion.div>
        </div>

        {/* ── RIGHT PANEL (2/3 Width Equivalent) ── */}
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column' }}>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            
            <GlassCard title="Personal Information" icon={<User color="#00D8D6" />}>
               <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                 <InputWrapper label="Full Name">
                    <Form.Item name="name" noStyle rules={[{ required: true }]}>
                      <Input size="large" prefix={<User size={16} color="#64748b" />} placeholder="John Doe" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 12 }} />
                    </Form.Item>
                 </InputWrapper>
                 <InputWrapper label="Age">
                    <Form.Item name="age" noStyle>
                      <InputNumber size="large" placeholder="22" style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 12 }} />
                    </Form.Item>
                 </InputWrapper>
               </div>
            </GlassCard>

            <GlassCard title="Academic Profile" icon={<GraduationCap color="#7C3AED" />}>
               <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                 <InputWrapper label="Major / Focus Area">
                    <Form.Item name="course" noStyle rules={[{ required: true }]}>
                      <Select size="large" popupClassName="dark-select-popup" style={{ height: 48, borderRadius: 12 }}>
                        <Select.Option value="Computer Science">Computer Science & Engineering</Select.Option>
                        <Select.Option value="Information Technology">Information Technology</Select.Option>
                        <Select.Option value="Data Science">Data Science</Select.Option>
                      </Select>
                    </Form.Item>
                 </InputWrapper>
                 <InputWrapper label="Skill Level" extra={<Tooltip title="Determined by assessment results"><BookOpen size={14}/></Tooltip>}>
                    <Form.Item name="skillLevel" noStyle>
                      <Select disabled size="large" popupClassName="dark-select-popup" style={{ opacity: 0.8, height: 48, borderRadius: 12 }}>
                        <Select.Option value="Beginner">Beginner</Select.Option>
                        <Select.Option value="Intermediate">Intermediate</Select.Option>
                        <Select.Option value="Advanced">Advanced</Select.Option>
                      </Select>
                    </Form.Item>
                 </InputWrapper>
               </div>
            </GlassCard>

            <GlassCard title="Social Connections" icon={<Github color="#fff" />}>
               <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                 <InputWrapper label="GitHub URL">
                    <Form.Item name="github" noStyle>
                      <Input size="large" prefix={<Github size={16} color="#64748b" />} placeholder="https://github.com/..." style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 12 }} />
                    </Form.Item>
                 </InputWrapper>
                 <InputWrapper label="LinkedIn URL">
                    <Form.Item name="linkedin" noStyle>
                      <Input size="large" prefix={<Linkedin size={16} color="#64748b" />} placeholder="https://linkedin.com/in/..." style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 12 }} />
                    </Form.Item>
                 </InputWrapper>
               </div>
            </GlassCard>

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} style={{ marginBottom: 40 }}>
              <Button type="primary" htmlType="submit" size="large" loading={saving} block style={{
                height: 56, background: 'linear-gradient(90deg, #00D8D6, #00A3A1)', border: 'none',
                borderRadius: 16, color: '#000', fontWeight: 800, fontSize: 16,
                boxShadow: '0 10px 30px rgba(0, 216, 214, 0.3)'
              }}>
                SAVE PROFILE SETTINGS
              </Button>
            </motion.div>
          </Form>

          {/* ── Danger Zone ── */}
          <div style={{ border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)', borderRadius: 24, padding: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <AlertTriangle color="#ef4444" />
              <h3 style={{ margin: 0, color: '#ef4444', fontSize: 18, fontWeight: 700 }}>Danger Zone</h3>
            </div>
            <p style={{ color: '#9ca3af', marginBottom: 24, fontSize: 14 }}>
              Once you delete your account, there is no going back. All your stats, problems solved, and XP will be permanently erased.
            </p>
            <Popconfirm title="Delete Account" description="Are you entirely sure you want to delete your account?" onConfirm={handleDeleteAccount} okText="Yes, delete it" cancelText="Cancel" okButtonProps={{ danger: true }}>
              <Button danger style={{ background: 'transparent', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
                 <Trash2 size={16} /> Delete Account
              </Button>
            </Popconfirm>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
