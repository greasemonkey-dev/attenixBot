const { initiateProcess } = require('./attenixClient/login.js');
const puppeteer = require('puppeteer');
const { clickPunchInLink } = require('./attenixClient/punch.js');

// Define credentials - replace these with actual credentials if needed
const username = "2222";  // Using the test username from login.js
const password = "123456"; // Using the test password from login.js

console.log("Starting punch-out process...");
console.log(`Using credentials: ${username} / ${'*'.repeat(password.length)}`);

async function runPunchOut() {
  let browser;
  let page;

  try {
    console.log("Launching browser...");
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized']
    });
    
    page = await browser.newPage();
    page.setDefaultTimeout(60000);
    
    console.log("Navigating to login page...");
    await page.goto("https://cloud.ovdimnet.com", { waitUntil: "networkidle2", timeout: 60000 });
    
    console.log("Entering credentials...");
    await page.type('input[name="email"]', username);
    await page.type('input[name="password"]', password);
    await page.waitForTimeout(3000);
    
    console.log("Clicking login button...");
    await page.click("#image1");
    
    console.log("Waiting for navigation after login...");
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(e => {
      console.log("Navigation timeout, but continuing anyway:", e.message);
    });
    
    // Take screenshot after login
    await page.screenshot({ path: 'after-login-punchout.png' });
    await page.waitForTimeout(5000);
    
    console.log("Proceeding to punch-out process...");
    // The key difference is that we pass 'out' instead of 'in' for the action type
    await clickPunchInLink(page, 'out');
    
    console.log("Punch-out process completed.");
    
  } catch (error) {
    console.error("Error during punch-out process:", error);
  } finally {
    console.log("Cleaning up...");
    // Add a delay before closing to see the final state
    await page.waitForTimeout(5000);
    if (page) await page.close();
    if (browser) await browser.close();
    console.log("Browser closed.");
  }
}

runPunchOut()
  .then(() => {
    console.log("Punch-out process completed successfully!");
  })
  .catch(error => {
    console.error("Error during punch-out process:", error);
  }); 