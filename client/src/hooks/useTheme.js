import { useEffect, useState } from 'react';
import themeStore from '../store/themeStore';

/**
 * Custom hook for accessing and managing theme state
 * Provides real-time theme updates through Zustand store subscription
 * @returns {Object} Theme utilities
 * @returns {string} theme - Current theme ('default' or 'minimal')
 * @returns {Function} setTheme - Function to change theme
 * @returns {boolean} isMinimal - Whether current theme is minimal
 */
const useTheme = () => {
  const theme = themeStore((state) => state.theme);
  const setTheme = themeStore((state) => state.setTheme);
  const syncTheme = themeStore((state) => state.syncTheme);
  
  // Listen for theme changes from custom events
  // This allows components to react to theme changes from external sources
  const [, forceUpdate] = useState({});
  
  useEffect(() => {
    const handleThemeChange = (event) => {
      // Force re-render when theme changes via custom event
      forceUpdate({});
    };
    
    window.addEventListener('themechange', handleThemeChange);
    
    return () => {
      window.removeEventListener('themechange', handleThemeChange);
    };
  }, []);
  
  return {
    theme,
    setTheme,
    syncTheme,
    isMinimal: theme === 'minimal',
  };
};

export default useTheme;
