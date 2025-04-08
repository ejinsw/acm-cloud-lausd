import expressAsyncHandler from "express-async-handler";
import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";

/**
 * Get all reviews.
 * Supports filtering by student or instructor ID using query parameters:
 * - `studentId`: Filter reviews written by a specific student.
 * - `instructorId`: Filter reviews received by a specific instructor.
 * 
 * @route GET /reviews
 */
export const getAllReviews = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: "Hello World!" });
  }
);

/**
 * Get a specific review by its ID.
 * 
 * @route GET /reviews/:id
 * @param {string} id - The unique identifier of the review.
 */
export const getReviewById = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: "Hello World!" });
  }
);

/**
 * Create a new review.
 * 
 * @route POST /reviews
 * @body {number} rating - The rating given (1-5).
 * @body {string} [comment] - Additional comments (optional).
 * @body {string} studentId - The ID of the student submitting the review.
 * @body {string} instructorId - The ID of the instructor being reviewed.
 */
export const createReview = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: "Hello World!" });
  }
);

/**
 * Update an existing review by its ID.
 * 
 * @route PUT /reviews/:id
 * @param {string} id - The unique identifier of the review.
 * @body {number} [rating] - The updated rating (optional).
 * @body {string} [comment] - The updated comment (optional).
 */
export const updateReview = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: "Hello World!" });
  }
);

/**
 * Delete a review by its ID.
 * 
 * @route DELETE /reviews/:id
 * @param {string} id - The unique identifier of the review to delete.
 */
export const deleteReview = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: "Hello World!" });
  }
);