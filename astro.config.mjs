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
import remarkTableOfContents from './src/utils/markdown/remark-toc';
import vercel from '@astrojs/vercel';
import fs from 'fs';
import path from 'path';

import icon from 'astro-icon';

/** @type {ShikiLang[]} */
const langs = [
  'javascript',
  'typescript',
  'html',
  'css',
  'shellscript',
  'python'
];

// Determine if we're in a Docker/production environment
const isProduction = process.env.NODE_ENV === 'production';

// Determine the content path based on environment
// In production (Docker), content is at /lossless-monorepo/content
// In development, content is at ../content (relative to site directory)
const contentBasePath = isProduction 
  ? '/lossless-monorepo/content'
  : path.resolve(process.cwd(), '../content');

console.log(`Content path resolved to: ${contentBasePath}`);
console.log(`Environment: ${isProduction ? 'Production' : 'Development'}`);

// Verify the content directory exists
if (!fs.existsSync(contentBasePath)) {
  console.warn(`WARNING: Content directory not found at ${contentBasePath}`);
}

export default defineConfig({
  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      theme: 'github-dark',
      langs: /** @type {any} */ (langs)
    },
    remarkPlugins: [
      /** @type {any} */ (normalizeShellLangs),
      /** @type {any} */ (remarkTableOfContents),
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
  adapter: vercel(),
  integrations: [
    mdx(),
    icon({
      iconDir: "src/assets/Icons"
    })
  ], // Shiki is the default highlighter for markdown/code blocks
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
        '@content': fileURLToPath(new URL('./src/content', import.meta.url)),
        // Add content root alias that points to the correct location in both environments
        '@content-root': contentBasePath
      }
    },
    // --- Vite server.fs.allow fix for dev-toolbar/entrypoint.js error ---
    // This allows Vite to serve files from the project root and node_modules, preventing
    // 'outside of Vite serving allow list' errors when dependencies are resolved with absolute paths.
    // If you are in a monorepo, add the monorepo root (e.g., '../') as needed.
    server: {
      fs: {
        allow: [
          '.', // always allow project root
          '../', // allow serving from parent directory
          'node_modules', // allow serving from node_modules
          contentBasePath, // explicitly allow the content directory
          '/lossless-monorepo', // allow the entire monorepo in production
        ]
      }
    }
  }
});