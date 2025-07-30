// Load environment variables
import { NODE_ENV, isProduction, isDevelopment, contentBasePath } from './src/utils/envUtils.js';


// Now import other dependencies
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import mdx from '@astrojs/mdx';
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from 'url';
import rehypeMermaid from 'rehype-mermaid';
import rehypeRaw from 'rehype-raw'; // Import rehype-raw
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import normalizeShellLangs from './src/utils/markdown/normalizeShellLangs.js';
import remarkTableOfContents from './src/utils/markdown/remark-toc';
import vercel from '@astrojs/vercel';
import fs from 'fs';
import path from 'path';
import icon from 'astro-icon';
import sitemap from '@astrojs/sitemap';
import remarkGfm from 'remark-gfm'
import remarkDirective from 'remark-directive';
import { directiveComponentMap, remarkDirectiveToComponent, remarkDirectiveTransform } from './src/utils/markdown/remark-directives.ts';

// Debug log environment
console.log('Environment in astro.config.mjs:', {
  NODE_ENV,
  isProduction,
  isDevelopment,
  CWD: process.cwd(),
  ENV_FILE: fs.existsSync(path.resolve(process.cwd(), '.env')) ? 'Found' : 'Not found'
});

/**
 * @typedef {string | { id: string; [key: string]: any }} ShikiLang
 */


/** @type {ShikiLang[]} */
const langs = [
  'javascript',
  'typescript',
  'html',
  'css',
  'shellscript',
  'python'
];


// Verify the content directory exists
if (!fs.existsSync(contentBasePath)) {
  console.warn(`WARNING: Content directory not found at ${contentBasePath}`);
}

export default defineConfig({
  markdown: {
    syntaxHighlight: 'shiki',
    // Syntax Highlighting with Shiki in codeblocks
    shikiConfig: {
      theme: 'github-dark',
      langs: /** @type {any} */ (langs)
    },
    // TODO: Check if this is actually doing anything. 90% this is already being ran in AstroMarkdown.astro. As a rule of thumb, we have moved away from using remarkPlugins
    remarkPlugins: [
      /** @type {any} */ (normalizeShellLangs),
      /** @type {any} */ (remarkTableOfContents),
      /** @type {any} */ (remarkDirective), // Parse directive syntax
      /** @type {any} */ (remarkDirectiveToComponent), // Preserve directives for AstroMarkdown
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
      // Add IDs to headings (Astro might do this by default via rehype-slug)
      // If not, uncomment: import rehypeSlug from 'rehype-slug'; and add rehypeSlug here.
      // Add anchor links to headings
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'append', // append the link after the heading text
          properties: {
            className: ['header-anchor'], // for styling
            'aria-hidden': 'true',
            tabIndex: -1
          },
          content: { // Display a '#' as the link content
            type: 'element',
            tagName: 'span',
            properties: { className: ['header-anchor-symbol'] },
            children: [{ type: 'text', value: '#' }]
          }
        }
      ],
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
  output: "static",
  adapter: vercel(),
  integrations: [
    mdx(),
    icon({
      iconDir: "src/assets/Icons"
    }),
    svelte({ extensions: ['.svelte'] }),
    sitemap()
  ], // Shiki is the default highlighter for markdown/code blocks
  vite: {
    plugins: [tailwindcss()],
    rollupOptions: {
      external: ['astro:content/loaders']
    },
    resolve: {
      alias: {
        '@basics': fileURLToPath(new URL('./src/components/basics', import.meta.url)),
        '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
        '@layouts': fileURLToPath(new URL('./src/layouts', import.meta.url)),
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
    // server.fs.allow: Vite will serve files from the project root and node_modules, preventing
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