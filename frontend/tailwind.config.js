/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        threatlens: {
          bg: '#eef2f6',
          card: '#ffffff',
          dark: '#0f172a',
          primary: '#2563eb',
          accent: '#06b6d4',
          border: '#e2e8f0',
          text: '#0f172a',
          muted: '#64748b',
        },
        cyber: {
          950: '#030712',
          900: '#0b0f19',
          850: '#111827',
          800: '#1f2937',
          700: '#374151',
          blue: '#3b82f6',
          cyan: '#06b6d4',
          emerald: '#10b981',
          crimson: '#ef4444',
          amber: '#f59e0b',
          purple: '#8b5cf6',
        },
        cyan: {
          DEFAULT: '#22d3ee',
          400: '#22d3ee',
          500: '#06b6d4',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.02)',
        'card-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02)',
        'card-glow': '0 8px 30px rgba(37, 99, 235, 0.15)',
        'neon-red': '0 0 15px rgba(239, 68, 68, 0.45)',
        'neon-cyan': '0 0 15px rgba(6, 182, 212, 0.45)',
        'neon-emerald': '0 0 15px rgba(16, 185, 129, 0.45)',
        'neon-purple': '0 0 15px rgba(139, 92, 246, 0.45)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'spin 4s linear infinite',
      },
    },
  },
  plugins: [],
};
