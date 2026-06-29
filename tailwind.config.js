/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Тёплый угольный фон + сдержанное золото как единственный акцент.
        surface: {
          0: '#141210', // страница
          1: '#1b1916', // карточки, сайдбар
          2: '#221f1b', // поля ввода, raised
          3: '#2a2620', // hover
        },
        line: '#2c2823',
        gold: {
          DEFAULT: '#c2a25e',
          hi: '#d4b878',
          lo: '#9b7f43',
        },
        fg: {
          DEFAULT: '#ece7dd',
          muted: '#a39a89',
          faint: '#736b5c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.25)',
        pop: '0 16px 40px -12px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
}
