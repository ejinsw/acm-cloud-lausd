import express from 'express';
import {
  createSession,
  getSessionById,
  updateSession,
  deleteSession,
  joinSession,
  leaveSession,
  getAllSessions,
} from '../controllers/sessionController';
import { authenticateToken, checkRole } from '../middleware/auth';

const router = express.Router();

// Protected routes
router.post('/sessions', authenticateToken, checkRole(['INSTRUCTOR']), createSession); //works
router.get('/sessions/:id', authenticateToken, getSessionById); //works
router.put('/sessions/:id', authenticateToken, checkRole(['INSTRUCTOR']), updateSession); //works
router.delete('/sessions/:id', authenticateToken, checkRole(['INSTRUCTOR']), deleteSession); //works
router.get('/sessions', authenticateToken, getAllSessions); //works

// Session participation
router.post('/sessions/:id/join', authenticateToken, checkRole(['STUDENT']), joinSession); //works
router.post('/sessions/:id/leave', authenticateToken, checkRole(['STUDENT']), leaveSession); //works

export default router;
