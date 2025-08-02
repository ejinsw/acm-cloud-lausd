import express from 'express';
import {
  verifyInstructor,
  adminDeleteUser,
  resetUserPassword,
  adminUpdateSession,
  adminDeleteSession,
} from '../controllers/adminController';
import { authenticateToken, checkRole } from '../middleware/auth';

const router = express.Router();

router.post(
  '/admin/instructors/:id/verify',
  authenticateToken,
  checkRole(['ADMIN']),
  verifyInstructor
);
router.delete('/admin/user/:id', authenticateToken, checkRole(['ADMIN']), adminDeleteUser);
router.post(
  '/admin/user/:id/reset-password',
  authenticateToken,
  checkRole(['ADMIN']),
  resetUserPassword
);
router.put('/admin/sessions/:id', authenticateToken, checkRole(['ADMIN']), adminUpdateSession);
router.delete('/admin/sessions/:id', authenticateToken, checkRole(['ADMIN']), adminDeleteSession);

export default router;
