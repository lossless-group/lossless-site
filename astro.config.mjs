// Load environment variables
import { NODE_ENV, isProduction, isDevelopment, contentBasePath } from './src/utils/envUtils.js';
import { fileURLToPath } from 'url';

// Now import other dependencies
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import mdx from '@astrojs/mdx';
import tailwindcss from "@tailwindcss/vite";
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
  'python',
  // Aliases for shellscript
  { id: 'shellscript', aliases: ['bash', 'zsh', 'sh'] }
];


// Verify the content directory exists
if (!fs.existsSync(contentBasePath)) {
  console.warn(`WARNING: Content directory not found at ${contentBasePath}`);
}

export default defineConfig({
  markdown: {
    // Be more lenient with markdown parsing
    gfm: true,
    smartypants: true,
    // Allow empty markdown content (just YAML frontmatter)
    allowDangerousHtml: true,
    // Don't fail on invalid markdown
    strict: false,
    
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
    mdx({
      // Add MDX-specific configuration
      markdown: {
        // Match the main markdown config
        gfm: true,
        smartypants: true,
        allowDangerousHtml: true,
        strict: false,
        
        syntaxHighlight: 'shiki',
        shikiConfig: {
          theme: 'github-dark',
          wrap: true,
        },
        // Exclude reports directory from processing
        exclude: ['**/reports/**/*.md', '**/reports/**/*.mdx'],
      },
      // Don't fail on empty MDX content
      allowDangerousHtml: true,
      // Add custom remark plugins
      remarkPlugins: [
        // Use the existing backlinks plugin
        (await import('./src/utils/markdown/remark-backlinks.js')).default
      ],
      // Better error handling for MDX files
      onError: (error, file) => {
        console.warn(`[MDX] Error in ${file || 'unknown file'}:`, error.message);
        // Don't fail the build for MDX errors
        return false;
      },
      // Ensure rehype plugins are properly configured for MDX
      rehypePlugins: [
        rehypeRaw,
        [
          rehypeAutolinkHeadings,
          {
            behavior: 'append',
            properties: {
              className: ['header-anchor'],
              'aria-hidden': 'true',
              tabIndex: -1
            },
            content: {
              type: 'element',
              tagName: 'span',
              properties: { className: ['header-anchor-symbol'] },
              children: [{ type: 'text', value: '#' }]
            }
          }
        ]
      ]
    }),
    icon({
      iconDir: "src/assets/Icons"
    }),
    svelte({ extensions: ['.svelte'] }),
    sitemap()
  ], // Shiki is the default highlighter for markdown/code blocks
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: [
        { find: '@utils', replacement: fileURLToPath(new URL('./src/utils', import.meta.url)) },
        { find: '@components', replacement: fileURLToPath(new URL('./src/components', import.meta.url)) },
        { find: '@assets', replacement: fileURLToPath(new URL('./src/assets', import.meta.url)) },
        { find: '@styles', replacement: fileURLToPath(new URL('./src/styles', import.meta.url)) },
        { find: '@basics', replacement: fileURLToPath(new URL('./src/components/basics', import.meta.url)) },
        { find: '@layouts', replacement: fileURLToPath(new URL('./src/layouts', import.meta.url)) },
        { find: '@visuals', replacement: fileURLToPath(new URL('./src/content/visuals', import.meta.url)) },
        { find: '@tool-components', replacement: fileURLToPath(new URL('./src/components/tool-components', import.meta.url)) },
        { find: '@content', replacement: fileURLToPath(new URL('./src/content', import.meta.url)) },
        { find: '@content-root', replacement: contentBasePath }
      ]
    },
    rollupOptions: {
      external: ['astro:content/loaders']
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