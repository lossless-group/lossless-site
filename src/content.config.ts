import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { join } from 'node:path';
import { pathToFileURL } from 'url';

// Import environment utilities
import { contentBasePath } from './utils/envUtils.js';



// Function to resolve content paths based on environment
function resolveContentPath(relativePath: string): string {
  // If already within generated-content, return as-is
  if (relativePath.startsWith('./src/generated-content')) {
    return relativePath;
  }

  const absolutePath = join(contentBasePath, relativePath);

  // Convert to file:// URL
  return pathToFileURL(absolutePath).href;
}

// Cards collection - respects JSON structure with cards array
const cardCollection = defineCollection({
  type: 'data',
  schema: z.object({
    cards: z.array(z.any())
  }).passthrough()
});

const slidesCollection = defineCollection({
    loader: glob({pattern: "**/*.md", base: resolveContentPath("slides")}),
    schema: z.object({
      title: z.string().optional(),
      lede: z.string().optional(),
      slug: z.string().optional(),
      date_created: z.date().optional(),
      date_modified: z.date().optional(),
      authors: z.array(z.string()).optional(),
      for_client: z.string().optional(),
      for_persons: z.array(z.string()).optional(),
      password: z.string().optional(),
      tags: z.array(z.string()).optional(),
      theme: z.string().default('default').optional(),
      layout: z.string().default('default').optional(),
      status: z.string().default('draft').optional(),
      published: z.boolean().default(true).optional(),
      // Additional fields
    }).passthrough(),
});

const clientRecommendationsCollection = defineCollection({
  loader: glob({
    pattern: "**/Recommendations/**/*.{md,mdx}", // Include both .md and .mdx files
    base: resolveContentPath("client-content")
  }),
  schema: z.object({
    aliases: z.union([
      z.string().transform(str => [str]),
      z.array(z.string()),
      z.null(),
      z.undefined()
    ]).transform(val => val ?? []).default([]),
  }).passthrough()
});

// const pathId = (entry: string) =>
//   entry.replace(/\.(md|mdx)$/i, '').toLowerCase();

/**
const clientProjectsCollection = defineCollection({
  loader: glob({
    base: resolveContentPath("client-content"),
    generateId: ({ entry }) => {
      return pathId(entry);
    }
  }),
  schema: z.object({
    aliases: z.union([
      z.string().transform(str => [str]),
      z.array(z.string()),
      z.null(),
      z.undefined()
    ]).transform(val => val ?? []).default([]),
  }).passthrough().transform((data, context) => {
    const filename = String(context.path).split('/').pop()?.replace(/\.(md|mdx)$/, '') || '';

    const displayTitle = data.title
      ? data.title
      : filename.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();

    return {
      ...data,
      title: displayTitle,
      slug: filename.toLowerCase().replace(/\s+/g, '-'),
    };
  })
});
*/

const clientPortfoliosCollection = defineCollection({
  loader: glob({
    pattern: "**/Portfolio/**/*.{md,mdx}", // Match any Portfolio directory at any depth
    base: resolveContentPath("client-content"),
    generateId: ({ entry }) => {
      // Ensure proper ID generation to avoid conflicts
      return entry.replace(/^client-content\//, '').toLowerCase();
    }
  }),
  schema: z.object({
    title: z.string().optional(), // Declare title as optional
    site_name: z.string().optional(), // Declare site_name as optional
    url: z.string().optional(), // Portfolio company URL
    og_title: z.string().optional(), // Open Graph title
    og_description: z.string().optional(), // Open Graph description
    og_image: z.string().optional(), // Open Graph image
    og_favicon: z.string().optional(), // Open Graph favicon
    og_last_fetch: z.union([z.string(), z.date()]).optional(), // Last OG fetch
    description: z.string().optional(), // Description
    description_site_cp: z.string().optional(), // Site-specific description
    zinger: z.string().optional(), // Short catchy phrase
    image: z.string().optional(), // Company image
    favicon: z.string().optional(), // Company favicon
    tags: z.array(z.string()).optional().default([]), // Tags for categorization
    portfolios: z.array(z.string()).optional().default([]), // Which portfolios/funds
    date_created: z.union([z.string(), z.date()]).optional(),
    date_modified: z.union([z.string(), z.date()]).optional(),
    aliases: z.union([
      z.string().transform(str => [str]),
      z.array(z.string()),
      z.null(),
      z.undefined()
    ]).transform(val => val ?? []).default([]),
    slug: z.string().optional(), // Allow custom slugs from frontmatter
  }).passthrough()
});

const clientPagesCollection = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}", // Include both .md and .mdx files at client level
    base: resolveContentPath("client-content"),
    generateId: ({ entry }) => {
      // Remove the .md/.mdx extension and convert to lowercase
      return entry.replace(/\.(md|mdx)$/i, '').toLowerCase();
    }
  }),
  schema: z.object({
    title: z.string().optional(),
    slug: z.string().optional(),
    date_created: z.union([z.string(), z.date()]).optional(),
    date_modified: z.union([z.string(), z.date()]).optional(),
    aliases: z.union([
      z.string().transform(str => [str]),
      z.array(z.string()),
      z.null(),
      z.undefined()
    ]).transform(val => val ?? []).default([]),
  }).passthrough()
});



const talksCollection = defineCollection({
  loader: glob({pattern: "**/*.md", base: resolveContentPath("lost-in-public/talks")}),
  schema: z.object({
    publish: z.boolean().optional(), // Allows individual entries to override collection default
  }).passthrough()
});

const vocabularyCollection = defineCollection({
  loader: glob({pattern: "**/*.md", base: resolveContentPath("vocabulary")}),
  schema: z.object({
    aliases: z.union([
      z.string().transform(str => [str]), // Single string -> array with one string
      z.array(z.string()),                // Already an array
      z.null(),                          // Handle null values
      z.undefined()                      // Handle undefined values
    ]).transform(val => {
      if (!val) return [];              // Transform null/undefined to empty array
      return val;                       // Keep arrays and transformed strings as-is
    }).default([])                      // Default to empty array if missing
  })
});

// Concepts collection - follows same pattern as vocabulary
const conceptsCollection = defineCollection({
  loader: glob({pattern: "**/*.md", base: resolveContentPath("concepts")}),
  schema: z.object({
    aliases: z.union([
      z.string().transform(str => [str]), // Single string -> array with one string
      z.array(z.string()),                // Already an array
      z.null(),                          // Handle null values
      z.undefined()                      // Handle undefined values
    ]).transform(val => {
      if (!val) return [];              // Transform null/undefined to empty array
      return val;                       // Keep arrays and transformed strings as-is
    }).default([])                      // Default to empty array if missing
  })
});

// Concepts collection - follows same pattern as vocabulary
const essaysCollection = defineCollection({
  loader: glob({pattern: "**/*.md", base: resolveContentPath("essays")}),
  schema: z.object({
    aliases: z.union([
      z.string().transform(str => [str]), // Single string -> array with one string
      z.array(z.string()),                // Already an array
      z.null(),                          // Handle null values
      z.undefined()                      // Handle undefined values
    ]).transform(val => {
      if (!val) return [];              // Transform null/undefined to empty array
      return val;                       // Keep arrays and transformed strings as-is
    }).default([])                      // Default to empty array if missing
  }).passthrough()
});

const promptsCollection = defineCollection({
  loader: glob({pattern: "**/*.md", base: resolveContentPath("lost-in-public/prompts")}),
  schema: z.object({}).passthrough()
});

const remindersCollection = defineCollection({
  loader: glob({pattern: "**/*.md", base: resolveContentPath("lost-in-public/reminders")}),
  schema: z.object({}).passthrough()
});

const blueprintsCollection = defineCollection({
  loader: glob({pattern: "**/*.md", base: resolveContentPath("lost-in-public/blueprints")}),
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    lede: z.string().optional(),
    slug: z.string().optional(),
    date_created: z.union([z.string(), z.date()]).optional(),
    date_modified: z.union([z.string(), z.date()]).optional(),
    authors: z.union([z.string(), z.array(z.string())]).optional(),
    tags: z.union([z.string(), z.array(z.string())]).optional(),
    status: z.string().optional(),
    publish: z.boolean().default(true).optional(),
    difficulty: z.string().optional(),
    estimated_time: z.string().optional(),
    prerequisites: z.array(z.string()).optional(),
    tools_required: z.array(z.string()).optional(),
    category: z.string().optional(),
    version: z.string().optional(),
  }).passthrough()
});

const changelogContentCollection = defineCollection({
  loader: glob({pattern: "**/*.md", base: resolveContentPath("changelog--content")}),
  schema: z.object({}).passthrough()
});


const changelogCodeCollection = defineCollection({
  loader: glob({pattern: "**/*.md", base: resolveContentPath("changelog--code")}),
  schema: z.object({}).passthrough()
});

const changelogLaerdalCollection = defineCollection({
  loader: glob({pattern: "**/*.md", base: resolveContentPath("changelog--laerdal")}),
  schema: z.object({}).passthrough()
});

const reportCollection = defineCollection({
  type: 'content',
  schema: z.any() // Allow any frontmatter structure to avoid validation errors
});

// Pages collection for individual MDX files
const pagesCollection = defineCollection({
  loader: glob({pattern: "**/*.{md,mdx}", base: resolveContentPath("mdx-pages")}),
  schema: z.object({}).passthrough()
});

// Individual markdown/mdx files with minimal validation - only ensure tags is an array
const toolCollection = defineCollection({
  loader: glob({pattern: "**/*.md", base: resolveContentPath("tooling")}),
  schema: z.object({}).passthrough()
});

const verticalToolkitsCollection = defineCollection({
  loader: glob({
    pattern: "**/*.md", 
    base: resolveContentPath("vertical-toolkits"),
    // Custom ID generation to preserve the full directory path
    generateId: ({ entry }) => {
      // entry is the relative path from base, e.g., "FinTech/Alviere.md"
      // We want to preserve the directory structure but lowercase it for consistency
      // Remove the .md extension and convert to lowercase
      return entry.replace(/\.md$/, '').toLowerCase();
    }
  }),
  schema: z.object({}).passthrough()
});

// ***
// Open: Specs Collection Definition
// Type: Content Collection

const marketMapsCollection = defineCollection({
  // Use the full path to the market maps content
  loader: glob({pattern: "**/*.md", base: resolveContentPath("lost-in-public/market-maps")}),
  schema: z.object({
    title: z.string().optional(),
    slug: z.string().optional(),
    banner_image: z.string().optional(),
    portrait_image: z.string().optional(),
    date_modified: z.union([z.string(), z.date()]).optional(),
    date_created: z.union([z.string(), z.date()]).optional(),
    lede: z.string().optional(),
    publish: z.boolean().default(true).optional(),
    tags: z.union([z.string(), z.array(z.string())]).optional(),
    authors: z.union([z.string(), z.array(z.string())]).optional(),
  }).passthrough()
});

const specsCollection = defineCollection({
  loader: glob({pattern: "**/*.md", base: resolveContentPath("specs")}),
  schema: z.object({}).passthrough()
});
// Includes:
//   - specsCollection (defineCollection)
//   - glob loader for ../content/specs
//   - Flexible schema with normalization
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// ========================================
// Affects: [specsCollection, collections export, paths export]
// Close: Specs Collection Definition
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

// ***
// Open: Issue Resolution Collection Definition (Ultra-Minimalist, following example)
// Type: Content Collection
// Purpose: For magazine-style articles detailing issue resolutions.
// Schema: Permissive, passes through all frontmatter.
// Transform: Passes data through. Astro will auto-generate id and slug.
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const issueResolutionCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: resolveContentPath("lost-in-public/issue-resolution") }),
  schema: z.object({
    publish: z.boolean().optional(), // Allows individual entries to override collection default
  }).passthrough().transform((data) => ({
    ...data // Pass through all original frontmatter fields.
            // Astro will automatically create 'id' and 'slug' properties for the entry.
            // All frontmatter, including 'site_uuid', 'title', etc., will be under entry.data.
  }))
});

const toHeroCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: resolveContentPath("lost-in-public/to-hero") }),
  schema: z.object({
    publish: z.boolean().optional(), // Allows individual entries to override collection default
  }).passthrough().transform((data) => ({
    ...data // Pass through all original frontmatter fields.
            // Astro will automatically create 'id' and 'slug' properties for the entry.
            // All frontmatter, including 'site_uuid', 'title', etc., will be under entry.data.
  }))
});

const upAndRunningCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: resolveContentPath("lost-in-public/up-and-running") }),
  schema: z.object({
    publish: z.boolean().optional(), // Allows individual entries to override collection default
  }).passthrough().transform((data) => ({
    ...data // Pass through all original frontmatter fields.
            // Astro will automatically create 'id' and 'slug' properties for the entry.
            // All frontmatter, including 'site_uuid', 'title', etc., will be under entry.data.
  }))
});

const mapOfContentsCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: resolveContentPath("moc") }),
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    type: z.string().optional(),
    MAX_CARDS: z.number().optional(),
  }).passthrough()
});

const pathId = (entry: string) => {
  // Remove file extension and convert to lowercase
  // This should match the slugify function behavior for consistency
  return entry
    .replace(/\.(md|mdx)$/i, '')  // Remove .md or .mdx extension
    .toLowerCase();               // Convert to lowercase
};

const explorationsCollection = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: resolveContentPath("lost-in-public/explorations")
  }),
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    lede: z.string().optional(),
    slug: z.string().optional(),
    date_created: z.union([z.string(), z.date()]).optional(),
    date_modified: z.union([z.string(), z.date()]).optional(),
    authors: z.union([z.string(), z.array(z.string())]).optional(),
    tags: z.union([z.string(), z.array(z.string())]).optional(),
    status: z.string().optional(),
    publish: z.boolean().default(true).optional(),
    difficulty: z.string().optional(),
    estimated_time: z.string().optional(),
    prerequisites: z.array(z.string()).optional(),
    tools_required: z.array(z.string()).optional(),
    category: z.string().optional(),
    version: z.string().optional(),
  }).passthrough()
});

const projectsCollection = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: resolveContentPath("projects"),
    generateId: ({ entry }) => {
      return pathId(entry);
    }
  }),
  schema: z.object({
    title: z.string().optional(),
    tags: z.array(z.string()).optional(),
    slug: z.string().optional(),
    publish: z.boolean().default(true),
  }),
});

const portfolioCollection = defineCollection({
  loader: glob({ 
    pattern: [
      'tooling/Portfolio/*.md',
      'client-content/*/Portfolio/*.md'
    ], 
    base: resolveContentPath('') 
  }),
  schema: z.object({
    // Make title optional and derive from og_title or filename
    title: z.string().optional(),
    og_title: z.string().optional(),
    og_description: z.string().optional(),
    og_image: z.string().optional(),
    og_favicon: z.string().optional(),
    og_last_fetch: z.union([z.string(), z.date()]).optional(),
    url: z.string().optional(),
    zinger: z.string().optional(),
    date_created: z.union([z.string(), z.date()]).optional(),
    date_modified: z.union([z.string(), z.date()]).optional(),
    tags: z.array(z.string()).optional(),
    portfolios: z.array(z.string()).optional(),
    client: z.string().optional(),
    status: z.string().optional(),
    authors: z.union([z.string(), z.array(z.string())]).optional(),
    description_site_cp: z.string().optional(),
    site_uuid: z.string().optional(),
    slug: z.string().optional(),
  }).passthrough()
});


// ---- NEW: Configuration for Publishing Defaults ----
export const collectionPublishingDefaults = {
  'issue-resolution': {
    publishByDefault: true, // true = publish all EXCEPT items with publish: false
                            // false = publish none EXCEPT items with publish: true
  },
  'talks': {
    publishByDefault: true, // true = publish all EXCEPT items with publish: false
                            // false = publish none EXCEPT items with publish: true
  },
  // Add other collections here as needed
};
// ---- END NEW ----

// Define where to find the content - using environment-aware paths
export const paths = {
  'cards': 'cards',
  'changelog--content': resolveContentPath('changelog--content'),
  'changelog--code': resolveContentPath('changelog--code'),
  'changelog--laerdal': resolveContentPath('changelog--laerdal'),
  'essays': resolveContentPath('essays'),
  'concepts': resolveContentPath('concepts'),
  'reports': resolveContentPath('reports'),
  'talks': resolveContentPath('lost-in-public/talks'),
  'tooling': resolveContentPath('tooling'),
  'vertical-toolkits': resolveContentPath('vertical-toolkits'),
  'vocabulary': resolveContentPath('vocabulary'),
  'prompts': resolveContentPath('lost-in-public/prompts'),
  'reminders': resolveContentPath('lost-in-public/reminders'),
  'blueprints': resolveContentPath('lost-in-public/blueprints'),
  'market-maps': resolveContentPath('lost-in-public/market-maps'),
  'specs': resolveContentPath('specs'),
  'issue-resolution': resolveContentPath('lost-in-public/issue-resolution'),
  'to-hero': resolveContentPath('lost-in-public/to-hero'),
  'up-and-running': resolveContentPath('lost-in-public/up-and-running'),
  'client-content': resolveContentPath('client-content'),
  'client-recommendations': resolveContentPath('client-content'),
  'client-portfolios': resolveContentPath('client-content'),
  'client-pages': resolveContentPath('client-content'),
  'visuals': resolveContentPath('visuals'),
  'moc': resolveContentPath('moc'),
  'projects': resolveContentPath('projects'),
};

// Export the collections
export const collections = {
  'cards': cardCollection,
  'explorations': explorationsCollection,
  'projects': projectsCollection,
  'concepts': conceptsCollection,
  'market-maps': marketMapsCollection,
  'essays': essaysCollection,
  'vocabulary': vocabularyCollection,
  'changelog--content': changelogContentCollection,
  'changelog--code': changelogCodeCollection,
  'changelog--laerdal': changelogLaerdalCollection,
  'reports': reportCollection,
  'pages': pagesCollection,
  'tooling': toolCollection,
  'vertical-toolkits': verticalToolkitsCollection,
  'slides': slidesCollection,
  'prompts': promptsCollection,
  'reminders': remindersCollection,
  'blueprints': blueprintsCollection,
  'specs': specsCollection,
  'talks': talksCollection,
  'issue-resolution': issueResolutionCollection,
  'up-and-running': upAndRunningCollection,
  'to-hero': toHeroCollection,
  'client-recommendations': clientRecommendationsCollection,
  'client-portfolios': clientPortfoliosCollection,
  'client-pages': clientPagesCollection,
  'portfolio': portfolioCollection,
  'moc': mapOfContentsCollection,
};