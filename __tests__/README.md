# AttenixBot Test Suite

This directory contains test files for the AttenixBot application. The test suite uses Jest as the testing framework.

## Test Structure

The tests are organized by service/module:

- `__tests__/services/`: Tests for service modules
- `__tests__/redisClient/`: Tests for Redis client functionality
- `__tests__/integration/`: Integration tests that verify interactions between components

## Running Tests

You can run the tests using the following commands:

```bash
# Run all tests
npm test

# Run a specific test file
npx jest path/to/test.js

# Run tests for a specific service
npx jest __tests__/services/

# Run tests with coverage report
npx jest --coverage
```

## Test Coverage

The test suite aims to cover:

1. **Unit Tests**:
   - Service functions
   - Client implementations
   - Utility functions

2. **Integration Tests**:
   - WhatsApp and User Service integration
   - Redis and service interactions

## Mocking Strategy

Most tests use Jest mocks to isolate the component being tested. For example:

- Database queries are mocked to avoid actual database connections
- Redis operations are mocked to avoid actual Redis connections
- External services like WhatsApp are mocked

## Available Test Files

- `services/userService.test.js`: Tests for user-related operations
- `redisClient/clientInit.test.js`: Tests for Redis client operations
- `integration/whatsapp-user-integration.test.js`: Tests for WhatsApp and user service integration

## Running with the Test Script

You can also use the shell script `runTests.sh` in the project root to run various test configurations:

```bash
./runTests.sh
```

This will run all tests, specific service tests, and generate a coverage report. 