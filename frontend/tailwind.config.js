/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f7fa',
          100: '#e9edf5',
          200: '#d2dbe8',
          300: '#aec0d5',
          400: '#839ebd',
          500: '#5c7da5',
          600: '#4a678a',
          700: '#3d5471',
          800: '#354761',
          900: '#2f3c53',
        },
        accent: {
          50: '#f7f8f8',
          100: '#eef0f2',
          200: '#d8dfe6',
          300: '#b8c4d0',
          400: '#92a2b6',
          500: '#738399',
          600: '#5d687b',
          700: '#4c5666',
          800: '#424856',
          900: '#383c47',
        },
        neutral: {
          50: '#f8f9fa',
          100: '#f1f3f5',
          200: '#e9ecef',
          300: '#dee2e6',
          400: '#ced4da',
          500: '#adb5bd',
          600: '#868e96',
          700: '#495057',
          800: '#343a40',
          900: '#212529',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}