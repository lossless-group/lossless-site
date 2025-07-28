import { getCollection } from 'astro:content';

try {
  const slides = await getCollection('slides');
  console.log('Slides collection loaded:', slides.length, 'entries');
  console.log('Available slugs:', slides.map(s => s.slug));
  const target = slides.find(s => s.slug === 'css-animation-systems');
  console.log('Target found:', !!target);
  if (target) {
    console.log('Target title:', target.data.title);
    console.log('Target body length:', target.body?.length || 'undefined');
  }
} catch (e) {
  console.error('Error:', e.message);
  console.error(e.stack);
}