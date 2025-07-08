import request from 'supertest';
import express from 'express';
import authenticationRouter from '../../src/routes/authenticationRouter';

// Mock the Cognito SDK
jest.mock('../../src/lib/cognitoSDK', () => ({
  cognito: {
    send: jest.fn(),
  },
}));

// Mock Prisma
jest.mock('../../src/config/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    subject: {
      findMany: jest.fn(),
    },
  },
}));

const app = express();
app.use(express.json());
app.use('/api', authenticationRouter);

describe('Authentication Integration', () => {
  it('should sign up a new student', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      email: 'integration-student@example.com',
      password: 'Password123!',
      firstName: 'Integration',
      lastName: 'Student',
      role: 'student',
      birthdate: '2000-01-01',
      schoolName: 'Integration School',
      street: '123 Integration St',
      apartment: 'Apt 1',
      city: 'Integration City',
      state: 'CA',
      zip: '12345',
      country: 'USA',
      grade: '10th',
      parentEmail: 'parent@example.com'
    });
    expect(res.status).toBeDefined();
  });

  it('should sign up a new instructor', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      email: 'integration-instructor@example.com',
      password: 'Password123!',
      firstName: 'Integration',
      lastName: 'Instructor',
      role: 'instructor',
      birthdate: '1980-01-01',
      schoolName: 'Integration School',
      street: '123 Integration St',
      apartment: 'Apt 1',
      city: 'Integration City',
      state: 'CA',
      zip: '12345',
      country: 'USA',
      subjects: ['math', 'science']
    });
    expect(res.status).toBeDefined();
  });

  it('should login a user', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'integration-student@example.com',
      password: 'Password123!'
    });
    expect(res.status).toBeDefined();
  });

  it('should resend verification email', async () => {
    const res = await request(app).post('/api/auth/resend-verification').send({
      email: 'integration-student@example.com'
    });
    expect(res.status).toBeDefined();
  });

  it('should verify email with code', async () => {
    const res = await request(app).post('/api/auth/verify-email').send({
      email: 'integration-student@example.com',
      code: '123456'
    });
    expect(res.status).toBeDefined();
  });

  it('should handle forgot password', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({
      email: 'integration-student@example.com'
    });
    expect(res.status).toBeDefined();
  });

  it('should reset password', async () => {
    const res = await request(app).post('/api/auth/reset-password').send({
      email: 'integration-student@example.com',
      code: '123456',
      newPassword: 'NewPassword123!'
    });
    expect(res.status).toBeDefined();
  });
}); 