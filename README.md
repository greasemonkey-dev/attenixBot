# AttenixBot

A WhatsApp bot application for Attenix services.

## Overview

AttenixBot integrates WhatsApp messaging with user management, authentication, and service provisioning. It provides a conversational interface for users to interact with Attenix services.

## Features

- WhatsApp message handling and processing
- User registration and authentication
- Command processing
- Redis caching for improved performance

## Project Structure

- `services/`: Core business logic services
- `redisClient/`: Redis client implementation
- `whatsappClient/`: WhatsApp integration
- `dbClient/`: Database client implementation
- `__tests__/`: Test files for all components

## Testing

The project uses Jest for unit and integration testing. Run the tests with:

```bash
# Run all tests
npm test

# Run tests with coverage
npx jest --coverage
```

### Test Coverage

Current test coverage is:
- Overall: 58.43% statements, 23.8% branches, 57.14% functions
- Services: 100% statements
- Redis Client: 90% statements
- WhatsApp Client: 35.57% statements (needs improvement)

## Installation and Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables (see `.env.example`)
4. Start the application:
   ```bash
   npm start
   ```

## Development

### Prerequisites

- Node.js 14+
- Redis server
- PostgreSQL database

### Running in Development Mode

```bash
npm run dev
```

### Running Tests

```bash
# Run the test script
./runTests.sh

# Or run individual test suites
npx jest __tests__/services/userService.test.js
npx jest __tests__/redisClient/clientInit.test.js
```

## Contributing

1. Create a feature branch
2. Add tests for new functionality
3. Ensure tests pass
4. Submit a pull request 