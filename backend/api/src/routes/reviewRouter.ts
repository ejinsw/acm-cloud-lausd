import express from 'express';
import {
  createReview,
  getReview,
  updateReview,
  deleteReview,
  getAllReviews,
} from '../controllers/reviewController';
import { authenticateToken, checkRole } from '../middleware/auth';

const router = express.Router();

// Protected routes
router.post('/reviews', authenticateToken, checkRole(['STUDENT']), createReview);
router.get('/reviews/:id', authenticateToken, getReview);
router.put('/reviews/:id', authenticateToken, checkRole(['STUDENT']), updateReview);
router.delete('/reviews/:id', authenticateToken, checkRole(['STUDENT']), deleteReview);
router.get('/reviews', authenticateToken, getAllReviews);

export default router;
