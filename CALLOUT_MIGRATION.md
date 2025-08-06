# Callout Migration Guide

## Overview

All custom callouts have been migrated from code block syntax (```type) to directive syntax (:::type). This provides better semantic meaning and consistency with other directives.

## Migration Examples

### Before (Code Block Syntax) ❌
```warning
This is a warning message
```

```emphasis
This is emphasized content
```

```info
This is informational content
```

### After (Directive Syntax) ✅
:::warning
This is a warning message
:::

:::emphasis
This is emphasized content
:::

:::info
This is informational content
:::

## Available Callout Types

| Directive | Aliases | Icon | Description |
|-----------|---------|------|-------------|
| `:::warning` | `:::alert` | ⚠️ | Warning messages |
| `:::info` | `:::information` | ℹ️ | Informational content |
| `:::success` | `:::check` | ✅ | Success messages |
| `:::error` | `:::danger` | ❌ | Error messages |
| `:::tip` | `:::hint` | 💡 | Helpful tips |
| `:::note` | | 📝 | General notes |
| `:::emphasis` | `:::em` | 💡 | Emphasized content |
| `:::quote` | `:::blockquote` | ❝ | Quotations |

## Custom Titles

You can override the default title using the `title` attribute:

```markdown
:::warning{title="Custom Warning Title"}
This warning has a custom title
:::
```

## Benefits of Directive Syntax

✅ **More Semantic**: Directives are designed for this type of content  
✅ **Consistent**: Same pattern as other directives (figma-embed, portfolio-gallery, etc.)  
✅ **Extensible**: Easy to add attributes and customize behavior  
✅ **Better Parsing**: More reliable parsing by remark-directive  
✅ **Future-Proof**: Aligns with modern markdown extension standards  

## Backward Compatibility

⚠️ **Breaking Change**: The old code block syntax (```warning, etc.) is no longer supported. All content must be migrated to use the new directive syntax.

## Migration Script

If you have many files to migrate, you can use this regex pattern:

**Find:** `^```(warning|alert|info|information|success|check|error|danger|tip|hint|note|emphasis|em|quote|blockquote)$\n([\s\S]*?)\n```$`

**Replace:** `:::$1\n$2\n:::`

This will convert most basic callouts automatically. Review the results and adjust as needed.
