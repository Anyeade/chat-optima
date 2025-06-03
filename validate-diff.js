#!/usr/bin/env node

// Quick diff validation tool
// Usage: node validate-diff.js "your diff content here"

const diff = process.argv[2];

if (!diff) {
  console.log('❌ Usage: node validate-diff.js "your diff content"');
  process.exit(1);
}

function validateDiff(diffContent) {
  console.log('🔍 Validating diff format...\n');
  
  const checks = {
    hasSearchMarker: diffContent.includes('<<<<<<< SEARCH'),
    hasReplaceMarker: diffContent.includes('>>>>>>> REPLACE'),
    hasEquals: diffContent.includes('======='),
    hasLineNumber: diffContent.includes(':start_line:'),
    hasSeparator: diffContent.includes('-------')
  };
  
  // Display results
  Object.entries(checks).forEach(([check, passed]) => {
    const icon = passed ? '✅' : '❌';
    const description = {
      hasSearchMarker: '<<<<<<< SEARCH marker',
      hasReplaceMarker: '>>>>>>> REPLACE marker', 
      hasEquals: '======= separator',
      hasLineNumber: ':start_line: indicator',
      hasSeparator: '------- separator'
    }[check];
    
    console.log(`${icon} ${description}`);
  });
  
  const isValid = checks.hasSearchMarker && checks.hasReplaceMarker && checks.hasEquals;
  
  console.log(`\n🎯 Overall: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
  
  if (!isValid) {
    console.log('\n💡 Quick fixes:');
    if (!checks.hasSearchMarker) console.log('   • Add: <<<<<<< SEARCH');
    if (!checks.hasEquals) console.log('   • Add: =======');
    if (!checks.hasReplaceMarker) console.log('   • Add: >>>>>>> REPLACE');
    
    console.log('\n📋 Example format:');
    console.log('<<<<<<< SEARCH');
    console.log(':start_line:10');
    console.log('-------');
    console.log('<old content>');
    console.log('=======');
    console.log('<new content>');
    console.log('>>>>>>> REPLACE');
  }
  
  return isValid;
}

validateDiff(diff);
