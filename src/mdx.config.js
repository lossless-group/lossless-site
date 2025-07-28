// mdx.config.js
import ToolCard from './components/mdx/ToolCard.svelte';

export default {
  // Configure the default layout for MDX files
  layout: './src/layouts/sections/MdxSectionLayout.astro',
  
  // Configure remark and rehype plugins (if needed)
  remarkPlugins: [
    // Add any remark plugins specific to MDX here
  ],
  rehypePlugins: [
    // Add any rehype plugins specific to MDX here
  ],
  
  // Provide components to be used in MDX files
  components: {
    ToolCard,
  },
  
  // Enable MDX provider to pass components to MDX content
  providerImportSource: '@mdx-js/react',
};
