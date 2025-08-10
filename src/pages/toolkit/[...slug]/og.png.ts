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
            tw: 'flex flex-col items-center justify-center w-full h-full',
            style: {
              background: 'white',
              fontFamily: 'Inter, system-ui, sans-serif',
            },
            children: [
              {
                type: 'div',
                props: {
                  tw: 'text-4xl font-bold text-gray-800 mb-4',
                  children: siteName,
                },
              },
              {
                type: 'div',
                props: {
                  tw: 'text-2xl text-gray-600 text-center max-w-4xl px-8',
                  children: title,
                },
              },
            ],
          },
        },
      ],
      tw: 'w-full h-full flex items-center justify-center',
      style: {
        background: 'white',
      },
    },
  };

  return new ImageResponse(html, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: 'Inter',
        data: await fetch(
          'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2'
        ).then((res) => res.arrayBuffer()),
        style: 'normal',
      },
    ],
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
