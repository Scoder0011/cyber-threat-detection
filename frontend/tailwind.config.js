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
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
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
