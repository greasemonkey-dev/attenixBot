const PUNCHIN = 'Punch in';
const PUNCHOUT = 'Punch out';
// /hi: "Welcome back! Clocking you in now."
// /bye: "See you tomorrow! Clocking you out."
async function clickPunchInLink(page, actionType) {
    try {
        console.log('Navigating to the page...');
        /**
         * this page might be  loaded without the punch in / out items - guessing it depend on the assignments inventory
         *  @todo:consider handle such flow
         * */
        await page.goto("https://cloud.ovdimnet.com/wt_users.adp?view_as_emp=1", {waitUntil: "networkidle2"});
        console.log('Page loaded.');

        const titleSelector = actionType === 'in' ? 'punch_in' : 'punch_out';

        // Wait for the element to be loaded in the DOM
        console.log('Waiting for the punch in element...');
        await page.waitForSelector(`a[href*="punch"] img[src="images/${titleSelector}.png"]`, {timeout: 10000});
        console.log(`${titleSelector} element found.`);

        // Click the element
        console.log(`Clicking the ${titleSelector} element...`);
        await page.click(`a[href*="punch"] img[src="images/${titleSelector}.png"]`);
        console.log(`Successfully clicked the ${titleSelector} link.`);
    } catch (error) {
        console.error('Error clicking the punch in link:', error);
    }
}

module.exports = {clickPunchInLink};