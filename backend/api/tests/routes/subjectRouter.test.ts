import request from 'supertest';
import express from 'express';
import subjectRouter from '../../src/routes/subjectRouter';

const app = express();
app.use(express.json());
app.use('/api', subjectRouter);

describe('Subject Router', () => {
  // TODO: Add integration tests for subject routes
  // - GET /api/subjects
  // - GET /api/subjects/:id
  // - POST /api/subjects
  // - PUT /api/subjects/:id
  // - DELETE /api/subjects/:id
  // - GET /subjects
  // - GET /subjects/:name

  it('should have subject router defined', () => {
    expect(subjectRouter).toBeDefined();
  });
}); 