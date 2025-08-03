# API Tests

This directory contains comprehensive unit and integration tests for the ACM Cloud LAUSD API.

## Test Structure

```
tests/
├── controllers/           # Unit tests for controller functions
│   ├── authenticationController.test.ts
│   ├── userController.test.ts
│   ├── sessionController.test.ts
│   ├── reviewController.test.ts
│   └── subjectController.test.ts
├── middleware/            # Unit tests for middleware functions
│   └── auth.test.ts
├── routes/               # Integration tests for API routes
│   ├── authenticationRouter.test.ts
│   ├── userRouter.test.ts
│   ├── sessionRouter.test.ts
│   ├── reviewRouter.test.ts
│   └── subjectRouter.test.ts
├── config/               # Tests for configuration modules
│   ├── auth0.test.ts
│   └── prisma.test.ts
├── integration/          # End-to-end integration tests
│   └── app.test.ts
├── utils/                # Test utilities and helpers
│   ├── testUtils.ts
│   └── databaseUtils.ts
├── mocks/                # Mock objects for external dependencies
│   └── prismaMock.ts
├── setup.ts              # Test environment setup
└── index.test.ts         # Test index file
```

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### Specific Test File
```bash
npm test -- --testPathPattern=authenticationController
```

## Test Environment

Tests use a separate test environment with:
- Test database configuration
- Mocked external services (Auth0, etc.)
- Isolated test data

## Writing Tests

### Unit Tests
- Test individual functions in isolation
- Use mocks for external dependencies
- Focus on input validation, error handling, and business logic

### Integration Tests
- Test API endpoints end-to-end
- Use supertest for HTTP requests
- Test request/response cycles

### Test Utilities
- `createMockRequest()` - Create mock Express request objects
- `createMockResponse()` - Create mock Express response objects
- `createMockUser()` - Create mock user objects
- `mockNext` - Mock Express next function

## TODO

The following test files are currently empty and need implementation:

### Controllers
- [ ] authenticationController.test.ts
- [ ] userController.test.ts
- [ ] sessionController.test.ts
- [ ] reviewController.test.ts
- [ ] subjectController.test.ts

### Middleware
- [ ] auth.test.ts

### Routes
- [ ] authenticationRouter.test.ts
- [ ] userRouter.test.ts
- [ ] sessionRouter.test.ts
- [ ] reviewRouter.test.ts
- [ ] subjectRouter.test.ts

### Configuration
- [ ] auth0.test.ts
- [ ] prisma.test.ts

### Integration
- [ ] app.test.ts

## Best Practices

1. **Test Structure**: Use describe blocks to group related tests
2. **Naming**: Use descriptive test names that explain the expected behavior
3. **Setup/Teardown**: Use beforeEach/afterEach for test isolation
4. **Mocks**: Mock external dependencies to avoid side effects
5. **Coverage**: Aim for high test coverage, especially for critical paths
6. **Error Cases**: Test both success and error scenarios
7. **Edge Cases**: Test boundary conditions and invalid inputs 