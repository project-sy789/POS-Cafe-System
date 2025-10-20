import { useEffect, createContext, useContext } from 'react';
import themeStore from '../store/themeStore';

/**
 * Theme Context for propagating theme changes throughout the app
 */
const ThemeContext = createContext(null);

/**
 * Hook to access theme context
 * @returns {Object} Theme context value with current theme
 */
export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Fallback to store if context is not available
    return { theme: themeStore.getState().theme };
  }
  return context;
};

/**
 * ThemeProvider component that applies theme to the document
 * Manages data-theme attribute on document root for CSS variable switching
 * Provides theme context to all child components for real-time updates
 */
const ThemeProvider = ({ children }) => {
  const theme = themeStore((state) => state.theme);
  const loadTheme = themeStore((state) => state.loadTheme);
  
  // Load theme from localStorage on mount
  useEffect(() => {
    loadTheme();
  }, [loadTheme]);
  
  // Apply theme to document root whenever theme changes
  // This ensures real-time updates across all pages
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    
    // Dispatch custom event for theme change
    // This allows components to listen for theme changes if needed
    const event = new CustomEvent('themechange', { 
      detail: { theme } 
    });
    window.dispatchEvent(event);
    
    // Log theme change for debugging
    console.log(`Theme changed to: ${theme}`);
  }, [theme]);
  
  // Subscribe to theme store changes
  useEffect(() => {
    // This subscription ensures that any external changes to the theme store
    // will trigger a re-render and propagate through context
    const unsubscribe = themeStore.subscribe((state) => {
      // The component will automatically re-render when theme changes
      // due to the Zustand hook above
    });
    
    return unsubscribe;
  }, []);
  
  // Provide theme context to all children
  const contextValue = {
    theme,
    isMinimal: theme === 'minimal',
  };
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
