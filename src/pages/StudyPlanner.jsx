import React, { useState } from 'react';
import { Typography, Card, Input, Button, List, Row, Col, Progress, Calendar, Badge, Tag, message } from 'antd';
import { Calendar as CalendarIcon, Plus, Trash2, GripVertical, Bell } from 'lucide-react';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const StudyPlanner = () => {
  const [tasks, setTasks] = useState([
    { id: '1', text: 'Complete Arrays & Hashing', date: dayjs().format('YYYY-MM-DD'), color: 'processing' },
    { id: '2', text: 'Watch React Hooks video', date: dayjs().add(1, 'day').format('YYYY-MM-DD'), color: 'success' },
    { id: '3', text: 'Attempt Weekly Mock', date: dayjs().add(2, 'day').format('YYYY-MM-DD'), color: 'warning' },
    { id: '4', text: 'Review DP Patterns', date: null, color: 'default' } // Unscheduled
  ]);
  const [newTask, setNewTask] = useState('');

  const handleAddTask = () => {
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: Date.now().toString(), text: newTask, date: null, color: 'default' }]);
    setNewTask('');
    message.success('Task Added! Drag it to the calendar to schedule.');
  };

  const removeTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const onDragStart = (e, taskId) => { e.dataTransfer.setData('taskId', taskId); };
  
  const onDrop = (e, dateStr) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    setTasks(tasks.map(t => t.id === taskId ? { ...t, date: dateStr, color: 'processing' } : t));
    message.success('Task Scheduled!');
  };
  const onDragOver = (e) => e.preventDefault();

  const cellRender = (current) => {
    const dateStr = current.format('YYYY-MM-DD');
    const dayTasks = tasks.filter(t => t.date === dateStr);
    return (
      <div 
        style={{ minHeight: '60px', padding: '4px', border: '1px dashed transparent', borderRadius: 8 }}
        onDragOver={onDragOver} 
        onDrop={(e) => onDrop(e, dateStr)}
      >
        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
          {dayTasks.map(item => (
             <li key={item.id}>
              <Badge status={item.color} text={<span style={{fontSize: 10, color: 'var(--text-color)'}}>{item.text}</span>} />
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const scheduledCount = tasks.filter(t => t.date !== null).length;
  const progressPercent = tasks.length === 0 ? 0 : Math.round((scheduledCount / tasks.length) * 100);
  const unscheduledTasks = tasks.filter(t => t.date === null);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 40 }}>
      <Row gutter={[24, 24]} align="middle" style={{ marginBottom: 32 }}>
        <Col xs={24} md={16}>
          <Title level={2} style={{ color: 'var(--heading-color)', margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
            <CalendarIcon color="var(--primary-color)" size={32} /> 
            Advanced Study Planner
          </Title>
          <Text style={{ color: 'var(--text-secondary)' }}>Drag and drop unscheduled tasks onto the calendar to assign deadlines.</Text>
        </Col>
        <Col xs={24} md={8} style={{ textAlign: 'right' }}>
           <div style={{ display: 'inline-block', textAlign: 'center' }}>
            <Progress type="circle" percent={progressPercent} size={80} strokeColor={{ '0%': '#00f2fe', '100%': '#4facfe' }} format={p => <span style={{ color: 'var(--heading-color)', fontSize: 16 }}>{p}%</span>} />
            <Text style={{display: 'block', marginTop: 8, color: 'var(--text-secondary)'}}>Scheduled</Text>
           </div>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card className="glass-card" bordered={false} bodyStyle={{ padding: 12 }}>
            <Calendar 
              cellRender={cellRender} 
              style={{ background: 'transparent' }} 
              headerRender={({ value, onChange }) => {
                const start = 0; const end = 12; const monthOptions = [];
                for (let i = start; i < end; i++) monthOptions.push(<option key={i} value={i} className="month-item">{dayjs().month(i).format('MMM')}</option>);
                return (
                  <div style={{ padding: 12, display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 12 }}>
                    <Title level={4} style={{color: 'var(--text-color)', margin: 0}}>{value.format('MMMM YYYY')}</Title>
                    <Tag icon={<Bell size={12} />} color="processing" style={{ borderRadius: 12, cursor: 'pointer' }}>Reminders On</Tag>
                  </div>
                );
              }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card className="glass-card" bordered={false} title={<span style={{ color: 'var(--heading-color)' }}>Unscheduled Tasks</span>}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              <Input
                size="large"
                placeholder="What do you need to study?"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onPressEnter={handleAddTask}
                style={{ background: 'var(--card-bg)', color: 'var(--text-color)', border: '1px solid rgba(0,242,254,0.3)', borderRadius: 12 }}
              />
              <Button type="primary" size="large" onClick={handleAddTask} icon={<Plus size={18} />} style={{ background: 'linear-gradient(135deg, #00f2fe, #4facfe)', border: 'none', borderRadius: 12 }}>
                Add
              </Button>
            </div>

            <List
              dataSource={unscheduledTasks}
              locale={{ emptyText: <span style={{ color: 'var(--text-secondary)' }}>All tasks scheduled! 🎉</span> }}
              renderItem={item => (
                <List.Item
                  draggable
                  onDragStart={(e) => onDragStart(e, item.id)}
                  actions={[<Button type="text" danger icon={<Trash2 size={16} />} onClick={() => removeTask(item.id)} />]}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)', margin: '8px 0', borderRadius: 8, padding: '12px 16px', cursor: 'grab' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <GripVertical size={16} color="#94a3b8" />
                    <span style={{ fontSize: 16, color: 'var(--text-color)' }}>
                      {item.text}
                    </span>
                  </div>
                </List.Item>
              )}
            />
            
            <div style={{ marginTop: 32, padding: 16, background: 'rgba(250, 173, 20, 0.1)', border: '1px solid rgba(250, 173, 20, 0.3)', borderRadius: 12 }}>
              <Text style={{ color: '#faad14', display: 'flex', alignItems: 'center', gap: 8 }}>
                 <Bell size={16}/> Tip: Drag these tasks onto a date cell over on the calendar to set a deadline!
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StudyPlanner;
