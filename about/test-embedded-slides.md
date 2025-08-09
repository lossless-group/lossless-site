# Testing Embedded Slides

This is a test document to verify that our embedded slides functionality works correctly.

## Basic Example

Here's a simple embedded presentation:

```slides
- [[essays/my-presentation.md|Introduction to AI]]
- [[essays/deep-learning.md|Deep Learning Fundamentals]]
```

## With Configuration

You can also add configuration options:

```slides
theme: white
transition: fade
controls: true
progress: true

- [[essays/intro.md|Getting Started]]
- [[essays/advanced.md|Advanced Topics]]
```

## Compact Configuration

Configuration can also be written inline:

```slides theme=dark transition=zoom
- [[essays/chapter1.md|Chapter 1]]
- [[essays/chapter2.md|Chapter 2]]
```

## Regular Content

This regular content should appear normally between the embedded presentations.