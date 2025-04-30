#!/bin/bash

# Run all tests
echo "Running all tests..."
npm test

# Run specific test suites
echo "Running user service tests..."
npx jest __tests__/services/userService.test.js

echo "Running Redis client tests..."
npx jest __tests__/redisClient/clientInit.test.js

# Run tests with coverage
echo "Running tests with coverage..."
npx jest --coverage

echo "Tests completed." 