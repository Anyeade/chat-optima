const fs = require('fs');
const path = require('path');

const pages = [
  'app/about/page.tsx',
  'app/api/page.tsx', 
  'app/blog/page.tsx',
  'app/careers/page.tsx',
  'app/docs/page.tsx',
  'app/integrations/page.tsx',
  'app/legal/page.tsx',
  'app/roadmap/page.tsx',
  'app/tutorials/page.tsx'
];

const newImports = `import Link from 'next/link';
import AuthAwareNavbar from '@/components/ui/auth-aware-navbar';
import ScrollToTopButton from '@/components/ui/scroll-to-top-button';
import { HeroParticles } from '@/components/particles-background';
import '../landing/landing.css';`;

const newHeader = `    <div className="min-h-screen bg-githubDark font-poppins text-white overflow-hidden">
      {/* Particles Background */}
      <HeroParticles />
      
      {/* Header/Navigation */}
      <AuthAwareNavbar />
      
      {/* Scroll to top button */}
      <ScrollToTopButton />`;

pages.forEach(pagePath => {
  try {
    if (fs.existsSync(pagePath)) {
      let content = fs.readFileSync(pagePath, 'utf8');
      
      // Replace imports
      content = content.replace(/import Link from 'next\/link';/, newImports);
      
      // Replace background and container
      content = content.replace(/bg-\[#0a0a0b\]/g, 'bg-githubDark font-poppins');
      content = content.replace(/overflow-hidden/g, 'overflow-hidden');
      
      // Remove old headers and replace with new structure
      content = content.replace(
        /(\s*<div className="min-h-screen[^>]*>)\s*{\/\* Header \*\/}[\s\S]*?<\/header>/,
        '$1\n      {/* Particles Background */}\n      <HeroParticles />\n      \n      {/* Header/Navigation */}\n      <AuthAwareNavbar />\n      \n      {/* Scroll to top button */}\n      <ScrollToTopButton />'
      );
      
      // Update hero sections to match landing page style
      content = content.replace(
        /<section className="py-20">\s*<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">/g,
        '<section className="relative py-32 overflow-hidden">\n        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">\n          <div className="text-center">'
      );
      
      // Update h1 styling in hero sections
      content = content.replace(
        /<h1 className="text-5xl font-bold mb-6">/g,
        '<h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">'
      );
      
      // Update paragraph styling in hero sections
      content = content.replace(
        /<p className="text-xl text-gray-400 max-w-3xl mx-auto">/g,
        '<p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto">'
      );
      
      // Close the extra div for the hero section
      content = content.replace(
        /(<\/p>\s*<\/div>\s*<\/section>)/g,
        '$1'
      );
      
      fs.writeFileSync(pagePath, content);
      console.log(`✅ Updated ${pagePath}`);
    } else {
      console.log(`❌ File not found: ${pagePath}`);
    }
  } catch (error) {
    console.log(`❌ Error updating ${pagePath}:`, error.message);
  }
});

console.log('\n🎉 All pages updated with consistent styling!');
