import expressAsyncHandler from 'express-async-handler';
import { NextFunction, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Types
interface UserProfile {
  id: string;
  email: string;
  role: 'STUDENT' | 'INSTRUCTOR';
  firstName: string;
  lastName: string;
  birthdate?: Date;
  // ... other fields from schema
}

/**
 * Get all instructors.
 * Supports filtering by name or subject using query parameters:
 * - `name`: Filter by instructor's name.
 * - `subject`: Filter by subjects taught by the instructor.
 *
 * @route GET /instructors
 */
export const getAllInstructors = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: 'Hello World!' });
  }
);

/**
 * Get a specific instructor by their ID.
 *
 * @route GET /instructors/:id
 * @param {string} id - The unique identifier of the instructor.
 */
export const getInstructorById = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: 'Hello World!' });
  }
);

/**
 * Update an existing instructor's profile by their ID.
 *
 * @route PUT /instructors/:id
 * @param {string} id - The unique identifier of the instructor.
 * @body {string[]} [certificationUrls] - Updated list of certification URLs (optional).
 * @body {string[]} [subjects] - Updated list of subjects (optional).
 * @body {number} [averageRating] - Updated average rating (optional).
 */
export const updateInstructor = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: 'Hello World!' });
  }
);

/**
 * Delete an instructor profile by their ID.
 *
 * @route DELETE /instructors/:id
 * @param {string} id - The unique identifier of the instructor to delete.
 */
export const deleteInstructor = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: 'Hello World!' });
  }
);

/**
 * @route GET /api/users/profile
 * @desc Get user profile
 * @access Private
 */
export const getUserProfile = expressAsyncHandler(async (req: Request, res: Response) => {
  // TODO: Implement get user profile
});

/**
 * @route PUT /api/users/profile
 * @desc Update user profile
 * @access Private
 */
export const updateUserProfile = expressAsyncHandler(async (req: Request, res: Response) => {
  // TODO: Implement update user profile
});

/**
 * @route DELETE /api/users/profile
 * @desc Delete user account
 * @access Private
 */
export const deleteUser = expressAsyncHandler(async (req: Request, res: Response) => {
  // TODO: Implement delete user
});

/**
 * @route GET /api/users/students
 * @desc Get all students (instructor only)
 * @access Private/Instructor
 */
export const getStudents = expressAsyncHandler(async (req: Request, res: Response) => {
  // TODO: Implement get all students
});

/**
 * @route GET /api/users/instructors
 * @desc Get all instructors (student only)
 * @access Private/Student
 */
export const getInstructors = expressAsyncHandler(async (req: Request, res: Response) => {
  // TODO: Implement get all instructors
});

/**
 * @route GET /api/users/sessions
 * @desc Get user's sessions
 * @access Private
 */
export const getUserSessions = expressAsyncHandler(async (req: Request, res: Response) => {
  // TODO: Implement get user sessions
});

/**
 * @route GET /api/users/reviews
 * @desc Get user's reviews
 * @access Private
 */
export const getUserReviews = expressAsyncHandler(async (req: Request, res: Response) => {
  // TODO: Implement get user reviews
});
