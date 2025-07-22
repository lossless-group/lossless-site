---
title: "Sample Reveal.js Presentation"
date: 2025-07-23
description: "A sample presentation demonstrating Reveal.js features"
layout: "../../layouts/Reveal.astro"
revealOptions:
  controls: true
  progress: true
  history: true
  center: true
  transition: 'slide'
  backgroundTransition: 'fade'
  slideNumber: true
  width: 1280
  height: 720
  margin: 0.1
  minScale: 0.2
  maxScale: 2.0
---

# Welcome to Reveal.js
## HTML Presentation Framework

---

## Vertical Slides

Click the down arrow to see vertical slides

--

### This is a vertical slide

--

### And another one

---

## Markdown Support

Write content using **Markdown** syntax
- Point 1
- Point 2
- Point 3

```javascript
// Code highlighting
function hello() {
  console.log('Hello, world!');
}
```

---

## Fragments

Hit the next arrow...

- Item 1 <!-- .element: class="fragment" -->
- Item 2 <!-- .element: class="fragment" -->
- Item 3 <!-- .element: class="fragment" -->

---

## Transitions

Different transition effects

--

### Fade In
<!-- .slide: data-transition="fade" -->

--

### Slide In
<!-- .slide: data-transition="slide" -->

--

### Convex
<!-- .slide: data-transition="convex" -->

---

## Speaker Notes

Press 'S' to open speaker view

<aside class="notes">
  This is a speaker note. Only visible in speaker view.
</aside>

---

## Math Support

Inline math: $E = mc^2$

Block math:

$$
\begin{align}
  \nabla \times \mathbf{B} -\, \frac1c\, \frac{\partial\mathbf{E}}{\partial t} & = \frac{4\pi}{c}\mathbf{j} \\
  \nabla \cdot \mathbf{E} & = 4 \pi \rho \\
\end{align}
$$

---

## The End

Thank you!

<small>Press ESC for overview mode</small>