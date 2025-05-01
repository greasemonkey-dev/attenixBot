const { Client } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { handleAssignments } = require("./assignmentHandling.js");
const { getUserByPhone, registerUser } = require("../services/userService");
// Import the Attenix login process for punch-in/out
// const { initiateProcess } = require("../attenixClient/login.js");

// Command constants
const COMMANDS = {
  HI: "hi",
  BYE: "bye",
  POLL: "poll",
  SIGNUP: "signup",
  PING: "!ping"
};

// Command handlers mapping
const COMMAND_HANDLERS = {
  // Authenticated command handlers
  [COMMANDS.HI]: {
    requiresAuth: true,
    handler: async (client, message, user) => {
      await client.sendMessage(message.from, "Hello! How can I help you today?");
      // TODO: Implement punch-in functionality with user credentials
      // Example: await initiateProcess(user.attenixUsername, user.attenixPassword, 'in');
    }
  },
  [COMMANDS.BYE]: {
    requiresAuth: true,
    handler: async (client, message, user) => {
      await client.sendMessage(message.from, "Goodbye! Have a great day!");
      // TODO: Implement punch-out functionality with user credentials
      // Example: await initiateProcess(user.attenixUsername, user.attenixPassword, 'out');
    }
  },
  [COMMANDS.POLL]: {
    requiresAuth: true,
    handler: async (client, message, user) => {
      try {
        // Using the client WhatsApp instance for poll handling
        // In a real application, assignments would be fetched from a service
        const assignments = ["Assignment 1", "Assignment 2", "Assignment 3"]; // Example assignments
        const chosenAssignment = await handleAssignments(client.client, message.from, assignments);
        console.log(`User ${user.username || message.from} selected: ${chosenAssignment?.selectedOption || 'None'}`);
        
        // Handle the chosen assignment (e.g. log time, save to database, etc.)
        if (chosenAssignment?.selectedOption) {
          await client.sendMessage(message.from, `You've selected: ${chosenAssignment.selectedOption}. Your time will be logged.`);
        }
      } catch (error) {
        console.error("Error handling poll:", error);
        await client.sendMessage(message.from, "Sorry, I couldn't create the poll. Please try again later.");
      }
    }
  },
  
  // Commands that work for all users (authenticated or not)
  [COMMANDS.PING]: {
    requiresAuth: false,
    handler: async (client, message) => {
      console.log(`Ping received from ${message.from}!`);
      await client.sendMessage(message.from, "Pong!");
    }
  },
  
  // Special signup command handler
  [COMMANDS.SIGNUP]: {
    requiresAuth: false,
    handler: async (client, message) => {
      await client.sendMessage(message.from, "To sign up, please provide your details in this format: SIGNUP:Name:Email");
    }
  }
};

// Help messages
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
    this.client.on("message_create", this.handleMessage.bind(this));
  }

  handleQR(qr) {
    qrcode.generate(qr, { small: true });
    console.log("QR RECEIVED");
  }

  handleReady() {
    console.log("Client is ready!");
  }

  /**
   * Main entry point for handling all incoming messages
   */
  async handleMessage(message) {
    try {
      const messageBody = message.body.trim().toLowerCase();

      // Handle signup format messages
      if (messageBody.startsWith("signup:")) {
        await this.handleSignupMessage(message);
        return;
      }

      // Handle commands
      const commandHandler = this.getCommandHandler(messageBody);
      if (commandHandler) {
        await this.executeCommandHandler(commandHandler, message);
        return;
      }

      // If we reach here, message wasn't recognized as a command
      await this.sendMessage(message.from, HELP_MESSAGES.UNVERIFIED);
    } catch (error) {
      console.error("Error handling message:", error);
      await this.sendMessage(message.from, "Sorry, I encountered an error processing your request.");
    }
  }

  /**
   * Get the command handler for a given message
   */
  getCommandHandler(messageBody) {
    return COMMAND_HANDLERS[messageBody];
  }

  /**
   * Execute a command handler with appropriate authentication check
   */
  async executeCommandHandler(commandHandler, message) {
    if (commandHandler.requiresAuth) {
      await this.executeAuthenticatedCommand(commandHandler, message);
    } else {
      await commandHandler.handler(this, message);
    }
  }

  /**
   * Execute a command that requires authentication
   */
  async executeAuthenticatedCommand(commandHandler, message) {
    const phoneNumber = message.from.replace("@c.us", "");
    const user = await getUserByPhone(phoneNumber);

    if (user) {
      await commandHandler.handler(this, message, user);
    } else {
      await this.sendMessage(message.from, "You are not authorized to use this command. Please sign up first.");
    }
  }

  /**
   * Handle signup message with format "signup:Name:Email"
   */
  async handleSignupMessage(message) {
    try {
      const parts = message.body.split(":");
      if (parts.length >= 3) {
        const name = parts[1];
        const email = parts[2];
        await registerUser(name, email, message.from);
        await this.sendMessage(message.from, `Thank you for signing up, ${name}!`);
      } else {
        await this.sendMessage(message.from, "Invalid signup format. Please use: signup:Your Name:your.email@example.com");
      }
    } catch (error) {
      console.error("Error during signup:", error);
      await this.sendMessage(message.from, "An error occurred during signup. Please try again.");
    }
  }

  /**
   * Send a message to a recipient
   */
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
