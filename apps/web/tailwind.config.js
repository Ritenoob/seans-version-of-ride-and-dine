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
          50: '#fef7ee',
          100: '#fdedd6',
          200: '#fad7ad',
          300: '#f6ba78',
          400: '#f19341',
          500: '#ed751c',
          600: '#de5b12',
          700: '#b84311',
          800: '#933616',
          900: '#772f15',
        },
      },
    },
  },
  plugins: [],
};
