/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { message } from 'antd';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hydrate Session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signup = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, skill_level: 'Beginner' }
      }
    });
    if (error) throw error;
    message.success('Account created successfully! Welcome to CognifyX AI.');
    return data;
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    message.success('Logged in successfully!');
    return data;
  };

  const loginWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    message.success('Successfully logged out.');
  };

  const isLoggedIn = !!session;

  return (
    <AuthContext.Provider value={{ user, session, login, signup, loginWithGoogle, logout, isLoggedIn, loading, isMockMode: false }}>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
          <div className="ai-pulse-dot" style={{ width: 120, height: 120, borderRadius: '50%', background: 'var(--primary)', filter: 'blur(40px)', opacity: 0.2 }} />
          <h1 className="text-gradient" style={{ margin: '0 0 12px 0', fontSize: '2.5rem', fontWeight: 900, position: 'relative', zIndex: 10 }}>CognifyX AI</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 500, letterSpacing: '0.05em', position: 'relative', zIndex: 10 }}>INITIALIZING WORKSPACE...</p>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
