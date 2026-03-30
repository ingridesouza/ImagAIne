import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        /* Semantic tokens — resolve to CSS custom properties */
        body:      'var(--color-bg)',
        surface:   'var(--color-surface)',
        elevated:  'var(--color-elevated)',
        inset:     'var(--color-inset)',
        overlay:   'var(--color-overlay)',
        backdrop:  'var(--color-backdrop)',

        fg:        'var(--color-text)',
        'fg-sec':  'var(--color-text-sec)',
        'fg-muted':'var(--color-text-muted)',
        'fg-inv':  'var(--color-text-inv)',

        border:    'var(--color-border)',
        'border-strong': 'var(--color-border-strong)',

        accent:      'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',
        'accent-soft': 'var(--color-accent-soft)',
        'accent-text': 'var(--color-accent-text)',

        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger:  'var(--color-danger)',

        like:      'var(--color-like)',
        'like-soft': 'var(--color-like-soft)',

        /* Legacy aliases kept for gradual migration */
        primary: 'var(--color-accent)',
        'background-dark': 'var(--color-bg)',
        'background-light': 'var(--color-bg)',
        'surface-dark': 'var(--color-surface)',
        'panel-dark': 'var(--color-elevated)',
        'accent-purple': 'var(--color-accent)',

        /* Flow palette — now indigo-based, sober */
        flow: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#818cf8',
          400: '#6366f1',
          500: '#4f46e5',
          600: '#4338ca',
          700: '#3730a3',
          800: '#312e81',
          900: '#1e1b4b',
        },
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0.625rem',
        lg: '0.875rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        full: '9999px',
      },
    },
  },
  plugins: [forms, containerQueries],
};
