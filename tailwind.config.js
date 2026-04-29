/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Kristal Ana Rengi - #249db3
        kristal: {
          50: '#f0fdf9',
          100: '#ccfbf0', 
          200: '#99f6e0',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#249db3', // Ana renk
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        
        // Primary olarak kristal kullan
        primary: {
          50: '#f0fdf9',
          100: '#ccfbf0',
          200: '#99f6e0', 
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#249db3', // Ana renk
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
      },
      
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      
      boxShadow: {
        'kristal': '0 4px 20px rgba(36, 157, 179, 0.15)',
        'kristal-lg': '0 10px 40px rgba(36, 157, 179, 0.2)',
      },
      
      borderRadius: {
        'kristal': '12px',
        'kristal-lg': '16px',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}