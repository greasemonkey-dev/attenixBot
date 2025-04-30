console.log('🚀 Starting cipherUtils test setup');

const { isValidEmail, randomNumber, hexEncode } = require('../cipherUtils');

describe('Cipher Utilities', () => {
  describe('isValidEmail', () => {
    it('should validate correct email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user-name@domain.com',
        'username123@domain.com',
        'user_name@domain.com'
      ];
      
      validEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(true);
      });
    });
    
    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'test@example',             // Missing TLD
        'test.com',                 // Missing @ symbol
        '',                         // Empty string
        'test',                     // No @ or domain
        null,                       // Null value
        undefined                   // Undefined value
      ];
      
      invalidEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(false);
      });
    });
    
    // Test with the exact regex implementation from the source code
    it('should follow the regex pattern /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/', () => {
      // These should pass based on the specific regex
      expect(isValidEmail('a@b.c')).toBe(true);
      
      // These should fail based on the specific regex
      expect(isValidEmail('a@b')).toBe(false);      // No dot after domain
      expect(isValidEmail('a @b.c')).toBe(false);   // Space in local part
      expect(isValidEmail('a@ b.c')).toBe(false);   // Space in domain
    });
  });
  
  describe('randomNumber', () => {
    it('should generate a 5-digit number', () => {
      // Run multiple times to ensure consistency
      for (let i = 0; i < 100; i++) {
        const num = randomNumber();
        
        // Check that it's a number
        expect(typeof num).toBe('number');
        
        // Check that it's a 5-digit number (between 10000 and 99999)
        expect(num).toBeGreaterThanOrEqual(10000);
        expect(num).toBeLessThanOrEqual(99999);
        
        // Check that it's an integer
        expect(Number.isInteger(num)).toBe(true);
      }
    });
    
    it('should generate different numbers on subsequent calls', () => {
      // Generate a bunch of numbers and check for duplicates
      const numbers = new Set();
      for (let i = 0; i < 100; i++) {
        numbers.add(randomNumber());
      }
      
      // If we're generating random numbers, we should have close to 100 unique numbers
      // Allow for some duplicates by checking that we have at least 80
      expect(numbers.size).toBeGreaterThan(80);
    });
  });
  
  describe('hexEncode', () => {
    it('should correctly encode ASCII strings to hex', () => {
      const testCases = [
        { input: 'ABC', expected: '414243' },
        { input: '123', expected: '313233' },
        { input: 'Hello, World!', expected: '48656c6c6f2c20576f726c6421' },
        { input: '', expected: '' }
      ];
      
      testCases.forEach(testCase => {
        expect(hexEncode(testCase.input)).toBe(testCase.expected);
      });
    });
    
    it('should handle special characters', () => {
      const testCases = [
        { input: '!@#$%^&*()', expected: '21402324255e262a2829' },
        { input: 'áéíóú', expected: 'e1e9edf3fa' }
      ];
      
      testCases.forEach(testCase => {
        expect(hexEncode(testCase.input)).toBe(testCase.expected);
      });
    });
  });
}); 