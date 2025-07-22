import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import userRouter from '../../src/routes/userRouter';

// Mock authentication and role middleware
jest.mock('../../src/middleware/auth', () => ({
  authenticateToken: (req: Request, res: Response, next: NextFunction) => next(),
  checkRole: () => (req: Request, res: Response, next: NextFunction) => next(),
}));

// Mock userController methods
jest.mock('../../src/controllers/userController', () => ({
  getUserProfile: (req: Request, res: Response) => res.status(200).json({ message: 'getUserProfile' }),
  updateUserProfile: (req: Request, res: Response) => res.status(200).json({ message: 'updateUserProfile' }),
  deleteUser: (req: Request, res: Response) => res.status(200).json({ message: 'deleteUser' }),
  getStudents: (req: Request, res: Response) => res.status(200).json({ message: 'getStudents' }),
  getInstructors: (req: Request, res: Response) => res.status(200).json({ message: 'getInstructors' }),
  getUserSessions: (req: Request, res: Response) => res.status(200).json({ message: 'getUserSessions' }),
  getUserReviews: (req: Request, res: Response) => res.status(200).json({ message: 'getUserReviews' }),
  getAllInstructors: (req: Request, res: Response) => res.status(200).json({ message: 'getAllInstructors' }),
  getInstructorById: (req: Request, res: Response) => res.status(200).json({ message: 'getInstructorById' }),
  updateInstructor: (req: Request, res: Response) => res.status(200).json({ message: 'updateInstructor' }),
  deleteInstructor: (req: Request, res: Response) => res.status(200).json({ message: 'deleteInstructor' }),
}));

const app = express();
app.use(express.json());
app.use('/api', userRouter);

describe('User Router', () => {
  it('GET /api/users/profile should get user profile', async () => {
    const res = await request(app).get('/api/users/profile');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('getUserProfile');
  });

  it('PUT /api/users/profile should update user profile', async () => {
    const res = await request(app).put('/api/users/profile').send({ street: '123 Main St' });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('updateUserProfile');
  });

  it('DELETE /api/users/profile should delete user', async () => {
    const res = await request(app).delete('/api/users/profile');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('deleteUser');
  });

  it('GET /api/users/students should get students (instructor only)', async () => {
    const res = await request(app).get('/api/users/students');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('getStudents');
  });

  it('GET /api/users/instructors should get instructors (student only)', async () => {
    const res = await request(app).get('/api/users/instructors');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('getInstructors');
  });

  it('GET /api/users/sessions should get user sessions', async () => {
    const res = await request(app).get('/api/users/sessions');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('getUserSessions');
  });

  it('GET /api/users/reviews should get user reviews', async () => {
    const res = await request(app).get('/api/users/reviews');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('getUserReviews');
  });

  describe('Authorization and Role Checks', () => {
    it('should return 401 if not authenticated', async () => {
      jest.resetModules();
      jest.doMock('../../src/middleware/auth', () => ({
        authenticateToken: (req: Request, res: Response, next: NextFunction) => res.status(401).json({ error: 'Unauthorized' }),
        checkRole: () => (req: Request, res: Response, next: NextFunction) => next(),
      }));
      const app401 = express();
      app401.use(express.json());
      app401.use('/api', require('../../src/routes/userRouter').default);
      const res = await request(app401).get('/api/users/profile');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
    });

    it('should return 403 if forbidden (wrong role)', async () => {
      jest.resetModules();
      jest.doMock('../../src/middleware/auth', () => ({
        authenticateToken: (req: Request, res: Response, next: NextFunction) => next(),
        checkRole: () => (req: Request, res: Response, next: NextFunction) => res.status(403).json({ error: 'Forbidden' }),
      }));
      const app403 = express();
      app403.use(express.json());
      app403.use('/api', require('../../src/routes/userRouter').default);
      const res = await request(app403).get('/api/users/students');
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Forbidden');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      jest.resetModules();
    });
    it('should return 404 if user not found', async () => {
      jest.doMock('../../src/controllers/userController', () => ({
        getUserProfile: (req: Request, res: Response) => res.status(404).json({ error: 'User not found' }),
        updateUserProfile: (req: Request, res: Response) => res.status(200).json({ message: 'updateUserProfile' }),
        deleteUser: (req: Request, res: Response) => res.status(200).json({ message: 'deleteUser' }),
        getStudents: (req: Request, res: Response) => res.status(200).json({ message: 'getStudents' }),
        getInstructors: (req: Request, res: Response) => res.status(200).json({ message: 'getInstructors' }),
        getUserSessions: (req: Request, res: Response) => res.status(200).json({ message: 'getUserSessions' }),
        getUserReviews: (req: Request, res: Response) => res.status(200).json({ message: 'getUserReviews' }),
        getAllInstructors: (req: Request, res: Response) => res.status(200).json({ message: 'getAllInstructors' }),
        getInstructorById: (req: Request, res: Response) => res.status(200).json({ message: 'getInstructorById' }),
        updateInstructor: (req: Request, res: Response) => res.status(200).json({ message: 'updateInstructor' }),
        deleteInstructor: (req: Request, res: Response) => res.status(200).json({ message: 'deleteInstructor' }),
      }));
      const app404 = express();
      app404.use(express.json());
      app404.use('/api', require('../../src/routes/userRouter').default);
      const res = await request(app404).get('/api/users/profile');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('User not found');
    });
    it('should return 500 on server error', async () => {
      jest.doMock('../../src/controllers/userController', () => ({
        getUserProfile: (req: Request, res: Response) => res.status(500).json({ error: 'Server error' }),
        updateUserProfile: (req: Request, res: Response) => res.status(200).json({ message: 'updateUserProfile' }),
        deleteUser: (req: Request, res: Response) => res.status(200).json({ message: 'deleteUser' }),
        getStudents: (req: Request, res: Response) => res.status(200).json({ message: 'getStudents' }),
        getInstructors: (req: Request, res: Response) => res.status(200).json({ message: 'getInstructors' }),
        getUserSessions: (req: Request, res: Response) => res.status(200).json({ message: 'getUserSessions' }),
        getUserReviews: (req: Request, res: Response) => res.status(200).json({ message: 'getUserReviews' }),
        getAllInstructors: (req: Request, res: Response) => res.status(200).json({ message: 'getAllInstructors' }),
        getInstructorById: (req: Request, res: Response) => res.status(200).json({ message: 'getInstructorById' }),
        updateInstructor: (req: Request, res: Response) => res.status(200).json({ message: 'updateInstructor' }),
        deleteInstructor: (req: Request, res: Response) => res.status(200).json({ message: 'deleteInstructor' }),
      }));
      const app500 = express();
      app500.use(express.json());
      app500.use('/api', require('../../src/routes/userRouter').default);
      const res = await request(app500).get('/api/users/profile');
      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Server error');
    });
  });

  describe('Input Validation', () => {
    beforeEach(() => {
      jest.resetModules();
    });
    it('should return 400 for invalid update input', async () => {
      jest.doMock('../../src/controllers/userController', () => ({
        getUserProfile: (req: Request, res: Response) => res.status(200).json({ message: 'getUserProfile' }),
        updateUserProfile: (req: Request, res: Response) => res.status(400).json({ error: 'Invalid input' }),
        deleteUser: (req: Request, res: Response) => res.status(200).json({ message: 'deleteUser' }),
        getStudents: (req: Request, res: Response) => res.status(200).json({ message: 'getStudents' }),
        getInstructors: (req: Request, res: Response) => res.status(200).json({ message: 'getInstructors' }),
        getUserSessions: (req: Request, res: Response) => res.status(200).json({ message: 'getUserSessions' }),
        getUserReviews: (req: Request, res: Response) => res.status(200).json({ message: 'getUserReviews' }),
        getAllInstructors: (req: Request, res: Response) => res.status(200).json({ message: 'getAllInstructors' }),
        getInstructorById: (req: Request, res: Response) => res.status(200).json({ message: 'getInstructorById' }),
        updateInstructor: (req: Request, res: Response) => res.status(200).json({ message: 'updateInstructor' }),
        deleteInstructor: (req: Request, res: Response) => res.status(200).json({ message: 'deleteInstructor' }),
      }));
      const app400 = express();
      app400.use(express.json());
      app400.use('/api', require('../../src/routes/userRouter').default);
      const res = await request(app400).put('/api/users/profile').send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid input');
    });
  });

  // Add tests for the new public routes
  it('GET /api/instructors should get all instructors', async () => {
    const res = await request(app).get('/api/instructors');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('getAllInstructors');
  });
  it('GET /api/instructors/:id should get instructor by id', async () => {
    const res = await request(app).get('/api/instructors/123');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('getInstructorById');
  });
  // Add tests for the new instructor management routes
  it('PUT /api/instructors/:id should update instructor by id', async () => {
    const res = await request(app).put('/api/instructors/123').send({ subjects: ['math'] });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('updateInstructor');
  });
  it('DELETE /api/instructors/:id should delete instructor by id', async () => {
    const res = await request(app).delete('/api/instructors/123');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('deleteInstructor');
  });
}); 