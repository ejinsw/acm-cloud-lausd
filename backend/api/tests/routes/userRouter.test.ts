import request from 'supertest';
import express from 'express';
import userRouter from '../../src/routes/userRouter';

const app = express();
app.use(express.json());
app.use('/api', userRouter);

describe('User Router', () => {
  // TODO: Add integration tests for user routes
  // - GET /api/users/profile
  // - PUT /api/users/profile
  // - DELETE /api/users/profile
  // - GET /api/users/students
  // - GET /api/users/instructors
  // - GET /api/users/sessions
  // - GET /api/users/reviews
  // - GET /instructors
  // - GET /instructors/:id
  // - PUT /instructors/:id
  // - DELETE /instructors/:id

  it('should have user router defined', () => {
    expect(userRouter).toBeDefined();
  });
}); 