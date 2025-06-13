const fs = require('fs');
const path = require('path');

// List of pages to update (excluding ones we already fixed)
const pagesToUpdate = [
  'app/docs/page.tsx',
  'app/blog/page.tsx',
  'app/api/page.tsx',
  'app/careers/page.tsx',
  'app/legal/page.tsx',
  'app/tutorials/page.tsx',
  'app/roadmap/page.tsx',
  'app/integrations/page.tsx',
  'app/profile/page.tsx'
];

// Standard imports to add
const standardImports = `import Link from 'next/link';
import AuthAwareNavbar from '@/components/ui/auth-aware-navbar';
import ScrollToTopButton from '@/components/ui/scroll-to-top-button';
import { HeroParticles } from '@/components/particles-background';
import '../landing/landing.css';`;

// Standard layout structure
const standardLayoutStart = `    <div className="min-h-screen bg-githubDark font-poppins text-white overflow-hidden">
      {/* Particles Background */}
      <HeroParticles />
      
      {/* Header/Navigation */}
      <AuthAwareNavbar />
      
      {/* Scroll to top button */}
      <ScrollToTopButton />`;

pagesToUpdate.forEach(pageFile => {
  const filePath = path.join(__dirname, pageFile);
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace the basic imports with standard imports
    content = content.replace(/import Link from 'next\/link';\s*/, standardImports + '\n');
    
    // Replace the basic div and header with standard layout
    content = content.replace(
      /return \(\s*<div className="min-h-screen bg-\[#0a0a0b\] text-white">\s*{\/\* Header \*\/}\s*<header[^>]*>[\s\S]*?<\/header>/,
      `return (
${standardLayoutStart}`
    );
    
    // Also handle cases where there might be slight variations
    content = content.replace(
      /return \(\s*<div className="min-h-screen bg-\[#[0-9a-f]+\] text-white">\s*{\/\* Header \*\/}[\s\S]*?<\/header>/,
      `return (
${standardLayoutStart}`
    );
    
    // Update any section styling to match the hero sections
    content = content.replace(
      /{\/\* Hero Section \*\/}\s*<section className="py-20">/g,
      `{/* Hero Section */}
      <section className="relative py-32 overflow-hidden">`
    );
    
    content = content.replace(
      /<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">/g,
      '<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"><div className="text-center">'
    );
    
    // Update h1 styling
    content = content.replace(
      /<h1 className="text-5xl font-bold mb-6">/g,
      '<h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">'
    );
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${pageFile}`);
  } else {
    console.log(`File not found: ${pageFile}`);
  }
});

console.log('All pages updated with consistent styling!');
