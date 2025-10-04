// tailwind.config.mjs
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: ['./src/**/*.{astro,html,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#f36b1c',      // Naranja principal (Ignia)
        secondary: '#0b6ab0',    // Azul secundario (Ignia)
        brand: {
          orange: '#F36B1C',
          blue: '#0B6AB0',
        },
        comp: {
          amber: '#F8A337',
          rust: '#CE4912',
        },
        gray: {
          900: '#434547',
          700: '#727476',
          500: '#A4A6A8',
          100: '#F5F5F5',
        },
      },
      fontFamily: {
        sans: ['Raleway', ...defaultTheme.fontFamily.sans],
      },
      borderRadius: {
        lg: '12px',
      },
    },
  },
  plugins: [],
};
