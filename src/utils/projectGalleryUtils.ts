import type { JSONCanvas } from '../types/json-canvas';
import { parseJSONCanvas, transformCoordinates } from './jsonCanvasUtils';
import { existsSync } from 'fs';
import { readFile as readFileAsync } from 'fs/promises';
import { resolve as pathResolve } from 'path';
import { contentBasePath } from './envUtils.js';
import galleryConfig from '../config/project-gallery.json';
import { getReferenceSlug } from './slugify';

export interface ProjectConfig {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  hasSidebar: boolean;
  canvas?: string;
  useCases: Array<{
    title: string;
    description: string;
  }>;
  demoSteps: Array<{
    title: string;
    href: string;
    type: 'orientation' | 'sequential';
    description?: string;
    step?: number;
    contentPath?: string;
  }>;
}

export interface GalleryConfig {
  projects: Record<string, ProjectConfig>;
}

// Load project gallery configuration
export function loadGalleryConfig(): GalleryConfig {
  return galleryConfig;
}

// Generate static paths for all projects
export function generateStaticPaths() {
  const config = loadGalleryConfig();
  const paths: Array<{ params: { slug: string }; props: any }> = [];

  // Add index path
  paths.push({
    params: { slug: 'index' },
    props: {
      step: null,
      demoSteps: null,
      projectTitle: 'Project Gallery'
    }
  });

  // Generate paths for each project's demo steps
  Object.values(config.projects).forEach(project => {
    project.demoSteps.forEach(step => {
      // Convert href to slug path
      let slugPath: string;
      
      if (step.href.startsWith('/projects/gallery/')) {
        // Remove /projects/gallery/ prefix
        slugPath = step.href.replace('/projects/gallery/', '');
      } else if (step.href.startsWith('/projects/')) {
        // For non-gallery projects, use the full path
        slugPath = step.href.replace('/projects/', '');
      } else {
        slugPath = step.href;
      }
      
      paths.push({
        params: { slug: slugPath },
        props: {
          step,
          demoSteps: project.demoSteps,
          projectTitle: project.title,
          projectId: project.id
        }
      });
    });
  });

  return paths;
}

// Find project by slug
export function findProjectBySlug(slug: string): { project: ProjectConfig; step: any } | null {
  const config = loadGalleryConfig();
  
  // Handle index
  if (slug === 'index') {
    return null;
  }
  
  // Find the project and step that matches this slug
  for (const project of Object.values(config.projects)) {
    for (const step of project.demoSteps) {
      let stepSlug: string;
      
      if (step.href.startsWith('/projects/gallery/')) {
        stepSlug = step.href.replace('/projects/gallery/', '');
      } else if (step.href.startsWith('/projects/')) {
        stepSlug = step.href.replace('/projects/', '');
      } else {
        stepSlug = step.href;
      }
      
      if (stepSlug === slug) {
        return { project, step };
      }
    }
  }
  
  console.log(`[GALLERY] No project found for slug:`, slug);
  return null;
}

// Export getReferenceSlug for use in other files
export { getReferenceSlug };

// Process canvas data with file content loading
export async function processCanvasData(canvasRaw: string): Promise<JSONCanvas | null> {
  if (!canvasRaw) return null;
  
  try {
    const parsedCanvas = parseJSONCanvas(canvasRaw);
    if (parsedCanvas.canvas) {
      const transformedCanvas = transformCoordinates(parsedCanvas.canvas);
      
      // Load file contents for file nodes
      if (transformedCanvas.nodes) {
        for (const node of transformedCanvas.nodes) {
          if (node.type === 'file' && node.file) {
            try {
              const filePath = pathResolve(contentBasePath, node.file);
              
              if (existsSync(filePath)) {
                const fileContent = await readFileAsync(filePath, 'utf-8');
                
                const frontmatterMatch = fileContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
                if (frontmatterMatch) {
                  const [, frontmatter, content] = frontmatterMatch;
                  (node as any).frontmatter = frontmatter.trim();
                  (node as any).fileContent = content;
                } else {
                  (node as any).fileContent = fileContent;
                  (node as any).frontmatter = null;
                }
              } else {
                (node as any).fileContent = `File not found: ${node.file}\nLooked in: ${filePath}`;
                (node as any).frontmatter = null;
              }
            } catch (fileError) {
              (node as any).fileContent = `Error reading file: ${node.file}\n${fileError}`;
              (node as any).frontmatter = null;
            }
          }
        }
      }
      
      return transformedCanvas;
    }
  } catch (error) {
    console.error('Failed to parse canvas data:', error);
  }
  
  return null;
}
