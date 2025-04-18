/**
 * tailwind.config.js for Lossless Astro site
 *
 * Custom theme extension using `lossless-theme.extend.colors` as requested.
 * This maps Tailwind color utilities to CSS variables defined in lossless-theme.css.
 *
 * To use these colors in components, use classes like `text-primary-600` or `bg-primary-400`.
 *
 * Aggressive commenting: Documented mapping and usage pattern for maintainers.
 */

const plugin = require('tailwindcss/plugin');

module.exports = {
  content: [
    './src/**/*.{astro,js,jsx,ts,tsx,vue,svelte}',
    './public/**/*.html',
    './src/styles/**/*.css',
  ],
  theme: {
    // DO NOT use theme.extend.colors here, use custom key as requested
    'lossless-theme': {
      extend: {
        colors: {
          'primary-600': 'var(--clr-lossless-primary-600)',
          'primary-400': 'var(--clr-lossless-primary-400)',
          // Add additional custom palette colors here as needed
        },
      },
    },
  },
  plugins: [
    // Example: Add a plugin to expose the custom color classes if needed
    plugin(function({ addUtilities, theme, e }) {
      const newUtilities = {};
      const colors = theme('lossless-theme.extend.colors', {});
      Object.entries(colors).forEach(([key, value]) => {
        newUtilities[`.text-${e(key)}`] = { color: value };
        newUtilities[`.bg-${e(key)}`] = { backgroundColor: value };
      });
      addUtilities(newUtilities, ['responsive', 'hover', 'dark']);
    }),
  ],
};
