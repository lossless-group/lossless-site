import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';

interface Options {
  processInFrontmatter?: boolean;
}

const defaultOptions: Options = {
  processInFrontmatter: false,
};

function getImageDirectory(filename: string): string {
  return filename.includes('Hero') ? 'Heroes' : 'Screenshots';
}

function normalizeImagePath(path: string): string {
  // Remove any leading path components and get just the filename
  const filename = path.split('/').pop() || path;
  return filename;
}

function transformImagePath(path: string): string {
  const filename = normalizeImagePath(path);
  const directory = getImageDirectory(filename);
  return `/content/Visuals/${directory}/${filename}`;
}

function generateAltText(filename: string): string {
  // Extract the name after the last underscore and before the extension
  const match = filename.match(/_([^_]+)\.[^.]+$/);
  if (!match) return filename;
  
  const baseName = match[1];
  const extension = filename.split('.').pop()?.toUpperCase() || '';
  return `${baseName} ${extension}`;
}

export default function remarkLitegal(userOptions: Partial<Options> = {}) {
  const options = { ...defaultOptions, ...userOptions };

  return function transformer(tree: Root) {
    visit(tree, 'code', (node: any, index: number | null, parent: any) => {
      if (!parent || index === null || node.lang !== 'litegal') return;

      const images = node.value
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          const match = line.match(/!\[\[(.*?)\]\]/);
          if (!match) return null;
          const path = match[1];
          
          return {
            path: transformImagePath(path),
            alt: generateAltText(normalizeImagePath(path))
          };
        })
        .filter(Boolean);

      // Generate gallery HTML
      const galleryId = `gallery-${Math.random().toString(36).substr(2, 9)}`;
      const html = `<div class="gallery litegal" id="${galleryId}">
        <div class="gallery-container">
          ${images.map((img, idx) => `
            <div class="gallery-slide${idx === 0 ? ' active' : ''}" data-index="${idx}">
              <img src="${img.path}" alt="${img.alt}" class="gallery-image" />
            </div>
          `).join('')}
        </div>
        <button class="gallery-nav prev" aria-label="Previous image">‹</button>
        <button class="gallery-nav next" aria-label="Next image">›</button>
        <div class="gallery-dots">
          ${images.map((_, idx) => `
            <button class="gallery-dot${idx === 0 ? ' active' : ''}" data-index="${idx}" aria-label="Go to slide ${idx + 1}"></button>
          `).join('')}
        </div>
        <script>
          (function() {
            const gallery = document.getElementById('${galleryId}');
            const slides = gallery.querySelectorAll('.gallery-slide');
            const dots = gallery.querySelectorAll('.gallery-dot');
            let currentIndex = 0;

            function showSlide(index) {
              slides.forEach(slide => slide.classList.remove('active'));
              dots.forEach(dot => dot.classList.remove('active'));
              slides[index].classList.add('active');
              dots[index].classList.add('active');
              currentIndex = index;
            }

            function nextSlide() {
              showSlide((currentIndex + 1) % slides.length);
            }

            function prevSlide() {
              showSlide((currentIndex - 1 + slides.length) % slides.length);
            }

            gallery.querySelector('.next').addEventListener('click', nextSlide);
            gallery.querySelector('.prev').addEventListener('click', prevSlide);
            
            dots.forEach((dot, index) => {
              dot.addEventListener('click', () => showSlide(index));
            });
          })();
        </script>
      </div>`;

      // Replace the code node with an HTML node
      parent.children.splice(index, 1, {
        type: 'html',
        value: html
      });
    });
  };
}
