const nodemailer = require("nodemailer");
require("dotenv").config(); // Load environment variables from .env file

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });


async function sendVerificationEmail(to, subject,code) {
  console.log("Sending email to:", to);
  const transporter = nodemailer.createTransport({
    service: "gmail", 
    auth: {
      user: process.env.GMAIL_USER, // Use environment variable for email
      pass: process.env.GMAIL_PWD, // Use environment variable for app password
    },
  });
  const emailBody = `Your validation code is: ${code}`;

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject,
    text: emailBody, // Use HTML for formatted body content
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}


module.exports = {sendVerificationEmail};

// sendEmail("oren9e@gmail.com", "User Validation", emailBody);
