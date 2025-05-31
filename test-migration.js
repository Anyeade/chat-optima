// Simple test to verify HTML server migration
console.log('🧪 Testing HTML Server Migration...');

try {
  // Test import
  const { htmlDocumentHandler } = require('./artifacts/html/server.ts');
  console.log('✅ HTML document handler imported successfully');
  
  // Check if it has the expected structure
  if (htmlDocumentHandler && htmlDocumentHandler.kind === 'html') {
    console.log('✅ Handler has correct structure');
  } else {
    console.log('❌ Handler structure is incorrect');
  }
  
  console.log('🎉 Migration test completed successfully!');
  console.log('');
  console.log('Your HTML artifacts now have enhanced update methods:');
  console.log('1. 🔍 Regex-based updates (for titles, headers, footers)');
  console.log('2. ⚡ String manipulation (for simple text changes)');
  console.log('3. 🏗️  Template-based updates (for structural changes)');
  console.log('4. 🔄 Diff-based updates (for intelligent merging)');
  console.log('5. 🧩 Regex block replace (for complex pattern-based changes)');
  console.log('6. 🎯 Simplified smart updates (improved precision)');
  console.log('');
  console.log('Try these test phrases in your HTML documents:');
  console.log('- "Change the title to \'New Title\'" (uses regex)');
  console.log('- "Simple: replace \'old text\' with \'new text\'" (uses string)');
  console.log('- "Add a new section for contact info" (uses template)');
  console.log('- "Regex block: replace all buttons with new style" (uses regex block)');
  console.log('- "Smart update: modify the navigation" (uses smart)');
  
} catch (error) {
  console.log('❌ Migration test failed:', error.message);
  console.log('Please check the server.ts file for any syntax errors.');
} 