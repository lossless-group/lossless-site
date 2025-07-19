# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Astro-based static site in a monorepo structure. The site features advanced Markdown rendering capabilities with custom components and multiple deployment environments.

**Key Context:**
- This is part of the Lossless Group monorepo
- The project is "vibe coded" (AI-assisted development) - expect non-standard patterns
- Heavy use of Markdown extensions and custom components
- Content is managed separately as a git submodule

## Development Commands

```bash
# Install dependencies (use pnpm, not npm)
pnpm install

# Approve builds (needed after install)
pnpm approve-builds

# Start development server
pnpm dev

# If dev server doesn't work or isn't accessible, run in background:
pnpm dev > /tmp/astro-dev.log 2>&1 &

# Build for production
pnpm build

# Build with output log for debugging
pnpm build 2>&1 | tee build_output.log

# Preview production build
pnpm preview

# Export slides to PDF
pnpm export-pdf

# Note: No lint/typecheck scripts are currently configured
# Consider adding them to package.json if needed
```

## Architecture

### Content Management
- Content lives in `/src/content/` as a git submodule
- Use `git submodule update --init --recursive` to initialize content
- Content structure: essays, slides, and various documentation types

### Component Architecture
- **Astro Components** (`/src/components/*.astro`): Server-rendered components
- **Svelte Components** (`/src/components/*.svelte`): Interactive client components
- **Layouts** (`/src/layouts/`): Page templates and content layouts
- **Pages** (`/src/pages/`): Route-based file structure

### Markdown Processing Pipeline
The site uses a sophisticated Markdown processing system:
1. MDX support with custom components
2. Shiki syntax highlighting with custom themes
3. Custom remark/rehype plugins for:
   - Mermaid diagrams
   - Math rendering (KaTeX)
   - Code block enhancements
   - Custom container blocks

### Environment Configuration
Set deployment environment via `.env`:
- `DEPLOY_ENV=LocalSiteOnly` - Site directory only
- `DEPLOY_ENV=LocalMonorepo` - Full monorepo context
- `DEPLOY_ENV=Vercel` - Vercel deployment
- `DEPLOY_ENV=Railway` - Railway deployment

Debug Markdown processing with:
- `SHOW_DEBUG_MARKDOWN_AST=true` - Outputs AST to `/debug/`

### Key Path Aliases
```typescript
@components/* → src/components/*
@layouts/* → src/layouts/*
@pages/* → src/pages/*
@styles/* → src/styles/*
@utils/* → src/utils/*
@content/* → src/content/*
```

## Important Patterns

### Adding New Components
1. Check existing components for naming conventions and patterns
2. Use TypeScript interfaces for props
3. Follow the established file organization (basic components in `/basics/`, tool components in `/tool-components/`)

### Working with Markdown
- Custom components can be imported in MDX files
- Use frontmatter for metadata
- Debug AST issues by enabling `SHOW_DEBUG_MARKDOWN_AST`

### Styling
- TailwindCSS v4 with custom Lossless theme
- Global styles in `/src/styles/global.css`
- Component-specific styles use Tailwind classes
- CSS variables defined in theme for consistent theming

## Testing and Validation

Currently no test suite is configured. When adding tests:
- Consider using Astro's built-in testing capabilities
- Validate Markdown rendering output
- Test component interactions

## Deployment Notes

- Site deploys to Vercel (see `vercel.json` for configuration)
- Static assets in `/public/` are served directly
- Large files use Git LFS
- Environment variables must be set in deployment platform

## Common Issues & Troubleshooting

### Development Server Issues
**Problem:** Server starts but can't be reached at localhost:4321
**Solution:** Run the server in background mode:
```bash
pnpm dev > /tmp/astro-dev.log 2>&1 &
```

### Build Errors
**Problem:** Build output is too long to debug
**Solution:** Pipe to a log file:
```bash
pnpm build 2>&1 | tee build_output.log
```

### Missing Content
**Problem:** Content directory is empty or missing
**Solution:** Initialize git submodules:
```bash
git submodule update --init --recursive
```

### Shiki Language Warnings
**Note:** Warnings about missing languages like "imageGallery", "toolingGallery", "litegal" are expected - these are custom code block types.

## Project-Specific Gotchas

1. **Always use pnpm** - npm or yarn will cause issues
2. **Content is a git submodule** - Remember to pull/update it separately
3. **Custom Markdown syntax** - Many non-standard Markdown extensions are used
4. **Environment-specific paths** - Content location changes based on DEPLOY_ENV
5. **Vibe coded** - Code may not follow standard patterns, prioritize functionality
6. **No test suite** - Be extra careful with changes, manually test thoroughly

## Debugging Tips

### Enable Debug Output
Add to `.env` file:
```
SHOW_DEBUG_MARKDOWN_AST=true  # Shows Markdown AST in /debug/
DEBUG_CITATIONS=true          # Debug citation processing
DEBUG_BACKLINKS=true          # Debug backlink generation
DEBUG_TOC=true               # Debug table of contents
```

### Check Server Logs
When running in background:
```bash
tail -f /tmp/astro-dev.log
```

### Component Debugging
- Check browser console for client-side errors
- Use Astro's built-in error overlay in dev mode
- Component props are often logged to console in development

## Code Style Guidelines

1. **Prefer editing over creating** - Always edit existing files when possible
2. **No unnecessary comments** - Keep code clean unless comments are essential
3. **Follow existing patterns** - Even if non-standard, maintain consistency
4. **TypeScript for new code** - Use TypeScript interfaces for component props
5. **Tailwind for styling** - Use Tailwind classes, avoid custom CSS

## Frequently Needed Paths

### Key Directories
- Components: `/src/components/` (`.astro` and `.svelte` files)
- Layouts: `/src/layouts/`
- Pages: `/src/pages/`
- Content: `/src/content/` (git submodule)
- Styles: `/src/styles/`
- Utils: `/src/utils/`
- Public assets: `/public/`
- Markdown plugins: `/src/utils/remark/` and `/src/utils/rehype/`

### Important Config Files
- `astro.config.mjs` - Main Astro configuration
- `tailwind.config.cjs` - Tailwind configuration
- `tsconfig.json` - TypeScript configuration
- `.env` - Environment variables (create from example.env)
- `vercel.json` - Vercel deployment config

## Working with the Monorepo

This site is part of a larger monorepo. Key relationships:
- Site location: `/site/` directory in monorepo
- Content submodule: Points to separate content repository
- Deployment contexts affect content path resolution

## Notes for Future Claude Instances

1. **Read error messages carefully** - Astro errors are usually descriptive
2. **Check git status** - User may have uncommitted changes affecting behavior
3. **Test incrementally** - Make small changes and test frequently
4. **Ask about intent** - The "vibe coded" nature means understanding goal is crucial
5. **Preserve existing functionality** - Even if code seems non-standard

## Claude Code Specific Tips

### First Time Setup
1. Check if `.env` file exists (create from `example.env` if not)
2. Run `pnpm install` followed by `pnpm approve-builds`
3. Initialize git submodules for content: `git submodule update --init --recursive`
4. Try `pnpm dev` first, use background mode if it fails

### Common User Transitions
- Users coming from **Windsurf**: Expect similar AI-assisted workflow but with better file navigation
- Users new to **pnpm**: Always use pnpm, never npm or yarn
- Users new to **Astro**: It's like Next.js but focused on static sites with islands architecture

### Project Peculiarities
- **"Vibe Coded"**: This codebase was largely AI-generated, expect unconventional patterns
- **Markdown Heavy**: Complex Markdown processing is core to this project
- **Monorepo Structure**: Be aware of the larger repository context
- **Git LFS**: Large files are stored separately, may need `git lfs pull`

### When User Says...
- "It's not working" → Check dev server, .env file, and git submodules
- "Can't see content" → Verify content submodule is initialized
- "Build fails" → Pipe to log file and look for specific errors
- "From Windsurf" → They're familiar with AI coding but may need orientation to Claude Code's features