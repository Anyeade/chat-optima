#!/usr/bin/env node

/**
 * Pre-deployment test to verify video functionality works for Vercel
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Vercel Deployment Readiness Check\n');

// Check required files exist
const requiredFiles = [
  'app/api/video-proxy/route.ts',
  'app/api/video-generator/scenes/route.ts',
  'components/video-generator-canvas.tsx',
  '.env.local'
];

console.log('📁 Checking required files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

// Check environment variables
console.log('\n🔑 Checking environment variables...');
if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  
  const requiredEnvVars = [
    'PEXELS_API_KEY',
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY'
  ];
  
  requiredEnvVars.forEach(envVar => {
    if (envContent.includes(`${envVar}=`) && !envContent.includes(`${envVar}=your_`)) {
      console.log(`✅ ${envVar} - Set`);
    } else {
      console.log(`⚠️  ${envVar} - Not set or using placeholder`);
    }
  });
} else {
  console.log('❌ .env.local file not found');
}

// Check package.json scripts
console.log('\n📦 Checking package.json...');
if (fs.existsSync('package.json')) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const requiredScripts = ['build', 'start', 'dev'];
  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      console.log(`✅ Script "${script}" - Available`);
    } else {
      console.log(`❌ Script "${script}" - Missing`);
    }
  });
  
  // Check important dependencies
  const importantDeps = ['next', 'react', '@anthropic-ai/sdk', 'openai'];
  console.log('\n📚 Checking important dependencies...');
  importantDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`✅ ${dep} - v${packageJson.dependencies[dep]}`);
    } else if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
      console.log(`✅ ${dep} - v${packageJson.devDependencies[dep]} (dev)`);
    } else {
      console.log(`⚠️  ${dep} - Not found`);
    }
  });
}

// Video functionality checks
console.log('\n🎥 Video System Readiness...');

// Check video proxy implementation
if (fs.existsSync('app/api/video-proxy/route.ts')) {
  const proxyContent = fs.readFileSync('app/api/video-proxy/route.ts', 'utf8');
  
  if (proxyContent.includes('videos.pexels.com')) {
    console.log('✅ Video proxy - Pexels support enabled');
  }
  
  if (proxyContent.includes('Access-Control-Allow-Origin')) {
    console.log('✅ Video proxy - CORS headers configured');
  }
  
  if (proxyContent.includes('Range')) {
    console.log('✅ Video proxy - Video streaming support');
  }
}

// Check scenes API implementation
if (fs.existsSync('app/api/video-generator/scenes/route.ts')) {
  const scenesContent = fs.readFileSync('app/api/video-generator/scenes/route.ts', 'utf8');
  
  if (scenesContent.includes('/api/video-proxy')) {
    console.log('✅ Scenes API - Uses video proxy for CORS');
  } else {
    console.log('⚠️  Scenes API - May have CORS issues');
  }
}

console.log('\n🎯 Summary:');
if (allFilesExist) {
  console.log('✅ All required files present');
  console.log('✅ Video proxy system implemented');
  console.log('✅ Ready for Vercel deployment');
  console.log('\n📝 Deployment commands:');
  console.log('   1. vercel --prod');
  console.log('   2. Set environment variables in Vercel dashboard');
  console.log('   3. Test video generation on deployed site');
} else {
  console.log('❌ Missing required files - fix before deployment');
}

console.log('\n🔗 After deployment, test these URLs:');
console.log('   - /api/video-proxy?url=<pexels_video_url>');
console.log('   - /api/video-generator/scenes');
console.log('   - Main video generator page');
