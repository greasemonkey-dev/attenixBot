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
        await page.goto("https://cloud.ovdimnet.com/wt_users.adp?view_as_emp=1", {waitUntil: "networkidle2", timeout: 60000});
        console.log('Page loaded.');
        
        // Take a screenshot to debug
        await page.screenshot({ path: 'debug-screenshot.png' });
        console.log('Debug screenshot saved to debug-screenshot.png');
        
        // Log the current URL
        console.log('Current URL:', await page.url());
        
        // Wait a bit more to ensure everything is loaded
        console.log('Waiting additional time for page to fully render...');
        await page.waitForTimeout(5000);
        
        const titleSelector = actionType === 'in' ? 'punch_in' : 'punch_out';
        
        // Try to get all elements on the page for debugging
        console.log('Looking for punch elements on page...');
        const imgElements = await page.$$('img');
        console.log(`Found ${imgElements.length} image elements on page`);
        
        // Try to check if any images contain "punch" in their src
        const imgSrcs = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('img')).map(img => img.src);
        });
        console.log('Image sources found:', imgSrcs);

        // Wait for the element to be loaded in the DOM
        console.log(`Waiting for the ${titleSelector} element...`);
        await page.waitForSelector(`a[href*="punch"] img[src="images/${titleSelector}.png"]`, {timeout: 30000});
        console.log(`${titleSelector} element found.`);

        // Click the element
        console.log(`Clicking the ${titleSelector} element...`);
        await page.click(`a[href*="punch"] img[src="images/${titleSelector}.png"]`);
        console.log(`Successfully clicked the ${titleSelector} link.`);
        
        // Wait to see the result
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'after-punch-screenshot.png' });
        console.log('After punch screenshot saved to after-punch-screenshot.png');
    } catch (error) {
        console.error('Error clicking the punch in link:', error);
        
        // Try to capture error state for debugging
        try {
            console.log('Taking error screenshot...');
            await page.screenshot({ path: 'error-screenshot.png' });
            console.log('Error state captured in error-screenshot.png');
            
            console.log('Page HTML at time of error:');
            const pageContent = await page.content();
            console.log(pageContent.substring(0, 1000) + '...'); // Show first 1000 chars
        } catch (screenshotError) {
            console.error('Failed to capture error state:', screenshotError);
        }
    }
}

module.exports = {clickPunchInLink};