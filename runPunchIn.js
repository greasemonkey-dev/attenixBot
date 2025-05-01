const { initiateProcess } = require('./attenixClient/login.js');

// Define credentials - replace these with actual credentials if needed
const username = "2222";  // Using the test username from login.js
const password = "123456"; // Using the test password from login.js

console.log("Starting punch-in process...");
console.log(`Using credentials: ${username} / ${'*'.repeat(password.length)}`);

// Export the function if it's not already exported in login.js
if (typeof initiateProcess !== 'function') {
  console.error("The initiateProcess function is not properly exported from login.js");
  process.exit(1);
}

// Run the punch-in process
initiateProcess(username, password)
  .then(() => {
    console.log("Punch-in process completed successfully!");
  })
  .catch(error => {
    console.error("Error during punch-in process:", error);
  }); 