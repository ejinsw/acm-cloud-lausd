import request from 'supertest';
import express from 'express';
import authenticationRouter from '../../src/routes/authenticationRouter';

// Create a test Express app
const app = express();
app.use(express.json());
app.use('/api', authenticationRouter);

// Mock Auth0 management client
jest.mock('../../src/config/auth0', () => ({
  getAuth0ManagementClient: jest.fn(() => ({
    users: {
      create: jest.fn(),
      get: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    tickets: {
      createEmailVerification: jest.fn(),
    },
  })),
}));

// Mock Prisma database
jest.mock('../../src/config/prisma', () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

// Import mocked dependencies
import { getAuth0ManagementClient } from '../../src/config/auth0';
import { prisma } from '../../src/config/prisma';

const mockAuth0 = getAuth0ManagementClient() as jest.Mocked<ReturnType<typeof getAuth0ManagementClient>>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Signup Flow', () => {
    test('should complete full signup flow for instructor', async () => {
      const instructorData = {
        email: 'newinstructor@example.com',
        password: 'SecurePassword123!',
        firstName: 'New',
        lastName: 'Instructor',
        role: 'instructor' as const,
        subjects: ['Mathematics', 'Physics'],
      };

      // Step 1: Signup
      const mockAuth0User = {
        user_id: 'auth0|newuser123',
        email: 'newinstructor@example.com',
        email_verified: false,
      };
      mockAuth0.users.create.mockResolvedValue(mockAuth0User);

      const mockDbUser = {
        id: 'auth0|newuser123',
        email: 'newinstructor@example.com',
        firstName: 'New',
        lastName: 'Instructor',
        role: 'INSTRUCTOR',
        verified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.user.create.mockResolvedValue(mockDbUser);

      const signupResponse = await request(app)
        .post('/api/auth/signup')
        .send(instructorData)
        .expect(201);

      expect(signupResponse.body.user.verified).toBe(false);
      expect(signupResponse.body.user.role).toBe('INSTRUCTOR');

      // Step 2: Resend verification email
      mockAuth0.tickets.createEmailVerification.mockResolvedValue({});

      const resendResponse = await request(app)
        .post('/api/auth/resend-verification')
        .send({ email: 'newinstructor@example.com' })
        .expect(200);

      expect(resendResponse.body.message).toBe('Verification email sent');

      // Step 3: Verify email
      mockPrisma.user.findUnique.mockResolvedValue(mockDbUser);
      mockPrisma.user.update.mockResolvedValue({
        ...mockDbUser,
        verified: true,
      });

      const verifyResponse = await request(app)
        .post('/api/auth/verify-email')
        .send({
          code: '123456',
          email: 'newinstructor@example.com',
        })
        .expect(200);

      expect(verifyResponse.body.message).toBe('Email verified successfully');

      // Step 4: Login with verified account
      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockDbUser,
        verified: true,
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'newinstructor@example.com',
          password: 'SecurePassword123!',
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('token');
      expect(loginResponse.body.user.verified).toBe(true);
      expect(loginResponse.body.user.role).toBe('INSTRUCTOR');

      // Verify database calls
      expect(mockPrisma.user.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { email: 'newinstructor@example.com' },
        data: { verified: true },
      });
      expect(mockAuth0.users.create).toHaveBeenCalledWith({
        email: 'newinstructor@example.com',
        password: 'SecurePassword123!',
        connection: 'Username-Password-Authentication',
        name: 'New Instructor',
        user_metadata: {
          firstName: 'New',
          lastName: 'Instructor',
          role: 'instructor',
          subjects: ['Mathematics', 'Physics'],
        },
      });
    });

    test('should complete full signup flow for student', async () => {
      const studentData = {
        email: 'newstudent@example.com',
        password: 'SecurePassword123!',
        firstName: 'New',
        lastName: 'Student',
        role: 'student' as const,
        grade: '11th Grade',
      };

      // Step 1: Signup
      const mockAuth0User = {
        user_id: 'auth0|newstudent123',
        email: 'newstudent@example.com',
        email_verified: false,
      };
      mockAuth0.users.create.mockResolvedValue(mockAuth0User);

      const mockDbUser = {
        id: 'auth0|newstudent123',
        email: 'newstudent@example.com',
        firstName: 'New',
        lastName: 'Student',
        role: 'STUDENT',
        grade: '11th Grade',
        verified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.user.create.mockResolvedValue(mockDbUser);

      const signupResponse = await request(app)
        .post('/api/auth/signup')
        .send(studentData)
        .expect(201);

      expect(signupResponse.body.user.verified).toBe(false);
      expect(signupResponse.body.user.role).toBe('STUDENT');

      // Step 2: Verify email
      mockPrisma.user.findUnique.mockResolvedValue(mockDbUser);
      mockPrisma.user.update.mockResolvedValue({
        ...mockDbUser,
        verified: true,
      });

      const verifyResponse = await request(app)
        .post('/api/auth/verify-email')
        .send({
          code: '123456',
          email: 'newstudent@example.com',
        })
        .expect(200);

      // Step 3: Login
      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockDbUser,
        verified: true,
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'newstudent@example.com',
          password: 'SecurePassword123!',
        })
        .expect(200);

      expect(loginResponse.body.user.role).toBe('STUDENT');
      expect(loginResponse.body.user.grade).toBe('11th Grade');
    });
  });

  describe('Password Reset Flow', () => {
    test('should handle password reset flow', async () => {
      const userEmail = 'instructor@example.com';

      // Step 1: Request password reset
      const mockUser = {
        id: 'auth0|123456789',
        email: userEmail,
        role: 'INSTRUCTOR',
        verified: true,
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockAuth0.tickets.createEmailVerification.mockResolvedValue({});

      const resetResponse = await request(app)
        .post('/api/auth/resend-verification')
        .send({ email: userEmail })
        .expect(200);

      expect(resetResponse.body.message).toBe('Verification email sent');

      // Step 2: Verify the reset (simulating email verification)
      mockPrisma.user.update.mockResolvedValue({
        ...mockUser,
        verified: true,
      });

      const verifyResponse = await request(app)
        .post('/api/auth/verify-email')
        .send({
          code: '123456',
          email: userEmail,
        })
        .expect(200);

      expect(verifyResponse.body.message).toBe('Email verified successfully');
    });
  });

  describe('Session Management', () => {
    test('should handle login and logout flow', async () => {
      const loginData = {
        email: 'instructor@example.com',
        password: 'SecurePassword123!',
      };

      // Step 1: Login
      const mockUser = {
        id: 'auth0|123456789',
        email: 'instructor@example.com',
        role: 'INSTRUCTOR',
        verified: true,
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      const token = loginResponse.body.token;
      expect(token).toBeDefined();

      // Step 2: Access protected route
      const tokensResponse = await request(app)
        .get('/api/auth/tokens')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Step 3: Logout
      const logoutResponse = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(logoutResponse.body.message).toBe('Logged out successfully');
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle Auth0 service failures gracefully', async () => {
      const instructorData = {
        email: 'instructor@example.com',
        password: 'SecurePassword123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'instructor' as const,
        subjects: ['Mathematics'],
      };

      // Mock Auth0 failure
      mockAuth0.users.create.mockRejectedValue(new Error('Auth0 service unavailable'));

      const signupResponse = await request(app)
        .post('/api/auth/signup')
        .send(instructorData)
        .expect(500);

      expect(signupResponse.body.error).toContain('service');
    });

    test('should handle database failures gracefully', async () => {
      const instructorData = {
        email: 'instructor@example.com',
        password: 'SecurePassword123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'instructor' as const,
        subjects: ['Mathematics'],
      };

      // Mock Auth0 success but database failure
      const mockAuth0User = {
        user_id: 'auth0|123456789',
        email: 'instructor@example.com',
        email_verified: false,
      };
      mockAuth0.users.create.mockResolvedValue(mockAuth0User);
      mockPrisma.user.create.mockRejectedValue(new Error('Database connection failed'));

      const signupResponse = await request(app)
        .post('/api/auth/signup')
        .send(instructorData)
        .expect(500);

      expect(signupResponse.body.error).toContain('database');
    });
  });

  describe('Data Consistency', () => {
    test('should maintain data consistency between Auth0 and database', async () => {
      const instructorData = {
        email: 'instructor@example.com',
        password: 'SecurePassword123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'instructor' as const,
        subjects: ['Mathematics'],
      };

      // Step 1: Create user in Auth0
      const mockAuth0User = {
        user_id: 'auth0|123456789',
        email: 'instructor@example.com',
        email_verified: false,
      };
      mockAuth0.users.create.mockResolvedValue(mockAuth0User);

      // Step 2: Create user in database
      const mockDbUser = {
        id: 'auth0|123456789', // Same ID as Auth0
        email: 'instructor@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'INSTRUCTOR',
        verified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.user.create.mockResolvedValue(mockDbUser);

      const signupResponse = await request(app)
        .post('/api/auth/signup')
        .send(instructorData)
        .expect(201);

      // Verify IDs match
      expect(signupResponse.body.user.id).toBe('auth0|123456789');
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id: 'auth0|123456789',
          email: 'instructor@example.com',
        }),
      });
    });
  });

  describe('Cookie Management', () => {
    test('should set and clear cookies properly', async () => {
      const loginData = {
        email: 'instructor@example.com',
        password: 'SecurePassword123!',
      };

      const mockUser = {
        id: 'auth0|123456789',
        email: 'instructor@example.com',
        role: 'INSTRUCTOR',
        verified: true,
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      // Login should set cookies
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(loginResponse.headers['set-cookie']).toBeDefined();
      const cookies = loginResponse.headers['set-cookie'];
      expect(cookies).toContain('token=');

      // Logout should clear cookies
      const logoutResponse = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${loginResponse.body.token}`)
        .expect(200);

      const logoutCookies = logoutResponse.headers['set-cookie'];
      expect(logoutCookies).toContain('token=;');
    });
  });
}); 