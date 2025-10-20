import { create } from 'zustand';

const THEME_STORAGE_KEY = 'cafe-pos-theme';
const VALID_THEMES = ['default', 'minimal'];

const themeStore = create((set) => ({
  theme: 'default',
  
  // Set theme and save to localStorage
  setTheme: (newTheme) => {
    if (!VALID_THEMES.includes(newTheme)) {
      console.warn(`Invalid theme: ${newTheme}. Using 'default'.`);
      newTheme = 'default';
    }
    
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Failed to save theme to localStorage:', error);
    }
    
    set({ theme: newTheme });
  },
  
  // Load theme from localStorage
  loadTheme: () => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && VALID_THEMES.includes(savedTheme)) {
        set({ theme: savedTheme });
        console.log(`Theme loaded from localStorage: ${savedTheme}`);
        return savedTheme;
      }
    } catch (error) {
      console.error('Failed to load theme from localStorage:', error);
    }
    // Set default theme if no saved theme found
    set({ theme: 'default' });
    return 'default';
  },
  
  // Sync theme from external source (e.g., API)
  syncTheme: (newTheme) => {
    if (!VALID_THEMES.includes(newTheme)) {
      console.warn(`Invalid theme: ${newTheme}. Using 'default'.`);
      newTheme = 'default';
    }
    
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Failed to sync theme to localStorage:', error);
    }
    
    set({ theme: newTheme });
  },
}));

export default themeStore;
