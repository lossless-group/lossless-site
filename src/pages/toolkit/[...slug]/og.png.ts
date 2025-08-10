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

  // Create the HTML structure for the OG image
  const html = {
    type: 'div',
    props: {
      children: [
        {
          type: 'div',
          props: {
            tw: 'flex flex-col items-center justify-center w-full h-full p-16',
            style: {
              background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
            },
            children: [
              {
                type: 'div',
                props: {
                  tw: 'text-5xl font-bold text-gray-900 mb-6 tracking-tight',
                  children: siteName,
                },
              },
              {
                type: 'div',
                props: {
                  tw: 'text-3xl text-gray-700 text-center max-w-5xl leading-relaxed',
                  children: title,
                },
              },
              {
                type: 'div',
                props: {
                  tw: 'absolute bottom-8 right-8 text-lg text-gray-500',
                  children: 'Lossless Group',
                },
              },
            ],
          },
        },
      ],
      tw: 'w-full h-full flex items-center justify-center relative',
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
  
  return toolingEntries.map(entry => {
    const generatedSlug = getReferenceSlug(entry.id);
    
    return {
      params: { slug: generatedSlug },
      props: { entry },
    };
  }).filter(path => {
    // Exclude vertical toolkit paths
    return !path.params.slug.startsWith('vertical/');
  });
}
