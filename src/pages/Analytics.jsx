import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Select } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { BarChart2, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabaseClient';

const { Title, Text } = Typography;

const accuracyData = [
  { name: 'Week 1', accuracy: 65, avg: 60 },
  { name: 'Week 2', accuracy: 72, avg: 62 },
  { name: 'Week 3', accuracy: 68, avg: 65 },
  { name: 'Week 4', accuracy: 85, avg: 68 },
  { name: 'Week 5', accuracy: 80, avg: 70 },
  { name: 'Week 6', accuracy: 92, avg: 72 },
];

const timeData = [
  { topic: 'React', hours: 4.5 },
  { topic: 'Python', hours: 2.5 },
  { topic: 'SQL', hours: 1.5 },
  { topic: 'Data Structures', hours: 3.0 },
];

const Analytics = () => {
  const { user } = useAuth();
  const [dynAccuracy, setDynAccuracy] = useState(accuracyData);

  useEffect(() => {
    if (!user) return;
    const fetchAnalytics = async () => {
      const { data, error } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(6);
        
      if (!error && data && data.length > 0) {
        // Map Postgres rows to chart (assume column `accuracy` exists)
        setDynAccuracy(data.map((row, i) => ({
          name: 'Week ' + (i+1), accuracy: row.accuracy || 70, avg: 65
        })));
      }
    };
    fetchAnalytics();
  }, [user]);

  return (
    <div className="analytics-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0, color: '#fff' }}>
          <BarChart2 color="#00f2fe" /> Performance Analytics
        </Title>
        <Select defaultValue="6weeks" style={{ width: 150 }}>
          <Select.Option value="1week">Last 7 Days</Select.Option>
          <Select.Option value="6weeks">Last 6 Weeks</Select.Option>
          <Select.Option value="all">All Time</Select.Option>
        </Select>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card className="glass-card" title={<><Activity size={18} style={{ marginRight: 8, verticalAlign: 'middle', color: '#52c41a' }}/><span style={{ color: '#fff'}}>Accuracy Improvement</span></>} bordered={false}>
            <div style={{ height: 350, width: '100%' }}>
              <ResponsiveContainer>
                <LineChart data={dynAccuracy} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(val) => `${val}%`} tick={{ fill: '#94a3b8' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: 8, border: 'none', background: 'rgba(15, 23, 42, 0.9)', color: '#fff', boxShadow: '0 4px 12px rgba(0,242,254,0.2)' }}
                  />
                  <Legend wrapperStyle={{ color: '#e2e8f0' }} />
                  <Line type="monotone" dataKey="accuracy" name="Your Accuracy" stroke="#00f2fe" strokeWidth={3} activeDot={{ r: 8, fill: '#00f2fe', stroke: '#fff' }} />
                  <Line type="monotone" dataKey="avg" name="Class Average" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <Typography.Paragraph style={{ marginTop: 16, textAlign: 'center', color: '#94a3b8' }}>
              Your accuracy has improved by <strong style={{color: '#00f2fe'}}>27%</strong> over the last 6 weeks. Fantastic job!
            </Typography.Paragraph>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card className="glass-card" title={<span style={{ color: '#fff'}}>Time by Topic</span>} bordered={false} style={{ height: '100%' }}>
            <div style={{ height: 300, width: '100%' }}>
              <ResponsiveContainer>
                <BarChart data={timeData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="topic" type="category" axisLine={false} tickLine={false} tick={{ fill: '#e2e8f0', fontSize: 12 }} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ borderRadius: 8, border: 'none', background: 'rgba(15, 23, 42, 0.9)', color: '#fff' }} />
                  <Bar dataKey="hours" fill="#4facfe" radius={[0, 4, 4, 0]} name="Hours Spent" barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Analytics;
