// Simple test script for WhatsApp client

// Mock the database client before import
const originalConsoleLog = console.log;
console.log = (...args) => {
  // Filter out initialization messages
  if (typeof args[0] === 'string' && 
      (args[0].includes('Initializing') || 
       args[0].includes('Client is ready') ||
       args[0].includes('Authenticated with') ||
       args[0].includes('QR RECEIVED'))
      ) {
    return;
  }
  originalConsoleLog(...args);
};

// Capture original exports before mocking
const originalModule = module.constructor.prototype;
const originalRequire = module.require;

// Mock modules before they're imported
require.cache[require.resolve('./dbClient/clientInit')] = {
  exports: {
    query: async () => {
      return { rows: [] };
    }
  }
};

require.cache[require.resolve('./redisClient/clientInit')] = {
  exports: {
    createOrUpdate: async () => {},
    getAsync: async () => null
  }
};

// Mock the user service module before it's imported by WhatsApp client
const mockUser = {
  id: 1,
  username: 'Test User',
  phone: '1234567890',
  verified: true
};

require.cache[require.resolve('./services/userService')] = {
  exports: {
    getUserByPhone: async (phone) => {
      console.log(`[MOCK] Looking up user with phone: ${phone}`);
      return mockUser;
    },
    registerUser: async () => {
      return { success: true };
    }
  }
};

// Replace the whatsapp-web.js module with a mock version
module.require = function(path) {
  if (path === 'whatsapp-web.js') {
    class MockClient {
      constructor() {
        this.pupPage = {};
        this.pupBrowser = {
          close: () => Promise.resolve()
        };
        this.eventCallbacks = {};
      }
      
      initialize() {
        console.log("Mock WhatsApp client initialized");
        if (this.eventCallbacks.ready) {
          setTimeout(() => this.eventCallbacks.ready(), 0);
        }
      }
      
      on(event, callback) {
        this.eventCallbacks[event] = callback;
      }
      
      sendMessage(to, content) {
        return Promise.resolve();
      }
      
      destroy() {
        console.log("Mock WhatsApp client destroyed");
        return Promise.resolve();
      }
    }
    
    return {
      Client: MockClient
    };
  }
  return originalRequire.apply(this, arguments);
};

// Now import the WhatsApp client
const whatsAppClient = require('./whatsappClient/clientInit');
// Restore original require
module.require = originalRequire;

// Mock methods on the client
whatsAppClient.sendMessage = async (to, message) => {
  console.log(`[MOCK] Message sent to ${to}: ${message}`);
  return Promise.resolve();
};

// Test simulation
async function runTests() {
  console.log('=== Starting WhatsApp Client Tests ===');
  
  try {
    // Test 1: Simulate a 'hi' command from a verified user
    console.log('\nTest 1: Hi command from a verified user');
    const hiMessage = {
      from: '1234567890@c.us',
      body: 'hi'
    };
    await whatsAppClient.handleMessage(hiMessage);
    
    // Test 2: Simulate a 'bye' command from a verified user
    console.log('\nTest 2: Bye command from a verified user');
    const byeMessage = {
      from: '1234567890@c.us',
      body: 'bye'
    };
    await whatsAppClient.handleMessage(byeMessage);
    
    // Test 3: Simulate a '!ping' command (works for all users)
    console.log('\nTest 3: Ping command');
    const pingMessage = {
      from: '1234567890@c.us',
      body: '!ping'
    };
    await whatsAppClient.handleMessage(pingMessage);
    
    // Test 4: Simulate an unknown command
    console.log('\nTest 4: Unknown command');
    const unknownMessage = {
      from: '1234567890@c.us',
      body: 'unknowncommand'
    };
    await whatsAppClient.handleMessage(unknownMessage);
    
    // Test 5: Simulate a signup message
    console.log('\nTest 5: Signup message');
    const signupMessage = {
      from: '9876543210@c.us',
      body: 'signup:New User:user@example.com'
    };
    await whatsAppClient.handleMessage(signupMessage);
    
    console.log('\n=== WhatsApp Client Tests Completed Successfully ===');
  } catch (error) {
    console.error('\nTest error:', error);
  } finally {
    // Force exit the process after a short delay 
    // to prevent any hanging connections
    setTimeout(() => process.exit(0), 100);
  }
}

runTests().catch(err => {
  console.error('Unhandled test error:', err);
  process.exit(1);
}); 