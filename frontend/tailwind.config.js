import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#38e07b',
        'accent-purple': '#a855f7',
        'background-light': '#f6f8f7',
        'background-dark': '#122017',
        'surface-dark': '#161b18',
        'panel-dark': '#1a2a20',
        'terminal-dark': '#0b120d',
        'purple-accent': '#8b5cf6',
      },
      fontFamily: {
        display: ['Spline Sans', 'system-ui', 'sans-serif'],
        sans: ['Spline Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '1rem',
        lg: '2rem',
        xl: '3rem',
        '2xl': '1.5rem',
        full: '9999px',
      },
    },
  },
  plugins: [forms, containerQueries],
};
