/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ConfigProvider, theme as antTheme } from 'antd';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Inject the physical theme attribute to synchronize with index.css variables
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <ConfigProvider
        theme={{
          algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
          token: {
            colorPrimary: '#49eef8',
            colorInfo: '#49eef8',
            borderRadius: 12,
            borderRadiusLG: 24,
            fontFamily: '"Inter", -apple-system, sans-serif',
            colorBgContainer: isDark ? '#1f1f1f' : '#ffffff',
            colorBgElevated: isDark ? '#2a2a2a' : '#ffffff',
            colorBgLayout: isDark ? '#131313' : '#f4f8fa',
            colorText: isDark ? '#e2e2e2' : '#0f172a',
            colorTextSecondary: isDark ? '#bac9ca' : '#3d5c60',
            colorBorder: isDark ? 'rgba(59,73,74,0.4)' : 'rgba(0,0,0,0.08)',
            colorBorderSecondary: isDark ? 'rgba(59,73,74,0.2)' : 'rgba(0,0,0,0.06)',
          },
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};
