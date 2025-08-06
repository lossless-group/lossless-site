# Gallery Directive Migration Guide

## Overview

Gallery components (toolingGallery and imageGallery) now support directive syntax (`:::`) in addition to the existing YAML code block syntax (```). The YAML syntax is deprecated and will show deprecation warnings.

## Migration Examples

### Tooling Gallery

#### Before (YAML Code Block) ❌
```yaml toolingGallery
- [[Flowise]]
- [[Acree AI]]
- tag: [[Agentic AI]]
```

#### After (Directive) ✅
:::tooling-gallery
- [[Flowise]]
- [[Acree AI]]
- tag: [[Agentic AI]]
:::

### Image Gallery

#### Before (YAML Code Block) ❌
```yaml imageGallery
- image1.jpg
- image2.png
- image3.webp
```

#### After (Directive) ✅
:::image-gallery
- image1.jpg
- image2.png
- image3.webp
:::

## Available Directives

| Directive | Aliases | Description |
|-----------|---------|-------------|
| `:::tooling-gallery` | `:::toolingGallery` | Display a gallery of tools |
| `:::image-gallery` | `:::imageGallery` | Display a gallery of images |

## Directive Attributes

### Tooling Gallery Attributes

```markdown
:::tooling-gallery{small="true"}
- [[Tool Name]]
- tag: [[Category]]
:::
```

**Available attributes:**
- `small="true"` - Display small tool cards
- `size="small"` - Alternative to `small="true"`

### Image Gallery Attributes

```markdown
:::image-gallery{columns="3"}
- image1.jpg
- image2.png
:::
```

**Available attributes:**
- `columns="3"` - Number of columns (default: auto)
- `gap="1rem"` - Gap between images

## Benefits of Directive Syntax

✅ **More Semantic**: Directives are designed for structured content  
✅ **Consistent**: Same pattern as other directives (portfolio-gallery, callouts, etc.)  
✅ **Extensible**: Easy to add attributes and customize behavior  
✅ **Better Parsing**: More reliable parsing by remark-directive  
✅ **Future-Proof**: Aligns with modern markdown extension standards  

## Deprecation Warnings

When using the old YAML syntax, you'll see a deprecation warning:

```
⚠️ Deprecation Warning
The ```yaml toolingGallery syntax is deprecated. 
Please use :::tooling-gallery directive syntax instead.
```

The warning appears above the gallery but doesn't prevent it from working.

## Migration Script

If you have many files to migrate, you can use these regex patterns:

### Tooling Gallery Migration

**Find:** `^```yaml toolingGallery$\n([\s\S]*?)\n```$`

**Replace:** `:::tooling-gallery\n$1\n:::`

### Image Gallery Migration

**Find:** `^```yaml imageGallery$\n([\s\S]*?)\n```$`

**Replace:** `:::image-gallery\n$1\n:::`

## Backward Compatibility

⚠️ **Deprecated but Supported**: The old YAML syntax will continue to work but will show deprecation warnings. It's recommended to migrate to the new directive syntax.

## Examples

### Complex Tooling Gallery with Tags

```markdown
:::tooling-gallery{small="true"}
- [[Flowise]]
- [[Acree AI]]
- [[LangChain]]
- tag: [[Agentic AI]]
- tag: [[Low-Code]]
:::
```

### Image Gallery with Custom Layout

```markdown
:::image-gallery{columns="2", gap="0.5rem"}
- screenshot1.png
- screenshot2.png
- diagram.svg
:::
```

## Migration Timeline

- **Phase 1**: Directive syntax available (current)
- **Phase 2**: Deprecation warnings shown (current)
- **Phase 3**: YAML syntax removed (future)

Migrate your galleries to directive syntax to avoid future breaking changes.
