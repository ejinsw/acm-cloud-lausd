import request from 'supertest';
import express from 'express';
import subjectRouter from '../../src/routes/subjectRouter';

const app = express();
app.use(express.json());
app.use('/api', subjectRouter);

describe('Subject Router', () => {
  // TODO: Add integration tests for legacy subject route
  // - GET /api/subjects

  it('should have subject router defined', () => {
    expect(subjectRouter).toBeDefined();
  });
}); 
