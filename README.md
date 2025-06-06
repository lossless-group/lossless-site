# Basics

## Stack:
- [Shiki](https://shiki.style/) for syntax highlighting.

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

# BEFORE PROCEEDING

```bash
brew install git-lfs
```

## Environment Variables
Copy the example.env text file and rename it to .env. Fill in the values for the environment variables.
```shellscript
NODE_ENV=development
APP_ENV=development

DEPLOY_ENV=LocalSiteOnly
```
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

## Markdown Handling:

There are any number of libraries and plugins that allow Astro to "extend" Markdown and support various kinds of Markdown syntax, rendered as either HMTL or custom components.  Honestly, we're still figuring all this out, and it's been quite the rabbit hole of yak shaving.

At the moment, we're using [remark-gfm](https://github.com/remarkjs/remark-gfm) for GitHub Flavored Markdown, and [remark-mermaid](https://github.com/mermaid-js/mermaid) for Mermaid diagrams. 

We have working:
- Codeblocks
- Tables
- Backlinks
- iFrames with HTML and CSS (mainly used for embedding videos)
- Callouts (basic).
- Footnotes (one set per page)
- Image Embeds (external, using an image href) (basic, no styling or sizing)
- Image Galleries (basic, no styling or sizing)
- Mermaid Diagrams
- Table of Contents (basic, having trouble with nested headers and ordered lists)

#### TODO for Extended Markdown:
- Callouts (advanced, using Syntax of the Callout class box to route to different components for different use cases and styles)
- Callouts that contain all the functionality of our general Markdown rendering, especially self-containing their own footnotes. 
- Image Embeds (advanced Styling)
- Internal Image Embeds (using a relative path to the image in the visualsCollection)


## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `pnpm install`            | Installs dependencies                            |
| `pnpm approve-builds`     | Approves a few packages that need additional approval. This is a one-time operation. |
| `pnpm run dev`            | Starts local dev server at `localhost:4321`      |
| `pnpm run build`          | Build your production site to `./dist/`          |
| `pnpm run preview`        | Preview your build locally, before deploying     |
| `pnpm run astro ...`      | Run CLI commands like `astro add`, `astro check` |
| `pnpm run astro -- --help` | Get help using the Astro CLI                    |

## 👀 Want to learn more?


