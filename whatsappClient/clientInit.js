const { Client } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { handleAssignments } = require("./assignmentHandling.js");
const { getUserByPhone, registerUser } = require("../services/userService");
const COMMANDS = {
  HI: "hi",
  BYE: "bye",
  POLL: "poll",
  SIGNUP: "signup",
  PING: "!ping"
};

const HELP_MESSAGES = {
  VERIFIED: `
Available commands for verified users:
- hi: Greet the bot
- bye: Say goodbye
- poll: Start a poll
- !ping: Check if the bot is responsive

For more information, type the command you're interested in.
`,
  UNVERIFIED: `
Available commands:
- signup: Sign up for the service (format: SIGNUP:Name:Email)
- !ping: Check if the bot is responsive

Please sign up to access more features.
`
};


class WhatsAppClient {
  constructor() {
    if (WhatsAppClient.instance) {
      return WhatsAppClient.instance;
    }

    this.client = new Client({
      webVersionCache: {
        remotePath: "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.3000.1015570063-alpha.html",
        type: "remote",
      },
    });

    this.setupClientListeners();
    WhatsAppClient.instance = this;
  }

  setupClientListeners() {
    this.client.on("qr", this.handleQR);
    this.client.on("ready", this.handleReady);
    this.client.on("message_create", this.handleMessage);
  }

  handleQR(qr) {
    qrcode.generate(qr, { small: true });
    console.log("QR RECEIVED");
  }

  handleReady() {
    console.log("Client is ready!");
  }

  async handleMessage(message) {
    const messageBody = message.body.trim().toLowerCase();

    if (messageBody.startsWith("signup:")) {
      await this.handleSignup(message);
    } else if (Object.values(COMMANDS).includes(messageBody)) {
      await this.authWrapper(this.handleVerifiedUserMessage, message);
    } else {
      await this.sendMessage(message.from, HELP_MESSAGES.UNVERIFIED);
    }
  }

  async authWrapper(handler, message) {
    const phoneNumber = message.from.replace("@c.us", "");
    const user = await getUserByPhone(phoneNumber);

    if (user) {
      return handler(message, user);
    } else {
      await this.sendMessage(message.from, "You are not authorized to use this command. Please sign up first.");
      return null;
    }
  }


async  handleMessage(message) {
  const messageBody = message.body.trim().toLowerCase();

  if (messageBody.startsWith("signup:")) {
    await handleSignup(message);
  } else if (Object.values(COMMANDS).includes(messageBody)) {
    await authWrapper(handleVerifiedUserMessage, message);
  } else {
    await sendMessage(message.from, HELP_MESSAGES.UNVERIFIED);
  }
}

async  handleVerifiedUserMessage(message, messageBody) {
  switch (messageBody) {
    case COMMANDS.HI:
      await this.sendMessage(message.from, "Hello! How can I help you today?");
      break;
    case COMMANDS.BYE:
      await this.sendMessage(message.from, "Goodbye! Have a great day!");
      break;
    case COMMANDS.POLL:
      await handlePoll(message);
      break;
    case COMMANDS.PING:
      await this.handlePing(message);
      break;
    default:
      await this.sendMessage(message.from, HELP_MESSAGES.VERIFIED);
  }
}

async  handleUnverifiedUserMessage(message, messageBody) {
  switch (messageBody) {
    case COMMANDS.SIGNUP:
      await this.sendMessage(message.from, "To sign up, please provide your details in this format: SIGNUP:Name:Email");
      break;
    case COMMANDS.PING:
      await handlePing(message);
      break;
    default:
      if (messageBody.startsWith("signup:")) {
        await handleSignup(message);
      } else {
        await this.sendMessage(message.from, HELP_MESSAGES.UNVERIFIED);
      }
  }
}

async  handlePoll(message) {
  const client = getClient();
  const chosenAssignment = await handleAssignments(client, message.from, assignments);
  // Handle the chosen assignment
}

  async handlePing(message) {
    console.log(`Ping received from ${message.from}!`);
    await this.sendMessage(message.from, "Pong!");
  }

  async handleSignup(message) {
    const [_, name, email] = message.body.split(":");
    await registerUser(name, email, message.from);
    await this.sendMessage(message.from, `Thank you for signing up, ${name}!`);
  }

  async sendMessage(to, content) {
    if (!this.client.pupPage) {
      throw new Error('Client not initialized');
    }
    await this.client.sendMessage(to, content);
  }

  initialize() {
    this.client.initialize();
  }
}

const whatsAppClient = new WhatsAppClient();
whatsAppClient.initialize();

module.exports = whatsAppClient;
