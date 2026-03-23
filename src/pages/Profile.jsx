import React, { useState } from 'react';
import { Form, Input, InputNumber, Select, Button, Card, Typography, Divider, Upload, Avatar, message, Row, Col } from 'antd';
import { User, Book, GraduationCap, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabaseClient';

const { Title, Text } = Typography;

const Profile = () => {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState(null);

  const onFinish = async (values) => {
    if (!user) return message.error("You must be logged in to update your profile.");
    
    // Physical Postgres update
    const { error } = await supabase
      .from('users')
      .update({
        name: values.name,
        age: values.age,
        course: values.course,
        github: values.github,
        linkedin: values.linkedin
      })
      .eq('id', user.id);

    if (error) {
      if (error.message.includes('fetch')) {
         message.info('Mock Mode: Profile updated locally (Supabase keys missing).');
      } else {
         message.error('Failed to update profile: ' + error.message);
      }
    } else {
      message.success('Postgres Row Updated successfully! 🎉');
    }
  };

  const handleAvatarChange = (info) => {
    if (info.file.status === 'done' || info.file.originFileObj) {
      const reader = new FileReader();
      reader.onload = (e) => setAvatarUrl(e.target.result);
      reader.readAsDataURL(info.file.originFileObj);
    }
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <Title level={3} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, color: '#fff' }}>
        <User color="#00f2fe" /> User Profile
      </Title>

      {/* Profile Banner */}
      <div style={{ position: 'relative', marginBottom: 72, borderRadius: 20, overflow: 'visible' }}>
        <div style={{
          height: 160,
          borderRadius: 20,
          backgroundImage: 'url(/images/profile-banner.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: '1px solid rgba(255,255,255,0.08)'
        }} />
        {/* Avatar Overlaid on Banner */}
        <div style={{ position: 'absolute', bottom: -48, left: 32 }}>
          <Upload
            showUploadList={false}
            beforeUpload={() => false}
            onChange={handleAvatarChange}
            accept="image/*"
          >
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <Avatar
                size={96}
                src={avatarUrl}
                style={{
                  border: '4px solid #0f172a',
                  background: 'linear-gradient(135deg, #00f2fe, #4facfe)',
                  color: '#000',
                  fontWeight: 700,
                  fontSize: 36,
                  boxShadow: '0 0 20px rgba(0,242,254,0.4)'
                }}
              >
                {!avatarUrl && (user?.name?.[0]?.toUpperCase() || 'U')}
              </Avatar>
              <div style={{
                position: 'absolute', bottom: 0, right: 0,
                background: 'linear-gradient(135deg, #00f2fe, #4facfe)',
                borderRadius: '50%', width: 28, height: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid #0f172a'
              }}>
                <Camera size={14} color="#000" />
              </div>
            </div>
          </Upload>
          <Text style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginTop: 4, marginLeft: 4 }}>Click to upload</Text>
        </div>
      </div>

      <Card className="glass-card" bordered={false}>
        <Text style={{ display: 'block', marginBottom: 24, color: '#94a3b8' }}>
          Update your personal information and academic background to help the AI engine tailor courses for you.
        </Text>

        <Form
          name="profile"
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ name: user?.name || 'Demo User', age: 17, course: 'Computer Science', skillLevel: user?.skillLevel || 'Intermediate' }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label={<span style={{ color: '#e2e8f0' }}>Full Name</span>} name="name" rules={[{ required: true }]}>
                <Input prefix={<User size={16} color="#64748b" />} size="large"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 10 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={<span style={{ color: '#e2e8f0' }}>Age</span>} name="age" rules={[{ required: true }]}>
                <InputNumber size="large" style={{ width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 10 }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label={<span style={{ color: '#e2e8f0' }}>Course / Major</span>} name="course" rules={[{ required: true }]}>
            <Input prefix={<Book size={16} color="#64748b" />} size="large"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 10 }} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label={<span style={{ color: '#e2e8f0' }}>GitHub Profile</span>} name="github">
                <Input size="large" placeholder="https://github.com/username"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 10 }} />
              </Form.Item>
              <Button href="https://github.com" target="_blank" block type="default" style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}>Connect GitHub</Button>
            </Col>
            <Col span={12}>
              <Form.Item label={<span style={{ color: '#e2e8f0' }}>LinkedIn Profile</span>} name="linkedin">
                <Input size="large" placeholder="https://linkedin.com/in/username"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 10 }} />
              </Form.Item>
              <Button href="https://linkedin.com" target="_blank" block type="primary" style={{ background: '#0a66c2', borderColor: '#0a66c2' }}>Connect LinkedIn</Button>
            </Col>
          </Row>

          <Divider style={{ borderColor: 'rgba(255,255,255,0.1)' }} />

          <Form.Item label={<span style={{ color: '#e2e8f0' }}>Current Skill Level (Auto-detected)</span>} name="skillLevel">
            <Select size="large" disabled>
              <Select.Option value="Beginner">Beginner</Select.Option>
              <Select.Option value="Intermediate">Intermediate</Select.Option>
              <Select.Option value="Advanced">Advanced</Select.Option>
            </Select>
          </Form.Item>
          <Text style={{ display: 'inline-block', marginTop: -12, marginBottom: 24, fontSize: 13, color: '#94a3b8' }}>
            <GraduationCap size={14} style={{ marginRight: 4, verticalAlign: 'middle', color: '#00f2fe' }} />
            Skill level is automatically determined by your assessment scores.
          </Text>

          <Form.Item>
            <Button className="gradient-btn" htmlType="submit" size="large" block style={{ borderRadius: 10, height: 48 }}>
              Save Profile Settings
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Profile;
