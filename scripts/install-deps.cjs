#!/usr/bin/env node

/**
 * Custom installation script to handle canvas dependency gracefully
 * This script will install all dependencies except canvas on Vercel
 */

const { execSync } = require('child_process');
const fs = require('fs');

const isVercel = process.env.VERCEL || process.env.CI;

try {
  if (isVercel) {
    console.log('Running on Vercel/CI - installing without canvas...');
    execSync('pnpm install --ignore-scripts', { stdio: 'inherit' });
    console.log('✅ Installation completed without canvas');
  } else {
    console.log('Running locally - installing all dependencies...');
    execSync('pnpm install', { stdio: 'inherit' });
  }
} catch (error) {
  console.error('❌ Installation failed:', error.message);
  process.exit(1);
}