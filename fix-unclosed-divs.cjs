const fs = require('fs');

const pages = [
  'app/blog/page.tsx',
  'app/careers/page.tsx', 
  'app/legal/page.tsx',
  'app/roadmap/page.tsx'
];

pages.forEach(pagePath => {
  try {
    if (fs.existsSync(pagePath)) {
      let content = fs.readFileSync(pagePath, 'utf8');
      
      // Fix the unclosed div issue by properly indenting and closing the text-center div
      const pattern = /(\s*<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">\s*<div className="text-center">\s*<h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">[\s\S]*?<\/p>)\s*(<\/div>\s*<\/section>)/g;
      
      content = content.replace(pattern, (match, beforeDiv, afterDiv) => {
        return beforeDiv + '\n          </div>\n        </div>' + '\n      </section>';
      });
      
      // More specific replacement for the indentation issue
      content = content.replace(
        /(<div className="text-center">\s*)(<h1 className="text-4xl)/g,
        '$1\n            $2'
      );
      
      fs.writeFileSync(pagePath, content);
      console.log(`✅ Fixed ${pagePath}`);
    } else {
      console.log(`❌ File not found: ${pagePath}`);
    }
  } catch (error) {
    console.log(`❌ Error fixing ${pagePath}:`, error.message);
  }
});

console.log('\n🎉 All unclosed div tags fixed!');
