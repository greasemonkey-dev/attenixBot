# Testing Approach

This project uses Jest for testing with a centralized testing structure.

## Directory Structure

All tests are organized in the central `__tests__` directory, with subdirectories mirroring the project structure:

```
__tests__/
├── attenixClient/     # Tests for attenixClient module
├── emailClient/       # Tests for emailClient module
├── integration/       # Integration tests across multiple modules
├── redisClient/       # Tests for redisClient module
├── services/          # Tests for services module
├── utils/             # Tests for utility functions
└── whatsappClient/    # Tests for whatsappClient module
```

## Test File Naming

Test files follow the naming convention:
- `moduleName.test.js` for unit tests
- `feature-integration.test.js` for integration tests

## Import Paths

Since tests are located in a centralized directory, imports in test files use relative paths from the test file to the module being tested:

```javascript
// Example: Importing a module from utils in a test
const { someUtil } = require('../../utils/someUtil');
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests for a specific module
npm test -- --testPathPattern=redisClient

# Run a specific test file
npm test -- path/to/test/file.test.js
```

## Best Practices

1. Mock external dependencies
2. Group tests logically with `describe` blocks
3. Write meaningful test names with `it` or `test` functions
4. Set up and tear down test state with `beforeEach` and `afterEach`
5. Isolate tests to prevent interdependencies

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