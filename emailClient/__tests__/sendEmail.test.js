console.log('🚀 Starting emailClient test setup');

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({
      response: 'Success'
    })
  })
}));

// Mock dotenv
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

// Mock console.log and console.error to keep test output clean
jest.spyOn(console, 'log').mockImplementation();
jest.spyOn(console, 'error').mockImplementation();

const nodemailer = require('nodemailer');
const { sendVerificationEmail } = require('../sendEmail');

describe('Email Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create environment variables needed
    process.env.GMAIL_USER = 'test@gmail.com';
    process.env.GMAIL_PWD = 'testpassword';
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.GMAIL_USER;
    delete process.env.GMAIL_PWD;
  });

  it('should create a transport with correct config', async () => {
    await sendVerificationEmail('user@example.com', 'Test Subject', '123456');
    
    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      service: 'gmail',
      auth: {
        user: 'test@gmail.com',
        pass: 'testpassword'
      }
    });
  });

  it('should send email with correct parameters', async () => {
    const to = 'user@example.com';
    const subject = 'Test Subject';
    const code = '123456';
    
    await sendVerificationEmail(to, subject, code);
    
    const transporter = nodemailer.createTransport();
    expect(transporter.sendMail).toHaveBeenCalledWith({
      from: 'test@gmail.com',
      to: to,
      subject: subject,
      text: `Your validation code is: ${code}`
    });
  });

  it('should handle errors when sending fails', async () => {
    // Set up the mock to reject the promise
    const mockSendMail = jest.fn().mockRejectedValue(new Error('Failed to send email'));
    nodemailer.createTransport.mockReturnValueOnce({
      sendMail: mockSendMail
    });
    
    await sendVerificationEmail('user@example.com', 'Test Subject', '123456');
    
    expect(mockSendMail).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  it('should work with different verification codes', async () => {
    // Test with different code formats
    const testCases = [
      { code: '123456', expected: 'Your validation code is: 123456' },
      { code: 'ABC-123', expected: 'Your validation code is: ABC-123' },
      { code: '0000', expected: 'Your validation code is: 0000' }
    ];
    
    for (const testCase of testCases) {
      jest.clearAllMocks();
      await sendVerificationEmail('user@example.com', 'Test Subject', testCase.code);
      
      const transporter = nodemailer.createTransport();
      expect(transporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: testCase.expected
        })
      );
    }
  });

  it('should handle missing environment variables', async () => {
    // Temporarily remove environment variables
    const originalUser = process.env.GMAIL_USER;
    const originalPwd = process.env.GMAIL_PWD;
    delete process.env.GMAIL_USER;
    delete process.env.GMAIL_PWD;
    
    const consoleErrorSpy = jest.spyOn(console, 'error');
    
    await sendVerificationEmail('user@example.com', 'Test Subject', '123456');
    
    // Expect transport to be created with undefined credentials
    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      service: 'gmail',
      auth: {
        user: undefined,
        pass: undefined
      }
    });
    
    // Restore env vars
    process.env.GMAIL_USER = originalUser;
    process.env.GMAIL_PWD = originalPwd;
  });

  it('should handle multiple recipient emails', async () => {
    const multipleRecipients = 'user1@example.com, user2@example.com';
    await sendVerificationEmail(multipleRecipients, 'Test Subject', '123456');
    
    const transporter = nodemailer.createTransport();
    expect(transporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: multipleRecipients
      })
    );
  });
}); 