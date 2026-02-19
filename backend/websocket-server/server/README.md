# WebSocket Server Testing

This directory contains test stubs for the WebSocket chat server. All tests currently pass but are minimal implementations that need to be filled in with actual test logic.

## Test Structure

```
tests/
├── setup.js                    # Basic test configuration
├── unit/                       # Unit test stubs for individual functions
│   ├── helper-functions.test.js
│   ├── room-management.test.js
│   ├── message-handling.test.js
│   └── user-management.test.js
└── integration/                # Integration test stubs for full server functionality
    └── websocket-server.test.js
```

## Current Status

✅ **All tests pass** - Basic test structure is in place  
⚠️ **Tests are stubs** - Need to be filled in with actual test logic  
📝 **TODO comments** - Each test has a TODO comment explaining what needs to be implemented  

## Development

### Install Dependencies
```bash
npm install
```

### Running the Server

#### Production Mode
```bash
npm start
```

#### Development Mode (with nodemon hot reloading)
```bash
npm run dev
```

The server will automatically restart when you make changes to `index.js` or `daxSTORE.js`.

#### Using Docker Compose
The WebSocket server is configured to run with nodemon in Docker:
```bash
# From the project root
docker-compose up websocket-server
```

Changes to the server files will automatically trigger a restart inside the container.

### Nodemon Configuration

The server uses nodemon for development with the following settings (see `nodemon.json`):
- Watches: `index.js`, `daxSTORE.js`
- File extensions: `.js`, `.json`
- Ignores: `node_modules`, `tests`, `coverage`
- Restart delay: 1 second

## Running Tests

### Run All Tests
```bash
npm test
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Specific Test Categories
```bash
# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

## Test Categories

### Unit Tests (Stubs)
- **Helper Functions**: Tests for utility functions like `sanitizeInput`, `broadcastToRoom`, `getRoomList`
- **Room Management**: Tests for room creation, joining, and leaving functionality
- **Message Handling**: Tests for message processing, profanity filtering, and message deletion
- **User Management**: Tests for user identification, permissions, and kicking functionality

### Integration Tests (Stubs)
- **WebSocket Server**: End-to-end tests that connect to a real WebSocket server instance
- Tests real message flow between clients
- Tests server behavior with multiple concurrent connections

## What Needs to Be Done

### 1. Fill in Unit Tests
Each unit test currently has a `TODO` comment. Replace the `expect(true).toBe(true)` with actual test logic:

```javascript
// Current stub
test('should sanitize HTML special characters', () => {
    // TODO: Implement test for HTML sanitization
    expect(true).toBe(true);
});

// Should become something like:
test('should sanitize HTML special characters', () => {
    const result = sanitizeInput('<script>alert("xss")</script>');
    expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
});
```

### 2. Fill in Integration Tests
Integration tests need to:
- Start a real WebSocket server instance
- Connect real WebSocket clients
- Send actual messages
- Verify server responses

### 3. Add Test Utilities
Create helper functions in `setup.js` for:
- Mock WebSocket connections
- Mock room and user objects
- Test data generators
- Async test helpers

### 4. Add Proper Mocking
Set up mocks for:
- UUID generation (for consistent test IDs)
- Profanity library
- Console output (to reduce test noise)

## Example of What a Complete Test Should Look Like

```javascript
describe('sanitizeInput', () => {
    test('should sanitize HTML special characters', () => {
        const input = '<script>alert("xss")</script>';
        const expected = '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;';
        const result = sanitizeInput(input);
        expect(result).toBe(expected);
    });

    test('should return empty string for non-string input', () => {
        expect(sanitizeInput(null)).toBe('');
        expect(sanitizeInput(undefined)).toBe('');
        expect(sanitizeInput(123)).toBe('');
        expect(sanitizeInput({})).toBe('');
    });
});
```

## Test Coverage Goals

Once implemented, tests should cover:

- ✅ User identification and authentication
- ✅ Room creation and management
- ✅ Message sending and broadcasting
- ✅ Profanity filtering
- ✅ Message deletion (instructor permissions)
- ✅ User kicking (instructor permissions)
- ✅ Error handling and edge cases
- ✅ WebSocket connection lifecycle
- ✅ Input sanitization and security
- ✅ Multi-client scenarios

## Next Steps

1. **Start with unit tests** - Pick one function and implement its tests
2. **Add test utilities** - Create helper functions in `setup.js`
3. **Implement integration tests** - Start with basic connection tests
4. **Add proper mocking** - Set up mocks for external dependencies
5. **Run coverage** - Ensure all code paths are tested

## Troubleshooting

### Common Issues
1. **Tests failing** - Check that you're testing the actual server functions
2. **Import errors** - Make sure you're importing the functions you want to test
3. **Async issues** - Use proper async/await patterns for WebSocket tests

### Debug Mode
Run tests with verbose output:
```bash
npm test -- --verbose
``` 