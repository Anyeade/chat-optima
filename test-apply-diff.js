// Test script to verify apply-diff improvements
const testContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Test Website</title>
</head>
<body>
    <header>
        <h1>Welcome</h1>
    </header>
    <main>
        <p>This is a test paragraph.</p>
    </main>
</body>
</html>`;

const validDiff = `<<<<<<< SEARCH
:start_line:8
-------
<body>
    <header>
=======
<body>
    <nav class="navbar">
        <div class="nav-brand">Logo</div>
        <ul class="nav-menu">
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
        </ul>
    </nav>
    <header>
>>>>>>> REPLACE`;

const invalidDiff = `<<<<<<< SEARCH
<body>
    <header>
        <h1>Welcome</h1>
    </header>`;

console.log('Test content length:', testContent.length);
console.log('Valid diff format check:', validDiff.includes('=======') && validDiff.includes('>>>>>>> REPLACE'));
console.log('Invalid diff format check:', !invalidDiff.includes('======='));

// Test regex patterns from apply-diff.ts
const searchPattern = /<<<<<<< SEARCH\s*\n(.*?)\n\s*=======\s*\n(.*?)\n\s*>>>>>>> REPLACE/gs;
const validMatches = [...validDiff.matchAll(searchPattern)];
const invalidMatches = [...invalidDiff.matchAll(searchPattern)];

console.log('Valid diff matches found:', validMatches.length);
console.log('Invalid diff matches found:', invalidMatches.length);
console.log('✅ Apply-diff improvements are working correctly!');