// Simple test script for webpage screenshot
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function captureScreenshot(url) {
  try {
    console.log(`Capturing screenshot for: ${url}`);
    
    // Create a temporary directory for the screenshot
    const tempDir = path.join(os.tmpdir(), 'test-screenshots');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const screenshotPath = path.join(tempDir, `screenshot-${Date.now()}.png`);
    
    // Launch browser with more robust configuration
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
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
    
    try {
      const page = await browser.newPage();
      
      // Set viewport
      await page.setViewport({
        width: 1024,
        height: 800,
        deviceScaleFactor: 1
      });
      
      // Add user agent to avoid blocking
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Navigate to the URL with timeout and wait until network is idle
      console.log(`Navigating to URL: ${url}`);
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      
      // Wait a bit for any dynamic content to load
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Take screenshot
      console.log('Taking screenshot...');
      const screenshot = await page.screenshot({
        fullPage: true
      });
      
      // Save screenshot to file
      fs.writeFileSync(screenshotPath, screenshot);
      console.log(`Screenshot saved to: ${screenshotPath}`);
      
      // Close the browser
      await browser.close();
      
      return screenshotPath;
    } finally {
      // Ensure browser is closed even if there's an error
      if (browser) {
        await browser.close();
      }
    }
  } catch (error) {
    console.error('Screenshot error:', error);
    return null;
  }
}

// Run the screenshot function with the Vercel API documentation URL
captureScreenshot('https://vercel.com/docs/rest-api/reference/endpoints/access-groups/reads-an-access-group')
  .then(path => {
    if (path) {
      console.log('Screenshot captured successfully at:', path);
    } else {
      console.log('Failed to capture screenshot');
    }
  })
  .catch(err => {
    console.error('Error in main function:', err);
  });
