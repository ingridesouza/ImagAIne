import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      /* ==================================================
         DESIGN SYSTEM — ImagAIne "Quiet Glow"
         Todas as decisões visuais derivam destes tokens.
         Nenhum valor ad-hoc no código dos componentes.
         ================================================== */

      colors: {
        /* ---- Surfaces ---- */
        body:       'var(--color-bg)',
        surface:    'var(--color-surface)',
        elevated:   'var(--color-elevated)',
        inset:      'var(--color-inset)',
        overlay:    'var(--color-overlay)',
        backdrop:   'var(--color-backdrop)',

        /* ---- Foreground ---- */
        fg:         'var(--color-text)',
        'fg-sec':   'var(--color-text-sec)',
        'fg-muted': 'var(--color-text-muted)',
        'fg-inv':   'var(--color-text-inv)',

        /* ---- Borders ---- */
        border:         'var(--color-border)',
        'border-strong':'var(--color-border-strong)',

        /* ---- Accent ---- */
        accent:         'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',
        'accent-soft':  'var(--color-accent-soft)',
        'accent-text':  'var(--color-accent-text)',

        /* ---- Status ---- */
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger:  'var(--color-danger)',

        /* ---- Like ---- */
        like:       'var(--color-like)',
        'like-soft':'var(--color-like-soft)',

        /* ---- Sidebar ---- */
        sidebar: 'var(--color-sidebar)',

        /* ---- Flow palette (Apple blue scale) ---- */
        flow: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#0071e3',
          700: '#0077ed',
          800: '#1e40af',
          900: '#1e3a5f',
          950: '#0c1e3a',
        },
      },

      /* ---- Typography ---- */
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'xs':   ['0.75rem',  { lineHeight: '1rem' }],      // 12px
        'sm':   ['0.8125rem',{ lineHeight: '1.25rem' }],    // 13px
        'base': ['0.875rem', { lineHeight: '1.375rem' }],   // 14px
        'lg':   ['1rem',     { lineHeight: '1.5rem' }],     // 16px
        'xl':   ['1.125rem', { lineHeight: '1.75rem' }],    // 18px
        '2xl':  ['1.25rem',  { lineHeight: '1.75rem' }],    // 20px
        '3xl':  ['1.5rem',   { lineHeight: '2rem' }],       // 24px
        '4xl':  ['2rem',     { lineHeight: '2.5rem' }],     // 32px
        '5xl':  ['2.5rem',   { lineHeight: '3rem' }],       // 40px
      },

      /* ---- Spacing (4px base unit) ---- */
      spacing: {
        '0.5': '2px',
        '1':   '4px',
        '1.5': '6px',
        '2':   '8px',
        '2.5': '10px',
        '3':   '12px',
        '4':   '16px',
        '5':   '20px',
        '6':   '24px',
        '7':   '28px',
        '8':   '32px',
        '10':  '40px',
        '12':  '48px',
        '16':  '64px',
        '20':  '80px',
        '24':  '96px',
      },

      /* ---- Border Radius (consistent scale) ---- */
      borderRadius: {
        'sm':   '4px',
        DEFAULT:'6px',
        'md':   '8px',
        'lg':   '12px',
        'xl':   '16px',
        '2xl':  '20px',
        '3xl':  '24px',
        'full': '9999px',
      },

      /* ---- Shadows (Apple-style: soft, diffused, layered) ---- */
      boxShadow: {
        'xs':  '0 0.5px 1px var(--shadow-color, rgba(0,0,0,0.04))',
        'sm':  '0 1px 3px var(--shadow-color, rgba(0,0,0,0.06)), 0 1px 2px var(--shadow-color, rgba(0,0,0,0.04))',
        'md':  '0 4px 16px var(--shadow-color, rgba(0,0,0,0.08)), 0 1px 4px var(--shadow-color, rgba(0,0,0,0.04))',
        'lg':  '0 12px 40px var(--shadow-color, rgba(0,0,0,0.12)), 0 4px 12px var(--shadow-color, rgba(0,0,0,0.06))',
        'xl':  '0 24px 64px var(--shadow-color, rgba(0,0,0,0.16)), 0 8px 24px var(--shadow-color, rgba(0,0,0,0.08))',
        'glow':'0 0 24px var(--color-accent-soft), 0 0 8px var(--color-accent-soft)',
      },

      /* ---- Z-Index (structured scale) ---- */
      zIndex: {
        'base':     '0',
        'raised':   '1',
        'dropdown': '10',
        'sticky':   '20',
        'fixed':    '30',
        'overlay':  '40',
        'modal':    '50',
        'toast':    '60',
      },

      /* ---- Transitions ---- */
      transitionDuration: {
        'fast': '100ms',
        DEFAULT: '150ms',
        'normal': '200ms',
        'slow': '300ms',
      },

      /* ---- Layout ---- */
      width: {
        'sidebar':          '15rem',      // 240px expanded
        'sidebar-collapsed':'4.5rem',     // 72px collapsed
      },
    },
  },
  plugins: [forms, containerQueries],
};
