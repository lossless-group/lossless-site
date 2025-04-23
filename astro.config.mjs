// @ts-check

/**
 * @typedef {string | { id: string; [key: string]: any }} ShikiLang
 */

import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from 'url';
import node from '@astrojs/node';
import normalizeShellLangs from './src/utils/markdown/normalizeShellLangs.js';

// ---
// Syntax Highlighting Configuration (Shiki)
// See: https://docs.astro.build/en/guides/syntax-highlighting/
//
// This configures Shiki as the syntax highlighter for all Markdown/MDX code blocks.
// Custom themes and languages can be set here.
// ---

/** @type {ShikiLang[]} */
const langs = [
  'javascript',
  'typescript',
  'python'
];

export default defineConfig({
  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      theme: 'github-dark',
      langs: /** @type {any} */ (langs)
    },
    remarkPlugins: [
      /** @type {any} */ (normalizeShellLangs),
    ]
  },
  output: "server",
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [mdx()], // Shiki is the default highlighter for markdown/code blocks
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@basics': fileURLToPath(new URL('./src/components/basics', import.meta.url)),
        '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
        '@styles': fileURLToPath(new URL('./src/styles', import.meta.url)),
        '@visuals': fileURLToPath(new URL('./src/content/visuals', import.meta.url)),
        '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
        '@tool-components': fileURLToPath(new URL('./src/components/tool-components', import.meta.url)),
        '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
        '@tabler/icons': fileURLToPath(new URL('./node_modules/@tabler/icons', import.meta.url)),
        '@content': fileURLToPath(new URL('./src/content', import.meta.url))
      }
    }
  },
  experimental: {
    svg: true,
  }
});
// Using Astro's built-in Shiki integration for syntax highlighting (SSR/static compatible)
// No Prism integration needed. Shiki handles all syntax highlighting.
