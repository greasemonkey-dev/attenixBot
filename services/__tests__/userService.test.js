console.log('🚀 Starting userService test setup');

// Mock the database client
jest.mock('../../dbClient/clientInit', () => ({
  query: jest.fn()
}));

const dbClient = require('../../dbClient/clientInit');
const userService = require('../userService');

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation
    dbClient.query.mockResolvedValue({ rows: [{ id: 1, username: 'testuser', email: 'test@example.com' }] });
  });

  describe('saveUser', () => {
    it('should save a user successfully', async () => {
      // Set up mock return value
      const mockUser = { id: 1, username: 'testuser', email: 'test@example.com', phone: '1234567890' };
      dbClient.query.mockResolvedValue({ rows: [mockUser] });
      
      // Call function
      const result = await userService.saveUser('1234567890', 'test@example.com', 'testuser', 'password');
      
      // Assertions
      expect(dbClient.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        expect.arrayContaining(['1234567890', 'test@example.com', 'testuser', 'password'])
      );
      expect(result).toEqual(mockUser);
    });

    it('should handle errors when saving users', async () => {
      // Mock a database error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      dbClient.query.mockRejectedValue(new Error('Database error'));
      
      // Call function
      const result = await userService.saveUser('1234567890', 'test@example.com', 'testuser', 'password');
      
      // Assertions
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(result).toBeUndefined();
      
      // Restore console.error
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getUserByPhone', () => {
    it('should retrieve a user by phone number', async () => {
      // Set up mock return value
      const mockUser = { id: 1, username: 'testuser', phone: '1234567890' };
      dbClient.query.mockResolvedValue({ rows: [mockUser] });
      
      // Call function
      const result = await userService.getUserByPhone('1234567890');
      
      // Assertions
      expect(dbClient.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM users WHERE phone'),
        ['1234567890']
      );
      expect(result).toEqual(mockUser);
    });

    it('should return undefined when user not found', async () => {
      // Mock empty result
      dbClient.query.mockResolvedValue({ rows: [] });
      
      // Call function
      const result = await userService.getUserByPhone('9999999999');
      
      // Assertions
      expect(result).toBeUndefined();
    });
  });

  describe('isPhoneInDatabase', () => {
    it('should return true when phone exists', async () => {
      // Mock a result with rows
      dbClient.query.mockResolvedValue({ rowCount: 1 });
      
      // Call function
      const result = await userService.isPhoneInDatabase('1234567890');
      
      // Assertions
      expect(result).toBe(true);
    });

    it('should return false when phone does not exist', async () => {
      // Mock no rows found
      dbClient.query.mockResolvedValue({ rowCount: 0 });
      
      // Call function
      const result = await userService.isPhoneInDatabase('9999999999');
      
      // Assertions
      expect(result).toBe(false);
    });
  });
}); 