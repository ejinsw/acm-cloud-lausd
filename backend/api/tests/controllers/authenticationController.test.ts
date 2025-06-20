import { Request, Response } from 'express';
import { signup, login, verifyEmail, resendVerification, getUserData, logout, getActiveTokens } from '../../src/controllers/authenticationController';

describe('Authentication Controller', () => {
  // TODO: Add tests for authentication controller functions
  // - signup
  // - login
  // - verifyEmail
  // - resendVerification
  // - getUserData
  // - logout
  // - getActiveTokens

  it('should have authentication controller functions defined', () => {
    expect(signup).toBeDefined();
    expect(login).toBeDefined();
    expect(verifyEmail).toBeDefined();
    expect(resendVerification).toBeDefined();
    expect(getUserData).toBeDefined();
    expect(logout).toBeDefined();
    expect(getActiveTokens).toBeDefined();
  });
});
