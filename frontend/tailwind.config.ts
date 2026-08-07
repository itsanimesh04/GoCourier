import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Premium white-based palette
        background: '#FFFFFF',
        foreground: '#0A0A0B',
        card: '#FAFAFA',
        'card-foreground': '#1A1A1B',
        primary: '#FF2E63', // Vibrant coral for food ordering
        'primary-foreground': '#FFFFFF',
        secondary: '#D4FF4F', // Fresh lime accent
        'secondary-foreground': '#0A0A0B',
        muted: '#6B7280',
        'muted-foreground': '#9CA3AF',
        border: '#E5E7EB',
        input: '#F3F4F6',
        ring: '#FF2E63',
        success: '#10B981',
        danger: '#EF4444',
        // Semantic aliases for backward compatibility
        bg: '#FFFFFF',
        text: '#0A0A0B',
        brand: '#FF2E63',
        brandContrast: '#FFFFFF',
        surface2: '#F3F4F6',
        urgent: '#D4FF4F'
      },
      fontFamily: {
        display: ['Sora', 'system-ui', 'sans-serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        button: '12px',
        input: '16px',
        card: '20px',
        sheet: '24px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px'
      },
      boxShadow: {
        cta: '0 12px 36px rgba(255, 46, 99, 0.22)',
        card: '0 4px 24px rgba(0, 0, 0, 0.06)',
        subtle: '0 1px 3px rgba(0, 0, 0, 0.04)',
        elevated: '0 8px 32px rgba(0, 0, 0, 0.08)'
      },
      maxWidth: {
        app: '430px'
      },
      spacing: {
        shell: '20px',
        tap: '44px'
      },
      backdropBlur: {
        xs: '2px'
      }
    }
  },
  plugins: []
};

export default config;
