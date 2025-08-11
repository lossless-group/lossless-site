import { getCollection, type CollectionEntry } from 'astro:content';
import { ImageResponse } from '@vercel/og';
import { getReferenceSlug } from '@utils/slugify';

interface Props {
  params: { slug: string };
  props: { entry: CollectionEntry<'tooling'> };
}

export async function GET({ props }: Props) {
  const { entry } = props;

  // Extract data from the entry
  const siteName = entry.data.site_name || 'Lossless Group';
  const title = entry.data.title || 'Toolkit Entry';
  const ogImage = entry.data.og_image;
  const description = (entry.data.og_description || entry.data.description || '') as string;

  // Load the Lossless logo SVG
  const logoSvg = await fetch('https://www.lossless.group/visuals/appIcon__Lossless_Record--Rounded-Rectangle.svg')
    .then(res => res.text())
    .catch(() => null);

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
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
            },
            children: [
              // Left side - Content
              {
                type: 'div',
                props: {
                  tw: 'flex flex-col justify-center flex-1 p-12',
                  children: [
                    // Site name (like GitHub repo name)
                    {
                      type: 'div',
                      props: {
                        tw: 'text-4xl font-bold text-gray-900 mb-3 tracking-tight',
                        children: siteName,
                      },
                    },
                    // Title/Description
                    {
                      type: 'div',
                      props: {
                        tw: 'text-xl text-gray-600 leading-relaxed max-w-2xl',
                        children: title,
                      },
                    },
                    // Additional description if available
                    description && {
                      type: 'div',
                      props: {
                        tw: 'text-lg text-gray-500 mt-4 leading-relaxed max-w-2xl',
                        children: description.length > 100 ? description.substring(0, 100) + '...' : description,
                      },
                    },
                    // Bottom stats bar (like GitHub)
                    {
                      type: 'div',
                      props: {
                        tw: 'flex items-center mt-8 space-x-8',
                        children: [
                          {
                            type: 'div',
                            props: {
                              tw: 'flex items-center space-x-2',
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
                                    tw: 'text-sm text-gray-600',
                                    children: 'Toolkit',
                                  },
                                },
                              ],
                            },
                          },
                          {
                            type: 'div',
                            props: {
                              tw: 'flex items-center space-x-2',
                              children: [
                                {
                                  type: 'div',
                                  props: {
                                    tw: 'w-4 h-4 bg-green-500 rounded-full',
                                  },
                                },
                                {
                                  type: 'div',
                                  props: {
                                    tw: 'text-sm text-gray-600',
                                    children: 'Verified',
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
                  children: ogImage ? [
                    // Tool's OG image if available
                    {
                      type: 'img',
                      props: {
                        src: ogImage,
                        tw: 'w-32 h-32 rounded-xl object-cover shadow-lg',
                        style: {
                          maxWidth: '128px',
                          maxHeight: '128px',
                        },
                      },
                    },
                  ] : [
                    // Fallback to Lossless logo
                    {
                      type: 'div',
                      props: {
                        tw: 'w-32 h-32 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg',
                        children: [
                          {
                            type: 'div',
                            props: {
                              tw: 'text-white text-2xl font-bold',
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
            children: [
              {
                type: 'div',
                props: {
                  tw: 'flex items-center space-x-2',
                  children: [
                    logoSvg ? {
                      type: 'div',
                      props: {
                        tw: 'w-6 h-6 flex items-center justify-center',
                        children: [
                          {
                            type: 'div',
                            props: {
                              dangerouslySetInnerHTML: {
                                __html: logoSvg,
                              },
                              style: {
                                width: '24px',
                                height: '24px',
                              },
                            },
                          },
                        ],
                      },
                    } : {
                      type: 'div',
                      props: {
                        tw: 'w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600',
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        tw: 'text-white text-sm font-medium',
                        children: 'Lossless Group',
                      },
                    },
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  tw: 'text-gray-400 text-sm',
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
