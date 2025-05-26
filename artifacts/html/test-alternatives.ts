import { diagnoseHtmlUpdate, logDiagnostics } from './diagnostics';
import { getUpdateConfig } from './update-config';

// Sample HTML content for testing
const sampleHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Sample Website</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <header>
        <h1>Welcome to My Website</h1>
        <nav>
            <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>
    
    <main>
        <section id="home">
            <h2>Home Section</h2>
            <p>This is the home section content.</p>
        </section>
        
        <section id="about">
            <h2>About Section</h2>
            <p>This is the about section content.</p>
        </section>
    </main>
    
    <footer>
        <p>&copy; 2024 My Website. All rights reserved.</p>
    </footer>
</body>
</html>
`;

// Test scenarios
const testScenarios = [
  {
    name: 'Simple Title Change',
    description: 'Change the title to "My Awesome Website"',
    expectedMethod: 'regex'
  },
  {
    name: 'Smart Update Request',
    description: 'Smart update: change the footer text to include current year',
    expectedMethod: 'smart'
  },
  {
    name: 'Simple Text Replace',
    description: 'Replace "Welcome to My Website" with "Hello World"',
    expectedMethod: 'string'
  },
  {
    name: 'Section Addition',
    description: 'Add a new contact section with a contact form',
    expectedMethod: 'template'
  },
  {
    name: 'Complex Restructure',
    description: 'Reorganize the layout to have a sidebar and restructure the navigation',
    expectedMethod: 'diff'
  },
  {
    name: 'Header Modification',
    description: 'Update the header to include a logo and change the navigation style',
    expectedMethod: 'regex'
  }
];

// Function to test diagnostics
export function testDiagnostics() {
  console.log('Testing HTML Update Diagnostics\n');
  
  testScenarios.forEach((scenario, index) => {
    console.log(`\n--- Test ${index + 1}: ${scenario.name} ---`);
    
    const result = diagnoseHtmlUpdate(sampleHtml, scenario.description);
    logDiagnostics(result, scenario.description);
    
    console.log(`Expected method: ${scenario.expectedMethod}`);
    console.log(`Recommended method: ${result.updateAnalysis.recommendedMethod}`);
    
    const match = result.updateAnalysis.recommendedMethod === scenario.expectedMethod;
    console.log(`Method prediction: ${match ? '✅ CORRECT' : '❌ INCORRECT'}`);
  });
}

// Function to test configurations
export function testConfigurations() {
  console.log('\n\nTesting Update Configurations\n');
  
  const configs = ['performance', 'reliability', 'advanced', 'debug'] as const;
  
  configs.forEach(configName => {
    console.log(`\n--- ${configName.toUpperCase()} Configuration ---`);
    const config = getUpdateConfig(configName);
    console.log('Primary method:', config.primaryMethod);
    console.log('Fallback methods:', config.fallbackMethods.join(', '));
    console.log('Debug enabled:', config.enableDebug);
    console.log('Max content size:', config.maxContentSizeForSmartUpdate, 'bytes');
  });
}

// Function to demonstrate method selection logic
export function demonstrateMethodSelection() {
  console.log('\n\nDemonstrating Method Selection Logic\n');
  
  const examples = [
    {
      content: '<html><body><h1>Simple</h1></body></html>',
      description: 'Change title',
      expected: 'Should use regex for title changes'
    },
    {
      content: sampleHtml,
      description: 'smart update: modify footer',
      expected: 'Should use smart update when explicitly requested'
    },
    {
      content: sampleHtml.repeat(10), // Large content
      description: 'Change a small text',
      expected: 'Should use string manipulation for large content with small changes'
    },
    {
      content: sampleHtml,
      description: 'Add new section with complex layout',
      expected: 'Should use template-based for structural changes'
    }
  ];
  
  examples.forEach((example, index) => {
    console.log(`\n--- Example ${index + 1} ---`);
    console.log('Description:', example.description);
    console.log('Content size:', example.content.length, 'bytes');
    
    const result = diagnoseHtmlUpdate(example.content, example.description);
    console.log('Recommended method:', result.updateAnalysis.recommendedMethod);
    console.log('Expected:', example.expected);
    
    if (result.potentialIssues.length > 0) {
      console.log('Issues:', result.potentialIssues.join(', '));
    }
  });
}

// Main test function
export function runAllTests() {
  console.log('🧪 HTML Update Alternative Methods Testing\n');
  console.log('==========================================\n');
  
  testDiagnostics();
  testConfigurations();
  demonstrateMethodSelection();
  
  console.log('\n\n✅ All tests completed!');
  console.log('\nTo use these methods in your application:');
  console.log('1. Import the enhanced HTML document handler');
  console.log('2. Configure your preferred update method');
  console.log('3. Use diagnostics to troubleshoot issues');
  console.log('4. Monitor console logs for debugging information');
}

// Export for use in other files
export { sampleHtml, testScenarios };

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
} 