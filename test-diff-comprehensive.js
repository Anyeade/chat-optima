// Comprehensive test for apply-diff issues
const testValidDiff = `<<<<<<< SEARCH
:start_line:10
-------
<nav class="bg-white shadow-sm navbar">
    <div class="container mx-auto px-6 py-3 flex justify-between">
        <a href="#" class="text-3xl font-bold text-blue-600">Tech Startup</a>
        <ul class="flex items-center space-x-4">
            <li><a href="#" class="hover:text-blue-600">Features</a></li>
            <li><a href="#" class="hover:text-blue-600">Pricing</a></li>
            <li><a href="#" class="hover:text-blue-600">About</a></li>
            <li><a href="#" class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">Get Started</a></li>
        </ul>
    </div>
</nav>
=======
<nav class="bg-white shadow-sm navbar">
    <div class="container mx-auto px-6 py-3 flex justify-between">
        <a href="#" class="text-3xl font-bold text-blue-600">Tech Startup</a>
        <!-- Mobile menu button -->
        <button class="md:hidden">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
        </button>
        <ul class="hidden md:flex items-center space-x-4">
            <li><a href="#" class="hover:text-blue-600 transition-colors">Features</a></li>
            <li><a href="#" class="hover:text-blue-600 transition-colors">Pricing</a></li>
            <li><a href="#" class="hover:text-blue-600 transition-colors">About</a></li>
            <li><a href="#" class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors">Get Started</a></li>
        </ul>
    </div>
</nav>
>>>>>>> REPLACE`;

// Test cases that commonly fail
const testIncompleteSearch = `<<<<<<< SEARCH
<nav class="bg-white shadow-sm navbar">
    <div class="container mx-auto px-6 py-3 flex justify-between">`;

const testMissingEquals = `<<<<<<< SEARCH
:start_line:10
-------
<nav class="old">
<nav class="new">
>>>>>>> REPLACE`;

const testMissingReplace = `<<<<<<< SEARCH
:start_line:10
-------
<nav class="old">
=======
<nav class="new">`;

function validateDiffFormat(diff) {
    console.log('\n🔍 Validating diff format...');
    
    const hasSearchMarker = diff.includes('<<<<<<< SEARCH');
    const hasReplaceMarker = diff.includes('>>>>>>> REPLACE');
    const hasEquals = diff.includes('=======');
    const hasLineNumber = diff.includes(':start_line:');
    const hasSeparator = diff.includes('-------');
    
    console.log(`- <<<<<<< SEARCH marker: ${hasSearchMarker ? '✅' : '❌'}`);
    console.log(`- >>>>>>> REPLACE marker: ${hasReplaceMarker ? '✅' : '❌'}`);
    console.log(`- ======= separator: ${hasEquals ? '✅' : '❌'}`);
    console.log(`- :start_line: indicator: ${hasLineNumber ? '✅' : '❌'}`);
    console.log(`- ------- separator: ${hasSeparator ? '✅' : '❌'}`);
    
    const isValid = hasSearchMarker && hasReplaceMarker && hasEquals;
    console.log(`\n🎯 Overall validity: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    
    if (!isValid) {
        console.log('\n💡 COMMON FIXES:');
        if (!hasSearchMarker) console.log('   - Add "<<<<<<< SEARCH" at the beginning');
        if (!hasEquals) console.log('   - Add "=======" between search and replace sections');
        if (!hasReplaceMarker) console.log('   - Add ">>>>>>> REPLACE" at the end');
        if (!hasLineNumber) console.log('   - Consider adding ":start_line:X" for line-based matching');
        if (!hasSeparator) console.log('   - Add "-------" after line number');
    }
    
    return isValid;
}

function testRegexParsing(diff) {
    console.log('\n🧪 Testing regex parsing...');
    
    const patterns = [
        /<<<<<<< SEARCH\s*\n([\s\S]*?)\n\s*=======\s*\n([\s\S]*?)\n\s*>>>>>>> REPLACE/g,
        /<<<<<<< SEARCH\n([\s\S]*?)\n=======\n([\s\S]*?)\n>>>>>>> REPLACE/g,
        /<{7} SEARCH\s*\n([\s\S]*?)\n={7}\s*\n([\s\S]*?)\n>{7} REPLACE/g
    ];
    
    for (let i = 0; i < patterns.length; i++) {
        const pattern = patterns[i];
        const matches = [...diff.matchAll(pattern)];
        console.log(`Pattern ${i + 1}: ${matches.length} matches found`);
        
        if (matches.length > 0) {
            const match = matches[0];
            const searchSection = match[1].trim();
            const replaceSection = match[2].trim();
            
            console.log(`  - Search section: ${searchSection.substring(0, 50)}...`);
            console.log(`  - Replace section: ${replaceSection.substring(0, 50)}...`);
            
            // Check for line number
            const lineMatch = searchSection.match(/^:start_line:\s*(\d+)\s*\n\s*-+\s*\n([\s\S]*)/);
            if (lineMatch) {
                console.log(`  - Line number found: ${lineMatch[1]}`);
                console.log(`  - Content after separator: ${lineMatch[2].substring(0, 30)}...`);
            }
        }
    }
}

console.log('🚀 Comprehensive Apply-Diff Test Suite');
console.log('=====================================');

console.log('\n1️⃣ Testing VALID diff:');
validateDiffFormat(testValidDiff);
testRegexParsing(testValidDiff);

console.log('\n2️⃣ Testing INCOMPLETE SEARCH:');
validateDiffFormat(testIncompleteSearch);

console.log('\n3️⃣ Testing MISSING EQUALS:');
validateDiffFormat(testMissingEquals);

console.log('\n4️⃣ Testing MISSING REPLACE:');
validateDiffFormat(testMissingReplace);

console.log('\n✅ Test suite completed!');
console.log('\n📋 SUMMARY:');
console.log('- Valid diff should pass all checks');
console.log('- Incomplete diffs should show specific missing components');
console.log('- Regex parsing should find matches for valid diffs only');
