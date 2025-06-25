import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  deleteUser,
  getStudents,
  getInstructors,
  getUserSessions,
  getUserReviews,
} from '../controllers/userController';
import { authenticateToken, checkRole } from '../middleware/auth';

const router = express.Router();

// Protected routes
router.get('/users/profile', authenticateToken, getUserProfile);
router.put('/users/profile', authenticateToken, updateUserProfile);
router.delete('/users/profile', authenticateToken, deleteUser);

// Role-specific routes
router.get('/users/students', authenticateToken, checkRole(['INSTRUCTOR']), getStudents);
router.get('/users/instructors', authenticateToken, checkRole(['STUDENT']), getInstructors);

// User activity routes
router.get('/users/sessions', authenticateToken, getUserSessions);
router.get('/users/reviews', authenticateToken, getUserReviews);

export default router;
