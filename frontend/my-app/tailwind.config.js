/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#34495e',
          dark: '#2c3e50',
          light: '#5d6d7e',
        },
        secondary: {
          DEFAULT: '#e74c3c',
          dark: '#c0392b',
          light: '#ec7063',
        },
        accent: {
          DEFAULT: '#3498db',
          dark: '#2980b9',
          light: '#5dade2',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Merriweather', 'serif'],
        sans: ['Inter', 'Roboto', 'Open Sans', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/forms'),
  ],
} 