<a href="https://lossless.group"><img src="https://i.imgur.com/jrZBIAb.png" alt="The Lossless Group"></a>

> Version 0.0.0.93 pushed to GitHub on 2025-08-04

# Basics

This Astro Static Site has been painstakingly developed and iterated to support complex, interactive, and dynamic content for market research, technical documentation, and thought leadership.  

## Features
- Responsive Layout
- CSS themes, mode, and Tailwind CSS theme.
- Extensible Collections
    - Collections with multiple paths
- [Extended Markdown Render Pipeline](#custom-markdown-extensions)
    - New: Direcives with syntax
    ```markdown
    :::<directive-name> 
       - `[[backlink/path/to/file]]`
    :::
    ``` 
    - New: Figma embeds
    ```markdown
    :::figma url="https://www.figma.com/file/..." />
    ```
    - Smart YouTube Link Rendering
- Standard Components
    - Logo Scroller
    - Hero Banner
    - Cards with Open Graph image handling, rendering from YAML Frontmatter.
    - Interactive Tags
        - Filtered Lists
- JSON Canvas (for client-side interactivity) according to the [JSON Canvas Specification](https://jsoncanvas.com/)
- Environment-based Content Delivery
- Header
- Footer
- Feature Image with Side Text
- AST Debugger

## Stack:
This is an Astro project, with robust support for Markdown, Extended Markdown, MDX, and Markdown+YAML frontmatter.
<a href="https://astro.build"><img src="https://astro.build/assets/press/astro-logo-light-gradient.svg" alt="Astro"></a>

### Dependencies:
A preference for `pnpm` over `npm` or `yarn`.
- [Shiki](https://shiki.style/) for syntax highlighting.
- [Reveal.js](https://revealjs.com) for presentations.
- [Mermaid](https://mermaid-js.github.io/mermaid) for diagrams.
- [Starwind](https://starwind.dev/) for basic component starters.
- [Tailwind CSS](https://tailwindcss.com) for inline styling, usually in the development phase.
- [Svelte](https://svelte.dev) for client-side interactivity.
- [MDX](https://mdxjs.com) for Markdown+JSX for component heavy content.

# Getting Started

## Prerequisites

```bash
brew install git-lfs
```

```bash
pnpm install --save-dev
```

```bash
pnpm approve-builds
```

```bash
pnpm build
```

```bash
pnpm dev
```

## Environment Variables
Copy the example.env text file and rename it to .env. Fill in the values for the environment variables.
```shellscript
NODE_ENV=development
APP_ENV=development

DEPLOY_ENV=LocalSiteOnly
```

## Running the Development Server

The development server can be started with:
```bash
pnpm dev
```

**Note:** If the server doesn't start or isn't accessible, you may need to run it in the background:
```bash
pnpm dev > /tmp/astro-dev.log 2>&1 &
```
This runs the server in the background and redirects output to a log file. The server will be available at `http://localhost:4321/` after a few seconds.

## Deployment Context

Lossless has one deployment on Vercel, which uses only the astro project as the root directory, and the content is in the 'generated_content' directory in `src` as a git submodule.

The team that also manages the content uses the lossless-monorepo, which has the astro project as the 'site' submodule. The content is then in the 'content' submodule.

The DEPLOY_ENV setting is used to determine the content location, and runs on a conditional swtich statement in the `astro.config.mjs` file.

## Inspect Build Output with tee

Because we've worked through so many issues, the build output is comically long. Yet, it can be very helpful for troubleshooting. So, we just pipe the output to a log file where we can search and find the parts of interest. 

```bash
pnpm build 2>&1 | tee build_output.log
```

# Stack Rationale

## Why Astro
Astro is the most beloved "Static Site Generator" with considerable support for Markdown, MDX, and Markdown+YAML frontmatter.

<a href="https://astro.build"><img src="https://astro.build/assets/press/astro-logo-light-gradient.svg" alt="Astro"></a>

Astro also sports an "Islands Architecture" that enables different functionality to be written in different languages and frameworks, as well as ways to "pass state" between them.

Bookmark [Astro documentation](https://docs.astro.build). To troubleshoot, go to the [Discord server](https://astro.build/chat).

# Lossless Nuances:

## Content Location:

The content is in the 'generated_content' directory in `src` as a git submodule.

The team that also manages the content uses the [lossless-monorepo](https://github.com/lossless-group/lossless-monorepo), which has the astro project as the 'site' submodule. The content is then developed from the 'content' submodule.  Settings in the .env file are used to determine the content location. The logic is in  the `content.config.ts` and `astro.config.ts` files.

If you want to experience content development the Lossless way, download [Obsidian](https://obsidian.md) and use the `content` directory in the monorepo, which is a git submodule pointing to [lossless-content](https://github.com/lossless-group/lossless-content).

Once you have the content submodule cloned, use symbolic links to point from the content submodule directories into the Obsidian vault directory.

## Image Handling:
While Astro is supposed to handle images extremely well, I find that sometimes there are just "dud rendering" issues that are not immediately apparent. As a result, I have a preference for using image APIs, I'm using [ImageKit](https://imagekit.io) for this.

## Markdown Render Pipeline:

The site uses a sophisticated multi-stage Markdown processing pipeline that transforms raw Markdown content into rich, interactive web components. This pipeline handles everything from basic formatting to complex custom components and syntax highlighting.

### Pipeline Architecture

The processing flow follows this sequence:
1. **Raw Markdown** → **Remark Plugins** → **Rehype Plugins** → **Custom Components** → **Final HTML**

### Core Dependencies
- **[remark-gfm](https://github.com/remarkjs/remark-gfm)** - GitHub Flavored Markdown support
- **[Shiki](https://shiki.style/)** - Advanced syntax highlighting with custom themes
- **[KaTeX](https://katex.org/)** - Mathematical notation rendering
- **[Mermaid](https://mermaid-js.github.io/mermaid)** - Diagram and flowchart generation

### Remark Plugins (Markdown AST Processing)
Located in `/src/utils/remark/`:
- **remark-mermaid** - Converts Mermaid code blocks to diagram component
- **remark-container** - Custom container blocks (callouts, info boxes)
- **remark-directive** - Custom container blocks (custom components)
- **remark-backlinks** - Generates bidirectional content linking
- **remark-toc** - Auto-generates table of contents from headers

### Rehype Plugins (HTML AST Processing)  
Located in `/src/utils/rehype/`:
- **rehype-autolink-headings** - Adds shareable anchor links to headers
- **rehype-slug** - Generates URL-friendly header IDs
- **rehype-external-links** - Processes external link handling

### Custom Processing Features
- **YouTube Auto-embeds** - Converts YouTube URLs to embedded players
- **Code Block Enhancement** - Custom syntax highlighting with copy buttons
- **Image Processing** - External image optimization via ImageKit API
- **Frontmatter Integration** - YAML metadata processing for pages and collections
- **Obsidian friendly** - We develop content with Obsidian, and keep the content in a git submodule. It's public, check it out at https://github.com/lossless-group/lossless-content

### Syntax Highlighting
Uses Shiki with custom themes supporting:
- 15+ programming languages
- Custom code block types (`imageGallery`, `toolingGallery`, `litegal`)
- Dark mode optimized color schemes
- Line highlighting and annotations

### Debug Configuration
Enable debugging in `.env`:
```bash
SHOW_DEBUG_MARKDOWN_AST=true  # Outputs processing AST to /debug/
DEBUG_CITATIONS=true          # Debug citation processing  
DEBUG_BACKLINKS=true          # Debug backlink generation
DEBUG_TOC=true               # Debug table of contents
```

### Custom Markdown Extensions
The pipeline supports several non-standard Markdown syntaxes:
- **Obsidian-style backlinks** - `[[Internal Links]]`
- **Custom callouts** - `> [!info]`, `> [!warning]`, etc.
- **Image galleries** - Special code block syntax for multi-image displays
- **Embedded components** - MDX-style component integration 

We have working:
- [x] **Codeblocks**
- [x] **Tables**
- [x] **Backlinks**
- [x] **iFrames with HTML and CSS** (mainly used for embedding videos)
- [x] **Autogenerated YouTube embeds** from YouTube links in the markdown. 
- [x] **Callouts** (basic).
- [x] **Directives** (basic).
    - [x] **Figma Embeds** via Figma Embed Kit. (requires API key in .env)
- [x] **Footnotes** (one set per page)
- [x] **Image Embeds** (external, using an image href) (basic, no styling or sizing)
- [x] **Image Galleries** (basic, no styling or sizing)
- [x] **Mermaid Diagrams**
- [x] **Table of Contents** (basic, having trouble with nested headers and ordered lists)
- [x] **Info Sidebar** (renders Author avatar component, a special "augmented with" component that can display AI//LLM trademarks, as well as semantic version, date created, date modified, and tags)
- [x] **Autogenerated Header Links** (allows for sharing to specific headers in any document)
- [x] **Banner and Portrait images** in frontmatter rendered as custom opengraph images per markdown file.  

#### TODO for Extended Markdown:
- [ ] Callouts (advanced, using Syntax of the Callout class box to route to different components for different use cases and styles)
- [ ] Callouts that contain all the functionality of our general Markdown rendering, especially self-containing their own footnotes. 
- [ ] Callouts that feed the Table of Contents with their headers.
- [ ] Image Embeds (advanced Styling)
- [ ] Internal Image Embeds (using a relative path to the image in the visualsCollection)


## JSON Canvas

Our JSON Canvas implementation provides interactive project visualization and specification overviews. The system renders `.canvas` files according to the [JSON Canvas Specification](https://jsoncanvas.com/) with enhanced features for content integration.

**Key Components:**
- `JSONCanvasIsland.astro` - Server-side canvas file processing and coordinate transformation
- `JSONCanvasRenderer.svelte` - Client-side interactive canvas rendering with pan/zoom
- `JSONCanvasFile.svelte` - Individual canvas file node rendering with markdown support
- `ProjectShowcase.astro` - Project container that integrates canvas with metadata

**Features:**
- Automatic coordinate transformation and viewport optimization
- Markdown file node content rendering with full pipeline support
- Interactive pan/zoom navigation with mouse and touch support
- Client-specific project routing via MOC (Map of Contents) system
- Canvas path resolution relative to content base directory

**Usage:**
Canvas files are integrated into projects via the MOC system using syntax like:
```markdown
:::projects
- [[projects/Project-Name/Specs/canvas-file.canvas|Project Display Name]]
:::
```


## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `pnpm install`            | Installs dependencies                            |
| `pnpm approve-builds`     | Approves a few packages that need additional approval. This is a one-time operation. |
| `pnpm run dev`            | Starts local dev server at `localhost:4321`      |
| `pnpm run dev > /tmp/astro-dev.log 2>&1 &` | Starts dev server in background (if having issues) |
| `pnpm run build`          | Build your production site to `./dist/`          |
| `pnpm run preview`        | Preview your build locally, before deploying     |
| `pnpm run astro ...`      | Run CLI commands like `astro add`, `astro check` |
| `pnpm run astro -- --help` | Get help using the Astro CLI                    |

# Welcome to any contributors, especially the Obsidian community:
We've gone through months of pain so hopefully others don't have to.  Obsidian Publish is cool, but limited. 

If you want to power a content rich site, with professional-grade content development and management, please join us. [The Lossless Group](https://lossless.group) isn't really a company so much as a few innovators hitting their head against the wall in the same direction.  Our goal is to help as many people as possible develop winning formulae for the age of AI. 

We've worked through most of the initial headaches in taking Obsidian extended Markdown and the bananas experience of trying to streamline YAML frontmatter so as to not throw errors across thousands of content files. 

# Warnings

### Vibe Code Warning:

Much of the code is "Vibe Coded" (usually with Windsurf using Claude, though at times we poke around with other tools). The code would likely never meet production grade standard.  

### Non-Refactored YOLO Mode:

Given we've just been trying to make things work, we've been in "YOLO Mode" and haven't been refactoring much of the code. You'll have to use your best judgement in to understand what's important and what's not. Or do a Vibe Code audit, it should be able to tell you.  

# Reach Out, we'd love to hear from you.
https://x.com/losslessgroup

<a href="https://lossless.group"><img src="https://i.imgur.com/jjBNAla.png" alt="The Lossless Group"></a>


