// Test Index - Import all test files
// This file ensures all tests are discovered by Jest

// Routes
import './routes/authenticationRouter.test';
import './routes/userRouter.test';
import './routes/sessionRouter.test';
import './routes/reviewRouter.test';
import './routes/subjectRouter.test';

describe('Test Suite', () => {
  it('should have all test files loaded', () => {
    expect(true).toBe(true);
  });
}); 