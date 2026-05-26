import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Source Serif 4', 'Georgia', 'serif'],
      },
      colors: {
        // Tokens semânticos do produto — usar estes, evitar hex direto.
        ink: {
          DEFAULT: '#18181B',
          muted: '#525252',
          subtle: '#71717A',
        },
        line: '#E5E5E5',
        canvas: '#FAFAF9',
        accent: {
          DEFAULT: '#0F172A',
          fg: '#FFFFFF',
        },
        loss: '#991B1B',
        gain: '#166534',
      },
      fontSize: {
        // Base 14 + escala compacta tipo Stripe/Linear
        xs: ['0.75rem', { lineHeight: '1.1rem' }],
        sm: ['0.875rem', { lineHeight: '1.35rem' }],
        base: ['1rem', { lineHeight: '1.6rem' }],
        lg: ['1.125rem', { lineHeight: '1.7rem' }],
        xl: ['1.25rem', { lineHeight: '1.85rem' }],
        '2xl': ['1.5rem', { lineHeight: '2.1rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.35rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.65rem' }],
      },
      boxShadow: {
        card: '0 1px 0 rgba(24,24,27,0.04), 0 0 0 1px rgba(24,24,27,0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
