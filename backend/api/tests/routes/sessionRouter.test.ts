import request from 'supertest';
import express from 'express';
import sessionRouter from '../../src/routes/sessionRouter';

const app = express();
app.use(express.json());
app.use('/api', sessionRouter);

describe('Session Router', () => {
  // TODO: Add integration tests for session routes
  // - GET /api/sessions
  // - GET /api/sessions/:id
  // - POST /api/sessions/:id/join
  // - POST /api/sessions/:id/leave
  // - GET /sessions
  // - GET /sessions/:id
  // - POST /sessions
  // - PUT /sessions/:id
  // - DELETE /sessions/:id

  it('should have session router defined', () => {
    expect(sessionRouter).toBeDefined();
  });
}); 