import React, { useState } from 'react';
import { Form, Input, Button, Typography, Divider, Checkbox, message as antMessage } from 'antd';
import { Mail, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { motion, useReducedMotion } from 'framer-motion';

const { Title, Text } = Typography;

/* ── Google OAuth SVG icon ── */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  /* ── Email / Password Login ── */
  const onFinish = async (values) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      antMessage.success('Welcome back!', 2);
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (err) {
      antMessage.error(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Google OAuth Login ── */
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      // window.location.origin resolves automatically:
      //   local dev  → http://localhost:5174  (or 5173 / any port)
      //   production → https://hackathon-aiedu.vercel.app
      const redirectTo = `${window.location.origin}/dashboard`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            include_granted_scopes: 'true',
          },
        },
      });
      if (error) throw error;
      // Supabase redirects the browser to Google — no further action needed here.
    } catch (err) {
      console.error('[Google OAuth] Error:', err);
      const isNotEnabled = err.message?.toLowerCase().includes('provider is not enabled')
        || err.message?.toLowerCase().includes('unsupported provider');
      antMessage.error(
        isNotEnabled
          ? '🔧 Google OAuth not enabled in Supabase yet — open browser console for setup steps.'
          : 'Google sign-in failed: ' + (err.message || 'Unknown error'),
        6
      );
      if (isNotEnabled) {
        console.info(
          '%c[ACTION REQUIRED — Google OAuth Setup]\n\n' +
          'Step 1: Go to Supabase Dashboard → Authentication → Providers → Google\n' +
          '  URL: https://supabase.com/dashboard/project/hhgespubrizykavtjscf/auth/providers\n\n' +
          'Step 2: Toggle "Google" → ON\n\n' +
          'Step 3: Paste credentials (get them from your .env file):\n' +
          '  Client ID:     <YOUR_VITE_GOOGLE_CLIENT_ID>\n' +
          '  Client Secret: <YOUR_VITE_GOOGLE_CLIENT_SECRET>\n\n' +
          'Step 4: In Google Cloud Console → OAuth Client → Authorized Redirect URIs, add:\n' +
          '  https://hhgespubrizykavtjscf.supabase.co/auth/v1/callback\n\n' +
          'Step 5: Save both dashboards, wait 2 min, retry.',
          'color: #faad14; font-size: 13px; font-weight: bold;'
        );
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Heading */}
      <div style={{ marginBottom: 32 }}>
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(73,238,248,0.06)', border: '1px solid rgba(73,238,248,0.2)', borderRadius: 9999, padding: '5px 14px', marginBottom: 20 }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#49eef8', boxShadow: '0 0 8px #49eef8' }} />
          <span style={{ color: '#49eef8', fontWeight: 600, fontSize: 12 }}>Secure Login</span>
        </motion.div>
        <Title level={2} style={{ color: '#fff', fontWeight: 800, margin: '0 0 8px 0', fontSize: '2rem', letterSpacing: '-0.02em' }}>
          Welcome Back
        </Title>
        <Text style={{ color: '#7a8a8b', fontSize: 15 }}>
          Sign in to continue your learning journey
        </Text>
      </div>

      {/* Google SSO Button — LIVE */}
      <motion.button
        whileHover={shouldReduceMotion ? {} : { background: 'rgba(255,255,255,0.09)', scale: 1.01 }}
        whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        aria-label="Sign in with Google"
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 12, height: 48,
          color: '#fff', fontSize: 15, fontWeight: 500,
          cursor: googleLoading ? 'wait' : 'pointer',
          marginBottom: 28,
          transition: 'background 0.2s ease, box-shadow 0.3s ease',
          fontFamily: 'Inter, sans-serif',
          opacity: googleLoading ? 0.7 : 1,
        }}
      >
        {googleLoading ? (
          <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#49eef8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        ) : <GoogleIcon />}
        {googleLoading ? 'Redirecting to Google...' : 'Sign in with Google'}
      </motion.button>

      <Divider style={{ borderColor: 'rgba(255,255,255,0.08)', color: '#4a5568', fontSize: 12, margin: '0 0 28px 0' }}>
        or sign in with email
      </Divider>

      {/* Email / Password Form */}
      <Form name="login" layout="vertical" onFinish={onFinish} autoComplete="off">
        <Form.Item
          name="email"
          label={<span style={{ color: '#bac9ca', fontSize: 13, fontWeight: 500 }}>Email</span>}
          rules={[{ required: true, type: 'email', message: 'Please enter a valid email!' }]}
          style={{ marginBottom: 20 }}
        >
          <Input
            className="auth-input"
            prefix={<Mail size={16} color="#4a5568" style={{ marginRight: 6 }} />}
            placeholder="you@example.com"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={<span style={{ color: '#bac9ca', fontSize: 13, fontWeight: 500 }}>Password</span>}
          rules={[{ required: true, message: 'Please enter your password!' }]}
          style={{ marginBottom: 16 }}
        >
          <Input.Password
            className="auth-input"
            prefix={<Lock size={16} color="#4a5568" style={{ marginRight: 6 }} />}
            placeholder="••••••••"
            size="large"
          />
        </Form.Item>

        {/* Remember + Forgot */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <Checkbox style={{ color: '#7a8a8b', fontSize: 13 }}>Remember Me</Checkbox>
          <Text
            style={{ color: '#49eef8', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}
            onClick={() => antMessage.info('Password reset — check your Supabase auth settings.', 3)}
          >
            Forgot Password?
          </Text>
        </div>



        <Form.Item style={{ marginBottom: 20 }}>
          <motion.div
            whileHover={shouldReduceMotion ? {} : { boxShadow: '0 0 40px rgba(73,238,248,0.45)', scale: 1.01 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
            style={{ borderRadius: 12, transition: 'all 0.3s ease' }}
          >
            <Button
              id="login-submit-btn"
              htmlType="submit"
              block
              loading={loading}
              style={{
                background: 'linear-gradient(135deg, #1d4ed8, #2563eb, #49eef8)',
                border: 'none', color: 'white',
                borderRadius: 12, height: 52,
                fontSize: 16, fontWeight: 700,
                boxShadow: '0 0 20px rgba(73,238,248,0.2)',
                transition: 'all 0.3s ease',
              }}
            >
              Sign In ✦
            </Button>
          </motion.div>
        </Form.Item>
      </Form>

      {/* Sign Up Link */}
      <div style={{ textAlign: 'center' }}>
        <Text style={{ color: '#7a8a8b', fontSize: 14 }}>
          Don&apos;t have an account?{' '}
          <Link to="/signup" style={{ color: '#49eef8', fontWeight: 600 }}>
            Create Free Account
          </Link>
        </Text>
      </div>

      {/* CSS for spinner */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Login;
