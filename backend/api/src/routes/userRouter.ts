import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  deleteUser,
  getStudents,
  getInstructors,
  getUserSessions,
  getUserReviews,
  uploadInstructorDocuments,
  deleteInstructorDocument,
  getAllInstructors,
  getInstructorById,
  updateInstructor,
  deleteInstructor,
} from '../controllers/userController';
import { authenticateToken, checkRole, ensureInstructorApprovedForInteraction } from '../middleware/auth';
import { instructorDocumentsUpload } from '../middleware/upload';

const router = express.Router();

// Public routes (no authentication required)
router.get('/instructors', getAllInstructors); //good
router.get('/instructors/:id', getInstructorById); //good

// Protected routes
router.get('/users/profile', authenticateToken, getUserProfile); //checked, is good
router.put('/users/profile', authenticateToken, updateUserProfile); //instructor checked, student checkked
router.delete('/users/profile', authenticateToken, deleteUser); //checked, is good

// Role-specific routes
router.get(
  '/users/students',
  authenticateToken,
  checkRole(['INSTRUCTOR']),
  ensureInstructorApprovedForInteraction,
  getStudents
); //works
router.get('/users/instructors', authenticateToken, checkRole(['STUDENT']), getInstructors); //works

// User activity routes
router.get('/users/sessions', authenticateToken, getUserSessions); //good
router.get('/users/reviews', authenticateToken, getUserReviews); //good

// Protected instructor management routes
router.put('/instructors/:id', authenticateToken, checkRole(['INSTRUCTOR']), updateInstructor);
router.delete('/instructors/:id', authenticateToken, checkRole(['INSTRUCTOR']), deleteInstructor);
router.post(
  '/instructors/documents',
  authenticateToken,
  checkRole(['INSTRUCTOR']),
  ...instructorDocumentsUpload,
  uploadInstructorDocuments
);
router.delete(
  '/instructors/documents/:documentId',
  authenticateToken,
  checkRole(['INSTRUCTOR']),
  deleteInstructorDocument
);

export default router;
