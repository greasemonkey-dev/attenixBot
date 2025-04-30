function handleWhatsappNumber(phoneNumber) {
    // Remove "@c.us" suffix if present
    if (phoneNumber.endsWith("@c.us")) {
      return phoneNumber.slice(0, -5);
    }
  
    // Add "@c.us" suffix if not present
    return phoneNumber + "@c.us";
  }
  module.exports = {handleWhatsappNumber,};