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
