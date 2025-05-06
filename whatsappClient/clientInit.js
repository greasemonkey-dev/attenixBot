const { Client, NoAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { handleAssignments } = require("./assignmentHandling.js");
const { getUserByPhone, registerUser } = require("../services/userService");
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
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

    console.log("Creating WhatsApp client instance...");
    
    // Test file write to qrcodes directory
    try {
      const qrcodesDir = '/app/qrcodes';
      if (!fs.existsSync(qrcodesDir)) {
        console.log(`Creating QR codes directory at ${qrcodesDir}`);
        fs.mkdirSync(qrcodesDir, { recursive: true });
      }
      const testFilePath = path.join(qrcodesDir, 'debug-test.txt');
      fs.writeFileSync(testFilePath, `Debug test file created at ${new Date().toISOString()}\n`);
      console.log(`Successfully wrote test file to ${testFilePath}`);
    } catch (err) {
      console.error('Error writing test file to qrcodes directory:', err);
    }
    
    // Configure puppeteer options for Docker environment
    const puppeteerOptions = {
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--disable-extensions',
        '--incognito',
        '--mute-audio'
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
      headless: 'new',
      timeout: 120000  // Extended timeout
    };
    
    this.client = new Client({
      webVersionCache: {
        remotePath: "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.3000.1015570063-alpha.html",
        type: "remote",
      },
      authStrategy: new NoAuth(),
      puppeteer: puppeteerOptions
    });

    console.log("Setting up WhatsApp client event listeners...");
    this.setupClientListeners();
    WhatsAppClient.instance = this;
  }

  setupClientListeners() {
    this.client.on("qr", this.handleQR);
    this.client.on("ready", this.handleReady);
    this.client.on("message", this.handleMessage.bind(this));
    this.client.on("auth_failure", this.handleAuthFailure);
    this.client.on("disconnected", this.handleDisconnect);
  }

  handleQR(qr) {
    // Generate QR code in terminal with high contrast colors for better scanning
    console.log("\n\n█████████ WHATSAPP QR CODE █████████");
    qrcode.generate(qr, { 
      small: true,
      white: "\u001b[47m  \u001b[0m", // Bright white background
      black: "\u001b[40m  \u001b[0m"  // Black background
    });
    console.log("█████ SCAN THIS QR WITH YOUR PHONE █████\n");
    console.log("QR RECEIVED - Scan to authenticate");
    
    // Absolute path for qrcodes directory inside Docker container
    const qrImagePath = '/app/qrcodes/qrcode.png';
    
    // Make sure the directory exists
    const qrDirPath = path.dirname(qrImagePath);
    if (!fs.existsSync(qrDirPath)) {
      console.log(`Creating directory: ${qrDirPath}`);
      fs.mkdirSync(qrDirPath, { recursive: true });
    }
    
    // Save QR code with high contrast for better scanning
    QRCode.toFile(qrImagePath, qr, {
      color: {
        dark: '#000000',  // Black dots
        light: '#FFFFFF'  // White background
      },
      width: 800,         // Make it large enough to scan easily
      margin: 1           // Add a small margin
    }, (err) => {
      if (err) {
        console.error(`Error saving QR code to file: ${err}`);
      } else {
        console.log(`\n✅ QR code saved to ${qrImagePath}\n`);
        console.log(`Open this file on your computer and scan it with your phone's WhatsApp app.`);
      }
    });
  }

  handleReady() {
    console.log("Client is ready! WhatsApp connection established.");
  }
  
  handleAuthFailure(error) {
    console.error("WhatsApp authentication failed:", error);
  }
  
  handleDisconnect(reason) {
    console.log('WhatsApp client was disconnected:', reason);
  }

  /**
   * Main entry point for handling all incoming messages
   */
  async handleMessage(message) {
    try {
      // Skip processing if the message is from the bot itself, status message or not a regular message
      if (message.fromMe || message.isStatus || !message.body) {
        console.log(`Skipping message: fromMe=${message.fromMe}, isStatus=${message.isStatus}, hasBody=${!!message.body}`);
        return;
      }
      
      // Log message details for debugging
      console.log(`Processing message from ${message.from}: "${message.body}" (type: ${message._data.type})`);
      const messageBody = message.body.trim().toLowerCase();

      // Skip empty messages
      if (!messageBody) {
        console.log('Skipping empty message');
        return;
      }

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

      // Only send help message if this is the first message from the user
      // Store messages we've responded to in memory to avoid duplicates
      if (!this._respondedTo) this._respondedTo = new Set();
      
      if (!this._respondedTo.has(message.from)) {
        console.log(`First message from ${message.from}, sending help`);
        this._respondedTo.add(message.from);
        await this.sendMessage(message.from, HELP_MESSAGES.UNVERIFIED);
      } else {
        console.log(`Already sent help to ${message.from}, skipping`);
      }
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
    try {
      if (!this.client.pupPage) {
        console.warn('Client not fully initialized, attempting to send message anyway');
      }
      await this.client.sendMessage(to, content);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  initialize() {
    console.log("Initializing WhatsApp client...");
    console.log("Starting WhatsApp client initialization...");
    this.client.initialize().then(() => {
      console.log("WhatsApp client initialization promise resolved successfully!");
    }).catch(error => {
      console.error("Error initializing WhatsApp client:", error);
      // Print more detailed error information
      if (error.stack) {
        console.error("Error stack:", error.stack);
      }
      // Try to log any available information about the Puppeteer page
      try {
        if (this.client.pupPage) {
          console.log("Puppeteer page exists, URL:", this.client.pupPage.url());
        } else {
          console.log("Puppeteer page does not exist yet");
        }
      } catch (e) {
        console.error("Error accessing Puppeteer page:", e);
      }
    });
  }
}

console.log("Creating WhatsApp client instance...");
const whatsAppClient = new WhatsAppClient();
console.log("Initializing WhatsApp client...");
whatsAppClient.initialize();

module.exports = whatsAppClient;
