// @ts-check

/**
 * @typedef {string | { id: string; [key: string]: any }} ShikiLang
 */

import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from 'url';
import node from '@astrojs/node';
import rehypeMermaid from 'rehype-mermaid';
import rehypeRaw from 'rehype-raw'; // Import rehype-raw
import normalizeShellLangs from './src/utils/markdown/normalizeShellLangs.js';

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
    ],
    remarkRehype: {
      allowDangerousHtml: true,
      // If you have custom handlers, add them here (e.g., defListHastHandlers)
      // handlers: defListHastHandlers,
    },
    // rehypePlugins array added to enable HTML transformations on Markdown
    rehypePlugins: [
      // rehypeRaw must come first to process raw HTML nodes in markdown
      rehypeRaw,
      // rehype-mermaid for UML/Mermaid diagrams
      [
        rehypeMermaid,
        {
          strategy: 'img-svg',
          dark: true
        }
      ],
      // rehypeModifyMermaidGraphs, // Uncomment if/when available
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
        '@tabler/icons': fileURLToPath(new URL('./src/assets', import.meta.url)),
        '@content': fileURLToPath(new URL('./src/content', import.meta.url))
      }
    }
  },
  experimental: {
    svg: true,
  }
});
