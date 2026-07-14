import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        card: 'var(--card)',
        brand: 'var(--brand)',
        brandContrast: 'var(--brand-contrast)',
        secondary: 'var(--secondary)',
        urgent: 'var(--urgent)',
        success: 'var(--success)',
        danger: 'var(--danger)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        border: 'var(--border)',
        surface2: 'var(--surface-2)'
      },
      fontFamily: {
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        button: '12px',
        input: '16px',
        card: '18px',
        sheet: '24px'
      },
      boxShadow: {
        cta: '0 12px 36px rgba(255, 46, 99, 0.28)',
        card: '0 18px 48px rgba(0, 0, 0, 0.28)'
      },
      maxWidth: {
        app: '430px'
      },
      spacing: {
        shell: '20px',
        tap: '44px'
      }
    }
  },
  plugins: []
};

export default config;
