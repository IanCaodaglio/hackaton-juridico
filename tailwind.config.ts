import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:  ['var(--font-sans)', 'Lato', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'EB Garamond', 'Georgia', 'serif'],
      },
      colors: {
        arbor: {
          bg:      '#020617',
          surface: '#0F172A',
          surface2:'#1E293B',
          border:  '#334155',
          muted:   '#475569',
          text:    '#F8FAFC',
          subtle:  '#94A3B8',
          accent:  '#22C55E',
          gain:    '#22C55E',
          loss:    '#EF4444',
          warn:    '#F59E0B',
        },
      },
      fontSize: {
        xs:    ['0.75rem',  { lineHeight: '1.1rem' }],
        sm:    ['0.875rem', { lineHeight: '1.35rem' }],
        base:  ['1rem',     { lineHeight: '1.6rem' }],
        lg:    ['1.125rem', { lineHeight: '1.7rem' }],
        xl:    ['1.25rem',  { lineHeight: '1.85rem' }],
        '2xl': ['1.5rem',   { lineHeight: '2.1rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.35rem' }],
        '4xl': ['2.25rem',  { lineHeight: '2.65rem' }],
      },
      boxShadow: {
        card: '0 1px 0 rgba(0,0,0,0.4), 0 0 0 1px rgba(51,65,85,0.5)',
        glow: '0 0 20px rgba(34,197,94,0.15)',
      },
    },
  },
  plugins: [],
};

export default config;
