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
        'background-light': '#f8f9fa',
        'background-dark': '#131316',
        'surface-dark': '#1b1b1f',
        'panel-dark': '#1e1e22',
        'terminal-dark': '#0e0e10',
        'purple-accent': '#8b5cf6',
        flow: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#a855f7',
          400: '#9333ea',
          500: '#7e22ce',
          600: '#6b21a8',
          700: '#581c87',
          800: '#4a1772',
          900: '#3b0764',
        },
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        '2xl': '2rem',
        full: '9999px',
      },
    },
  },
  plugins: [forms, containerQueries],
};
