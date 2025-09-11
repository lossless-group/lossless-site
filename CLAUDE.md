# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Astro-based static site generator within the Lossless Group monorepo, featuring an advanced Markdown processing pipeline with custom components and multiple deployment environments.

**Core Technologies:**
- **Astro 5.13.2** - Static site generator with islands architecture
- **Svelte 5.38** - Interactive client components
- **Tailwind CSS v4** - Styling with custom Lossless theme
- **Shiki** - Syntax highlighting with custom singleton utility
- **pnpm** - Package manager (REQUIRED - do not use npm/yarn)

## Development Commands

```bash
# Install dependencies (MUST use pnpm)
pnpm install

# One-time setup after install
pnpm approve-builds

# Development server
pnpm dev

# If dev server issues, run in background
pnpm dev > /tmp/astro-dev.log 2>&1 &

# Production build
pnpm build

# Debug build issues
pnpm build 2>&1 | tee build_output.log

# Preview production build
pnpm preview

# Export slides to PDF
pnpm export-pdf

# Git LFS (for large files)
git lfs install
git lfs pull

# Initialize content submodule
git submodule update --init --recursive
```

**Note:** No lint/typecheck commands currently configured. When requested by users, suggest adding to package.json.

## High-Level Architecture

### Content Management System
The content architecture supports multiple deployment contexts through environment-based path resolution:

```
DEPLOY_ENV determines content location:
- LocalSiteOnly: /src/generated-content (default)
- LocalMonorepo: ../content (for monorepo development)
- Vercel: /src/generated-content
- Railway: /lossless-monorepo/content
```

### Collections Architecture (content.config.ts)
The site uses Astro's content collections with custom loaders:
- **essays, concepts, vocabulary** - Knowledge base content
- **tooling, vertical-toolkits** - Tool documentation
- **slides** - Reveal.js presentations
- **projects** - Project showcases with JSON Canvas support
- **client-content** - Client-specific recommendations and portfolios
- **lost-in-public/** - Public content (blueprints, prompts, explorations)

### Markdown Processing Pipeline
The site implements a sophisticated multi-stage processing system:

1. **Remark Stage** (Markdown AST)
   - Custom directives (:::figma, :::projects)
   - Obsidian-style backlinks [[Internal Links]]
   - Callout blocks (> [!info], > [!warning])
   - YouTube auto-embeds from plain URLs

2. **Rehype Stage** (HTML AST)
   - Mermaid diagram rendering
   - Auto-linked headers with IDs
   - Raw HTML processing
   - Syntax highlighting via Shiki singleton

3. **Component Integration**
   - MDX support for embedding Astro/Svelte components
   - Custom code block types (imageGallery, toolingGallery)
   - JSON Canvas rendering for interactive diagrams

### Component Architecture

```
/src/components/
├── basics/          # Core UI components
├── tool-components/ # Tool-specific components
├── *.astro         # Server-rendered components
└── *.svelte        # Client-side interactive components

/src/layouts/
├── Layout.astro              # Base layout wrapper
├── OneArticle.astro          # Article with sidebar
├── MarkdownSlideDeck.astro   # Reveal.js presentations
└── Section__JSONCanvasLayout.astro  # Canvas visualizations
```

### Routing Strategy
- File-based routing via `/src/pages/`
- Dynamic catch-all route `[...path].astro` handles content collections
- Client-specific routing through MOC (Map of Contents) system

## Environment Configuration

Create `.env` from `example.env`:
```bash
NODE_ENV=development
APP_ENV=development
DEPLOY_ENV=LocalSiteOnly

# Debug flags
SHOW_DEBUG_MARKDOWN_AST=true
DEBUG_CITATIONS=true
DEBUG_BACKLINKS=true
DEBUG_TOC=true

# API Keys (optional)
PLUNK_API_KEY=your_key_here
```

## Key Implementation Patterns

### When Adding Features
1. Check existing patterns in similar components
2. Use TypeScript for new components with proper interfaces
3. Follow Astro conventions (no React/JSX patterns)
4. Leverage existing utilities before creating new ones

### Working with Collections
1. Collections defined in `content.config.ts`
2. Content paths resolved via `envUtils.js` based on DEPLOY_ENV
3. Use glob loaders with proper base paths
4. Schemas are permissive (.passthrough()) to handle varied frontmatter

### Custom Markdown Extensions
- Directives: `:::<name>` with YAML-style attributes
- Backlinks: `[[path/to/file]]` Obsidian-compatible
- Callouts: `> [!type]` GitHub-style with custom styling
- Code blocks: Support custom languages for galleries

### Styling Guidelines
- Use Tailwind classes inline during development
- Global styles in `/src/styles/global.css`
- Theme variables in `lossless-theme.css`
- Avoid custom CSS unless absolutely necessary

## Common Issues & Solutions

### Content Not Found
```bash
# Check DEPLOY_ENV setting
cat .env | grep DEPLOY_ENV

# Initialize submodules
git submodule update --init --recursive

# Verify content path
ls -la src/generated-content/
```

### Dev Server Issues
```bash
# Run in background and check logs
pnpm dev > /tmp/astro-dev.log 2>&1 &
tail -f /tmp/astro-dev.log
```

### Build Failures
```bash
# Capture full output
pnpm build 2>&1 | tee build_output.log

# Common fixes:
# 1. Clear node_modules and reinstall
rm -rf node_modules && pnpm install

# 2. Check for Git LFS issues
git lfs pull

# 3. Verify environment variables
```

### Shiki Language Warnings
Expected warnings for custom code block types:
- `imageGallery`
- `toolingGallery`
- `litegal`

These are handled by custom rendering, not Shiki.

## Project-Specific Context

### "Vibe Coded" Nature
- AI-assisted development with non-standard patterns
- Prioritize functionality over convention
- Expect creative solutions and workarounds
- Test thoroughly as no automated test suite exists

### Monorepo Considerations
- Site lives in `/site/` directory
- Content managed as separate git submodule
- Path resolution adapts to deployment context
- Use relative imports within site directory

### Performance Optimizations
- Images served via ImageKit CDN when configured
- Static generation for all pages
- Islands architecture for selective hydration
- Lazy loading for heavy components

## Critical Paths and Files

### Configuration
- `astro.config.mjs` - Core Astro setup
- `content.config.ts` - Collection definitions
- `src/utils/envUtils.js` - Environment resolution
- `tailwind.config.js` - Tailwind setup

### Key Components
- `src/layouts/OneArticle.astro` - Main article layout
- `src/components/JSONCanvas*.svelte` - Canvas rendering
- `src/pages/[...path].astro` - Dynamic routing

### Markdown Processing
- Layout-level processing (not global)
- Custom remark/rehype plugins per layout
- Debug output in `/debug/` when enabled

## Notes for AI Assistants

1. **Always use pnpm** - npm/yarn will cause dependency issues
2. **Check git status** - User may have uncommitted changes
3. **Verify DEPLOY_ENV** - Affects content path resolution
4. **Test incrementally** - No automated tests means manual verification
5. **Preserve functionality** - Even if code seems unusual
6. **Ask about intent** - "Vibe coded" nature means understanding goals is crucial

When users report issues, check in order:
1. Environment variables (.env file)
2. Git submodules (content availability)
3. Dev server logs (if running in background)
4. Build output (pipe to file for long outputs)
5. Browser console (for client-side errors)