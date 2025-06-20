import { Request, Response } from 'express';
import {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  getReview,
} from '../../src/controllers/reviewController';

describe('Review Controller', () => {
  // TODO: Add tests for review controller functions
  // - getAllReviews
  // - getReviewById
  // - createReview
  // - updateReview
  // - deleteReview
  // - getReview

  it('should have review controller functions defined', () => {
    expect(getAllReviews).toBeDefined();
    expect(getReviewById).toBeDefined();
    expect(createReview).toBeDefined();
    expect(updateReview).toBeDefined();
    expect(deleteReview).toBeDefined();
    expect(getReview).toBeDefined();
  });
}); 