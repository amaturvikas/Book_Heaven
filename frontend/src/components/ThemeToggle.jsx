import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme, isDarkMode } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`btn btn-outline-custom theme-toggle-btn d-inline-flex align-items-center justify-content-center gap-2 ${className}`}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="theme-toggle-icon-wrap position-relative d-inline-flex align-items-center justify-content-center">
        {isDarkMode ? (
          <Sun size={18} className="theme-icon sun-icon text-warning" />
        ) : (
          <Moon size={18} className="theme-icon moon-icon text-secondary" />
        )}
      </span>
      {showLabel && (
        <span className="small fw-semibold">
          {isDarkMode ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
