import express from 'express';
import {
  createSession,
  getSessionById,
  updateSession,
  deleteSession,
  joinSession,
  leaveSession,
  getAllSessions,
  createSessionRequest,
  getSessionRequests,
  deleteSessionRequest,
  acceptSessionRequest,
  rejectSessionRequest,
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

// Session requests
router.post('/session-requests', authenticateToken, checkRole(['STUDENT']), createSessionRequest); //works
router.delete('/session-requests/:id', authenticateToken, deleteSessionRequest); //works
router.get('/session-requests', authenticateToken, checkRole(['INSTRUCTOR']), getSessionRequests); //works
router.post('/session-requests/:id/accept', authenticateToken, checkRole(['INSTRUCTOR']), acceptSessionRequest); //works
router.post('/session-requests/:id/reject', authenticateToken, checkRole(['INSTRUCTOR']), rejectSessionRequest); //works

export default router;
