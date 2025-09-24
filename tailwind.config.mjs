// tailwind.config.mjs
import Config  from 'tailwindcss'

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      // Aquí le decimos a Tailwind sobre nuestros colores personalizados
      colors: {
        'primary': 'var(--color-primary)',
        'secondary': 'var(--color-secondary)',
        'accent1': 'var(--color-accent1)',
        'accent2': 'var(--color-accent2)',
      },
      // También puedes añadir tus fuentes personalizadas
      fontFamily: {
        'title': 'var(--font-title)',
        'subtitle': 'var(--font-subtitle)',
        'body': 'var(--font-body)',
      },
    },
  },
  plugins: [],
}