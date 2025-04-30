/**
 * Unit Tests for User Service
 * 
 * Tests for verifying the functionality of the user service methods.
 */

// Mock the database client
jest.mock('../../dbClient/clientInit', () => ({
  query: jest.fn()
}));

// Import the module to test
const userService = require('../../services/userService');
const dbClient = require('../../dbClient/clientInit');

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('saveUser', () => {
    it('should successfully save a new user', async () => {
      // Mock database response
      const mockResult = {
        rows: [{ id: 1, username: 'Test User', email: 'test@example.com', phone: '1234567890' }]
      };
      dbClient.query.mockResolvedValueOnce(mockResult);
      
      // Call the function
      const result = await userService.saveUser('1234567890', 'test@example.com', 'Test User', 'password123');
      
      // Verify function was called with correct parameters
      expect(dbClient.query).toHaveBeenCalledWith(
        'INSERT INTO users (phone, email, username, password) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        ['1234567890', 'test@example.com', 'Test User', 'password123']
      );
      
      // Verify result
      expect(result).toEqual(mockResult.rows[0]);
    });
    
    it('should handle database errors', async () => {
      // Mock database error
      const mockError = new Error('Database error');
      dbClient.query.mockRejectedValueOnce(mockError);
      
      // Spy on console.error
      const consoleErrorSpy = jest.spyOn(console, 'error');
      
      // Call the function
      const result = await userService.saveUser('1234567890', 'test@example.com', 'Test User', 'password123');
      
      // Verify console.error was called
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      // Verify function returns undefined on error
      expect(result).toBeUndefined();
    });
  });
  
  describe('getUserByPhone', () => {
    it('should return user data when user exists', async () => {
      // Mock user in database
      const mockUser = { id: 1, username: 'Test User', email: 'test@example.com', phone: '1234567890' };
      dbClient.query.mockResolvedValueOnce({ rows: [mockUser] });
      
      // Call the function
      const result = await userService.getUserByPhone('1234567890');
      
      // Verify function was called with correct parameters
      expect(dbClient.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE phone = $1',
        ['1234567890']
      );
      
      // Verify result
      expect(result).toEqual(mockUser);
    });
    
    it('should return undefined when user does not exist', async () => {
      // Mock empty result
      dbClient.query.mockResolvedValueOnce({ rows: [] });
      
      // Call the function
      const result = await userService.getUserByPhone('1234567890');
      
      // Verify result is undefined
      expect(result).toBeUndefined();
    });
    
    it('should handle database errors', async () => {
      // Mock database error
      const mockError = new Error('Database error');
      dbClient.query.mockRejectedValueOnce(mockError);
      
      // Spy on console.error
      const consoleErrorSpy = jest.spyOn(console, 'error');
      
      // Call the function
      const result = await userService.getUserByPhone('1234567890');
      
      // Verify console.error was called
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      // Verify function returns undefined on error
      expect(result).toBeUndefined();
    });
  });
  
  describe('isPhoneInDatabase', () => {
    it('should return true when phone exists', async () => {
      // Mock user in database
      dbClient.query.mockResolvedValueOnce({ rowCount: 1 });
      
      // Call the function
      const result = await userService.isPhoneInDatabase('1234567890');
      
      // Verify function was called with correct parameters
      expect(dbClient.query).toHaveBeenCalledWith(
        'SELECT 1 FROM users WHERE phone = $1',
        ['1234567890']
      );
      
      // Verify result
      expect(result).toBe(true);
    });
    
    it('should return false when phone does not exist', async () => {
      // Mock no user in database
      dbClient.query.mockResolvedValueOnce({ rowCount: 0 });
      
      // Call the function
      const result = await userService.isPhoneInDatabase('1234567890');
      
      // Verify result
      expect(result).toBe(false);
    });
    
    it('should handle database errors', async () => {
      // Mock database error
      const mockError = new Error('Database error');
      dbClient.query.mockRejectedValueOnce(mockError);
      
      // Spy on console.error
      const consoleErrorSpy = jest.spyOn(console, 'error');
      
      // Call the function
      const result = await userService.isPhoneInDatabase('1234567890');
      
      // Verify console.error was called
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      // Verify function returns false on error
      expect(result).toBe(false);
    });
  });
  
  describe('updateUserVerificationCode', () => {
    it('should update user verification code successfully', async () => {
      // Mock database response
      const mockResult = {
        rows: [{ id: 1, username: 'Test User', verification_number: '123456' }]
      };
      dbClient.query.mockResolvedValueOnce(mockResult);
      
      // Call the function
      const result = await userService.updateUserVerificationCode('1234567890', '123456');
      
      // Verify function was called with correct parameters
      expect(dbClient.query).toHaveBeenCalledWith(
        'UPDATE users SET verification_number = $1 WHERE phone = $2 RETURNING *',
        ['123456', '1234567890']
      );
      
      // Verify result
      expect(result).toEqual(mockResult.rows[0]);
    });
    
    it('should handle case when user does not exist', async () => {
      // Mock empty result
      dbClient.query.mockResolvedValueOnce({ rows: [] });
      
      // Call the function
      const result = await userService.updateUserVerificationCode('1234567890', '123456');
      
      // Verify result is undefined
      expect(result).toBeUndefined();
    });
    
    it('should handle database errors', async () => {
      // Mock database error
      const mockError = new Error('Database error');
      dbClient.query.mockRejectedValueOnce(mockError);
      
      // Spy on console.error
      const consoleErrorSpy = jest.spyOn(console, 'error');
      
      // Call the function
      const result = await userService.updateUserVerificationCode('1234567890', '123456');
      
      // Verify console.error was called
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      // Verify function returns undefined on error
      expect(result).toBeUndefined();
    });
  });
}); 