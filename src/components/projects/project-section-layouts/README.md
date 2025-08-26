# StorySidebarTree__VariantB - Hierarchical Navigation Component

This component provides a hierarchical navigation system for project galleries with support for parent-child relationships.

## Features

### Step Types
- **`orientation`**: Overview/introduction steps (displayed first)
- **`sequential`**: Workflow steps with numbered progression
- **`child`**: Sub-steps that belong to a parent sequential step

### Hierarchy Support
The component now supports hierarchical navigation with child steps:

```json
{
  "title": "Documentation Kit",
  "href": "/projects/gallery/ace-it/docs-kit/living-specifications",
  "type": "sequential",
  "step": 2,
  "contentPath": "ACE-It/Docs-Kit/Living-Specifications.md",
  "children": {
    "title": "Blueprints",
    "href": "/projects/gallery/ace-it/docs-kit/blueprints",
    "type": "child",
    "step": 1,
    "contentPath": "ACE-It/Docs-Kit/Blueprints.md"
  }
}
```

### Visual Hierarchy
- **Parent steps**: Full styling with numbered chips
- **Child steps**: Indented with smaller chips and lighter styling
- **Active states**: Bracket accents and highlighting for current page
- **Breadcrumbs**: Dynamic breadcrumb showing current position

### Styling Classes
- `.tree-link--orientation`: Overview step styling
- `.tree-link--sequential`: Main workflow step styling  
- `.tree-link--child`: Child step styling (smaller, indented)
- `.tree-branch--children`: Container for child steps
- `.chip--child`: Smaller chip styling for child steps

### Configuration
Child steps are defined in `project-gallery.json` under the `children` property of sequential steps. The system automatically:

1. Generates static paths for child steps
2. Handles routing and content loading
3. Updates breadcrumbs to show child step titles
4. Applies appropriate styling and active states

### Fallback Behavior
If no explicit step types are defined, the component falls back to:
- First item as orientation
- Remaining items as sequential
- Children are still supported in fallback mode

## Usage

The component is used in `[...slug].astro` and automatically handles:
- Content loading from the projects collection
- Navigation state management
- Responsive design
- Accessibility features
