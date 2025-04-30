const {
  verifyUser,
  saveUser,
  getUserByPhone,
  updateUserVerificationCode,
} = require("../services/userService");
const { getAsync, setAsync, delAsync,createOrUpdate } = require("../redisClient/clientInit");
const { handleWhatsappNumber } = require("../utils/whatsappTelphoneHandler");
const { sendVerificationEmail } = require("../emailClient/sendEmail");
const { randomNumber, isValidEmail } = require("../utils/cipherUtils");
const { isPhoneInDatabase } = require("../services/userService");
const STATES = {
  UNVERIFIED: "UNVERIFIED",
  AWAITING_VERIFICATION: "AWAITING_VERIFICATION",
  VERIFIED: "VERIFIED",
};
// const users = []; // In-memory array to simulate user data

// const getAsync = async (phoneNumber) => {
//   const user = users.find((u) => u.phoneNumber === phoneNumber);
//   return user ? JSON.stringify(user) : null;
// };

// const setAsync = async (phoneNumber, data) => {
//   const user = users.find((u) => u.phoneNumber === phoneNumber);
//   if (user) {
//     user.data = data;
//   } else {
//     users.push({ phoneNumber, data });
//   }
// };

// const delAsync = async (phoneNumber) => {
//   const index = users.findIndex((u) => u.phoneNumber === phoneNumber);
//   if (index !== -1) {
//     users.splice(index, 1);
//   }
// };
const handleUnverifiedState = async (message, client, phoneNumber) => {
  const messageBody = message.body.trim();
  // move the email domain verification to a config file
  if (isValidEmail(messageBody) && messageBody.endsWith("@ravtech.co.il")) {
    const verificationCode = randomNumber();
    console.log("Verification code: ", verificationCode);
    await sendVerificationEmail(messageBody, "User Validation", verificationCode);
    await createOrUpdate(
      phoneNumber,
      JSON.stringify({
        state: STATES.AWAITING_VERIFICATION,
        verificationCode: verificationCode,
        workEmail: messageBody,
      })
    ); // Set TTL to 600 seconds (10 minutes)
    message.reply(
      "A verification code has been sent to your email. Please provide the code."
    );
  } else if (!isValidEmail(messageBody)) {
    message.reply("Your email is not valid.");
  } else {
    message.reply("Your email is not from ravtech.co.il.");
  }
};

const handleAwaitingVerificationState = async (
  message,
  _client,
  phoneNumber
) => {
  const messageBody = message.body.trim();
  const userData = JSON.parse(await getAsync(phoneNumber));
console.log("🚨 . \n messageBody", messageBody,
typeof(messageBody), "\n verification code: ",userData.verificationCode, typeof(userData.verificationCode));
  if (messageBody == userData.verificationCode) {
    userData.state = STATES.VERIFIED;
    await createOrUpdate(phoneNumber, JSON.stringify(userData));
    message.reply(
      "Congrats! You have successfully verified your account. Now please provide your Attenix username."
    );
  } else {
    message.reply("Your verification code is invalid.");
    // todo:add a code resend mechanism
  }
};

const handleVerifiedState = async (message, client, phoneNumber) => {
  const userData = JSON.parse(await getAsync(phoneNumber));
  console.log("🛎️. \n userData", userData);
  if (!userData.attenixUsername && !userData.attenixPassword) {
    userData.attenixUsername = message.body.trim();
    await createOrUpdate(phoneNumber, JSON.stringify(userData));
    message.reply("Please provide your Attenix password.");
  } else if (userData.attenixUsername && !userData.attenixPassword) {
    userData.attenixPassword = message.body.trim();
    await createOrUpdate(phoneNumber, JSON.stringify(userData));}
    // ! some culomns issues with the database
  //   try {
  //     const savedUser = await saveUser(
  //       phoneNumber,
  //       userData.workEmail,
  //       userData.attenixUsername,
  //       userData.attenixPassword
  //     );
  //     console.log(`User saved: ${JSON.stringify(savedUser)}`);
  //     await delAsync(phoneNumber);
  //   } catch (error) {
  //     console.error("Error saving user:", error);
  //   }
  // }
  // await setAsync(phoneNumber, JSON.stringify(userData));
};

const signIn = async (message, client) => {
  const phoneNumber = handleWhatsappNumber(message.from);
  const user = await isPhoneInDatabase(phoneNumber);
  const userData = JSON.parse(await getAsync(phoneNumber));
  console.log(
    "Sign In  🚒user:",
    user,
    "\n 🧯userData:",
    userData,
    "\n 🧰phoneNumber: ",
    phoneNumber
  );

  if (!user && !userData) {
    client.sendMessage(
      message.from,
      "Welcome! Please provide your work email so I can send you a verification code."
    );
    await createOrUpdate(
      phoneNumber,
      JSON.stringify({
        state: STATES.UNVERIFIED,
        verificationCode: null,
        workEmail: null,
      })
    ); // Set TTL to 600 seconds (10 minutes)
    return;
  } else if (!user && userData) {
    console.log("🚨 . \nUser data found in memory:", userData);
    const userState = userData.state;
    console.log("🚨 . \nUser state", userState);

    switch (userState) {
      
      case STATES.UNVERIFIED:

        await handleUnverifiedState(message, client, phoneNumber);
        break;

      case STATES.AWAITING_VERIFICATION:
        await handleAwaitingVerificationState(message, client, phoneNumber);
        break;

      case STATES.VERIFIED:
        await handleVerifiedState(message, client, phoneNumber);
        break;

      default:
        message.reply("An unknown error occurred.");
        break;
    }
  }
};
module.exports = signIn;
