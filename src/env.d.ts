/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  // Core environment
  readonly NODE_ENV: 'development' | 'production' | 'test';
  
  // Debug flags
  readonly DEBUG_AST: string;
  readonly PUBLIC_DEBUG_AST: string;
  readonly DEBUG_MARKDOWN: string;
  readonly DEBUG_MARKDOWN_VERBOSE: string;
  readonly DEBUG_CITATIONS: string;
  readonly DEBUG_CITATIONS_VERBOSE: string;
  
  // Database
  readonly TURSO_DB_URL: string;
  readonly ASTRO_DB_REMOTE_URL: string;
  
  // ImageKit
  readonly IMAGEKIT_PUBLIC_KEY: string;
  readonly IMAGEKIT_PRIVATE_KEY: string;
  
  // Railway (optional)
  readonly RAILWAY_ENVIRONMENT?: string;
  readonly RAILWAY_ENV?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace NodeJS {
  interface ProcessEnv extends ImportMetaEnv {}
}

// Export the types for use in your application
export {};
