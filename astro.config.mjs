import tailwindcss from "@tailwindcss/vite";
// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import mdx from '@astrojs/mdx';
import { fileURLToPath } from 'url';
import { remarkDefinitionList, defListHastHandlers } from 'remark-definition-list';
import remarkImages from './src/utils/markdown/remark-images';
import remarkBacklinks from './src/utils/markdown/remark-backlinks';
import { processCallouts } from './src/utils/markdown/callouts/processCalloutPipeline';
import remarkCallouts from './src/utils/markdown/remark-callout-handler';

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
      processCallouts, // Must be first to see raw markdown
      remarkBacklinks,      // Then handle wiki-links
      remarkImages,         // Then handle images
      remarkCallouts,
      remarkDefinitionList  // Finally handle definition lists
    ],
    remarkRehype: { handlers: defListHastHandlers },
    syntaxHighlight: false, // Disable Shiki's syntax highlighting
    shikiConfig: {
      theme: 'github-dark',
      // Register our custom languages
      langs: [
        {
          id: 'litegal',
          scopeName: 'source.litegal',
          grammar: {
            patterns: [{ match: '.*', name: 'text.litegal' }]
          }
        },
        {
          id: 'dataview',
          scopeName: 'source.dataview',
          grammar: {
            patterns: [{ match: '.*', name: 'text.dataview' }]
          }
        }
      ]
    },
    parse: {
      blockquotes: true,
      gfm: true
    },
    render: [
      {
        mode: 'sync',
        renderer: (content) => {
          console.log('Astro markdown renderer:', { content });
          return marked.parse(content);
        }
      }
    ]
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
		svg: {
			mode: "sprite",
		},
	},
});