import express from 'express';
import {
  createReview,
  getReviewById,
  updateReview,
  deleteReview,
  getAllReviews,
} from '../controllers/reviewController';
import { authenticateToken, checkRole } from '../middleware/auth';

const router = express.Router();

// Protected routes
router.post('/reviews', authenticateToken, checkRole(['STUDENT']), createReview); //works
router.get('/reviews/:id', authenticateToken, getReviewById); //works
router.put('/reviews/:id', authenticateToken, checkRole(['STUDENT']), updateReview); //works
router.delete('/reviews/:id', authenticateToken, checkRole(['STUDENT']), deleteReview); //works
router.get('/reviews', authenticateToken, getAllReviews); //works

export default router;
