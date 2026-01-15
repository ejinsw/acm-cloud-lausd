import express from 'express';
import {
  verifyInstructor,
  adminDeleteUser,
  resetUserPassword,
  adminUpdateSession,
  adminDeleteSession,
  getAllUsers,
  getUnverifiedInstructors,
  createAdminAccount,
  updateUserRole,
  getAdminStats,
  confirmUserAccount,
  runMigrations,
  initializeDB,
} from '../controllers/adminController';
import { authenticateToken, checkRole } from '../middleware/auth';

const router = express.Router();

// Admin authentication middleware
const adminAuth = [authenticateToken, checkRole(['ADMIN'])];

// Dashboard stats
router.get('/admin/stats', ...adminAuth, getAdminStats);

// User management
router.get('/admin/users', ...adminAuth, getAllUsers);
router.delete('/admin/users/:id', ...adminAuth, adminDeleteUser);
router.put('/admin/users/:id/role', ...adminAuth, updateUserRole);
router.post('/admin/users/:id/reset-password', ...adminAuth, resetUserPassword);
router.post('/admin/users/:id/confirm', ...adminAuth, confirmUserAccount);

// Instructor verification
router.get('/admin/instructors/unverified', ...adminAuth, getUnverifiedInstructors);
router.post('/admin/instructors/:id/verify', ...adminAuth, verifyInstructor);

// Admin account creation
router.post('/admin/accounts', ...adminAuth, createAdminAccount);

// Session management
router.put('/admin/sessions/:id', ...adminAuth, adminUpdateSession);
router.delete('/admin/sessions/:id', ...adminAuth, adminDeleteSession);

// Database migrations
router.post('/admin/migrations/run', runMigrations);
router.post('/admin/initialize', initializeDB);

export default router;
