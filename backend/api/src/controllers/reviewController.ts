import expressAsyncHandler from 'express-async-handler';
import { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prisma';

/**
 * Get all reviews.
 * Supports filtering by owner or recipient ID using query parameters:
 * - `ownerId`: Filter reviews written by a specific user.
 * - `recipientId`: Filter reviews received by a specific user.
 *
 * @route GET /reviews
 */
export const getAllReviews = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as { sub: string })?.sub;

    if (!userId) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const { ownerId, recipientId } = req.query;
    const where: any = {};
    if (ownerId) {
      where.ownerId = ownerId;
    }
    if (recipientId) {
      where.recipientId = recipientId;
    }
    const reviews = await prisma.review.findMany({ where });
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
    const userId = (req.user as { sub: string })?.sub;

    if (!userId) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const review = await prisma.review.findUnique({
      where: {
        id: id,
      },
    });
    if (!review) {
      res.status(404).json({ message: 'Review Not Found' });
      return;
    }

    res.json({ review });
  }
);

// Types
interface ReviewData {
  rating: number;
  comment?: string;
  ownerId: string;
  recipientId: string;
}

/**
 * Create a new review.
 *
 * @route POST /reviews
 * @body {number} rating - The rating given (1-5).
 * @body {string} [comment] - Additional comments (optional).
 * @body {string} recipientId - The ID of the user being reviewed.
 */
export const createReview = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { rating, comment, recipientId } = req.body;
    const userId = (req.user as { sub: string })?.sub; // Use authenticated user's ID

    if (!userId) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    // Check if the authenticated user is a student
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'STUDENT') {
      res.status(403).json({ message: 'Only students can create reviews' });
      return;
    }

    if (rating === undefined || rating === null || rating === '' || !comment || !recipientId) {
      res.status(400).json({ message: 'Missing required fields!' });
      return;
    }

    // Validate rating is between 1-5
    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
      return;
    }

    const existingRecipient = await prisma.user.findUnique({
      where: {
        id: recipientId,
      },
    });

    if (!existingRecipient) {
      res.status(400).json({ message: "Recipient user doesn't exist" });
      return;
    }

    const newReview = await prisma.review.create({
      data: {
        rating: ratingNum,
        comment,
        ownerId: userId, // Use the authenticated user's ID as the ownerId
        recipientId,
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
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = (req.user as { sub: string })?.sub;

    if (!userId) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    // Check if the authenticated user is a student
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'STUDENT') {
      res.status(403).json({ message: 'Only students can update reviews' });
      return;
    }

    const existingReview = await prisma.review.findUnique({ where: { id } });

    if (!existingReview) {
      res.status(404).json({ message: 'Review not found' });
      return;
    }

    // Check if the authenticated user is the one who created the review
    if (existingReview.ownerId !== userId) {
      res.status(403).json({ message: 'You can only update your own reviews' });
      return;
    }

    // Check if at least one field is provided and not blank
    const hasRating = rating !== undefined && rating !== null && rating !== '';
    const hasComment = comment !== undefined && comment !== null && comment !== '';

    if (!hasRating && !hasComment) {
      res.status(400).json({ message: 'At least one field (rating or comment) must be provided' });
      return;
    }

    // Prepare update data, only including non-blank values
    const updateData: any = {};

    if (hasRating) {
      // Validate rating is between 1-5
      const ratingNum = parseInt(rating);
      if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
        return;
      }
      updateData.rating = ratingNum;
    }

    if (hasComment) {
      updateData.comment = comment;
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: updateData,
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
    const { id } = req.params;
    const userId = (req.user as { sub: string })?.sub;

    if (!userId) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    // Check if the authenticated user is a student
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'STUDENT') {
      res.status(403).json({ message: 'Only students can delete reviews' });
      return;
    }

    const existingReview = await prisma.review.findUnique({ where: { id } });

    if (!existingReview) {
      res.status(404).json({ message: 'Review not found' });
      return;
    }

    // Check if the authenticated user is the one who created the review
    if (existingReview.ownerId !== userId) {
      res.status(403).json({ message: 'You can only delete your reviews' });
      return;
    }

    await prisma.review.delete({ where: { id } });

    res.status(200).json({ message: 'Review deleted successfully' });
  }
);
