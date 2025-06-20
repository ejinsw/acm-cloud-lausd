import { Request, Response } from 'express';
import {
  getAllInstructors,
  getInstructorById,
  updateInstructor,
  deleteInstructor,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  getStudents,
  getInstructors,
  getUserSessions,
  getUserReviews,
} from '../../src/controllers/userController';

describe('User Controller', () => {
  // TODO: Add tests for user controller functions
  // - getAllInstructors
  // - getInstructorById
  // - updateInstructor
  // - deleteInstructor
  // - getUserProfile
  // - updateUserProfile
  // - deleteUser
  // - getStudents
  // - getInstructors
  // - getUserSessions
  // - getUserReviews

  it('should have user controller functions defined', () => {
    expect(getAllInstructors).toBeDefined();
    expect(getInstructorById).toBeDefined();
    expect(updateInstructor).toBeDefined();
    expect(deleteInstructor).toBeDefined();
    expect(getUserProfile).toBeDefined();
    expect(updateUserProfile).toBeDefined();
    expect(deleteUser).toBeDefined();
    expect(getStudents).toBeDefined();
    expect(getInstructors).toBeDefined();
    expect(getUserSessions).toBeDefined();
    expect(getUserReviews).toBeDefined();
  });
});
