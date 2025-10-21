/**
 * useTheme Hook - Hook para acessar o tema dark/light
 */

import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return {
    theme: context.theme,
    isDarkMode: context.theme === 'dark',
    toggleTheme: context.toggleTheme,
  };
};
