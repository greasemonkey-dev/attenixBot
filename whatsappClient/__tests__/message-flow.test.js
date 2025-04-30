/**
 * WhatsApp Message Flow Tests
 * 
 * Tests for the WhatsApp client message handling functionality.
 */

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

jest.mock('../assignmentHandling', () => ({
  handleAssignments: jest.fn().mockResolvedValue({}),
}));

// Import modules
const userService = require('../../services/userService');
const { handleAssignments } = require('../assignmentHandling');

describe('WhatsApp Message Flow', () => {
  let whatsAppClient;
  let mockSendMessage;
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    
    // Reset mock implementations
    userService.getUserByPhone.mockReset();
    userService.isPhoneInDatabase.mockReset();
    userService.saveUser.mockReset();
    userService.registerUser.mockReset().mockResolvedValue({ 
      id: 1, phone: '1234567890', email: 'test@example.com', username: 'John Doe' 
    });
    handleAssignments.mockReset();
    
    // Create a mock for the client
    mockSendMessage = jest.fn().mockResolvedValue({});
    
    // Mock the WhatsApp client
    const WhatsAppClient = jest.requireActual('../clientInit').constructor;
    WhatsAppClient.prototype.sendMessage = mockSendMessage;
    WhatsAppClient.prototype.client = {
      pupPage: {},
      sendMessage: jest.fn().mockResolvedValue({})
    };
    
    // Now we can require the module
    whatsAppClient = require('../clientInit');
    
    // Replace the sendMessage with our mock
    whatsAppClient.sendMessage = mockSendMessage;
  });
  
  describe('handleSignup', () => {
    it('should register a new user and send confirmation', async () => {
      // Create a mock signup message
      const mockMessage = {
        from: '1234567890@c.us',
        body: 'signup:John Doe:test@example.com'
      };
      
      // Call handleSignup directly
      await whatsAppClient.handleSignup(mockMessage);
      
      // Verify registerUser was called with correct parameters
      expect(userService.registerUser).toHaveBeenCalledWith(
        'John Doe',
        'test@example.com',
        '1234567890@c.us'
      );
      
      // Verify confirmation message was sent
      expect(mockSendMessage).toHaveBeenCalledWith(
        '1234567890@c.us',
        expect.stringContaining('Thank you for signing up, John Doe')
      );
    });
  });
  
  describe('authWrapper', () => {
    it('should execute handler for verified users', async () => {
      // Mock handler function
      const mockHandler = jest.fn().mockResolvedValue({});
      
      // Mock getUserByPhone to return a valid user
      const mockUser = { id: 1, phone: '1234567890', email: 'test@example.com' };
      userService.getUserByPhone.mockResolvedValue(mockUser);
      
      // Create mock message
      const mockMessage = { from: '1234567890@c.us', body: 'hi' };
      
      // Call authWrapper
      await whatsAppClient.authWrapper(mockHandler, mockMessage);
      
      // Verify getUserByPhone was called with correct phone number
      expect(userService.getUserByPhone).toHaveBeenCalledWith('1234567890');
      
      // Verify handler was called with correct params
      expect(mockHandler).toHaveBeenCalledWith(mockMessage, mockUser);
    });
    
    it('should reject unverified users', async () => {
      // Mock handler function
      const mockHandler = jest.fn().mockResolvedValue({});
      
      // Mock getUserByPhone to return null (unverified user)
      userService.getUserByPhone.mockResolvedValue(null);
      
      // Create mock message
      const mockMessage = { from: '9999999999@c.us', body: 'hi' };
      
      // Call authWrapper
      await whatsAppClient.authWrapper(mockHandler, mockMessage);
      
      // Verify getUserByPhone was called
      expect(userService.getUserByPhone).toHaveBeenCalledWith('9999999999');
      
      // Verify handler was NOT called
      expect(mockHandler).not.toHaveBeenCalled();
      
      // Verify error message was sent
      expect(mockSendMessage).toHaveBeenCalledWith(
        '9999999999@c.us',
        expect.stringContaining('not authorized')
      );
    });
  });
  
  describe('handleVerifiedUserMessage', () => {
    it('should handle hi command', async () => {
      // Create a mock message
      const mockMessage = { from: '1234567890@c.us', body: 'hi' };
      
      // Call handleVerifiedUserMessage
      await whatsAppClient.handleVerifiedUserMessage(mockMessage, 'hi');
      
      // Verify greeting response is sent
      expect(mockSendMessage).toHaveBeenCalledWith(
        '1234567890@c.us',
        "Hello! How can I help you today?"
      );
    });
    
    it('should handle bye command', async () => {
      // Create a mock message
      const mockMessage = { from: '1234567890@c.us', body: 'bye' };
      
      // Call handleVerifiedUserMessage
      await whatsAppClient.handleVerifiedUserMessage(mockMessage, 'bye');
      
      // Verify goodbye response is sent
      expect(mockSendMessage).toHaveBeenCalledWith(
        '1234567890@c.us',
        "Goodbye! Have a great day!"
      );
    });
    
    it('should handle ping command', async () => {
      // Create a mock message
      const mockMessage = { from: '1234567890@c.us', body: '!ping' };
      
      // Mock handlePing
      const originalHandlePing = whatsAppClient.handlePing;
      whatsAppClient.handlePing = jest.fn().mockImplementation(async (message) => {
        await mockSendMessage(message.from, "Pong!");
      });
      
      // Call handleVerifiedUserMessage with ping command
      await whatsAppClient.handleVerifiedUserMessage(mockMessage, '!ping');
      
      // Verify handlePing is called
      expect(whatsAppClient.handlePing).toHaveBeenCalledWith(mockMessage);
      
      // Verify correct response
      expect(mockSendMessage).toHaveBeenCalledWith('1234567890@c.us', "Pong!");
      
      // Restore original
      whatsAppClient.handlePing = originalHandlePing;
    });
    
    it('should send help message for unknown commands', async () => {
      // Create a mock message with unknown command
      const mockMessage = { from: '1234567890@c.us', body: 'unknown' };
      
      // Call handleVerifiedUserMessage
      await whatsAppClient.handleVerifiedUserMessage(mockMessage, 'unknown');
      
      // Verify help message is sent
      expect(mockSendMessage).toHaveBeenCalledWith(
        '1234567890@c.us',
        expect.stringContaining('Available commands for verified users')
      );
    });
  });
}); 