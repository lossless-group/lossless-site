# MDX Specification for Lossless Monorepo Site

## Overview

This document specifies how to use MDX (Markdown with JSX) in the Lossless monorepo Astro site to create content pages and sections with custom components.

## Current Setup

### 1. MDX Integration Status
- ✅ MDX is installed and configured in `astro.config.mjs` (line 109)
- ✅ Content collections support `.mdx` files (see `client-recommendations` and `client-projects` collections)
- ✅ Example MDX file exists at `/src/content/pages/test.mdx`
- ✅ MDX components can be imported and used

### 2. Configuration Details

#### astro.config.mjs
```javascript
integrations: [
  mdx(),  // MDX integration is active
  // ... other integrations
]
```

#### Markdown Processing Pipeline
The site uses a sophisticated Markdown/MDX processing system with:
- Shiki syntax highlighting (GitHub Dark theme)
- Remark plugins: `normalizeShellLangs`, `remarkTableOfContents`
- Rehype plugins: `rehypeRaw`, `rehypeAutolinkHeadings`, `rehypeMermaid`

## How to Use MDX

### 1. Creating MDX Content

#### For Pages Collection
Place `.mdx` files in `/src/content/pages/`:

```mdx
---
title: 'Your Page Title'
description: 'Optional description'
---
import ComponentName from '../../components/ComponentName.astro';

# Your Content

Regular markdown content here.

<ComponentName prop="value" />

More markdown content.
```

#### For Other Collections
Collections that support MDX:
- `client-recommendations`: Pattern `**/Recommendations/**/*.{md,mdx}`
- `client-projects`: Pattern `**/Projects/**/*.{md,mdx}`

### 2. Using Components in MDX

#### Import Components
Components must be imported at the top of the MDX file, after the frontmatter:

```mdx
---
title: 'Page Title'
---
import BaseCodeblock from '../../components/codeblocks/BaseCodeblock.astro';
import CustomComponent from '../../components/CustomComponent.astro';
import SvelteComponent from '../../components/InteractiveComponent.svelte';
```

#### Component Usage
Use imported components like JSX elements:

```mdx
<BaseCodeblock language="javascript">
  const example = "Hello World";
</BaseCodeblock>

<CustomComponent 
  title="Example" 
  description="This is a custom component"
/>
```

### 3. Rendering MDX Content

#### In Layouts (Information.astro pattern)
```astro
---
import { getCollection } from 'astro:content';

const { pageName } = Astro.props;
const pages = await getCollection('pages');
const pageContent = pages.find(page => page.slug === pageName);

if (!pageContent) {
  throw new Error(`Page ${pageName} not found`);
}

const { Content } = await pageContent.render();
---

<Layout>
  <div class="content-wrapper">
    <Content />
  </div>
</Layout>
```

#### In Pages (about.astro pattern)
```astro
---
import Information from '../layouts/Information.astro';
---

<Information pageName="test" />
```

## Available Components for MDX

Based on the test.mdx example, these component types are available:

### 1. Codeblock Components
- `BaseCodeblock.astro` - Basic code display
- `LitegalCodeblockDisplay.astro` - Legal code display
- `DataviewCodeblockDisplay.astro` - Data view display

### 2. Custom Components
Any component in `/src/components/` can be imported, including:
- Astro components (`.astro`)
- Svelte components (`.svelte`) for interactivity

## Best Practices

### 1. Component Imports
- Use relative paths from the MDX file location
- Import paths should match the actual file structure
- Prefer Astro components for static content
- Use Svelte components only when interactivity is needed

### 2. Frontmatter
Always include frontmatter with at least a title:
```yaml
---
title: 'Page Title'
---
```

### 3. File Organization
- Keep MDX files in appropriate content collections
- Follow existing naming conventions
- Use lowercase with hyphens for slugs

### 4. Component Props
Pass props to components using standard JSX syntax:
```mdx
<Component 
  stringProp="value"
  numberProp={42}
  booleanProp
  objectProp={{ key: 'value' }}
/>
```

## Common Issues & Solutions

### Issue: Component not found
**Solution**: Verify the import path is correct relative to the MDX file

### Issue: MDX not rendering
**Solution**: Ensure the collection loader includes `.mdx` pattern

### Issue: Styles not applying
**Solution**: Components should use Tailwind classes or scoped styles

## Example: Creating a New MDX Page

1. Create `/src/content/pages/new-feature.mdx`:
```mdx
---
title: 'New Feature Documentation'
---
import CodeExample from '../../components/CodeExample.astro';
import FeatureCard from '../../components/FeatureCard.astro';

# New Feature

This page demonstrates our new feature using custom components.

<FeatureCard 
  title="Feature One"
  description="This is the first feature"
  icon="rocket"
/>

## Code Example

<CodeExample language="typescript">
interface Feature {
  name: string;
  enabled: boolean;
}
</CodeExample>
```

2. Create a page to render it at `/src/pages/new-feature.astro`:
```astro
---
import Information from '../layouts/Information.astro';
---

<Information pageName="new-feature" />
```

## Future Enhancements

1. **Global Component Registry**: Consider creating a global components file to avoid repetitive imports
2. **MDX Layouts**: Define layout components specifically for MDX content
3. **Component Documentation**: Create a component gallery page showing all available MDX components
4. **Type Safety**: Add TypeScript types for component props used in MDX

## Debugging Tips

1. Enable debug output in `.env`:
   ```
   SHOW_DEBUG_MARKDOWN_AST=true
   ```

2. Check browser console for component loading errors

3. Verify collections are properly configured to load `.mdx` files

4. Use the Astro dev server error overlay for detailed error messages