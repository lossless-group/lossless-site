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

// Export environment variables
export const NODE_ENV = process.env.NODE_ENV;
export const APP_ENV = process.env.APP_ENV;
export const DEPLOY_ENV = process.env.DEPLOY_ENV;
export const isProduction = NODE_ENV === 'production';
export const isDevelopment = !isProduction;
export const contentBasePath = getContentBasePath();

// Log environment info
console.log('Environment Configuration:', {
  NODE_ENV,
  APP_ENV,
  DEPLOY_ENV,
  isProduction,
  isDevelopment,
  contentBasePath,
  resolvedContentPath: path.resolve(contentBasePath),
  envFile: envFileExists ? envPath : 'Not found',
  cwd: process.cwd()
});