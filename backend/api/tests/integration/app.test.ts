import request from 'supertest';
import express from 'express';
import authenticationRouter from '../../src/routes/authenticationRouter';
import userRouter from '../../src/routes/userRouter';
import sessionRouter from '../../src/routes/sessionRouter';
import reviewRouter from '../../src/routes/reviewRouter';
import subjectRouter from '../../src/routes/subjectRouter';

const app = express();
app.use(express.json());
app.use('/api', authenticationRouter);
app.use('/api', userRouter);
app.use('/api', sessionRouter);
app.use('/api', reviewRouter);
app.use('/api', subjectRouter);

describe('App Integration Tests', () => {
  // TODO: Add integration tests for the main app
  // - Health check endpoint
  // - 404 handling
  // - Error handling middleware
  // - CORS configuration
  // - Request logging

  it('should have app defined', () => {
    expect(app).toBeDefined();
  });
}); 