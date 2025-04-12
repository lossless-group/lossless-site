/**
 * Simple Animation Utility for Scroll Animations
 * 
 * This utility provides basic scroll-based animations for components.
 * It's a lightweight alternative to AOS (Animate On Scroll) that doesn't
 * require external dependencies.
 * 
 * Usage:
 * 1. Add data-animate="fade-up|fade-in|slide-in" to elements
 * 2. Optionally add data-animate-delay="0.2" (in seconds)
 * 3. Call initAnimations() in your component's client script
 */

// Animation class that will be added to elements when they enter viewport
const ANIMATION_ACTIVE_CLASS = 'animate-active';

// Options for the Intersection Observer
const observerOptions = {
  root: null, // Use the viewport as the root
  rootMargin: '0px', // No margin
  threshold: 0.1 // Trigger when 10% of the element is visible
};

// Store observer instance to prevent multiple observers
let observer: IntersectionObserver | null = null;

/**
 * Initialize animations for elements with data-animate attribute
 */
export function initAnimations() {
  // Only run on the client
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  
  console.log('Initializing animations');

  // Disconnect existing observer if it exists
  if (observer) {
    observer.disconnect();
    observer = null;
  }

  // Get all elements with data-animate attribute
  const animatedElements = document.querySelectorAll('[data-animate]');
  
  if (animatedElements.length === 0) {
    console.log('No animated elements found');
    return;
  }
  
  console.log(`Found ${animatedElements.length} elements to animate`);

  // Create observer
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // If element is in viewport
      if (entry.isIntersecting) {
        const element = entry.target as HTMLElement;
        const delay = element.dataset.animateDelay || '0';
        
        console.log(`Animating element with delay ${delay}s`, element);
        
        // Add animation after delay
        setTimeout(() => {
          element.classList.add(ANIMATION_ACTIVE_CLASS);
        }, parseFloat(delay) * 1000);
        
        // Unobserve after animation is triggered
        observer?.unobserve(element);
      }
    });
  }, observerOptions);

  // Observe all animated elements
  animatedElements.forEach(element => {
    // Reset element state by removing active class
    element.classList.remove(ANIMATION_ACTIVE_CLASS);
    
    // Start observing
    observer?.observe(element);
  });
}

/**
 * Reset animations - useful for view transitions or dynamic content
 */
export function resetAnimations() {
  // Only run on the client
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  
  console.log('Resetting animations');

  // Get all animated elements
  const animatedElements = document.querySelectorAll('[data-animate]');
  
  // Remove animation class
  animatedElements.forEach(element => {
    element.classList.remove(ANIMATION_ACTIVE_CLASS);
  });
  
  // Re-initialize animations
  initAnimations();
}

// Initialize animations when the DOM is loaded
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimations);
  } else {
    // DOM already loaded, run now
    initAnimations();
  }
  
  // Re-initialize on view transitions
  document.addEventListener('astro:after-swap', resetAnimations);
}
