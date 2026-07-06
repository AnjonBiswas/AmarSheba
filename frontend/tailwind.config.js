/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Noto Sans Bengali', 'system-ui', 'sans-serif'],
        bangla: ['Hind Siliguri', 'sans-serif'],
      },
      colors: {
        ink: '#172026',
        sheba: {
          50: '#eef9f5',
          100: '#d7f1e7',
          500: '#1f9d78',
          600: '#168464',
          700: '#126b54',
        },
        river: '#246b9f',
        harvest: '#e6a12a',
        clay: '#b85c38',
      },
      boxShadow: {
        soft: '0 18px 50px rgba(23, 32, 38, 0.12)',
      },
    },
  },
  plugins: [],
};
