import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        page: '#f7f8fa',
        card: '#ffffff',
        primary: {
          DEFAULT: '#2e7d32',
          hover: '#1b5e20',
          light: '#81c784',
          bg: '#e8f5e9',
        },
        accent: {
          error: '#ef4444',
          success: '#22c55e',
          warning: '#f59e0b',
        },
        text: {
          primary: '#1a1a2e',
          secondary: '#6b7280',
        },
        border: {
          DEFAULT: '#e5e7eb',
          accent: '#2e7d32',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Nunito', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
}
export default config
