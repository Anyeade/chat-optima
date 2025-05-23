// Detailed test script for webpage screenshot
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function testPuppeteerSetup() {
  console.log('===== PUPPETEER SETUP TEST =====');
  console.log('Node.js version:', process.version);
  console.log('OS platform:', process.platform);
  console.log('OS release:', os.release());
  
  // Get puppeteer version
  const puppeteerVersion = require('puppeteer/package.json').version;
  console.log('Puppeteer version:', puppeteerVersion);
  
  // Check for Chrome executable
  try {
    const browserFetcher = puppeteer.createBrowserFetcher();
    const revInfo = await browserFetcher.download('latest');
    console.log('Chrome executable found at:', revInfo.executablePath);
    console.log('Chrome revision:', revInfo.revision);
  } catch (error) {
    console.error('Error checking Chrome executable:', error);
  }
  
  // Test browser launch
  let browser;
  try {
    console.log('Attempting to launch browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ],
      ignoreHTTPSErrors: true
    });
    console.log('Browser launched successfully!');
    
    // Get browser version
    const version = await browser.version();
    console.log('Browser version:', version);
    
    // Test page creation
    const page = await browser.newPage();
    console.log('New page created successfully!');
    
    // Test simple navigation
    await page.goto('https://example.com', { waitUntil: 'networkidle2' });
    console.log('Navigation to example.com successful!');
    
    // Test screenshot
    const screenshotPath = path.join(os.tmpdir(), 'test-screenshot.png');
    await page.screenshot({ path: screenshotPath });
    console.log('Screenshot saved to:', screenshotPath);
    
    if (fs.existsSync(screenshotPath)) {
      const stats = fs.statSync(screenshotPath);
      console.log('Screenshot file size:', stats.size, 'bytes');
      console.log('Screenshot created successfully!');
    } else {
      console.error('Screenshot file not found!');
    }
  } catch (error) {
    console.error('Error during browser test:', error);
  } finally {
    if (browser) {
      await browser.close();
      console.log('Browser closed successfully!');
    }
  }
  
  console.log('===== TEST COMPLETE =====');
}

// Run the test
testPuppeteerSetup()
  .then(() => console.log('All tests completed!'))
  .catch(error => console.error('Test failed:', error));
