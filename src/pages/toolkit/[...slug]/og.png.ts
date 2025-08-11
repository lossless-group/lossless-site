import { getCollection, type CollectionEntry } from 'astro:content';
import { ImageResponse } from '@vercel/og';
import { getReferenceSlug } from '@utils/slugify';

export const prerender = false;

interface Props {
  params: { slug: string };
}

export async function GET({ params }: Props) {
  const { slug } = params;
  
  // Fetch the tooling entry at runtime
  const toolingEntries = await getCollection('tooling');
  
  // Find the entry that matches the slug
  const entry = toolingEntries.find(entry => {
    const generatedSlug = getReferenceSlug(entry.id);
    const cleanSlug = generatedSlug.replace(/^tooling\//, '');
    return cleanSlug === slug;
  });

  if (!entry) {
    // Return a default OG image if entry not found
    return new ImageResponse(
      {
        type: 'div',
        props: {
          tw: 'flex w-full h-full items-center justify-center bg-gray-100',
          children: [
            {
              type: 'div',
              props: {
                tw: 'text-2xl text-gray-600',
                children: 'Toolkit Entry Not Found',
              },
            },
          ],
        },
      },
      {
        width: 1200,
        height: 630,
      }
    );
  }

  // Extract data from the entry
  const siteName = entry.data.site_name || 'Lossless Group';
  const title = entry.data.title || 'Toolkit Entry';
  const ogImage = entry.data.og_image;
  const description = (entry.data.og_description || entry.data.description || '') as string;

  // Validate ogImage URL - skip if invalid
  const isValidOgImage = ogImage && typeof ogImage === 'string' && ogImage.startsWith('http');

  // Load the Lossless logo SVG URL
  const logoUrl = 'https://www.lossless.group/visuals/appIcon__Lossless_Record--Rounded-Rectangle.svg';

  // Create the HTML structure for the OG image
  const html = {
    type: 'div',
    props: {
      children: [
        {
          type: 'div',
          props: {
            tw: 'flex w-full h-full',
            style: {
              background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              display: 'flex',
            },
            children: [
              // Left side - Content
              {
                type: 'div',
                props: {
                  tw: 'flex flex-col justify-center flex-1 p-12',
                  style: {
                    display: 'flex',
                  },
                  children: [
                    // Site name (like GitHub repo name)
                    {
                      type: 'div',
                      props: {
                        tw: 'text-6xl font-bold text-gray-900 mb-3 tracking-tight',
                        style: {
                          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                          fontWeight: '700',
                          letterSpacing: '-0.025em',
                        },
                        children: siteName,
                      },
                    },
                    // Title/Description
                    {
                      type: 'div',
                      props: {
                        tw: 'text-3xl text-gray-600 leading-relaxed max-w-2xl',
                        style: {
                          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                          fontWeight: '500',
                          letterSpacing: '-0.01em',
                        },
                        children: title,
                      },
                    },
                    // Additional description if available
                    description && {
                      type: 'div',
                      props: {
                        tw: 'text-2xl text-gray-500 mt-4 leading-relaxed max-w-2xl',
                        style: {
                          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                          fontWeight: '400',
                          letterSpacing: '0em',
                        },
                        children: description.length > 100 ? description.substring(0, 100) + '...' : description,
                      },
                    },
                    // Bottom stats bar (like GitHub)
                    {
                      type: 'div',
                      props: {
                        tw: 'flex items-center mt-8',
                        style: {
                          display: 'flex',
                        },
                        children: [
                          {
                            type: 'div',
                            props: {
                              tw: 'flex items-center',
                              style: {
                                display: 'flex',
                              },
                              children: [
                                {
                                  type: 'div',
                                  props: {
                                    tw: 'w-4 h-4 bg-blue-500 rounded-full',
                                  },
                                },
                                {
                                  type: 'div',
                                  props: {
                                    tw: 'text-lg text-gray-600 ml-3',
                                    style: {
                                      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                                      fontWeight: '600',
                                      letterSpacing: '0.025em',
                                      textTransform: 'uppercase',
                                      fontSize: '1.125rem',
                                    },
                                    children: 'Toolkit',
                                  },
                                },
                              ],
                            },
                          },
                        ],
                      },
                    },
                  ].filter(Boolean), // Remove falsy values
                },
              },
              // Right side - Image or Logo
              {
                type: 'div',
                props: {
                  tw: 'flex items-center justify-center flex-1 p-8',
                  style: {
                    display: 'flex',
                  },
                  children: isValidOgImage ? [
                    // Tool's OG image if available
                    {
                      type: 'img',
                      props: {
                        src: ogImage,
                        width: 480,
                        height: 480,
                        tw: 'w-[480px] h-[480px] rounded-xl object-contain shadow-lg',
                        style: {
                          maxWidth: '480px',
                          maxHeight: '480px',
                          objectFit: 'contain',
                        },
                      },
                    },
                  ] : [
                    // Fallback to Lossless logo
                    {
                      type: 'div',
                      props: {
                        tw: 'w-[480px] h-[480px] rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg',
                        style: {
                          display: 'flex',
                        },
                        children: [
                          {
                            type: 'div',
                            props: {
                              tw: 'text-white text-7xl font-bold',
                              children: 'LG',
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        // Bottom footer with Lossless branding
        {
          type: 'div',
          props: {
            tw: 'absolute bottom-0 left-0 right-0 h-16 bg-gray-900 flex items-center justify-between px-8',
            style: {
              display: 'flex',
            },
            children: [
              {
                type: 'div',
                props: {
                  tw: 'flex items-center space-x-2',
                  style: {
                    display: 'flex',
                  },
                  children: [
                    {
                      type: 'img',
                      props: {
                        src: logoUrl,
                        width: 24,
                        height: 24,
                        tw: 'w-6 h-6',
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        tw: 'text-white text-lg font-medium ml-3',
                        style: {
                          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                          fontWeight: '600',
                          letterSpacing: '0.025em',
                        },
                        children: 'Lossless Group',
                      },
                    },
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  tw: 'text-gray-400 text-lg',
                  style: {
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    fontWeight: '500',
                    letterSpacing: '0.025em',
                    fontVariantNumeric: 'tabular-nums',
                  },
                  children: 'lossless.group',
                },
              },
            ],
          },
        },
      ],
      tw: 'w-full h-full relative',
      style: {
        background: 'white',
        display: 'flex',
      },
    },
  };

  return new ImageResponse(html, {
    width: 1200,
    height: 630,
  });
}

// Generate static paths for all tooling entries
export async function getStaticPaths() {
  const toolingEntries = await getCollection('tooling');
  
  console.log(`🔗 Generating ${toolingEntries.length} OG image paths for tooling entries`);
  
  const paths = toolingEntries.map(entry => {
    const generatedSlug = getReferenceSlug(entry.id);
    // Remove the 'tooling/' prefix from the slug since we're already in the /toolkit/ route
    const cleanSlug = generatedSlug.replace(/^tooling\//, '');
    
    console.log(`   ${entry.id} -> ${cleanSlug}`);
    
    return {
      params: { slug: cleanSlug },
      props: { entry },
    };
  }).filter(path => {
    // Exclude vertical toolkit paths
    return !path.params.slug.startsWith('vertical/');
  });
  
  console.log(`✅ Generated ${paths.length} OG image paths`);
  return paths;
}
