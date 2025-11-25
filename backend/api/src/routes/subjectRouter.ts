import express from 'express';
import {
  createSubject,
  getSubject,
  updateSubject,
  deleteSubject,
  getSubjects,
} from '../controllers/subjectController';
import { authenticateToken, checkRole } from '../middleware/auth';

const router = express.Router();

// Protected routes
router.post('/subjects', authenticateToken, createSubject);
router.get('/subjects/:id', authenticateToken, getSubject);
router.put('/subjects/:id', authenticateToken, checkRole(['ADMIN']), updateSubject);
router.delete('/subjects/:id', authenticateToken, checkRole(['ADMIN']), deleteSubject);
router.get('/subjects', getSubjects);

export default router;
