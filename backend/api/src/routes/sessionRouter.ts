import express from 'express';
import {
  createSession,
  getSession,
  updateSession,
  deleteSession,
  getSessions,
  joinSession,
  leaveSession,
} from '../controllers/sessionController';
import { authenticateToken, checkRole } from '../middleware/auth';

const router = express.Router();

// Protected routes
router.post('/sessions', authenticateToken, checkRole(['INSTRUCTOR']), createSession);
router.get('/sessions/:id', authenticateToken, getSession);
router.put('/sessions/:id', authenticateToken, checkRole(['INSTRUCTOR']), updateSession);
router.delete('/sessions/:id', authenticateToken, checkRole(['INSTRUCTOR']), deleteSession);
router.get('/sessions', authenticateToken, getSessions);

// Session participation
router.post('/sessions/:id/join', authenticateToken, checkRole(['STUDENT']), joinSession);
router.post('/sessions/:id/leave', authenticateToken, checkRole(['STUDENT']), leaveSession);

export default router;
