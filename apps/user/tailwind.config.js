/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'karyo-dark': '#0d1117',
        'karyo-darker': '#070b11',
        'karyo-panel': '#111827',
        'karyo-border': '#1f2937',
        'karyo-cyan': '#00d4ff',
        'karyo-blue': '#3b82f6',
        'karyo-text': '#e5e5e5',
        'karyo-text-secondary': '#9ca3af',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(0, 212, 255, 0.15), 0 10px 30px rgba(0, 0, 0, 0.35)',
      },
    },
  },
  plugins: [],
};
