import React, { createContext, useContext, useState, useEffect } from 'react';
import { ConfigProvider, theme as antTheme } from 'antd';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Set root CSS variables based on theme
    const root = document.documentElement;
    if (isDark) {
      root.style.setProperty('--bg-color', '#0f172a');
      root.style.setProperty('--text-color', '#f8fafc');
      root.style.setProperty('--heading-color', '#ffffff');
      root.style.setProperty('--text-secondary', '#94a3b8');
      root.style.setProperty('--card-bg', 'rgba(30, 41, 59, 0.7)');
    } else {
      root.style.setProperty('--bg-color', '#f8fafc');
      root.style.setProperty('--text-color', '#0f172a');
      root.style.setProperty('--heading-color', '#0f172a');
      root.style.setProperty('--text-secondary', '#475569');
      root.style.setProperty('--card-bg', 'rgba(255, 255, 255, 0.9)');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <ConfigProvider
        theme={{
          algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
          token: {
            colorPrimary: '#00f2fe',
            borderRadius: 8,
            fontFamily: '"Inter", sans-serif',
            colorBgContainer: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
            colorTextBase: isDark ? '#f8fafc' : '#0f172a',
          },
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};
