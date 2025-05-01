// const { injectAssignmentName } = require("./assignmentsHandler.js");
const puppeteer = require("puppeteer");
const { clickPunchInLink } = require("./punch.js");

async function initiateProcess(username, password) {
  let browser;
  let page;

  try {
    console.log("Launching browser...");
    browser = await puppeteer.launch({ 
      headless: false,
      defaultViewport: null, // Use full viewport
      args: ['--start-maximized'] // Maximize window
    });
    page = await browser.newPage();
    
    // Set a longer default timeout
    page.setDefaultTimeout(60000); // 60 seconds
    
    console.log("Navigating to login page...");
    await page.goto("https://cloud.ovdimnet.com", { waitUntil: "networkidle2", timeout: 60000 });
    console.log("Login page loaded.");
    
    // Take screenshot of login page
    await page.screenshot({ path: 'login-page.png' });
    console.log("Login page screenshot saved.");
    
    console.log("Entering username...");
    await page.type('input[name="email"]', username);
    console.log("Entering password...");
    await page.type('input[name="password"]', password);
    
    console.log("Waiting before clicking login button...");
    await page.waitForTimeout(3000); // Wait longer before clicking
    
    console.log("Clicking login button...");
    await page.click("#image1");
    console.log("Login button clicked.");
    
    // Wait for navigation after login
    console.log("Waiting for navigation after login...");
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(e => {
      console.log("Navigation timeout, but continuing anyway:", e.message);
    });
    
    console.log("Current URL after login:", await page.url());
    
    // Take screenshot after login
    await page.screenshot({ path: 'after-login.png' });
    console.log("After login screenshot saved.");
    
    // Add a longer wait to ensure we're fully logged in
    console.log("Adding additional wait time after login...");
    await page.waitForTimeout(10000);
    
    console.log("Proceeding to punch-in process...");
    await clickPunchInLink(page, 'in');
    
    console.log("Punch-in process completed.");

  } catch (error) {
    console.error("Error during login or punch-in process:", error);
    
    // Capture error state
    if (page) {
      try {
        console.log("Capturing error state...");
        await page.screenshot({ path: 'login-error.png' });
        console.log("Error screenshot saved as login-error.png");
      } catch (screenshotError) {
        console.error("Failed to capture error screenshot:", screenshotError);
      }
    }
    throw error; // Re-throw the error to be caught by the caller
  } finally {
    console.log("Cleaning up...");
    if (page) await page.close();
    if (browser) await browser.close();
    console.log("Browser closed.");
  }
}

// Comment out the direct call to allow for importing without immediate execution
/*
initiateProcess("2222", "123456")
    .then(assignments => {
      console.log("Assignments (using then):", assignments);
      // Optionally, perform further actions on the assignments here
    })
    .catch(error => {
      console.error("Error during process:", error);
    });
*/

// Export the function
module.exports = { initiateProcess };