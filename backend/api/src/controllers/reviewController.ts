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
    const reviews = await prisma.review.findMany();
    res.json({ reviews });
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
    const { id } = req.params;
    const review = await prisma.review.findUnique({
      where: {
        id: id,
      }
    })
    res.json({ review });
  }
);

// Types
interface ReviewData {
  rating: number;
  comment?: string;
  studentId: string;
  instructorId: string;
}

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

    const {rating, comment, studentId, instructorId} = req.body;

    if (rating === undefined || rating === null || rating === "" || !comment || !studentId || !instructorId) {
      res.status(400).json({"message": "Missing required fields!"})
      return
    }
    
  const existingStudent = await prisma.user.findUnique({
    where: {
      id: studentId
    }
  })

  if(!existingStudent) {
    res.status(400).json({"message": "Student doesn't exist"})
      return
  }

  const existingTeacher = await prisma.user.findUnique({
    where: {
      id: studentId
    }
  })

    const newReview = await prisma.review.create({
      data: {
        rating: parseInt(rating),
        comment,
        studentId,
        instructorId,
      },
    });


    res.status(201).json(newReview);
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

    const {id} = req.params;
    const {rating, comment} = req.body;

    const existingReview = await prisma.user.findUnique({ where: { id } })

    if (!existingReview){
      res.status(404).json({message: "Review not found"});
      return;
    }

    if (rating === undefined || rating === null || rating === "" || !comment) {
      res.status(400).json({"message": "Missing required fields!"})
      return
    }

    const updatedReview = await prisma.review.update({
      where: {id},
      data: {
        ...(rating && {rating}),
        ...(comment && {comment}), 
      },
    });

    res.json(updatedReview);
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

    const {id} = req.params;
    await prisma.review.delete({where: {id}});

    const existingReview = await prisma.user.findUnique({ where: { id } })

    if (!existingReview){
      res.status(404).json({message: "Review not found"});
      return;
    }

    res.status(200).json({message: "Review deleted successfully"}); 
  }
);

/**
 * Get all reviews.
 * 
 * @route GET /reviews
 * @desc Get all reviews
 * @access Private
 */
export const getReview = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // TODO: Implement get all reviews
  }
);