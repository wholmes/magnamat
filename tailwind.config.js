/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './app/(marketing)/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'mag-red': '#E5342A',
        'mag-blue': '#3B9BE5',
        ink: '#161616',
        paper: '#fafaf8',
      },
      fontFamily: {
        display: ['var(--font-orbitron)', 'sans-serif'],
        body: ['var(--font-barlow)', 'sans-serif'],
        mono: ['var(--font-space-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};
