import puppeteer from "puppeteer";

export async function getAssignmentList(page) {
  try {
    // Navigate to the assignments page (if needed)
    await page.goto("https://cloud.ovdimnet.com/wt_periodic.adp", {
      waitUntil: "networkidle2",
    });

    // Extract assignments from the <select> element
    const assignments = await page.evaluate(() => {
      const selectElement = document.getElementById("assignments");
      const options = selectElement.options;
      let assignmentsArray = [];
      for (let option of options) {
        assignmentsArray.push({
          value: option.value,
          name: option.textContent,
        });
      }
      return assignmentsArray;
    });
    return assignments;
  } catch (error) {
    console.error("Error during getting assignments:", error);
  }
}
export async function injectAssignmentName(page, assignmentName) {
  try {
    // Navigate to the page containing the input element
    await page.goto('https://cloud.ovdimnet.com/wt_periodic.adp', { waitUntil: 'networkidle2' });

    // Remove the readonly attribute using page.evaluate
    await page.evaluate(() => {
      const inputElement = document.querySelector('input[name="assignment_name_2"]');
      if (inputElement) {
        inputElement.removeAttribute('readonly');
      }
    });

    // Type the assignment name into the input field
    await page.type('input[name="assignment_name_2"]', assignmentName);

    console.log('Assignment name injected successfully.');
  } catch (error) {
    console.error('Error injecting assignment name:', error);
  }
}
//
// (async () => {
//   const browser = await puppeteer.launch({ headless: false });
//   const page = await browser.newPage();
//   const assignmentName = 'My New Assignment';
//
//   await injectAssignmentName(page, assignmentName);
//
//   await browser.close();
// })();// TODO how to inject an assignment to the current day with punch in and out?
async function selectOptionAndSaveWithDate(page, optionText) {
  try {

    // TODO:REMOVE LATER
    let browser = await puppeteer.launch({ headless: false });
    page = await browser.newPage();

    // Login process
    await page.goto("https://cloud.ovdimnet.com", { waitUntil: "networkidle2" });
    await page.type('input[name="email"]', username);
    await page.type('input[name="password"]', password);
    await page.waitForTimeout(2000); // Optional: Wait before submitting
    await page.click("#image1");

    // Wait for the select element to be available
    await page.waitForSelector('select[name="select1"]');

    // Find and click the option that matches the input text
    await page.evaluate((text) => {
      const select = document.querySelector('select[name="select1"]');
      const option = Array.from(select.options).find(opt => opt.text === text);
      if (option) {
        option.selected = true;
        select.dispatchEvent(new Event('change'));
      } else {
        throw new Error(`Option with text "${text}" not found`);
      }
    }, optionText);

    // Get today's date in DD/MM/YYYY format
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

    // Click on today's date in the assignment column
    await page.evaluate((date) => {
      const cells = document.querySelectorAll('td.PunchTD');
      const todayCell = Array.from(cells).find(cell => cell.textContent.trim() === date);
      if (todayCell) {
        todayCell.click();
      } else {
        throw new Error(`Cell for date ${date} not found`);
      }
    }, formattedDate);

    // Wait for the "שמור" button to be available and click it
    await page.waitForSelector('input[value="שמור"]');
    await page.click('input[value="שמור"]');

    console.log(`Selected option "${optionText}", clicked on today's date (${formattedDate}), and clicked Save button`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}
selectOptionAndSaveWithDate()