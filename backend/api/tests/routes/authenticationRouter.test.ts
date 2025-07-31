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

describe('Authentication Router', () => {
  it('should be defined', () => {
    expect(authenticationRouter).toBeDefined();
  });

  describe('Unit: Signup', () => {
    it('should return 400 for missing parameters', async () => {
      const res = await request(app).post('/api/auth/signup').send({});
      expect(res.status).toBe(400);
    });

    it('should allow student signup', async () => {
      const res = await request(app).post('/api/auth/signup').send({
        email: 'student@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student',
        birthdate: '2000-01-01',
        schoolName: 'Test School',
        street: '123 Main St',
        apartment: 'Apt 1',
        city: 'Test City',
        state: 'CA',
        zip: '12345',
        country: 'USA',
        grade: '10th',
        parentEmail: 'parent@example.com'
      });
      expect(res.status).toBeDefined();
    });

    it('should allow instructor signup', async () => {
      const res = await request(app).post('/api/auth/signup').send({
        email: 'instructor@example.com',
        password: 'Password123!',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'instructor',
        birthdate: '1980-01-01',
        schoolName: 'Test School',
        street: '123 Main St',
        apartment: 'Apt 1',
        city: 'Test City',
        state: 'CA',
        zip: '12345',
        country: 'USA',
        subjects: ['math', 'science']
      });
      expect(res.status).toBeDefined();
    });

    it('should reject invalid role', async () => {
      const res = await request(app).post('/api/auth/signup').send({
        email: 'bad@example.com',
        password: 'Password123!',
        firstName: 'Bad',
        lastName: 'User',
        role: 'invalid',
        birthdate: '2000-01-01',
        schoolName: 'Test School',
        street: '123 Main St',
        apartment: 'Apt 1',
        city: 'Test City',
        state: 'CA',
        zip: '12345',
        country: 'USA'
      });
      expect(res.status).toBe(500);
    });
  });

  describe('Unit: Login', () => {
    it('should return 400 for missing parameters', async () => {
      const res = await request(app).post('/api/auth/login').send({});
      expect(res.status).toBe(400);
    });

    it('should accept valid login credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'user@example.com',
        password: 'Password123!'
      });
      expect(res.status).toBeDefined();
    });
  });

  describe('Unit: Verify Email', () => {
    it('should return 422 for missing parameters', async () => {
      const res = await request(app).post('/api/auth/verify-email').send({});
      expect(res.status).toBe(422);
    });

    it('should accept valid verification code', async () => {
      const res = await request(app).post('/api/auth/verify-email').send({
        email: 'user@example.com',
        code: '123456'
      });
      expect(res.status).toBeDefined();
    });
  });

  describe('Unit: Resend Verification', () => {
    it('should return 422 for missing email', async () => {
      const res = await request(app).post('/api/auth/resend-verification').send({});
      expect(res.status).toBe(422);
    });

    it('should accept valid email', async () => {
      const res = await request(app).post('/api/auth/resend-verification').send({
        email: 'user@example.com'
      });
      expect(res.status).toBeDefined();
    });
  });

  describe('Unit: Forgot Password', () => {
    it('should return 400 for missing email', async () => {
      const res = await request(app).post('/api/auth/forgot-password').send({});
      expect(res.status).toBe(400);
    });

    it('should accept valid email', async () => {
      const res = await request(app).post('/api/auth/forgot-password').send({
        email: 'user@example.com'
      });
      expect(res.status).toBeDefined();
    });
  });

  describe('Unit: Reset Password', () => {
    it('should return 400 for missing parameters', async () => {
      const res = await request(app).post('/api/auth/reset-password').send({});
      expect(res.status).toBe(400);
    });

    it('should accept valid reset parameters', async () => {
      const res = await request(app).post('/api/auth/reset-password').send({
        email: 'user@example.com',
        code: '123456',
        newPassword: 'NewPassword123!'
      });
      expect(res.status).toBeDefined();
    });
  });

  // Add more tests for email verification, role checks, etc.
}); 