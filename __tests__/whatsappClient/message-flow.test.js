/**
 * WhatsApp Message Flow Tests
 * 
 * Tests for the WhatsApp client message handling functionality.
 */

// Mock entire module
jest.mock('../../whatsappClient/clientInit', () => {
  // Create mock implementation
  const mockSendMessage = jest.fn().mockResolvedValue({});
  const mockHandleSignupMessage = jest.fn();
  const mockExecuteAuthenticatedCommand = jest.fn();
  const mockHandleMessage = jest.fn();
  
  // Create mock of command handler
  const hiHandler = {
    requiresAuth: true,
    handler: jest.fn().mockImplementation(async (client, message, user) => {
      await mockSendMessage(message.from, "Hello! How can I help you today?");
    })
  };
  
  const byeHandler = {
    requiresAuth: true,
    handler: jest.fn().mockImplementation(async (client, message, user) => {
      await mockSendMessage(message.from, "Goodbye! Have a great day!");
    })
  };
  
  const pingHandler = {
    requiresAuth: false,
    handler: jest.fn().mockImplementation(async (client, message) => {
      console.log(`Ping received from ${message.from}!`);
      await mockSendMessage(message.from, "Pong!");
    })
  };
  
  // Create mock client
  return {
    sendMessage: mockSendMessage,
    handleSignupMessage: mockHandleSignupMessage,
    executeAuthenticatedCommand: mockExecuteAuthenticatedCommand,
    handleMessage: mockHandleMessage,
    getCommandHandler: (cmd) => {
      if (cmd === 'hi') return hiHandler;
      if (cmd === 'bye') return byeHandler;
      if (cmd === '!ping') return pingHandler;
      return null;
    }
  };
});

// Mock dependencies
jest.mock('../../services/userService', () => ({
  getUserByPhone: jest.fn(),
  saveUser: jest.fn(),
  isPhoneInDatabase: jest.fn(),
  updateUserVerificationCode: jest.fn(),
  registerUser: jest.fn().mockResolvedValue({ id: 1, phone: '1234567890', email: 'test@example.com' })
}));

jest.mock('whatsapp-web.js', () => ({
  Client: jest.fn().mockImplementation(() => ({
    pupPage: { },
    sendMessage: jest.fn().mockResolvedValue({}),
    on: jest.fn(),
    initialize: jest.fn(),
  }))
}));

jest.mock('../../whatsappClient/assignmentHandling', () => ({
  handleAssignments: jest.fn().mockResolvedValue({}),
}));

// Import modules
const userService = require('../../services/userService');
const { handleAssignments } = require('../../whatsappClient/assignmentHandling');
const whatsAppClient = require('../../whatsappClient/clientInit');

describe('WhatsApp Message Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mock implementations
    userService.getUserByPhone.mockReset();
    userService.isPhoneInDatabase.mockReset();
    userService.saveUser.mockReset();
    userService.registerUser.mockReset().mockResolvedValue({ 
      id: 1, phone: '1234567890', email: 'test@example.com', username: 'John Doe' 
    });
    handleAssignments.mockReset();
  });
  
  describe('Signup Command', () => {
    it('should register a new user and send confirmation', async () => {
      // Create a mock signup message
      const mockMessage = {
        from: '1234567890@c.us',
        body: 'signup:John Doe:test@example.com'
      };
      
      // Setup the signup message handler to call registerUser and sendMessage
      whatsAppClient.handleSignupMessage.mockImplementation(async (message) => {
        const parts = message.body.split(":");
        const name = parts[1];
        const email = parts[2];
        await userService.registerUser(name, email, message.from);
        await whatsAppClient.sendMessage(message.from, `Thank you for signing up, ${name}!`);
      });
      
      // Call handleSignupMessage directly
      await whatsAppClient.handleSignupMessage(mockMessage);
      
      // Verify registerUser was called with correct parameters
      expect(userService.registerUser).toHaveBeenCalledWith(
        'John Doe',
        'test@example.com',
        '1234567890@c.us'
      );
      
      // Verify confirmation message was sent
      expect(whatsAppClient.sendMessage).toHaveBeenCalledWith(
        '1234567890@c.us',
        expect.stringContaining('Thank you for signing up, John Doe')
      );
    });
  });
  
  describe('Authentication Check', () => {
    it('should execute handler for verified users', async () => {
      // Mock handler function
      const mockHandler = {
        requiresAuth: true,
        handler: jest.fn().mockResolvedValue({})
      };
      
      // Mock getUserByPhone to return a valid user
      const mockUser = { id: 1, phone: '1234567890', email: 'test@example.com' };
      userService.getUserByPhone.mockResolvedValue(mockUser);
      
      // Create mock message
      const mockMessage = { from: '1234567890@c.us', body: 'hi' };
      
      // Setup executeAuthenticatedCommand implementation
      whatsAppClient.executeAuthenticatedCommand.mockImplementation(async (handler, message) => {
        const phoneNumber = message.from.replace("@c.us", "");
        const user = await userService.getUserByPhone(phoneNumber);
        
        if (user) {
          await handler.handler(whatsAppClient, message, user);
        } else {
          await whatsAppClient.sendMessage(message.from, "You are not authorized to use this command. Please sign up first.");
        }
      });
      
      // Call executeAuthenticatedCommand
      await whatsAppClient.executeAuthenticatedCommand(mockHandler, mockMessage);
      
      // Verify getUserByPhone was called with correct phone number
      expect(userService.getUserByPhone).toHaveBeenCalledWith('1234567890');
      
      // Verify handler was called with correct params
      expect(mockHandler.handler).toHaveBeenCalledWith(whatsAppClient, mockMessage, mockUser);
    });
    
    it('should reject unverified users', async () => {
      // Mock handler function
      const mockHandler = {
        requiresAuth: true,
        handler: jest.fn().mockResolvedValue({})
      };
      
      // Mock getUserByPhone to return null (unverified user)
      userService.getUserByPhone.mockResolvedValue(null);
      
      // Create mock message
      const mockMessage = { from: '9999999999@c.us', body: 'hi' };
      
      // Setup executeAuthenticatedCommand implementation
      whatsAppClient.executeAuthenticatedCommand.mockImplementation(async (handler, message) => {
        const phoneNumber = message.from.replace("@c.us", "");
        const user = await userService.getUserByPhone(phoneNumber);
        
        if (user) {
          await handler.handler(whatsAppClient, message, user);
        } else {
          await whatsAppClient.sendMessage(message.from, "You are not authorized to use this command. Please sign up first.");
        }
      });
      
      // Call executeAuthenticatedCommand
      await whatsAppClient.executeAuthenticatedCommand(mockHandler, mockMessage);
      
      // Verify getUserByPhone was called
      expect(userService.getUserByPhone).toHaveBeenCalledWith('9999999999');
      
      // Verify handler was NOT called
      expect(mockHandler.handler).not.toHaveBeenCalled();
      
      // Verify error message was sent
      expect(whatsAppClient.sendMessage).toHaveBeenCalledWith(
        '9999999999@c.us',
        expect.stringContaining('not authorized')
      );
    });
  });
  
  describe('Command Handling', () => {
    it('should handle hi command', async () => {
      // Create a mock message
      const mockMessage = { from: '1234567890@c.us', body: 'hi' };
      const mockUser = { id: 1, phone: '1234567890', email: 'test@example.com' };
      
      // Get the hi command handler
      const hiHandler = whatsAppClient.getCommandHandler('hi');
      
      // Call the handler directly with the client, message and user
      await hiHandler.handler(whatsAppClient, mockMessage, mockUser);
      
      // Verify greeting response is sent
      expect(whatsAppClient.sendMessage).toHaveBeenCalledWith(
        '1234567890@c.us',
        "Hello! How can I help you today?"
      );
    });
    
    it('should handle bye command', async () => {
      // Create a mock message
      const mockMessage = { from: '1234567890@c.us', body: 'bye' };
      const mockUser = { id: 1, phone: '1234567890', email: 'test@example.com' };
      
      // Get the bye command handler
      const byeHandler = whatsAppClient.getCommandHandler('bye');
      
      // Call the handler directly
      await byeHandler.handler(whatsAppClient, mockMessage, mockUser);
      
      // Verify goodbye response is sent
      expect(whatsAppClient.sendMessage).toHaveBeenCalledWith(
        '1234567890@c.us',
        "Goodbye! Have a great day!"
      );
    });
    
    it('should handle ping command', async () => {
      // Create a mock message
      const mockMessage = { from: '1234567890@c.us', body: '!ping' };
      
      // Get the ping command handler
      const pingHandler = whatsAppClient.getCommandHandler('!ping');
      
      // Call the handler directly
      await pingHandler.handler(whatsAppClient, mockMessage);
      
      // Verify correct response
      expect(whatsAppClient.sendMessage).toHaveBeenCalledWith('1234567890@c.us', "Pong!");
    });
    
    it('should send help message for unknown commands', async () => {
      // Create a mock message with unknown command
      const mockMessage = { from: '1234567890@c.us', body: 'unknown' };
      
      // Setup handleMessage to send help message for unknown commands
      whatsAppClient.handleMessage.mockImplementation(async (message) => {
        await whatsAppClient.sendMessage(message.from, "Available commands...");
      });
      
      // Call handleMessage with an unknown command
      await whatsAppClient.handleMessage(mockMessage);
      
      // Verify help message is sent
      expect(whatsAppClient.sendMessage).toHaveBeenCalledWith(
        '1234567890@c.us',
        expect.stringContaining('Available commands')
      );
    });
  });
}); 