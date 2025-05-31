// Test script for our updated webpage-screenshot tool
const { webpageScreenshot } = require('./lib/ai/tools/webpage-screenshot.ts');

// Test with the Vercel API documentation page
async function testScreenshotTool() {
  try {
    console.log('Testing webpage screenshot tool...');
    
    const result = await webpageScreenshot.execute({
      url: 'https://vercel.com/docs/rest-api/reference/endpoints/access-groups/reads-an-access-group',
      width: 1024,
      fullPage: true
    });
    
    console.log('Screenshot captured successfully!');
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error testing screenshot tool:', error);
  }
}

testScreenshotTool();
