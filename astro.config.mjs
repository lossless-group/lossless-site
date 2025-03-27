// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import mdx from '@astrojs/mdx';
import { fileURLToPath } from 'url';
import { remarkObsidianLinks } from './src/utils/remarkObsidianLinks';

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
    remarkPlugins: [remarkObsidianLinks],
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
    }
  },
  vite: {
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
  }
});