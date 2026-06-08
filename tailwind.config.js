/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bebas Neue"', 'cursive'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: '#F5F3EE',
        card: '#FFFFFF',
        border: '#E8E5DF',
        muted: '#AAA',
        accent: '#F97316',
        dark: '#0D0D0D',
      },
    },
  },
  plugins: [],
};
