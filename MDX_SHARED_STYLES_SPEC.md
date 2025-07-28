# MDX Shared Styles Specification

## Current Situation

1. **AstroMarkdown.astro** contains all markdown rendering logic and styles (1265 lines)
2. **MDX** is configured but doesn't share the same styling
3. **Risk**: Style divergence between regular markdown and MDX content

## Recommended Solution: Hybrid Approach

### 1. Create Shared Style System

Create a centralized style system that both AstroMarkdown and MDX can use:

```
/src/styles/
  ├── markdown/
  │   ├── base.css          # Core typography, spacing
  │   ├── code.css          # Code blocks, inline code
  │   ├── headings.css      # Heading styles
  │   ├── tables.css        # Table styles
  │   ├── callouts.css      # Alert boxes, quotes
  │   └── index.css         # Import all styles
```

### 2. MDX Component Mapping

Use MDX's component substitution to ensure consistent rendering:

```javascript
// astro.config.mjs
export default defineConfig({
  integrations: [
    mdx({
      // Configure MDX to use our custom components
      components: './src/components/markdown/mdx-components.js'
    })
  ]
});
```

### 3. Implementation Steps

#### Step 1: Extract Shared Styles
Extract styles from AstroMarkdown.astro into modular CSS files:

```css
/* /src/styles/markdown/code.css */
.inline-code {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
  font-size: 0.875em;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.08) 0%, 
    rgba(255, 255, 255, 0.04) 100%);
  /* ... rest of styles ... */
}
```

#### Step 2: Create MDX Layout Component
```astro
---
// /src/layouts/MDXLayout.astro
import '@styles/markdown/index.css';
import MDXProvider from '@components/markdown/MDXProvider.astro';

const { frontmatter } = Astro.props;
---

<MDXProvider>
  <article class="mdx-article">
    <slot />
  </article>
</MDXProvider>
```

#### Step 3: Update MDX Files
```mdx
---
title: 'About Us'
layout: '@layouts/MDXLayout.astro'
---
import TeamBios from '@components/TeamBios.svelte';

# About The Lossless Group

Regular markdown content styled consistently.

<TeamBios client:load />
```

## Benefits

1. **Single Source of Truth**: One set of styles for all markdown/MDX
2. **Maintainability**: Update styles in one place
3. **Consistency**: Same visual appearance across content types
4. **Flexibility**: Can still have MDX-specific enhancements
5. **Performance**: Shared CSS is cached and reused

## Migration Path

### Phase 1: Extract Styles (Non-breaking)
- Create CSS modules from AstroMarkdown styles
- Import CSS modules in AstroMarkdown
- Test existing markdown rendering

### Phase 2: MDX Integration
- Create MDXProvider component
- Configure MDX to use shared components
- Test MDX rendering with shared styles

### Phase 3: Optimization
- Remove duplicate styles
- Optimize CSS bundle size
- Add CSS custom properties for theming

## Alternative Approaches Considered

### Option A: Full Duplication
- **Pros**: Independent systems
- **Cons**: Maintenance nightmare, style drift

### Option B: Force MDX through AstroMarkdown
- **Pros**: Perfect consistency
- **Cons**: Loses MDX benefits, complex implementation

### Option C: CSS-in-JS
- **Pros**: Component-scoped styles
- **Cons**: Performance overhead, complexity

## Conclusion

The hybrid approach provides the best balance of:
- Consistency between markdown and MDX
- Maintainability with shared styles
- Flexibility for future enhancements
- Performance through shared CSS

This approach allows the existing AstroMarkdown component to continue working while enabling MDX content to share the same visual styling.