# AttenixBot Test Coverage Plan

## Current Coverage Status

We have implemented unit tests for several components:

- ✅ Email client (sending functionality)
  - Complete tests for email sending, error handling, and parameter validation
  - Located in `emailClient/__tests__/sendEmail.test.js`

- ✅ User service (database operations with mocks)
  - Complete tests for user creation, retrieval, and phone verification
  - Located in `services/__tests__/userService.test.js`

- ✅ WhatsApp client (basic message handling)
  - Basic message response tests
  - Located in `whatsappClient/__tests__/whatsapp-client.test.js`
  - Command handling tests in `whatsappClient/__tests__/message-flow.test.js`

- ✅ Attenix login (mocked)
  - Login functionality with mock implementations
  - Located in `attenixClient/__tests__/attenix-login.test.js`

- ✅ Utility functions (cipher, email validation, random number generation)
  - Complete tests for email validation, hex encoding, random number generation
  - Located in `utils/__tests__/cipherUtils.test.js`

## Created Test Templates

The following test templates have been created as part of the implementation plan:

1. ✅ WhatsApp Message Flow Test Template
   - Structured tests for message handling, authentication, and command routing
   - Located in `whatsappClient/__tests__/message-flow.test.js`
   - 4 tests implemented, 3 pending

2. ✅ WhatsApp-User Service Integration Test Template
   - Framework for testing user registration, authentication, and verification flows
   - Located in `__tests__/integration/whatsapp-user-integration.test.js`
   - Ready for implementation in Phase 1

3. ✅ Redis Client Test Template
   - Structure for testing connection handling, cache operations, and error cases
   - Located in `redisClient/__tests__/redis-client.test.js`
   - Ready for implementation in Phase 2

## Coverage Goals

- **Unit Tests**: Achieve at least 80% code coverage for all modules
- **Integration Tests**: Cover all critical user flows and component interactions
- **Error Handling**: Test all error conditions and edge cases
- **Security**: Verify input validation and authentication safeguards

## Areas Requiring Test Coverage

### 1. WhatsApp Client (High Priority)

- [🔄] Message flow handling
  - [✅] Test command handler functionality (implemented)
  - [ ] Test handleMessage with different message types
  - [ ] Test authentication wrapper
  - [ ] Test verification handling
  - **Acceptance Criteria**: Must validate all command paths and error responses
  - **Implementation Status**: Partial implementation in `whatsappClient/__tests__/message-flow.test.js`

- [ ] Client initialization
  - [ ] Test QR code generation
  - [ ] Test event listeners
  - [ ] Test ready state handling
  - **Acceptance Criteria**: Must verify proper start-up sequence and event registration

- [ ] Assignment handling
  - [ ] Test assignment selection
  - [ ] Test assignment confirmation
  - [ ] Test error handling during assignment process
  - **Acceptance Criteria**: Must verify correct selection and submission of assignments

### 2. Attenix Client (High Priority)

- [✓] Login process (Basic tests completed)
  - [ ] Test actual login sequence (Advanced scenarios)
  - [ ] Test session management
  - [ ] Test error handling
  - **Acceptance Criteria**: Must validate successful login, session persistence, and proper error messages
  - **Implementation Status**: Basic tests in `attenixClient/__tests__/attenix-login.test.js`

- [ ] Assignment handling
  - [ ] Test assignment retrieval
  - [ ] Test assignment selection
  - [ ] Test submission process
  - **Acceptance Criteria**: Must verify assignments are correctly retrieved, selected, and submitted

- [ ] Punch functionality
  - [ ] Test punch in/out
  - [ ] Test time tracking
  - [ ] Test error states
  - **Acceptance Criteria**: Must confirm accurate time recording and error recovery

### 3. Redis Client (Medium Priority)

- [ ] Connection handling
  - [ ] Test connection establishment
  - [ ] Test reconnection logic
  - [ ] Test connection error handling
  - **Acceptance Criteria**: Must verify resilience during connection issues
  - **Implementation Status**: Template created in `redisClient/__tests__/redis-client.test.js`

- [ ] Cache operations
  - [ ] Test get/set operations
  - [ ] Test cache invalidation
  - [ ] Test expiration policy
  - **Acceptance Criteria**: Must validate data integrity and proper expiration behavior
  - **Implementation Status**: Template created in `redisClient/__tests__/redis-client.test.js`

### 4. Database Client (Medium Priority)

- [✓] Query execution (Basic tests via userService)
  - [ ] Test query formatting
  - [ ] Test parameter binding
  - [ ] Test result parsing
  - **Acceptance Criteria**: Must prevent SQL injection and correctly handle query results
  - **Implementation Status**: Partially tested through `services/__tests__/userService.test.js`

- [ ] Connection handling
  - [ ] Test successful connection
  - [ ] Test connection failures
  - [ ] Test reconnection attempts
  - **Acceptance Criteria**: Must verify automatic reconnection and error reporting

### 5. Utility Functions (Low Priority)

- [✓] Data validation and encoding
  - [✓] Test email validation
  - [✓] Test hex encoding
  - [✓] Test random number generation
  - **Implementation Status**: Complete in `utils/__tests__/cipherUtils.test.js`

- [ ] WhatsApp telephone handler
  - [ ] Test number formatting
  - [ ] Test validation rules
  - [ ] Test international number handling
  - **Acceptance Criteria**: Must handle all phone number formats correctly

### 6. Integration Tests (High Priority)

- [ ] WhatsApp and User Service integration
  - [ ] Test user registration flow
  - [ ] Test authentication flow
  - **Acceptance Criteria**: Must verify end-to-end user registration and authentication
  - **Implementation Status**: Template created in `__tests__/integration/whatsapp-user-integration.test.js`

- [ ] WhatsApp and Attenix integration
  - [ ] Test assignment relay
  - [ ] Test status reporting
  - **Acceptance Criteria**: Must confirm assignments flow correctly between systems

- [ ] Email and User Service integration
  - [✓] Test email sending (Unit tests)
  - [ ] Test verification email flow
  - [ ] Test user notification
  - **Acceptance Criteria**: Must verify email delivery and verification processes
  - **Implementation Status**: Basic tests in `emailClient/__tests__/sendEmail.test.js`

### 7. End-to-End Tests (Medium Priority)

- [ ] Complete user journeys
  - [ ] Test registration to assignment submission
  - [ ] Test login to punch out
  - [ ] Test error recovery paths
  - **Acceptance Criteria**: Must validate entire user workflows without errors

## Test Environment Setup

### Local Development Environment
- Jest as the test runner
- Local PostgreSQL database for integration tests
- Docker containers for Redis and other dependencies
- Environmental variables for test configuration

### CI/CD Pipeline Environment
- Dedicated test database with sanitized data
- Mock external services (Attenix API, email service)
- Automated test execution on pull requests
- Test coverage reporting and threshold enforcement

## Mocking Strategies

### External Service Mocking
- **WhatsApp Web.js**: Mock Client class and message events
- **Redis**: Mock client methods for connection and data operations
- **Email Service**: Mock nodemailer for email verification tests
- **Attenix API**: Mock responses for login, assignments, and punches

### Database Mocking
- Use in-memory database for unit tests
- Use test database for integration tests
- Provide seeded data for consistent test results
- Reset database state between test runs

## Implementation Plan

### Phase 1: Critical Component Testing (Weeks 1-2)

1. Complete WhatsApp Client unit tests
   - **Status**: Partially implemented (4/7 tests for message-flow.test.js)
   - **Progress**: Verified that the command handler works as expected
   - **Next Steps**: Implement remaining tests for message handling and auth wrapper

2. Implement Attenix Client core functionality tests
   - **Status**: Basic login tests completed
   - **Next Steps**: Implement assignment and punch functionality tests

3. Create basic integration tests for WhatsApp + User Service
   - **Status**: Template created
   - **Next Steps**: Implement actual tests from template

### Phase 2: Supporting Services (Weeks 3-4)

1. Implement Redis Client tests
   - **Status**: Template created
   - **Next Steps**: Implement actual tests from template

2. Implement Database Client tests
   - **Status**: Partially covered through userService tests
   - **Next Steps**: Create dedicated connection and error handling tests

3. Complete remaining utility function tests
   - **Status**: Core utility functions tested
   - **Next Steps**: Add telephone handling tests

### Phase 3: Integration and E2E (Weeks 5-6)

1. Complete all integration test scenarios
   - **Status**: Templates created for key integration points
   - **Next Steps**: Implement full integration tests

2. Implement key end-to-end user journeys
   - **Status**: Not started
   - **Next Steps**: Create E2E test framework

3. Performance and load testing
   - **Status**: Not started
   - **Next Steps**: Design performance test scenarios

## Testing Approaches

1. **Unit Tests**: Jest for component-level testing
2. **Mock Services**: Use jest.mock() for external dependencies
3. **Integration Tests**: Test interactions between multiple components
4. **E2E Tests**: Simulate complete user interactions

## Test Documentation Requirements

1. **Test Description**: Each test must have a clear description of the functionality being tested
2. **Test Coverage Report**: Generated after each test run to verify coverage metrics
3. **Test Comments**: Complex test scenarios must include explanatory comments
4. **Test Data**: Test fixtures and mock data should be clearly documented
5. **Edge Cases**: Specific tests for boundary conditions and error scenarios must be included

## Continuous Integration

- [ ] Setup automated test runs on PR submissions
- [ ] Configure coverage reporting with minimum threshold of 80%
- [ ] Implement quality gates based on test coverage
- [ ] Generate test summary reports for each build

## Tools and Libraries

- Jest for test execution
- Mock-Service-Worker for API mocking
- Supertest for HTTP endpoint testing
- Istanbul for code coverage analysis
- Jest-HTML-Reporter for readable test reports 