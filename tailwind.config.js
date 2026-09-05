/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          bg: '#12141A',
          surface: '#1B1E26',
          border: '#2A2E38',
          text: '#F1F2F4',
          muted: '#9195A0',
        },
        accent: {
          DEFAULT: '#2DD4BF',
          dim: '#1F8F82',
        },
        status: {
          good: '#4ADE80',
          warn: '#FBBF24',
          bad: '#F87171',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'San Francisco',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
