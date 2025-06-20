// Test Index - Import all test files
// This file ensures all tests are discovered by Jest

// Controllers
import './controllers/authenticationController.test';
import './controllers/userController.test';
import './controllers/sessionController.test';
import './controllers/reviewController.test';
import './controllers/subjectController.test';

// Middleware
import './middleware/auth.test';

// Routes
import './routes/authenticationRouter.test';
import './routes/userRouter.test';
import './routes/sessionRouter.test';
import './routes/reviewRouter.test';
import './routes/subjectRouter.test';

// Config
import './config/auth0.test';
import './config/prisma.test';

// Integration
import './integration/app.test';

describe('Test Suite', () => {
  it('should have all test files loaded', () => {
    expect(true).toBe(true);
  });
}); 