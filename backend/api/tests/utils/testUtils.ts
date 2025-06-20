import { Request, Response } from 'express';
import { User } from '../../src/types';

export const createMockRequest = (overrides: Partial<Request> = {}): Partial<Request> => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  user: undefined,
  ...overrides,
});

export const createMockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

export const createMockUser = (overrides: Partial<User> = {}): User => ({
  sub: 'auth0|123456789',
  email: 'test@example.com',
  user_metadata: {
    role: 'student',
    firstName: 'John',
    lastName: 'Doe',
  },
  ...overrides,
});

export const createMockInstructor = (overrides: Partial<User> = {}): User => ({
  sub: 'auth0|987654321',
  email: 'instructor@example.com',
  user_metadata: {
    role: 'instructor',
    firstName: 'Jane',
    lastName: 'Smith',
  },
  ...overrides,
});

export const mockNext = jest.fn(); 