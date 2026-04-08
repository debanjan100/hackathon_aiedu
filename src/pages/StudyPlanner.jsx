import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Typography, Input, Button, Progress, Calendar, Badge, Select, Collapse, Modal, DatePicker, Popconfirm } from 'antd';
import { Calendar as CalendarIcon, Plus, Trash2, Bell, Target, CheckCircle2, GripVertical, CheckCircle, AlertCircle, XCircle, Sparkles } from 'lucide-react';
import { DndContext, useDraggable, useDroppable, DragOverlay, closestCenter } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

const { Title, Text } = Typography;
const { Option } = Select;

// ── DnD Wrappers ──
const DraggableTask = ({ id, task, children }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id, data: { task } });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 999 : 1 }
    : {};
  return <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="draggable-task">{children}</div>;
};

const DroppableCell = ({ dateStr, children, onClick }) => {
  const { isOver, setNodeRef } = useDroppable({ id: dateStr });
  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      style={{
        minHeight: '80px', height: '100%', padding: '4px',
        background: isOver ? 'rgba(0, 216, 214, 0.15)' : 'transparent',
        borderRadius: 8, border: isOver ? '1px dashed #00D8D6' : '1px solid transparent',
        transition: 'all 0.2s', position: 'relative', cursor: 'pointer',
      }}
    >
      {children}
    </div>
  );
};

const PRIORITY_COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
const PRIORITY_BG = { high: 'rgba(239,68,68,0.1)', medium: 'rgba(245,158,11,0.1)', low: 'rgba(16,185,129,0.1)' };
const PRIORITY_LABELS = { high: 'High', medium: 'Med', low: 'Low' };

/* ── Progress motivational messages ── */
const getMotivation = (pct) => {
  if (pct === 0)   return "Let's get started! 💪";
  if (pct <= 33)   return 'Good progress! Keep going 🚀';
  if (pct <= 66)   return 'Halfway there! 🔥';
  if (pct <= 99)   return 'Almost done! 🏁';
  return 'All done! You crushed it! 🏆';
};

const StudyPlanner = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [activeDragTask, setActiveDragTask] = useState(null);
  const [addSuccess, setAddSuccess] = useState(false); // flash green on success

  // Quick-add for clicking a date
  const [quickAddModal, setQuickAddModal] = useState({ open: false, date: null });
  const [quickAddText, setQuickAddText] = useState('');
  const [quickAddPriority, setQuickAddPriority] = useState('medium');
  const [quickAddLoading, setQuickAddLoading] = useState(false);

  // Mobile modal
  const [isMobileModalVisible, setIsMobileModalVisible] = useState(false);
  const [mobileTaskSelected, setMobileTaskSelected] = useState(null);

  // Prevent duplicate error toasts
  const errorShownRef = useRef(false);
  const fetchingRef = useRef(false);

  // Fetch Tasks & Realtime Sync — deduped, single fetch on mount
  useEffect(() => {
    if (!user?.id) { setFetchLoading(false); return; }
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    const fetchTasks = async () => {
      try {
        const { data, error } = await supabase
          .from('study_tasks')
          .select('id, user_id, title, priority, scheduled_date, is_completed, created_at, updated_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          if (!errorShownRef.current) {
            errorShownRef.current = true;
            if (error.message?.includes('schema cache') || error.code === '42P01') {
              toast.error(
                'Study Planner table not found. Please run the SQL migration in Supabase. See BUGFIX_LOG.md for the SQL.',
                { id: 'study-tasks-missing', duration: 8000 }
              );
            } else {
              toast.error(`Could not load tasks: ${error.message}`, { id: 'study-tasks-fetch-error' });
            }
          }
        } else if (data) {
          // Map DB column `is_completed` to local `completed` for backward compat
          setTasks(data.map(t => ({ ...t, completed: t.is_completed ?? false })));
        }
      } catch (e) {
        if (!errorShownRef.current) {
          errorShownRef.current = true;
          toast.error('Failed to connect to database.', { id: 'study-tasks-network' });
        }
      } finally {
        setFetchLoading(false);
        fetchingRef.current = false;
      }
    };
    fetchTasks();

    const channel = supabase
      .channel('study_tasks_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'study_tasks', filter: `user_id=eq.${user.id}` }, (payload) => {
        const mapRow = (r) => ({ ...r, completed: r.is_completed ?? false });
        if (payload.eventType === 'INSERT') setTasks(prev => prev.find(t => t.id === payload.new.id) ? prev : [mapRow(payload.new), ...prev]);
        else if (payload.eventType === 'UPDATE') setTasks(prev => prev.map(t => t.id === payload.new.id ? mapRow(payload.new) : t));
        else if (payload.eventType === 'DELETE') setTasks(prev => prev.filter(t => t.id !== payload.old.id));
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  // Add Task (sidebar quick-add)
  const handleAddTask = async () => {
    const trimmed = newTask.trim();
    if (!trimmed) return;
    if (!user?.id) { toast.error('Please log in to add tasks.'); return; }
    setLoading(true);

    const tempId = `temp-${Date.now()}`;
    const newTaskObj = { id: tempId, user_id: user.id, title: trimmed, priority, scheduled_date: null, completed: false, is_completed: false, created_at: new Date().toISOString() };
    setTasks(prev => [newTaskObj, ...prev]);
    setNewTask('');

    const { data, error } = await supabase
      .from('study_tasks')
      .insert({ user_id: user.id, title: trimmed, priority })
      .select('id, user_id, title, priority, scheduled_date, is_completed, created_at')
      .single();

    if (error) {
      toast.error(`Failed to save: ${error.message || 'Unknown error'}`, { id: 'add-task-error' });
      setTasks(prev => prev.filter(t => t.id !== tempId));
    } else {
      setTasks(prev => prev.map(t => t.id === tempId ? { ...data, completed: data.is_completed ?? false } : t));
      setAddSuccess(true);
      setTimeout(() => setAddSuccess(false), 1200);
      toast.success('Task added! Drag to calendar to schedule. 📌', { id: 'add-task-success' });
    }
    setLoading(false);
  };

  // Quick-add from calendar date click
  const handleQuickAdd = async () => {
    const trimmed = quickAddText.trim();
    if (!trimmed || !quickAddModal.date) return;
    setQuickAddLoading(true);

    const tempId = `temp-${Date.now()}`;
    const newTaskObj = { id: tempId, user_id: user.id, title: trimmed, priority: quickAddPriority, scheduled_date: quickAddModal.date, completed: false, is_completed: false, created_at: new Date().toISOString() };
    setTasks(prev => [newTaskObj, ...prev]);
    setQuickAddModal({ open: false, date: null });
    setQuickAddText('');

    const { data, error } = await supabase
      .from('study_tasks')
      .insert({ user_id: user.id, title: trimmed, priority: quickAddPriority, scheduled_date: quickAddModal.date })
      .select('id, user_id, title, priority, scheduled_date, is_completed, created_at')
      .single();

    if (error) {
      toast.error(`Failed to save: ${error.message}`, { id: 'quick-add-error' });
      setTasks(prev => prev.filter(t => t.id !== tempId));
    } else {
      setTasks(prev => prev.map(t => t.id === tempId ? { ...data, completed: data.is_completed ?? false } : t));
      toast.success(`Task scheduled for ${dayjs(quickAddModal.date).format('MMM D')}! 📅`);
    }
    setQuickAddLoading(false);
  };

  // Update Task
  const handleUpdateTask = async (id, updates, showToast = true) => {
    if (String(id).startsWith('temp')) return;
    
    // Map local `completed` to DB `is_completed`
    const dbUpdates = { ...updates };
    if (updates.completed !== undefined) {
      dbUpdates.is_completed = updates.completed;
      dbUpdates.updated_at = new Date().toISOString();
      delete dbUpdates.completed;
    }

    let previousTasks;
    setTasks(prev => {
      previousTasks = prev;
      return prev.map(t => t.id === id ? { ...t, ...updates } : t);
    });

    try {
      const { error } = await supabase.from('study_tasks').update(dbUpdates).eq('id', id);
      if (error) throw error;
      
      if (showToast) {
        if (updates.completed === true) toast.success('Task completed! 🎉 +10 XP');
        else if (updates.completed === false) toast.success('Task moved back to queue. 🔄');
        else if (updates.scheduled_date) toast.success(`Rescheduled to ${dayjs(updates.scheduled_date).format('MMM D')}! 📅`);
      }
    } catch (error) {
      setTasks(previousTasks);
      toast.error(`Failed to update: ${error.message || 'Network error'}`, { id: 'update-error' });
    }
  };

  // Delete Task
  const handleDeleteTask = async (id) => {
    if (String(id).startsWith('temp')) {
      setTasks(prev => prev.filter(t => t.id !== id));
      return;
    }

    let previousTasks;
    setTasks(prev => {
      previousTasks = prev;
      return prev.filter(t => t.id !== id);
    });

    try {
      const { error } = await supabase.from('study_tasks').delete().eq('id', id);
      if (error) throw error;
      toast.success('Task removed.');
    } catch (error) {
      setTasks(previousTasks);
      toast.error(`Failed to delete: ${error.message || 'Network error'}`);
    }
  };

  // Clear All Unscheduled
  const handleClearAllUnscheduled = async () => {
    const ids = tasks.filter(t => !t.scheduled_date && !t.completed).map(t => t.id).filter(id => !String(id).startsWith('temp'));
    if (!ids.length) return;
    
    let previousTasks;
    setTasks(prev => {
      previousTasks = prev;
      return prev.filter(t => !(!t.scheduled_date && !t.completed));
    });

    try {
      const { error } = await supabase.from('study_tasks').delete().in('id', ids);
      if (error) throw error;
      toast.success('Unscheduled queue cleared.');
    } catch (error) {
      setTasks(previousTasks);
      toast.error(`Error: ${error.message || 'Network error'}`);
    }
  };

  // Clear Completed
  const handleClearCompleted = async () => {
    const ids = tasks.filter(t => t.completed).map(t => t.id).filter(id => !String(id).startsWith('temp'));
    if (!ids.length) return;

    let previousTasks;
    setTasks(prev => {
      previousTasks = prev;
      return prev.filter(t => !t.completed);
    });

    try {
      const { error } = await supabase.from('study_tasks').delete().in('id', ids);
      if (error) throw error;
      toast.success('Cleared all completed tasks.');
    } catch (error) {
      setTasks(previousTasks);
      toast.error(`Error clearing completed: ${error.message || 'Network error'}`);
    }
  };

  // Drag Handlers
  const handleDragStart = (event) => { setActiveDragTask(event.active.data.current.task); };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDragTask(null);
    if (over && over.id) {
      const task = tasks.find(t => t.id === active.id);
      if (task && task.scheduled_date !== over.id) {
        handleUpdateTask(active.id, { scheduled_date: over.id });
      }
    }
  };

  // Mobile assign
  const handleMobileAssign = (date) => {
    if (mobileTaskSelected && date) {
      handleUpdateTask(mobileTaskSelected.id, { scheduled_date: date.format('YYYY-MM-DD') });
      setIsMobileModalVisible(false);
      setMobileTaskSelected(null);
    }
  };

  // Calendar Cell Render
  const cellRender = (current) => {
    const dateStr = current.format('YYYY-MM-DD');
    const isToday = current.isSame(dayjs(), 'day');
    const dayTasks = tasks.filter(t => t.scheduled_date === dateStr && !t.completed);

    return (
      <DroppableCell dateStr={dateStr} onClick={(e) => {
        if (e.target.closest('.task-chip')) return;
        setQuickAddModal({ open: true, date: dateStr });
      }}>
        <div style={{ position: 'absolute', top: -20, right: 0, fontWeight: 800, color: isToday ? '#00D8D6' : 'var(--on-surface-muted)', fontSize: 10 }}>
          {isToday && '📍 '}{dayTasks.length > 0 && <span style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 5px', borderRadius: 8 }}>{dayTasks.length}</span>}
        </div>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 3, marginTop: 4 }}>
          {dayTasks.map(item => (
            <DraggableTask key={item.id} id={item.id} task={item}>
              <li className="task-chip" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: PRIORITY_BG[item.priority || 'medium'],
                borderLeft: `3px solid ${PRIORITY_COLORS[item.priority || 'medium']}`,
                border: `1px solid ${PRIORITY_COLORS[item.priority || 'medium']}40`,
                padding: '3px 6px', borderRadius: 8, fontSize: 11, color: 'var(--on-surface)',
                cursor: 'grab', transition: 'all 0.15s ease',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, overflow: 'hidden', flex: 1 }}>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</span>
                </div>
                <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                  <CheckCircle2 
                    size={12} 
                    color="#10b981" 
                    style={{ cursor: 'pointer' }} 
                    data-testid={`complete-btn-${item.id}`}
                    onClick={(e) => { e.stopPropagation(); handleUpdateTask(item.id, { completed: true }); }} 
                  />
                  <Trash2 
                    size={11} 
                    color="#ef4444" 
                    style={{ cursor: 'pointer', opacity: 0.6 }} 
                    data-testid={`delete-btn-${item.id}`}
                    onClick={(e) => { e.stopPropagation(); handleDeleteTask(item.id); }} 
                  />
                </div>
              </li>
            </DraggableTask>
          ))}
        </ul>
      </DroppableCell>
    );
  };

  const unscheduled = tasks.filter(t => !t.scheduled_date && !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  const scheduledCount = tasks.filter(t => t.scheduled_date && !t.completed).length;
  const totalProgress = tasks.length === 0 ? 0 : Math.round((completedTasks.length / tasks.length) * 100);
  const thisWeekTasks = tasks.filter(t => t.scheduled_date && !t.completed && dayjs(t.scheduled_date).isAfter(dayjs().subtract(1, 'day')) && dayjs(t.scheduled_date).isBefore(dayjs().add(7, 'day')));

  // Skeleton loader while fetching
  if (fetchLoading) {
    return (
      <div style={{ maxWidth: 1400, margin: '0 auto', paddingBottom: 60 }}>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 24 }}>
          <div style={{ flex: 1, minWidth: 260, height: 120, borderRadius: 24, background: 'var(--surface-container-low)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ width: 220, height: 120, borderRadius: 24, background: 'var(--surface-container-low)', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: '0.2s' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
          <div style={{ height: 500, borderRadius: 24, background: 'var(--surface-container-low)', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: '0.3s' }} />
          <div style={{ height: 500, borderRadius: 24, background: 'var(--surface-container-low)', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: '0.4s' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', paddingBottom: 60 }}>

      {/* ── Header Stats ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
        style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 24 }}
      >
        {/* Left header — gradient */}
        <div style={{
          flex: 1, minWidth: 280,
          background: 'linear-gradient(135deg, rgba(0,216,214,0.12), rgba(124,58,237,0.08))',
          border: '1px solid rgba(0,216,214,0.2)',
          padding: '22px 28px', borderRadius: 24, position: 'relative', overflow: 'hidden',
        }}>
          {/* Subtle animated glow */}
          <div style={{ position: 'absolute', top: -30, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'var(--primary)', filter: 'blur(60px)', opacity: 0.1 }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                <CalendarIcon color="#00D8D6" size={26} />
              </motion.div>
              <span style={{ color: 'var(--on-surface)', fontWeight: 900, fontSize: 22 }}>Study Planner</span>
            </div>
            <div style={{ color: 'var(--on-surface-muted)', fontSize: 14, marginBottom: 14 }}>Drag tasks onto the calendar to schedule your study sessions.</div>

            {/* ── Stat pills ── */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                { icon: '🔥', value: `${completedTasks.length > 0 ? Math.min(completedTasks.length, 7) : 0}-day`, label: 'streak' },
                { icon: '✅', value: `${completedTasks.length}`, label: 'tasks done' },
                { icon: '📅', value: `${scheduledCount}`, label: 'scheduled' },
              ].map(s => (
                <div key={s.label} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 9999, padding: '5px 14px', fontSize: 12,
                }}>
                  <span>{s.icon}</span>
                  <span style={{ fontWeight: 700, color: 'var(--on-surface)' }}>{s.value}</span>
                  <span style={{ color: 'var(--on-surface-muted)' }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right header — progress ring */}
        <div style={{ background: 'var(--surface-container-low)', border: '1px solid rgba(255,255,255,0.06)', padding: '20px 28px', borderRadius: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ textAlign: 'center' }}>
            <Progress type="circle" percent={totalProgress} size={80} strokeColor={{ '0%': '#7C3AED', '100%': '#00D8D6' }}
              format={p => <span style={{ color: 'var(--on-surface)', fontSize: 15, fontWeight: 800 }}>{p}%</span>} />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--on-surface)' }}>{completedTasks.length} Done</div>
            <div style={{ color: 'var(--on-surface-muted)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>of {tasks.length} total</div>
            <div style={{ color: '#00D8D6', fontSize: 12, marginTop: 4 }}>{unscheduled.length} in queue</div>
            <div style={{ color: 'var(--on-surface-muted)', fontSize: 11, marginTop: 6, fontStyle: 'italic' }}>{getMotivation(totalProgress)}</div>
          </div>
        </div>
      </motion.div>

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
        <div className="planner-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start' }}>

          {/* ── LEFT: Calendar ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }}
              style={{ background: 'var(--surface-container-low)', padding: '20px 24px', borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)', overflowX: 'auto' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Button onClick={() => setSelectedDate(dayjs())} style={{ background: 'rgba(0,216,214,0.1)', color: '#00D8D6', border: '1px solid rgba(0,216,214,0.3)', borderRadius: 12, fontWeight: 700, transition: 'all 0.15s ease' }}>
                  Today
                </Button>
                <div style={{ display: 'flex', gap: 14 }}>
                  {Object.entries(PRIORITY_COLORS).map(([k, c]) => (
                    <div key={k} style={{ fontSize: 11, color: 'var(--on-surface-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 7, height: 7, background: c, borderRadius: '50%' }} />
                      {PRIORITY_LABELS[k]}
                    </div>
                  ))}
                </div>
              </div>
              <Calendar value={selectedDate} onSelect={d => setSelectedDate(d)} cellRender={cellRender} style={{ background: 'transparent' }} />
            </motion.div>

            {/* Completed Collapse */}
            <Collapse ghost expandIconPosition="end">
              <Collapse.Panel key="1" header={
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircle color="#10b981" size={18} />
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--on-surface)' }}>Completed ({completedTasks.length})</span>
                </div>
              }>
                {completedTasks.length === 0 ? (
                  <div style={{ color: 'var(--on-surface-muted)' }}>No completed tasks yet. Keep grinding! 💪</div>
                ) : (
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 14, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Button danger type="text" onClick={handleClearCompleted} style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 7, fontSize: 13 }}>
                      <Trash2 size={14} /> Clear completed
                    </Button>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }} className="completed-list">
                      {completedTasks.map(t => (
                        <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(16,185,129,0.05)', borderRadius: 10, border: '1px solid rgba(16,185,129,0.15)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <CheckCircle 
                              size={13} 
                              color="#10b981" 
                              style={{ cursor: 'pointer' }} 
                              data-testid={`uncomplete-btn-${t.id}`}
                              onClick={() => handleUpdateTask(t.id, { completed: false })} 
                            />
                            <span style={{ textDecoration: 'line-through', color: 'var(--on-surface-muted)', fontSize: 13 }}>{t.title}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 10, color: 'var(--on-surface-muted)', background: 'rgba(16,185,129,0.1)', padding: '2px 7px', borderRadius: 9999 }}>Done</span>
                            <Trash2 
                              size={12} 
                              color="#ef4444" 
                              style={{ cursor: 'pointer', opacity: 0.6 }} 
                              data-testid={`delete-completed-btn-${t.id}`}
                              onClick={() => handleDeleteTask(t.id)} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Collapse.Panel>
            </Collapse>
          </div>

          {/* ── RIGHT: Sidebar ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>

            {/* Create Task Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.3 }}
              style={{ background: 'var(--surface-container-low)', padding: 20, borderRadius: 24, border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--on-surface)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={16} color="var(--primary)" />
                Create Task
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                <Input
                  size="large" placeholder="What do you need to study?"
                  value={newTask} onChange={e => setNewTask(e.target.value)}
                  onPressEnter={handleAddTask}
                  style={{
                    background: 'rgba(0,0,0,0.3)', color: 'var(--on-surface)', borderRadius: 12,
                    border: addSuccess ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                    transition: 'border-color 0.3s ease',
                  }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <Select value={priority} onChange={setPriority} style={{ flex: 1, height: 42 }} popupClassName="dark-select-popup">
                    <Option value="high"><span style={{ color: '#ef4444', fontWeight: 700 }}>🔴 High</span></Option>
                    <Option value="medium"><span style={{ color: '#f59e0b', fontWeight: 700 }}>🟡 Medium</span></Option>
                    <Option value="low"><span style={{ color: '#10b981', fontWeight: 700 }}>🟢 Low</span></Option>
                  </Select>
                  <Button type="primary" onClick={handleAddTask} loading={loading} icon={!loading && <Plus size={16} />}
                    style={{ background: '#00D8D6', color: '#000', height: 42, borderRadius: 12, fontWeight: 800, minWidth: 68, transition: 'all 0.15s ease' }}>
                    Add
                  </Button>
                </div>
              </div>

              {/* Unscheduled Queue */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--on-surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    Unscheduled Queue
                    <Badge count={unscheduled.length} style={{ background: '#7C3AED' }} />
                  </div>
                  {unscheduled.length > 0 && (
                    <Popconfirm
                      title="Clear all unscheduled tasks?"
                      description="This cannot be undone."
                      onConfirm={handleClearAllUnscheduled}
                      okText="Clear All"
                      cancelText="Cancel"
                      okButtonProps={{ danger: true }}
                    >
                      <Button type="text" size="small" danger style={{ fontSize: 11, padding: '0 6px', height: 24, borderRadius: 6 }}>
                        <XCircle size={11} style={{ marginRight: 3 }} /> Clear All
                      </Button>
                    </Popconfirm>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto', paddingRight: 2 }}>
                  <AnimatePresence>
                    {unscheduled.map(item => (
                      <motion.div key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
                        <DraggableTask id={item.id} task={item}>
                          <div className="planner-task-card" style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '11px 14px',
                            background: PRIORITY_BG[item.priority || 'medium'],
                            borderLeft: `3px solid ${PRIORITY_COLORS[item.priority || 'medium']}`,
                            border: `1px solid ${PRIORITY_COLORS[item.priority || 'medium']}30`,
                            borderRadius: 12, cursor: 'grab', touchAction: 'none',
                            transition: 'all 0.15s ease',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                              <GripVertical size={14} color="var(--on-surface-muted)" style={{ flexShrink: 0 }} />
                              <span style={{ width: 7, height: 7, borderRadius: '50%', background: PRIORITY_COLORS[item.priority || 'medium'], flexShrink: 0 }} />
                              <span style={{ color: 'var(--on-surface)', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                              <div className="mobile-only" onClick={() => { setMobileTaskSelected(item); setIsMobileModalVisible(true); }} style={{ padding: 4, background: 'rgba(0,216,214,0.1)', borderRadius: 6, color: '#00D8D6', cursor: 'pointer' }}>
                                <CalendarIcon size={14} />
                              </div>
                              <Trash2 
                                size={13} 
                                color="#ef4444" 
                                style={{ cursor: 'pointer', opacity: 0.6, transition: 'opacity 0.15s' }} 
                                data-testid={`delete-btn-${item.id}`}
                                onClick={() => handleDeleteTask(item.id)} 
                              />
                            </div>
                          </div>
                        </DraggableTask>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {unscheduled.length === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: 28, textAlign: 'center', color: 'var(--on-surface-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: 14, fontSize: 13 }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
                      <div style={{ fontWeight: 600 }}>No pending tasks</div>
                      <div style={{ fontSize: 12, marginTop: 4 }}>You're all caught up! Add a new task above.</div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* This Week's Focus */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.3 }}
              style={{ background: 'rgba(124,58,237,0.06)', padding: 20, borderRadius: 24, border: '1px solid rgba(124,58,237,0.15)' }}
            >
              <div style={{ fontWeight: 800, fontSize: 14, color: '#c4b5fd', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
                <Target size={16} /> This Week's Focus
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {thisWeekTasks.length === 0
                  ? <div style={{ color: 'var(--on-surface-muted)', fontSize: 12 }}>Nothing scheduled this week. Start adding tasks!</div>
                  : thisWeekTasks.slice(0, 5).map(t => (
                    <div key={t.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '8px 12px', borderRadius: 10,
                      background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.1)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, overflow: 'hidden', flex: 1 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: PRIORITY_COLORS[t.priority || 'medium'], flexShrink: 0 }} />
                        <span style={{ color: 'var(--on-surface)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                        <span style={{ color: '#00D8D6', fontSize: 11, fontWeight: 600 }}>{dayjs(t.scheduled_date).format('ddd')}</span>
                        <span style={{ color: 'var(--on-surface-muted)', fontSize: 10 }}>{dayjs(t.scheduled_date).format('MMM D')}</span>
                      </div>
                    </div>
                  ))
                }
              </div>
            </motion.div>
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeDragTask ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'var(--surface-container-high)', border: `2px solid ${PRIORITY_COLORS[activeDragTask.priority || 'medium']}`, borderRadius: 12, color: 'var(--on-surface)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', fontSize: 13 }}>
              <GripVertical size={14} color="#00D8D6" /> {activeDragTask.title}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Quick-Add Date Modal */}
      <Modal
        title={`📅 Add task for ${quickAddModal.date ? dayjs(quickAddModal.date).format('MMM D, YYYY') : ''}`}
        open={quickAddModal.open}
        onCancel={() => setQuickAddModal({ open: false, date: null })}
        footer={null}
        className="glass-modal"
      >
        <div style={{ padding: '16px 0' }}>
          <Input
            size="large"
            placeholder="Task title..."
            value={quickAddText}
            onChange={e => setQuickAddText(e.target.value)}
            onPressEnter={handleQuickAdd}
            autoFocus
            style={{ marginBottom: 12, borderRadius: 10 }}
          />
          <div style={{ display: 'flex', gap: 10 }}>
            <Select value={quickAddPriority} onChange={setQuickAddPriority} style={{ flex: 1 }} popupClassName="dark-select-popup">
              <Option value="high"><span style={{ color: '#ef4444' }}>🔴 High</span></Option>
              <Option value="medium"><span style={{ color: '#f59e0b' }}>🟡 Medium</span></Option>
              <Option value="low"><span style={{ color: '#10b981' }}>🟢 Low</span></Option>
            </Select>
            <Button type="primary" loading={quickAddLoading} onClick={handleQuickAdd}
              style={{ background: '#00D8D6', color: '#000', borderRadius: 10, fontWeight: 700, transition: 'all 0.15s ease' }}>
              Add Task
            </Button>
          </div>
        </div>
      </Modal>

      {/* Mobile Assign Modal */}
      <Modal title="Schedule Task" open={isMobileModalVisible} onCancel={() => setIsMobileModalVisible(false)} footer={null} className="glass-modal">
        <div style={{ padding: '16px 0' }}>
          <Text style={{ display: 'block', color: 'var(--on-surface-variant)', marginBottom: 14 }}>
            Select a date for: <strong style={{ color: 'var(--on-surface)' }}>{mobileTaskSelected?.title}</strong>
          </Text>
          <DatePicker style={{ width: '100%', borderRadius: 10 }} onChange={handleMobileAssign} />
        </div>
      </Modal>

      <style>{`
        .ant-picker-calendar-full .ant-picker-cell-in-view.ant-picker-cell-selected .ant-picker-calendar-date { background: rgba(0,216,214,0.1) !important; }
        .ant-picker-calendar-date { padding: 6px !important; margin: 0 !important; }
        .ant-picker-calendar-date-value { color: var(--on-surface) !important; font-weight: 700; margin-bottom: 6px; }
        .ant-picker-cell-today .ant-picker-calendar-date-value { color: #00D8D6 !important; }
        .ant-picker-cell-today .ant-picker-calendar-date { background: rgba(0,216,214,0.06) !important; border-radius: 12px; }
        .planner-task-card:hover { border-left-width: 4px !important; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        .task-chip:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @media (max-width: 900px) {
          .desktop-only { display: none !important; }
          .mobile-only  { display: block !important; }
          .planner-grid { grid-template-columns: 1fr !important; }
          .ant-picker-calendar-full { font-size: 11px; }
        }
        @media (min-width: 901px) { .mobile-only { display: none !important; } }
      `}</style>
    </div>
  );
};

export default StudyPlanner;
