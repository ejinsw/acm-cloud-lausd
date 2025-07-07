import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  deleteUser,
  getStudents,
  getInstructors,
  getUserSessions,
  getUserReviews,
  getAllInstructors,
  getInstructorById,
  updateInstructor,
  deleteInstructor,
} from '../controllers/userController';
import { authenticateToken, checkRole } from '../middleware/auth';

const router = express.Router();

// Public routes (no authentication required)
router.get('/instructors', getAllInstructors); //good
router.get('/instructors/:id', getInstructorById); //good

// Protected routes
router.get('/users/profile', /*authenticateToken,*/ getUserProfile); //checked, is good
router.put('/users/profile', /*authenticateToken,*/ updateUserProfile);
router.delete('/users/profile', /*authenticateToken,*/ deleteUser);

// Role-specific routes
router.get('/users/students', authenticateToken, checkRole(['INSTRUCTOR']), getStudents);
router.get('/users/instructors', authenticateToken, checkRole(['STUDENT']), getInstructors);

// User activity routes
router.get('/users/sessions', authenticateToken, getUserSessions);
router.get('/users/reviews', authenticateToken, getUserReviews);

// Protected instructor management routes
router.put('/instructors/:id', /*authenticateToken,*/ checkRole(['INSTRUCTOR']), updateInstructor);
router.delete('/instructors/:id', /*authenticateToken,*/ checkRole(['INSTRUCTOR']), deleteInstructor);

export default router;
