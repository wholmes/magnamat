/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html'],
  theme: {
    extend: {
      colors: {
        'mag-red': '#E5342A',
        'mag-blue': '#3B9BE5',
        ink: '#161616',
        paper: '#fafaf8',
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        body: ['Barlow', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
