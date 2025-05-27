// src/utils/env.js
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load .env file first, before anything else
const envPath = path.resolve(process.cwd(), '.env');
const envFileExists = fs.existsSync(envPath);

// Initialize with current env vars
const envVars = { ...process.env };

// Load .env file if it exists
if (envFileExists) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  Object.assign(envVars, envConfig);
}

// Set NODE_ENV if not already set
envVars.NODE_ENV = envVars.NODE_ENV || 'development';

// Set APP_ENV to match NODE_ENV if not explicitly set
envVars.APP_ENV = envVars.APP_ENV || envVars.NODE_ENV;

// Set default DEPLOY_ENV if not set
envVars.DEPLOY_ENV = envVars.DEPLOY_ENV || 'LocalSiteOnly';

// Update process.env with our final values
Object.assign(process.env, envVars);

// Determine content path based on DEPLOY_ENV
const getContentBasePath = () => {
  const cwd = process.cwd();
  let contentPath;

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

  // Verify the content directory exists
  if (!fs.existsSync(contentPath)) {
    console.warn(`WARNING: Content directory not found at ${contentPath}`);
  } else {
    console.log(`Using content directory: ${contentPath}`);
  }

  return contentPath;
};

const toBool = (val) => typeof val === 'string' && val.toLowerCase() === 'true';

// Export environment variables
export const NODE_ENV = envVars.NODE_ENV;
export const APP_ENV = envVars.APP_ENV;
export const DEPLOY_ENV = envVars.DEPLOY_ENV;
export const isProduction = NODE_ENV === 'production';
export const isDevelopment = !isProduction;
export const contentBasePath = getContentBasePath();
export const DEBUG_AST = toBool(envVars.DEBUG_AST);
export const DEBUG_ARTICLE = toBool(envVars.DEBUG_ARTICLE);
export const DEBUG_CITATIONS = toBool(envVars.DEBUG_CITATIONS)
export const DEBUG_BACKLINKS = toBool(envVars.DEBUG_BACKLINKS)

// Log environment info
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
  resolvedContentPath: path.resolve(contentBasePath),
  envFile: envFileExists ? envPath : 'Not found',
  cwd: process.cwd()
});

