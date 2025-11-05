 /** @type {import('tailwindcss').Config} */
export default {
   content: ["./index.html", "./src/**/*.{html,js,jsx}"],
   theme: {
     extend: {
       colors: {
         primary: {
           DEFAULT: '#E31B54',
           light: '#E91E63',
           dark: '#C41648',
         },
       },
       screens: {
         'xs': '475px',
         '3xl': '1920px',
       },
       spacing: {
         '18': '4.5rem',
         '88': '22rem',
         '128': '32rem',
       },
       maxWidth: {
         '8xl': '88rem',
         '9xl': '96rem',
       },
       fontSize: {
         '2xs': '0.625rem',
       },
       animation: {
         'fade-in': 'fadeIn 0.3s ease-in-out',
         'slide-up': 'slideUp 0.3s ease-out',
         'slide-down': 'slideDown 0.3s ease-out',
       },
       keyframes: {
         fadeIn: {
           '0%': { opacity: '0' },
           '100%': { opacity: '1' },
         },
         slideUp: {
           '0%': { transform: 'translateY(10px)', opacity: '0' },
           '100%': { transform: 'translateY(0)', opacity: '1' },
         },
         slideDown: {
           '0%': { transform: 'translateY(-10px)', opacity: '0' },
           '100%': { transform: 'translateY(0)', opacity: '1' },
         },
       },
     },
   },
   plugins: [],
 }