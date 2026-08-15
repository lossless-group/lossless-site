# Graph Report - .  (2026-08-03)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 2281 nodes · 2334 edges · 1147 communities (1121 shown, 26 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 53 edges (avg confidence: 0.74)
- Token cost: 593,567 input · 17,766 output

## Graph Freshness
- Built from commit: `7e602013`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Markdown Processing Pipeline
- Participant & Avatar Components
- Preview Cards & Word Count
- Article List & Post Cards
- Content Collections Config
- Augment-It Project Specs
- Markdown AST Debugging
- Tool Cards & Tracking
- Slide Deck Rendering
- Site Header & Navigation
- Page Layout & Reveal Slides
- Tooling Gallery & Tags
- Timeline & Date Utilities
- Tag Filter Components
- Remark & Shiki Rendering
- JSON Canvas Parsing
- Content Navigation Sidebar
- Hero & Showcase Sections
- Footer & CTA Buttons
- Environment Config Resolution
- Mermaid & Canvas File Nodes
- Table of Contents & Routes
- LLMs.txt Generation
- Content Nav Story Variants
- Organizations & Sources Pages
- Content Slug Routing
- Splash Pages & OG Metadata
- Client & About Page Components
- Article Callouts & Citations
- Backlink Parsing
- Client & Project Cards
- Astro Slides Embedding
- Client Essay Routing
- Trademark Ribbon Components
- Route Manager & Mappings
- Client Portal Layout
- Module Path Aliases
- Card & Collection Routing
- Mobile Table of Contents
- Image Gallery Grid
- Portfolio Cards & Layout
- Backlink Utilities
- Card Row Slider
- Feature Side Image
- Three Column Frame Layout
- MDX Components
- YouTube Embed
- Guide Index Layout
- Markdown Preview
- Magazine Article Grid
- Newsletter Subscription
- YouTube Shorts Embed
- Route Mappings API
- Explorations Index
- Word Count Utilities
- Icon Header Message
- Simplified Trademark Ribbon
- OpenGraph Data Fetching
- Canvas Modal Buttons
- Environment Type Definitions
- OG Image Generation
- Weekly View
- Route Manager Page
- Contrasting Trademark Ribbons
- Glassmorphic Hero
- Sidebar Tree Navigation
- Essay Reading Routes
- Italian Language Page
- Citation MDAST Types
- Codeblock Remark Types
- OpenGraph Embed Processing
- YAML Frontmatter Utilities
- Collection List Scroll
- Icon Header Message Cards
- Tool Showcase Carousel
- Tool Showcase Small Item
- Client Project Routing
- Client Thread Magazine
- Issue Resolution Index
- Log Entry Routing
- Organizations Slug Routing
- Sources Slug Routing
- Thread Magazine Pages
- Tools Page
- Vibe-With Collection Routing
- Callout MDAST Types
- Backlink MDAST Types
- Wiki Image MDAST Types
- Callout Handler Types
- Tube Container Components
- Card Collection Config
- 404 Page
- Catch-All Path Routing
- HAST HTML Types
- Rehype Stringify Types
- Route Path Constants
- Server Actions
- Tube Box SVG Asset
- Compare Card Styling
- Workflow Steps Component
- HAST Root Types
- Frontmatter Corruption Patterns

## God Nodes (most connected - your core abstractions)
1. `getReferenceSlug()` - 54 edges
2. `slugify()` - 39 edges
3. `processEntries()` - 33 edges
4. `toProperCase()` - 26 edges
5. `[]` - 25 edges
6. `[]` - 22 edges
7. `transformContentPathToRoute()` - 18 edges
8. `[]` - 17 edges
9. `[]` - 16 edges
10. `[]` - 15 edges

## Surprising Connections (you probably didn't know these)
- `generateToolkitPath()` --calls--> `getReferenceSlug()`  [EXTRACTED]
  src/components/tool-components/ToolCard.astro → src/utils/slugify.ts
- `getStaticPaths()` --calls--> `processEntries()`  [EXTRACTED]
  src/pages/client/[client]/projects/[...slug].astro → src/utils/slugify.ts
- `getStaticPaths()` --calls--> `processEntries()`  [EXTRACTED]
  src/pages/client/[client]/thread/[magazine].astro → src/utils/slugify.ts
- `getStaticPaths()` --calls--> `processEntries()`  [EXTRACTED]
  src/pages/log/[slug].astro → src/utils/slugify.ts
- `getFallbackTitle()` --calls--> `toProperCase()`  [EXTRACTED]
  src/pages/more-about/index.astro → src/utils/slugify.ts

## Import Cycles
- None detected.

## Communities (1147 total, 26 thin omitted)

### Community 0 - "Markdown Processing Pipeline"
Cohesion: 0.06
Nodes (35): ./AstroMarkdownNew.astro, targetSlug, calloutMatch, firstParagraph, firstText, hasImage, hasOnlyText, [] (+27 more)

### Community 1 - "Participant & Avatar Components"
Cohesion: 0.07
Nodes (16): matchedParticipants, participantsData, participantsFilePath, participantsList, searchInput, avatar, avatarFallback, avatarImage (+8 more)

### Community 2 - "Preview Cards & Word Count"
Cohesion: 0.06
Nodes (23): renderedGridItems, searchInput, processedConcepts, processedVocab, processedEntries, validEntries, getFallbackTitle(), processedConcepts (+15 more)

### Community 3 - "Article List & Post Cards"
Cohesion: 0.07
Nodes (14): collectionNames, entriesByCollection, [], authorsList, matchedAuthors, peopleDir, displayTags, normalCase (+6 more)

### Community 4 - "Content Collections Config"
Cohesion: 0.05
Nodes (34): blueprintsCollection, cardCollection, changelogCodeCollection, changelogContentCollection, changelogLaerdalCollection, clientPagesCollection, clientPortfoliosCollection, clientRecommendationsCollection (+26 more)

### Community 5 - "Augment-It Project Specs"
Cohesion: 0.07
Nodes (21): @generated/projects/Augment-It/Specs/apps-microfrontends/HighlightCollector.md?raw, @generated/projects/Augment-It/Specs/apps-microfrontends/PromptTemplateManager.md?raw, @generated/projects/Augment-It/Specs/apps-microfrontends/RecordCollector.md?raw, @generated/projects/Augment-It/Specs/apps-microfrontends/RequestReviewer.md?raw, @generated/projects/Augment-It/Specs/Data Augmentation Workflow with Microfrontends.md?raw, @generated/projects/Augment-It/Specs/shared-services/apiConnectorService.md?raw, data, data (+13 more)

### Community 6 - "Markdown AST Debugging"
Cohesion: 0.10
Nodes (6): AstDebugger, MarkdownDebugger, MarkdownDebugger, Code, MdxJsxAttribute, MdxJsxFlowElement

### Community 7 - "Tool Cards & Tracking"
Cohesion: 0.07
Nodes (17): toolsWithImages, toolsWithoutImages, allTags, tagFrequencies, tools, TRADEMARK_CONFIG, string, effectiveSiteName (+9 more)

### Community 8 - "Slide Deck Rendering"
Cohesion: 0.08
Nodes (16): revealOptions, slides, frontmatter, promptData, promptEntry, revealOptions, revealOptionsJson, config (+8 more)

### Community 9 - "Site Header & Navigation"
Cohesion: 0.12
Nodes (12): navLinks, socialIcons, @config/project-gallery.json, GalleryConfig, transformCoordinates(), findProjectBySlug(), GalleryConfig, generateStaticPaths() (+4 more)

### Community 10 - "Page Layout & Reveal Slides"
Cohesion: 0.11
Nodes (10): isToolkitPage, autoSlide, revealOptions, url, prerender, frontmatter, ./heavy-module.js, frontmatter (+2 more)

### Community 11 - "Tooling Gallery & Tags"
Cohesion: 0.11
Nodes (13): generateToolkitPath(), frontmatter, tagCounts, tools, getActualFilename(), loadToolsFromMoc(), loadToolsFromMocToolingGallery(), parseMocContent() (+5 more)

### Community 12 - "Timeline & Date Utilities"
Cohesion: 0.13
Nodes (19): [], collections, detailHref(), getTitle(), originalFilename(), originalFolder(), parseDate(), prerender (+11 more)

### Community 13 - "Tag Filter Components"
Cohesion: 0.10
Nodes (9): allTags, allTools, filterData, processedTools, url, urlTags, active, allTools (+1 more)

### Community 14 - "Remark & Shiki Rendering"
Cohesion: 0.15
Nodes (13): visit(), Code, escapeHtml(), Html, remarkJsonCanvasCodeblocks(), CUSTOM_DIRECTIVE_LANGUAGES, getLanguageForHighlighting(), getLanguageRoutingStrategy() (+5 more)

### Community 15 - "JSON Canvas Parsing"
Cohesion: 0.16
Nodes (18): BaseCanvasNode, CanvasColor, CanvasDimensions, CanvasEdge, CanvasNode, FileNode, GroupNode, JSONCanvas (+10 more)

### Community 16 - "Content Navigation Sidebar"
Cohesion: 0.10
Nodes (3): pageContent, frontmatter, mocsList

### Community 17 - "Hero & Showcase Sections"
Cohesion: 0.13
Nodes (10): containerClasses, hasImage, frontmatter, frontmatter, allEntries, articles, collectionConfig, initAnimations() (+2 more)

### Community 18 - "Footer & CTA Buttons"
Cohesion: 0.11
Nodes (11): onClick, fullPath, fullPath, processedFeatures, frontmatter, prerender, prerender, prerender (+3 more)

### Community 19 - "Environment Config Resolution"
Cohesion: 0.10
Nodes (16): getStaticPaths(), APP_ENV, contentBasePath, DEBUG_ARTICLE, DEBUG_CITATIONS, DEBUG_OG, DEBUG_TOC, DEPLOY_ENV (+8 more)

### Community 20 - "Mermaid & Canvas File Nodes"
Cohesion: 0.12
Nodes (5): ../../assets/Icons/arrows-maximize.svg?raw, ../../assets/Icons/arrows-minimize.svg?raw, ../../assets/Icons/frontmatter-indicator.svg?raw, convertFilePathToSiteUrl(), handleOpenInNewTab()

### Community 21 - "Table of Contents & Routes"
Cohesion: 0.19
Nodes (9): traverse(), COLLECTION_ROUTES, CollectionKey, getStaticPaths(), getStaticPaths(), getStaticPaths(), BaseCollectionEntry, extractAllText() (+1 more)

### Community 22 - "LLMs.txt Generation"
Cohesion: 0.16
Nodes (16): GET(), isPublished(), titleOrId(), GET(), isPublished(), linkLine(), sectionLines(), sortByTitle() (+8 more)

### Community 23 - "Content Nav Story Variants"
Cohesion: 0.11
Nodes (5): demoSteps, steps, steps, steps, pathToUrl()

### Community 24 - "Organizations & Sources Pages"
Cohesion: 0.14
Nodes (12): folders, getDisplayTitle(), processedEntries, tabConfig, folders, getDisplayTitle(), processedEntries, tabConfig (+4 more)

### Community 25 - "Content Slug Routing"
Cohesion: 0.15
Nodes (13): contentData, getStaticPaths(), prerender, contentData, getStaticPaths(), prerender, contentData, getStaticPaths() (+5 more)

### Community 26 - "Splash Pages & OG Metadata"
Cohesion: 0.29
Nodes (7): prerender, cache, decodeEntities(), fetchOgMetadata(), metaRe(), OgMetadata, pickMeta()

### Community 27 - "Client & About Page Components"
Cohesion: 0.16
Nodes (5): advisoryChildren, aiLabsChildren, collaborators, foundations, socialIcons

### Community 28 - "Article Callouts & Citations"
Cohesion: 0.15
Nodes (6): playlistId, siMatch, button, container, scrollArea, DEBUG_AST

### Community 29 - "Backlink Parsing"
Cohesion: 0.19
Nodes (11): [], allContent, baseFilename, frontmatter, loadClientContent(), pathParts, extractBacklinkDisplayTexts(), extractBacklinkPaths() (+3 more)

### Community 30 - "Client & Project Cards"
Cohesion: 0.15
Nodes (5): onClick, frontmatter, presentations, frontmatter, markdownPresentations

### Community 31 - "Astro Slides Embedding"
Cohesion: 0.15
Nodes (8): config, slidesData, normalizedConfig, queryParams, sanitizedPath, slug, embedConfig, testSlides

### Community 32 - "Client Essay Routing"
Cohesion: 0.21
Nodes (9): getStaticPaths(), contentData, getStaticPaths(), contentData, getStaticPaths(), contentData, getStaticPaths(), prerender (+1 more)

### Community 33 - "Trademark Ribbon Components"
Cohesion: 0.27
Nodes (4): svgContent, widthMatch, resolvedPath, svgContent

### Community 34 - "Route Manager & Mappings"
Cohesion: 0.24
Nodes (11): buildDynamicPriorityRoots(), collectAllMappingPaths(), customRouteMappings, defaultRouteMappings, deriveClientFromFilePath(), isValidContentFile(), PRIORITY_CONTENT_PATHS, resolveWithMappings() (+3 more)

### Community 35 - "Client Portal Layout"
Cohesion: 0.25
Nodes (6): clientPortalCards, portfolioReferences, ClientPortalProps, OpenGraphData, ReferenceItem, ReferenceTerms

### Community 36 - "Module Path Aliases"
Cohesion: 0.18
Nodes (10): @assets/*, @basics/*, @components/*, @content/*, @layouts/*, @scripts/*, @styles/*, @tool-components/* (+2 more)

### Community 37 - "Card & Collection Routing"
Cohesion: 0.20
Nodes (3): frontmatter, prerender, frontmatter

### Community 38 - "Mobile Table of Contents"
Cohesion: 0.44
Nodes (9): closeDropdown(), collectHeadings(), constructor(), init(), openDropdown(), setupEventListeners(), toggleDropdown(), updateActiveLink() (+1 more)

### Community 39 - "Image Gallery Grid"
Cohesion: 0.28
Nodes (6): getFilenameWithoutExtension(), resolveAbsoluteSrcPath(), yaml_to_grid_images(), button, container, gallery

### Community 40 - "Portfolio Cards & Layout"
Cohesion: 0.25
Nodes (5): allClientPortfolios, listEntry, portfoliosWithImages, portfoliosWithoutImages, prerender

### Community 41 - "Backlink Utilities"
Cohesion: 0.28
Nodes (5): query, DEBUG_BACKLINKS, backlinkRegex, extractBacklinkPath(), isBacklink()

### Community 42 - "Card Row Slider"
Cohesion: 0.29
Nodes (5): filteredTools, nextButton, prevButton, updateButtonVisibility(), updateSlider()

### Community 43 - "Feature Side Image"
Cohesion: 0.25
Nodes (5): isMasked, isPlaceholder, uniqueId, frontmatter, placeholderImage

### Community 45 - "MDX Components"
Cohesion: 0.25
Nodes (3): components, id, text

### Community 46 - "YouTube Embed"
Cohesion: 0.25
Nodes (7): embedMatch, isShorts, shortsMatch, siMatch, videoId, vMatch, watchMatch

### Community 47 - "Guide Index Layout"
Cohesion: 0.25
Nodes (4): collectionPublishingDefaults, allEntries, articles, collectionConfig

### Community 48 - "Markdown Preview"
Cohesion: 0.25
Nodes (7): allowedPaths, filePath, frontmatter, isAllowedPath, renderedMarkdown, safePath, url

### Community 50 - "Newsletter Subscription"
Cohesion: 0.29
Nodes (4): buttonLoading, buttonText, messageDiv, submitButton

### Community 51 - "YouTube Shorts Embed"
Cohesion: 0.29
Nodes (6): embedMatch, shortsMatch, siMatch, videoId, vMatch, watchMatch

### Community 52 - "Route Mappings API"
Cohesion: 0.48
Nodes (6): GET(), POST(), validateMappingRequest(), addRouteMapping(), getAllRouteMappings(), removeRouteMapping()

### Community 53 - "Explorations Index"
Cohesion: 0.29
Nodes (5): allEntries, articles, bannerImage, collectionConfig, portraitImage

### Community 54 - "Word Count Utilities"
Cohesion: 0.52
Nodes (6): countWords(), extractText(), formatReadingTime(), getReadingStats(), getReadingTime(), getWordCount()

### Community 56 - "Simplified Trademark Ribbon"
Cohesion: 0.33
Nodes (3): componentsDir, trademarks, publishedRawEssays

### Community 57 - "OpenGraph Data Fetching"
Cohesion: 0.33
Nodes (3): OpenGraphProperties, screenshotFetchInProgress, server

### Community 58 - "Canvas Modal Buttons"
Cohesion: 0.33
Nodes (3): mappedButtons, @generated/projects/Augment-It/Specs/Augment-It.canvas?raw, @generated/projects/Context-Vigilance/ACE-It-Canvas.canvas?raw

### Community 59 - "Environment Type Definitions"
Cohesion: 0.40
Nodes (5): ImportMeta, ImportMetaEnv, NodeJS, ProcessEnv, Window

### Community 60 - "OG Image Generation"
Cohesion: 0.47
Nodes (5): GET(), getStaticPaths(), prerender, Props, resolveEntrySlug()

### Community 61 - "Weekly View"
Cohesion: 0.47
Nodes (3): getStartOfWeek(), getWeekKey(), getWeekNumber()

### Community 63 - "Contrasting Trademark Ribbons"
Cohesion: 0.40
Nodes (3): componentsDir, debugInfo, @basics/TrademarkFragment.astro

### Community 66 - "Essay Reading Routes"
Cohesion: 0.40
Nodes (4): toProperCase(), contentData, getStaticPaths(), prerender

### Community 67 - "Italian Language Page"
Cohesion: 0.40
Nodes (4): allEntries, articles, collectionConfig, ROUTE_PATHS

### Community 68 - "Citation MDAST Types"
Cohesion: 0.40
Nodes (4): CitationNode, CitationsNode, mdast, RootContentMap

### Community 69 - "Codeblock Remark Types"
Cohesion: 0.40
Nodes (4): CodeblockInfo, MdxJsxAttribute, MdxJsxFlowElement, @utils/markdown/remark-codeblocks

### Community 70 - "OpenGraph Embed Processing"
Cohesion: 0.60
Nodes (4): getEmbedFromOpenGraphIo(), OEmbedResponse, processFileForEmbeds(), processFilesForEmbeds()

### Community 76 - "Client Project Routing"
Cohesion: 0.50
Nodes (3): contentData, getStaticPaths(), prerender

### Community 77 - "Client Thread Magazine"
Cohesion: 0.50
Nodes (3): frontmatter, getStaticPaths(), prerender

### Community 78 - "Issue Resolution Index"
Cohesion: 0.50
Nodes (3): allEntries, articles, collectionConfig

### Community 79 - "Log Entry Routing"
Cohesion: 0.50
Nodes (3): contentData, getStaticPaths(), prerender

### Community 82 - "Thread Magazine Pages"
Cohesion: 0.50
Nodes (3): frontmatter, getStaticPaths(), prerender

### Community 83 - "Tools Page"
Cohesion: 0.50
Nodes (3): frontmatter, processedTools, TRADEMARK_CONFIG

### Community 84 - "Vibe-With Collection Routing"
Cohesion: 0.50
Nodes (3): contentData, getStaticPaths(), prerender

### Community 85 - "Callout MDAST Types"
Cohesion: 0.50
Nodes (3): CalloutNode, mdast, RootContentMap

### Community 86 - "Backlink MDAST Types"
Cohesion: 0.50
Nodes (3): BacklinkNode, mdast, RootContentMap

### Community 87 - "Wiki Image MDAST Types"
Cohesion: 0.50
Nodes (3): mdast, RootContentMap, WikiImageNode

### Community 88 - "Callout Handler Types"
Cohesion: 0.50
Nodes (3): CalloutData, CalloutHandlerOptions, @utils/markdown/remark-callout-handler

## Knowledge Gaps
- **439 isolated node(s):** `OpenGraphProperties`, `screenshotFetchInProgress`, `server`, `server`, `../../styles/global.css` (+434 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `[]` connect `Backlink Parsing` to `Markdown Processing Pipeline`, `Client Essay Routing`, `Route Manager & Mappings`, `Page Layout & Reveal Slides`, `Content Navigation Sidebar`, `Hero & Showcase Sections`, `Environment Config Resolution`, `Table of Contents & Routes`, `Simplified Trademark Ribbon`, `Content Slug Routing`, `Organizations & Sources Pages`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **Why does `getReferenceSlug()` connect `Client Essay Routing` to `Markdown Processing Pipeline`, `Participant & Avatar Components`, `Preview Cards & Word Count`, `Article List & Post Cards`, `Site Header & Navigation`, `Tooling Gallery & Tags`, `Timeline & Date Utilities`, `Content Navigation Sidebar`, `Mermaid & Canvas File Nodes`, `Table of Contents & Routes`, `LLMs.txt Generation`, `Organizations & Sources Pages`, `Content Slug Routing`, `Backlink Parsing`, `Route Manager & Mappings`, `Client Portal Layout`, `Portfolio Cards & Layout`, `OG Image Generation`, `Client Project Routing`, `Organizations Slug Routing`, `Sources Slug Routing`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **Why does `getLanguageRoutingStrategy()` connect `Remark & Shiki Rendering` to `Article Callouts & Citations`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **What connects `OpenGraphProperties`, `screenshotFetchInProgress`, `server` to the rest of the system?**
  _439 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Markdown Processing Pipeline` be split into smaller, more focused modules?**
  _Cohesion score 0.06455696202531645 - nodes in this community are weakly interconnected._
- **Should `Participant & Avatar Components` be split into smaller, more focused modules?**
  _Cohesion score 0.06845513413506013 - nodes in this community are weakly interconnected._
- **Should `Preview Cards & Word Count` be split into smaller, more focused modules?**
  _Cohesion score 0.06161616161616162 - nodes in this community are weakly interconnected._