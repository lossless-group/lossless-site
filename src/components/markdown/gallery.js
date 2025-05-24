let lightbox;

async function initPhotoSwipe() {
  const { default: PhotoSwipeLightbox } = await import('photoswipe/lightbox');
  await import('photoswipe/style.css');

  if (!lightbox) {
    lightbox = new PhotoSwipeLightbox({
      gallery: '.image-gallery-scroll',
      children: 'a',
      pswpModule: () => import('photoswipe')
    });

    lightbox.init();
  } else {
    // ✅ Just rescan the DOM if already initialized
    lightbox.refresh();
  }
}

window.initPhotoSwipe = initPhotoSwipe;

// Initialize once on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPhotoSwipe);
} else {
  initPhotoSwipe();
}
