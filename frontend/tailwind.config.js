/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        gray: {
          950: '#030712',
          925: '#080f1a',
        },
      },
      backgroundOpacity: {
        3: '0.03',
        8: '0.08',
      },
      transitionProperty: {
        'colors': 'color, background-color, border-color, text-decoration-color, fill, stroke',
      },
    },
  },
  plugins: [],
  // Safelist ensures dynamic classes like opacity fractions aren't purged
  safelist: [
    { pattern: /bg-(indigo|purple|emerald|amber|red|gray|white|black)\/(5|10|20|30|40|50)/ },
    { pattern: /border-(indigo|purple|emerald|amber|red|white)\/(5|10|20|30)/ },
    { pattern: /text-(indigo|purple|emerald|amber|red|gray)-(300|400|500)/ },
    'animate-in', 'fade-in', 'zoom-in-95', 'slide-in-from-right-5',
    'duration-200', 'duration-300',
  ],
}
