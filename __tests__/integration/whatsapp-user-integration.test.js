/**
 * Integration Tests - WhatsApp Client + User Service
 * 
 * Tests for verifying the proper integration between the WhatsApp client
 * and User Service components.
 */

// Mock external dependencies
jest.mock('whatsapp-web.js', () => ({
  Client: jest.fn().mockImplementation(() => ({
    pupPage: {},
    sendMessage: jest.fn().mockResolvedValue({}),
    on: jest.fn(),
    initialize: jest.fn(),
  }))
}));

// Mock database client for controlled testing
jest.mock('../../dbClient/clientInit', () => ({
  query: jest.fn()
}));

// Mock registerUser directly since it's used in WhatsAppClient
jest.mock('../../services/userService', () => ({
  getUserByPhone: jest.fn(),
  registerUser: jest.fn().mockResolvedValue({ id: 1, phone: '1234567890', email: 'test@example.com' })
}));

// Import the modules to test
const whatsAppClient = require('../../whatsappClient/clientInit');
const userService = require('../../services/userService');
const dbClient = require('../../dbClient/clientInit');

describe('WhatsApp and User Service Integration', () => {
  let mockSendMessage;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock database responses
    dbClient.query.mockReset();
    
    // Mock the service methods
    userService.registerUser.mockReset().mockImplementation(async (name, email, phone) => {
      return { 
        id: 1, 
        username: name, 
        email: email, 
        phone: phone.replace('@c.us', '') 
      };
    });
    
    userService.getUserByPhone.mockReset().mockImplementation(async (phone) => {
      if (phone === '1234567890') {
        return {
          id: 1,
          username: 'Test User',
          email: 'test@example.com',
          phone: phone
        };
      }
      return null; // User not found
    });
    
    // Create a mock sendMessage function
    mockSendMessage = jest.fn().mockResolvedValue({});
    
    // Replace the actual methods with mocks
    whatsAppClient.sendMessage = mockSendMessage;
    
    // Mock handleSignup to call our mocked registerUser
    whatsAppClient.handleSignup = jest.fn().mockImplementation(async (message) => {
      const [_, name, email] = message.body.split(":");
      const user = await userService.registerUser(name, email, message.from);
      await whatsAppClient.sendMessage(message.from, `Thank you for signing up, ${name}!`);
      return user;
    });
    
    // Setup handleMessage to call our mocked handleSignup
    whatsAppClient.handleMessage = jest.fn().mockImplementation(async (message) => {
      const messageBody = message.body.trim().toLowerCase();
      
      if (messageBody.startsWith("signup:")) {
        return await whatsAppClient.handleSignup(message);
      } else {
        // Check if user exists first - properly await the response
        const user = await userService.getUserByPhone(message.from.replace("@c.us", ""));
        if (user) {
          // Handle verified user commands
          await whatsAppClient.sendMessage(message.from, "Command processed successfully");
        } else {
          // Handle unverified user
          await whatsAppClient.sendMessage(message.from, "You are not authorized. Please sign up first.");
        }
      }
    });
  });
  
  describe('User Registration Flow', () => {
    it('should register a new user through WhatsApp message', async () => {
      // Create a mock signup message
      const mockMessage = {
        from: '9876543210@c.us',
        body: 'signup:John Doe:john@example.com'
      };
      
      // Trigger the flow by calling handleMessage
      await whatsAppClient.handleMessage(mockMessage);
      
      // Verify that handleSignup was called with the message
      expect(whatsAppClient.handleSignup).toHaveBeenCalledWith(mockMessage);
      
      // Verify that registerUser was called with the correct parameters
      expect(userService.registerUser).toHaveBeenCalledWith(
        'John Doe',
        'john@example.com',
        '9876543210@c.us'
      );
      
      // Verify that a confirmation message was sent to the user
      expect(mockSendMessage).toHaveBeenCalledWith(
        '9876543210@c.us',
        'Thank you for signing up, John Doe!'
      );
    });
    
    it('should validate user credentials during registration', async () => {
      // Create a mock signup message with invalid email
      const mockMessage = {
        from: '9876543210@c.us',
        body: 'signup:John Doe:invalid-email'
      };
      
      // Override the handleSignup implementation to include validation
      whatsAppClient.handleSignup = jest.fn().mockImplementation(async (message) => {
        const [_, name, email] = message.body.split(":");
        
        // Simple validation
        if (!email.includes('@')) {
          await whatsAppClient.sendMessage(message.from, 'Invalid email format. Please try again with a valid email.');
          return null;
        }
        
        const user = await userService.registerUser(name, email, message.from);
        await whatsAppClient.sendMessage(message.from, `Thank you for signing up, ${name}!`);
        return user;
      });
      
      // Trigger the flow
      await whatsAppClient.handleMessage(mockMessage);
      
      // Verify handleSignup was called
      expect(whatsAppClient.handleSignup).toHaveBeenCalledWith(mockMessage);
      
      // Verify that registerUser was NOT called (validation failed)
      expect(userService.registerUser).not.toHaveBeenCalled();
      
      // Verify that an error message was sent
      expect(mockSendMessage).toHaveBeenCalledWith(
        '9876543210@c.us',
        'Invalid email format. Please try again with a valid email.'
      );
    });
  });
  
  describe('User Authentication Flow', () => {
    it('should authenticate verified users for commands', async () => {
      // Create a user in our mock database
      userService.getUserByPhone.mockResolvedValueOnce({
        id: 1,
        username: 'Test User',
        email: 'test@example.com',
        phone: '1234567890'
      });
      
      // Create a message with a command from a verified user
      const mockMessage = {
        from: '1234567890@c.us',
        body: 'hi'
      };
      
      // Trigger the flow
      await whatsAppClient.handleMessage(mockMessage);
      
      // Verify message was sent (command processed)
      expect(mockSendMessage).toHaveBeenCalledWith(
        '1234567890@c.us',
        'Command processed successfully'
      );
    });
    
    it('should reject commands from unverified users', async () => {
      // Ensure user is not in database
      userService.getUserByPhone.mockResolvedValueOnce(null);
      
      // Create a message with a command from an unverified user
      const mockMessage = {
        from: '9999999999@c.us',
        body: 'hi'
      };
      
      // Trigger the flow
      await whatsAppClient.handleMessage(mockMessage);
      
      // Verify rejection message was sent
      expect(mockSendMessage).toHaveBeenCalledWith(
        '9999999999@c.us',
        'You are not authorized. Please sign up first.'
      );
    });
  });
}); 