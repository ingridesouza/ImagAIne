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
        'background-dark': '#0c0e0d',
        'surface-dark': '#161b18',
      },
      fontFamily: {
        display: ['Spline Sans', 'system-ui', 'sans-serif'],
        sans: ['Spline Sans', 'system-ui', 'sans-serif'],
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
