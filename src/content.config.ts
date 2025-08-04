import { defineCollection, z, getCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { basename, dirname, extname, join, resolve } from 'node:path';
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

// Function to create a collection that loads from multiple paths
function createMultiPathCollection({
  paths,
  ...config
}: {
  paths: string[];
  schema: any;
  loader?: any;
}) {
  // Create a glob pattern that combines all paths
  const patterns = paths.map(path => `${path}/**/*.md`);
  const base = process.cwd(); // Use current working directory as base

  return defineCollection({
    ...config,
    loader: config.loader || glob({
      pattern: patterns,
      base
    })
  });
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
    }).passthrough().transform((data, context) => {
      // Get the filename without extension
      const filename = String(context.path).split('/').pop()?.replace(/\.md$/, '') || '';
      
      // Use provided title or generate from filename
      const displayTitle = data.title
        ? data.title
        : filename.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
      
      // Generate slug from filename if not provided in frontmatter
      const slug = data.slug || filename.toLowerCase().replace(/\s+/g, '-');
      
      return {
        ...data,
        title: displayTitle,
        slug: slug,
      };
    }),
});

const clientEssaysCollection = defineCollection({
  loader: glob({
    pattern: "**/essays/**/*.md", // lowercase "essays"
    base: resolveContentPath("client-content")
  }),
  schema: z.object({
    aliases: z.union([
      z.string().transform(str => [str]),
      z.array(z.string()),
      z.null(),
      z.undefined()
    ]).transform(val => val ?? []).default([]),
  }).passthrough().transform((data, context) => {
    const filename = String(context.path).split('/').pop()?.replace(/\.md$/, '') || '';

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

const clientProjectsCollection = defineCollection({
  loader: glob({
    pattern: "**/Projects/**/*.{md,mdx}", // Include both .md and .mdx files
    base: resolveContentPath("client-content")
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
    aliases: z.union([
      z.string().transform(str => [str]),
      z.array(z.string()),
      z.null(),
      z.undefined()
    ]).transform(val => val ?? []).default([]),
    slug: z.string().optional(), // Allow custom slugs from frontmatter
  }).passthrough().transform((data, context) => {
    const filename = String(context.path).split('/').pop()?.replace(/\.(md|mdx)$/, '') || '';

    const displayTitle = data.title
      ? data.title
      : filename.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();

    return {
      ...data,
      title: displayTitle,
      slug: data.slug || filename.toLowerCase().replace(/\s+/g, '-'), // Respect frontmatter slug
    };
  })
});

const visualsCollection = defineCollection({
  loader: glob({pattern: "**/*.{png,jpg,jpeg,gif,webp,svg}", base: resolveContentPath("visuals")}),  // Explicitly list image extensions
  schema: z.object({
    // Define base fields that all images should have
    id: z.string().optional(),
    title: z.string().optional(),
    alt: z.string().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    format: z.enum(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg']).optional()
  }).passthrough().transform((data, context) => {
    // Get the filename without extension
    const filename = String(context.path).split('/').pop()?.replace(/\.[^.]+$/, '') || '';
    const extension = String(context.path).split('.').pop()?.toLowerCase() || '';
    
    // Use the filename as the display title, preserving original case
    // - Replace dashes/underscores with spaces
    // - Collapse multiple spaces
    // - DO NOT change the case of any letters (e.g., 'API' stays 'API')
    const displayTitle = filename
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    return {
      ...data,
      id: filename,  // Original filename as id
      title: data.title || displayTitle,  // Use provided title or computed one
      format: extension as 'png' | 'jpg' | 'jpeg' | 'gif' | 'webp' | 'svg',
      slug: filename.toLowerCase().replace(/\s+/g, '-')  // Add computed slug
    };
  })
});

const talksCollection = defineCollection({
  loader: glob({pattern: "**/*.md", base: resolveContentPath("lost-in-public/talks")}),
  schema: z.object({
    publish: z.boolean().optional(), // Allows individual entries to override collection default
  }).passthrough().transform((data) => ({
    ...data // Pass through all original frontmatter fields.
  }))
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
  }).passthrough().transform((data, context) => {
    // Get the filename without extension
    const filename = String(context.path).split('/').pop()?.replace(/\.md$/, '') || '';
    
    // Title fallback logic for essaysCollection:
    // - If frontmatter provides a title, use it as-is (preserve all casing).
    // - If missing, generate a title from the filename by replacing dashes/underscores with spaces.
    // - DO NOT change the case of any letters (e.g., 'API' stays 'API', 'AI' stays 'AI').
    // - This preserves the author's intended casing from the filename.
    const displayTitle = data.title
      ? data.title
      : filename
          .replace(/_/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
    
    // Merge our computed values into the data object
    return {
      ...data,  // Start with existing data
      title: displayTitle,  // Override with computed title
      slug: filename.toLowerCase().replace(/\s+/g, '-'),  // Add computed slug
    };
  })
});

const promptsCollection = defineCollection({
  loader: glob({pattern: "**/*.md", base: resolveContentPath("lost-in-public/prompts")}),
  schema: z.object({}).passthrough().transform((data) => ({
    ...data,
    // Ensure tags is always an array, even if null/undefined in frontmatter
    tags: Array.isArray(data.tags) ? data.tags
      : data.tags ? [data.tags]
      : []
  }))
});

const remindersCollection = defineCollection({
  loader: glob({pattern: "**/*.md", base: resolveContentPath("lost-in-public/reminders")}),
  schema: z.object({}).passthrough().transform((data) => ({
    ...data,
    // Ensure tags is always an array, even if null/undefined in frontmatter
    tags: Array.isArray(data.tags) ? data.tags
      : data.tags ? [data.tags]
      : []
  }))
});

const changelogContentCollection = defineCollection({
  loader: glob({pattern: "**/*.md", base: resolveContentPath("changelog--content")}),
  schema: z.object({}).passthrough().transform((data) => ({
    ...data,
    // Ensure tags is always an array, even if null/undefined in frontmatter
    tags: Array.isArray(data.tags) ? data.tags
      : data.tags ? [data.tags]
      : []
  }))
});


const changelogCodeCollection = defineCollection({
  loader: glob({pattern: "**/*.md", base: resolveContentPath("changelog--code")}),
  schema: z.object({}).passthrough().transform((data) => ({
    ...data,
    // Ensure tags is always an array, even if null/undefined in frontmatter
    tags: Array.isArray(data.tags) ? data.tags
      : data.tags ? [data.tags]
      : []
  }))
});

const changelogLaerdalCollection = defineCollection({
  loader: glob({pattern: "**/*.md", base: resolveContentPath("changelog--laerdal")}),
  schema: z.object({}).passthrough().transform((data) => ({
    ...data,
    // Ensure tags is always an array, even if null/undefined in frontmatter
    tags: Array.isArray(data.tags) ? data.tags
      : data.tags ? [data.tags]
      : []
  }))
});

const reportCollection = defineCollection({
  type: 'content',
  schema: z.any() // Allow any frontmatter structure to avoid validation errors
});

// Pages collection for individual MDX files
const pagesCollection = defineCollection({
  type: 'content',
  schema: z.any() // Allow any frontmatter structure to avoid validation errors
});

// Individual markdown/mdx files with minimal validation - only ensure tags is an array
const toolCollection = defineCollection({
  loader: glob({pattern: "**/*.md", base: resolveContentPath("tooling")}),
  schema: z.object({}).passthrough().transform((data) => ({
    ...data,
    // Ensure tags is always an array, even if null/undefined in frontmatter
    tags: Array.isArray(data.tags) ? data.tags
      : data.tags ? [data.tags]
      : []
  }))
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
  schema: z.object({}).passthrough().transform((data, context) => {
    // Get the filename for title generation
    const filename = String(context.path).split('/').pop()?.replace(/\.md$/, '') || '';
    
    // Generate title from filename if not provided
    const displayTitle = data.title || filename.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
    
    return {
      ...data,
      title: displayTitle,
      // Ensure tags is always an array, even if null/undefined in frontmatter
      tags: Array.isArray(data.tags) ? data.tags
        : data.tags ? [data.tags]
        : []
    };
  })
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
  }).passthrough().transform((data) => ({
    ...data,
    // Ensure tags is always an array, even if null/undefined in frontmatter
    tags: Array.isArray(data.tags) ? data.tags
      : data.tags ? [data.tags]
      : []
  }))
});

const specsCollection = defineCollection({
  loader: glob({pattern: "**/*.md", base: resolveContentPath("specs")}),
  schema: z.object({}).passthrough().transform((data) => ({
    ...data,
    // Ensure tags is always an array, even if null/undefined in frontmatter
    tags: Array.isArray(data.tags) ? data.tags
      : data.tags ? [data.tags]
      : []
  }))
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
  }).passthrough().transform((data, context) => {
    // Handle context.path - it might be an array in glob loaders
    const contextPath = Array.isArray(context.path) 
      ? context.path.join('/') 
      : String(context.path || '');
    
    // Extract client name from path if in client-content
    const pathParts = contextPath.split('/');
    const isClientContent = pathParts.includes('client-content');
    const clientIndex = pathParts.indexOf('client-content');
    const client = isClientContent && clientIndex !== -1 ? pathParts[clientIndex + 1] : null;
    
    // Get filename for slug generation
    const filename = contextPath.split('/').pop()?.replace(/\.md$/, '') || '';
    
    // Derive title from og_title or filename
    const title = data.title || data.og_title || filename.replace(/[-_]/g, ' ');
    
    return {
      ...data,
      title,
      client: data.client || client,
      slug: filename.toLowerCase().replace(/\s+/g, '-'),
    };
  })
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
  'market-maps': resolveContentPath('lost-in-public/market-maps'),
  'specs': resolveContentPath('specs'),
  'issue-resolution': resolveContentPath('lost-in-public/issue-resolution'),
  'to-hero': resolveContentPath('lost-in-public/to-hero'),
  'up-and-running': resolveContentPath('lost-in-public/up-and-running'),
  'client-content': resolveContentPath('client-content'),
  'client-recommendations': resolveContentPath('client-content'),
  'client-projects': resolveContentPath('client-content'),
  'client-portfolios': resolveContentPath('client-content'),
};

// Export the collections
export const collections = {
  'cards': cardCollection,
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
  'specs': specsCollection,
  'talks': talksCollection,
  'issue-resolution': issueResolutionCollection,
  'up-and-running': upAndRunningCollection,
  'to-hero': toHeroCollection,
  'client-content': clientEssaysCollection,
  'client-recommendations': clientRecommendationsCollection,
  'client-projects': clientProjectsCollection,
  'client-portfolios': clientPortfoliosCollection,
  'portfolio': portfolioCollection,
};