import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load .env file first, before anything else
const envPath = path.resolve(process.cwd(), '.env');
const envFileExists = fs.existsSync(envPath);

// Define interface for environment variables
interface EnvVars {
  NODE_ENV: 'development' | 'production' | 'test';
  APP_ENV: string;
  DEPLOY_ENV: 'LocalSiteOnly' | 'LocalMonorepo' | 'Vercel' | 'Railway' | string;
  DEBUG_AST?: string;
  DEBUG_ARTICLE?: string;
  DEBUG_CITATIONS?: string;
  DEBUG_BACKLINKS?: string;
  DEBUG_TOOLING?: string;
  DEBUG_TOC?: string;
  [key: string]: string | undefined;
}

// Initialize with current env vars
const envVars: EnvVars = { ...process.env } as EnvVars;

// Load .env file if it exists
if (envFileExists) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  Object.assign(envVars, envConfig);
}

// Set NODE_ENV if not already set
envVars.NODE_ENV = (envVars.NODE_ENV || 'development') as EnvVars['NODE_ENV'];

// Set APP_ENV to match NODE_ENV if not explicitly set
envVars.APP_ENV = envVars.APP_ENV || envVars.NODE_ENV;

// Set default DEPLOY_ENV if not set
envVars.DEPLOY_ENV = envVars.DEPLOY_ENV || 'LocalSiteOnly';

// Update process.env with our final values
Object.assign(process.env, envVars);

/**
 * Determine content path based on DEPLOY_ENV
 */
const getContentBasePath = (): string => {
  const cwd = process.cwd();
  let contentPath: string;

  switch (process.env.DEPLOY_ENV) {
    case 'LocalSiteOnly':
      contentPath = path.resolve(cwd, 'src/generated-content');
      break;
    case 'LocalMonorepo':
      contentPath = path.resolve(cwd, '..', 'content');
      break;
    case 'Vercel':
      contentPath = path.resolve(cwd, 'src/generated-content');
      break;
    case 'Railway':
      contentPath = '/lossless-monorepo/content';
      break;
    default:
      contentPath = path.resolve(cwd, 'src/generated-content');
  }

  // Ensure the directory exists
  if (!fs.existsSync(contentPath)) {
    console.warn(`Content directory does not exist: ${contentPath}`);
  } else if (process.env.DEBUG_BACKLINKS) {
    console.log(`Using content directory: ${contentPath}`);
  }

  return contentPath;
};

/**
 * Convert string to boolean
 */
const toBool = (val: string | undefined): boolean => 
  val !== undefined && (val === 'true' || val === '1' || val === '');

// Export environment variables
export const NODE_ENV = envVars.NODE_ENV;
export const APP_ENV = envVars.APP_ENV;
export const DEPLOY_ENV = envVars.DEPLOY_ENV;

export const isProduction = NODE_ENV === 'production';
export const isDevelopment = !isProduction;

export const contentBasePath = getContentBasePath();

export const DEBUG_AST = toBool(envVars.DEBUG_AST);
export const DEBUG_ARTICLE = toBool(envVars.DEBUG_ARTICLE);
export const DEBUG_CITATIONS = toBool(envVars.DEBUG_CITATIONS);
export const DEBUG_BACKLINKS = toBool(envVars.DEBUG_BACKLINKS);
export const DEBUG_TOOLING = toBool(envVars.DEBUG_TOOLING);
export const DEBUG_TOC = toBool(envVars.DEBUG_TOC);

// Log environment configuration if in debug mode
if (isDevelopment || DEBUG_BACKLINKS) {
  console.log('Environment Configuration:', {
    NODE_ENV,
    APP_ENV,
    DEPLOY_ENV,
    isProduction,
    isDevelopment,
    contentBasePath,
    DEBUG_AST,
    DEBUG_ARTICLE,
    DEBUG_CITATIONS,
    DEBUG_BACKLINKS,
    DEBUG_TOOLING,
    DEBUG_TOC,
    envFile: envFileExists ? envPath : 'Not found',
    cwd: process.cwd()
  });
}

// Export all environment variables as a typed object
export const env = {
  NODE_ENV,
  APP_ENV,
  DEPLOY_ENV,
  isProduction,
  isDevelopment,
  contentBasePath,
  DEBUG_AST,
  DEBUG_ARTICLE,
  DEBUG_CITATIONS,
  DEBUG_BACKLINKS,
  DEBUG_TOOLING,
  DEBUG_TOC,
  // Add other environment variables as needed
} as const;
