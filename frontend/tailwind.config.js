import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#a855f7',
        'accent-purple': '#a855f7',
        'background-light': '#f8f6fa',
        'background-dark': '#0a090d',
        'surface-dark': '#0c0b10',
        'panel-dark': '#100e16',
        'terminal-dark': '#06050a',
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
