// site/src/types/article.ts
// Defines the shared structure for article data used across components.

export interface ArticleData {
  id?: string;
  title?: string;
  slug?: string; 
  banner_image?: string;
  portrait_image?: string;
  imageAlt?: string;
  date?: string; // us.astro and other transformers ensure this is a string
  lede?: string;
  tags?: string[];
  authors?: string[];
  categories?: string[];
  imgWidth?: number | string;
  imgHeight?: number | string;
  class?: string; // Optional class for the PostCardBare component itself
  [key: string]: any; // Allows for other passthrough attributes not explicitly defined
}
