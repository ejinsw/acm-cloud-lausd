import expressAsyncHandler from "express-async-handler";
import { NextFunction, Request, Response } from "express";

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
    res.json({ message: "Hello World!" });
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
    res.json({ message: "Hello World!" });
  }
);

/**
 * Create a new instructor profile.
 * 
 * @route POST /instructors
 * @body {string} userId - The ID of the user associated with the instructor.
 * @body {string[]} certificationUrls - List of URLs pointing to certification documents.
 * @body {string[]} subjects - List of subjects the instructor teaches.
 * @body {number} averageRating - The initial average rating of the instructor (default to 0).
 */
export const createInstructor = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: "Hello World!" });
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
    res.json({ message: "Hello World!" });
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
    res.json({ message: "Hello World!" });
  }
);