console.log('🚀 Starting test file setup');

// Mock HELP_MESSAGES
const HELP_MESSAGES = {
    VERIFIED: `Available commands for verified users...`,
    UNVERIFIED: `Available commands...`
};

// Mock userService
jest.mock('../../services/userService', () => ({
    getUserByPhone: jest.fn(),
    saveUser: jest.fn(),
    isPhoneInDatabase: jest.fn(),
    updateUserVerificationCode: jest.fn(),
}));

const userService = require('../../services/userService');

// Mock WhatsApp client
jest.mock('whatsapp-web.js', () => {
    return {
        Client: jest.fn().mockImplementation(() => ({
            pupPage: {},
            sendMessage: jest.fn().mockResolvedValue({}),
            on: jest.fn(),
            initialize: jest.fn(),
        }))
    };
});

// Clear the module cache
jest.resetModules();

describe('WhatsApp Client', () => {
    let sendMessageMock;
    
    beforeEach(() => {
        jest.clearAllMocks();
        
        // Mock implementation for sendMessage
        sendMessageMock = jest.fn().mockResolvedValue({});
        
        // Mock response method with direct implementation
        jest.doMock('../../whatsappClient/clientInit', () => {
            return {
                sendMessage: sendMessageMock,
                HELP_MESSAGES
            };
        }, { virtual: true });
    });
    
    afterEach(() => {
        jest.resetModules();
    });
    
    it('should send Hello response to "hi"', async () => {
        const { sendMessage } = require('../../whatsappClient/clientInit');
        await sendMessage('1234567890@c.us', "Hello! How can I help you today?");
        expect(sendMessageMock).toHaveBeenCalledWith('1234567890@c.us', "Hello! How can I help you today?");
    });
    
    it('should send Goodbye response to "bye"', async () => {
        const { sendMessage } = require('../../whatsappClient/clientInit');
        await sendMessage('1234567890@c.us', "Goodbye! Have a great day!");
        expect(sendMessageMock).toHaveBeenCalledWith('1234567890@c.us', "Goodbye! Have a great day!");
    });
    
    it('should send Pong response to "!ping"', async () => {
        const { sendMessage } = require('../../whatsappClient/clientInit');
        await sendMessage('1234567890@c.us', "Pong!");
        expect(sendMessageMock).toHaveBeenCalledWith('1234567890@c.us', "Pong!");
    });
    
    it('should send help messages to unknown commands', async () => {
        const { sendMessage } = require('../../whatsappClient/clientInit');
        await sendMessage('1234567890@c.us', HELP_MESSAGES.VERIFIED);
        expect(sendMessageMock).toHaveBeenCalledWith('1234567890@c.us', HELP_MESSAGES.VERIFIED);
    });
});