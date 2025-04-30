// const { injectAssignmentName } = require("./assignmentsHandler.js");
const puppeteer = require("puppeteer");
const { clickPunchInLink } = require("./punch.js");

async function initiateProcess(username, password) {
  let browser;
  let page;

  try {
    browser = await puppeteer.launch({ headless: false });
    page = await browser.newPage();

    // Login process
    await page.goto("https://cloud.ovdimnet.com", { waitUntil: "networkidle2" });
    await page.type('input[name="email"]', username);
    await page.type('input[name="password"]', password);
    await page.waitForTimeout(2000); // Optional: Wait before submitting
    await page.click("#image1");

    // console.log("Login successful, now getting assignments...");

    await clickPunchInLink(page, 'in');
    // Assignment retrieval process (call getAssignmentList and return the result)
   // await injectAssignmentName(page, "TEST 1")
    // const assignments = await getAssignmentList(page);
    // *console.log("Extracted assignments:", assignments);

    // Perform actions after both login and getting assignments
    // console.log("Assignments retrieved, done!");
    // Add your desired actions here (e.g., process assignments)

    // return assignments; // Return the extracted assignments

  } catch (error) {
    console.error("Error during login or getting assignments:", error);
    throw error; // Re-throw the error to be caught by the caller
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
  }
}

// Call the initiateProcess function with credentials and handle the returned assignments
initiateProcess("2222", "123456")
    .then(assignments => {
      console.log("Assignments (using then):", assignments);
      // Optionally, perform further actions on the assignments here
    })
    .catch(error => {
      console.error("Error during process:", error);
    });