// Function to hex-encode a string
function hexEncode(str) {
    return Array.from(str)
        .map(char => char.charCodeAt(0).toString(16))
        .join('');
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Generate random 5 digit number
  function randomNumber() {
    return Math.floor(10000 + Math.random() * 90000);
  }

module.exports = { isValidEmail, randomNumber, hexEncode};
