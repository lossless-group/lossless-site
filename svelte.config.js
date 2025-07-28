import { vitePreprocess } from '@astrojs/svelte';

export default {
  extensions: ['.svelte', '.mdx'],
  preprocess: [
    vitePreprocess({
      typescript: {
        compilerOptions: {
          module: 'es2022',
          moduleResolution: 'node'
        }
      }
    })
  ],
  compilerOptions: {
    customElement: false
  }
};