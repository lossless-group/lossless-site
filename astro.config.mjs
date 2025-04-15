import tailwindcss from "@tailwindcss/vite";
// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import mdx from '@astrojs/mdx';
import { fileURLToPath } from 'url';
import { remarkDefinitionList, defListHastHandlers } from 'remark-definition-list';
import remarkImages from './src/utils/markdown/remark-images';
import remarkBacklinks from './src/utils/markdown/remark-backlinks';
import remarkCalloutHandler from './src/utils/markdown/remark-callout-handler';
import remarkCitations from './src/utils/markdown/remarkCitations';

export default defineConfig({
  output: "server",
  adapter: node({
    mode: 'standalone'
  }),
  integrations: [
    mdx({
      // MDX options here
      extendMarkdownConfig: true, // Extend the existing markdown config
      optimize: false // Don't minify MDX content for better debugging
    })
  ],
  markdown: {
    remarkPlugins: [
      remarkCalloutHandler, // Must be first to see raw markdown
      remarkBacklinks,      // Then handle wiki-links
      remarkImages,         // Then handle images
      remarkDefinitionList, // Handle definition lists
      remarkCitations,      // Handle citations
    ],
    remarkRehype: { handlers: defListHastHandlers },
    syntaxHighlight: 'shiki', // Use Shiki for syntax highlighting
    shikiConfig: {
      theme: 'github-dark', // Use a dark theme for better readability
      // Register our custom languages
      langs: [
        {
          id: 'litegal',
          scopeName: 'source.litegal',
          grammar: {
            patterns: [
              // Add some basic patterns for litegal syntax
              { match: '\\b(function|return|if|else|for|while)\\b', name: 'keyword.control.litegal' },
              { match: '\\b(true|false|null|undefined)\\b', name: 'constant.language.litegal' },
              { match: '"[^"]*"', name: 'string.quoted.double.litegal' },
              { match: '\'[^\']*\'', name: 'string.quoted.single.litegal' },
              { match: '//.*$', name: 'comment.line.double-slash.litegal' },
              { match: '/\\*[^*]*\\*+([^/*][^*]*\\*+)*/', name: 'comment.block.litegal' },
              { match: '\\b[0-9]+\\b', name: 'constant.numeric.litegal' }
            ]
          }
        },
        {
          id: 'dataview',
          scopeName: 'source.dataview',
          grammar: {
            patterns: [
              // Add some basic patterns for dataview syntax
              { match: '\\b(table|list|task|from|where|sort|group by)\\b', name: 'keyword.control.dataview' },
              { match: '\\b(file|tags|outlinks|inlinks)\\b', name: 'support.function.dataview' },
              { match: '"[^"]*"', name: 'string.quoted.double.dataview' },
              { match: '\'[^\']*\'', name: 'string.quoted.single.dataview' },
              { match: '//.*$', name: 'comment.line.double-slash.dataview' },
              { match: '\\b[0-9]+\\b', name: 'constant.numeric.dataview' }
            ]
          }
        },
        {
          id: 'dataviewjs',
          scopeName: 'source.dataviewjs',
          grammar: {
            patterns: [
              // DataviewJS extends JavaScript syntax with Dataview features
              { include: 'source.js' },  // Include JavaScript patterns
              { match: '\\b(dv|luxon|moment|dataview)\\b', name: 'support.class.dataviewjs' },
              { match: '\\b(table|list|task|from|where|sort|group)\\b', name: 'keyword.control.dataviewjs' },
              { match: '\\b(file|tags|outlinks|inlinks)\\b', name: 'support.function.dataviewjs' },
              { match: '"[^"]*"', name: 'string.quoted.double.dataviewjs' },
              { match: '\'[^\']*\'', name: 'string.quoted.single.dataviewjs' }
            ]
          }
        }
      ]
    },
    parse: {
      blockquotes: true,
      gfm: true
    }
  },
  vite: {
		plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@basics': fileURLToPath(new URL('./src/components/basics', import.meta.url)),
        '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
        '@styles': fileURLToPath(new URL('./src/styles', import.meta.url)),
        '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
        '@tool-components': fileURLToPath(new URL('./src/components/tool-components', import.meta.url)),
        '@assets': fileURLToPath(new URL('./src/assets', import.meta.url))
      }
    }
  },
	experimental: {
		svg: true,
	},
});