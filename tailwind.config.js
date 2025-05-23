/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}",],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Core Brand Colors
        'dominator': {
          black: '#0A0A0A',
          blue: '#00F5FF',
          green: '#00FFA3',
          magenta: '#FF00F5',
          dark: '#1A1A1A',
          light: '#F0F0F0',
          red: '#FF3D3D',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-magenta': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      boxShadow: {
        'glow-blue': '0 0 15px rgba(0, 245, 255, 0.5)',
        'glow-green': '0 0 15px rgba(0, 255, 163, 0.5)',
        'glow-magenta': '0 0 15px rgba(255, 0, 245, 0.5)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

