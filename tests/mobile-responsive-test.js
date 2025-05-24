// Mobile responsive testing script
// This script helps test mobile responsiveness using Playwright
const { chromium, devices } = require('playwright');
const iPhone = devices['iPhone 13 Pro'];
const iPad = devices['iPad Pro 11'];

(async () => {
  console.log('🔍 Starting mobile responsiveness tests');
  
  // Launch browser 
  const browser = await chromium.launch({ headless: false });
  console.log('🌐 Browser launched');
  
  try {
    // Test on iPhone
    console.log('📱 Testing on iPhone device');
    const iPhoneContext = await browser.newContext({
      ...iPhone,
      permissions: ['clipboard-read']
    });
    const iPhonePage = await iPhoneContext.newPage();
    await testDeviceResponsiveness(iPhonePage, 'iPhone');
    
    // Test on iPad
    console.log('📱 Testing on iPad device');
    const iPadContext = await browser.newContext({
      ...iPad,
      permissions: ['clipboard-read']
    });
    const iPadPage = await iPadContext.newPage();
    await testDeviceResponsiveness(iPadPage, 'iPad');
    
  } finally {
    await browser.close();
    console.log('✅ Tests completed');
  }
})().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});

async function testDeviceResponsiveness(page, deviceName) {
  console.log(`⏳ Loading page on ${deviceName}...`);
  await page.goto('http://localhost:3000');
  
  // Login if needed
  if (await page.getByText('Login').isVisible()) {
    console.log('🔑 Logging in...');
    // Add login steps here
  }
  
  // Test document preview
  console.log('📄 Testing document preview responsiveness');
  try {
    // Wait for documents to load
    await page.waitForSelector('.rounded-t-2xl', { timeout: 5000 });
    await page.screenshot({ path: `${deviceName}-document-preview.png` });
    
    // Test scrolling behavior
    console.log('⏬ Testing scrolling behavior');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.wait(500);
    await page.evaluate(() => window.scrollTo(0, 0));
    
    // Test code block copy functionality
    console.log('📋 Testing code block copy button');
    const codeBlock = await page.locator('pre code').first();
    if (await codeBlock.isVisible()) {
      await codeBlock.hover();
      const copyButton = await page.getByRole('button', { name: 'Copy code' });
      
      if (await copyButton.isVisible()) {
        await copyButton.click();
        console.log('✅ Copy button clicked successfully');
      } else {
        console.log('⚠️ Copy button not visible on hover');
      }
    } else {
      console.log('⚠️ No code blocks found to test copy functionality');
    }
    
    // Take a screenshot of the final state
    console.log('📸 Taking screenshot');
    await page.screenshot({ path: `${deviceName}-full-page.png` });
    
  } catch (error) {
    console.error(`❌ Error testing on ${deviceName}:`, error);
    await page.screenshot({ path: `${deviceName}-error-state.png` });
  }
}
