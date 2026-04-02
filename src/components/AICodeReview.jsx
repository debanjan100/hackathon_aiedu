import React, { useState } from 'react';
import { Button } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Clock, Database, Lightbulb, Code2, ChevronDown, ChevronUp } from 'lucide-react';
import { sendChatMessage } from '../lib/chatApi';

const AICodeReview = ({ code, language, problemTitle, visible }) => {
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState(null);
  const [expanded, setExpanded] = useState(true);

  const getReview = async () => {
    if (!code?.trim()) return;
    setLoading(true);
    setReview(null);

    try {
      const response = await fetch('/api/ai/code-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, problemTitle })
      });
      const data = await response.json();
      
      if (data.error || !response.ok) {
        setReview({ error: data.error || 'AI Code Review is temporarily unavailable.' });
      } else {
        setReview({ text: data.review });
      }
    } catch (err) {
      console.error('Review Error:', err);
      setReview({ error: 'AI Code Review is temporarily unavailable. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{ marginTop: 16, background: 'rgba(124,58,237,0.04)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 18, overflow: 'hidden' }}
    >
      {/* Header */}
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', cursor: 'pointer', background: 'rgba(124,58,237,0.06)' }}
        onClick={() => review && setExpanded(v => !v)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Bot size={18} color="#a855f7" />
          <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--on-surface)' }}>AI Code Review</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {!review && (
            <Button
              size="small"
              loading={loading}
              onClick={(e) => { e.stopPropagation(); getReview(); }}
              style={{ borderRadius: 9999, fontSize: 12, fontWeight: 700, background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', color: '#a855f7', height: 30 }}
              icon={!loading && <Bot size={12} />}
            >
              {loading ? 'Analyzing...' : 'Get AI Review'}
            </Button>
          )}
          {review && (expanded ? <ChevronUp size={14} color="var(--on-surface-muted)" /> : <ChevronDown size={14} color="var(--on-surface-muted)" />)}
        </div>
      </div>

      {/* Review Body */}
      <AnimatePresence>
        {review && expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

              {review.error ? (
                <div style={{ color: '#ef4444', fontSize: 13 }}>{review.error}</div>
              ) : (<>
                <div style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 12, padding: '16px', color: 'var(--on-surface)', fontSize: 14, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {review.text}
                </div>

                {/* Re-analyze Button */}
                <Button
                  size="small"
                  onClick={getReview}
                  loading={loading}
                  style={{ alignSelf: 'flex-start', borderRadius: 9999, fontSize: 11, color: 'var(--on-surface-muted)', border: '1px solid var(--border-color)', background: 'transparent', height: 28 }}
                >
                  Re-analyze
                </Button>
              </>)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AICodeReview;
