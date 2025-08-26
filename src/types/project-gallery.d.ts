declare module '@config/project-gallery.json' {
  import { ProjectConfig } from '../utils/projectGalleryUtils';
  
  interface GalleryConfig {
    projects: Record<string, ProjectConfig>;
  }

  const value: GalleryConfig;
  export default value;
}
