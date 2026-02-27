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
  startSession,
  stopSession,
  getZoomToken,
} from '../controllers/sessionController';
import { authenticateToken, checkRole, ensureInstructorApprovedForInteraction } from '../middleware/auth';

const router = express.Router();

// Protected routes
router.post(
  '/sessions',
  authenticateToken,
  checkRole(['INSTRUCTOR']),
  ensureInstructorApprovedForInteraction,
  createSession
); //works
router.get('/sessions/:id', authenticateToken, getSessionById); //works
router.put(
  '/sessions/:id',
  authenticateToken,
  checkRole(['INSTRUCTOR']),
  ensureInstructorApprovedForInteraction,
  updateSession
); //works
router.patch(
  '/sessions/:id',
  authenticateToken,
  checkRole(['INSTRUCTOR']),
  ensureInstructorApprovedForInteraction,
  updateSession
); //works
router.delete(
  '/sessions/:id',
  authenticateToken,
  checkRole(['INSTRUCTOR']),
  ensureInstructorApprovedForInteraction,
  deleteSession
); //works
router.get('/sessions', authenticateToken, getAllSessions); //works

// Session participation
router.post('/sessions/:id/join', authenticateToken, checkRole(['STUDENT']), joinSession); //works
router.post('/sessions/:id/leave', authenticateToken, checkRole(['STUDENT']), leaveSession); //works

// Session requests
router.post('/session-requests', authenticateToken, checkRole(['STUDENT']), createSessionRequest); //works
router.delete('/session-requests/:id', authenticateToken, deleteSessionRequest); //works
router.get(
  '/session-requests',
  authenticateToken,
  ensureInstructorApprovedForInteraction,
  getSessionRequests
); //works - both students and instructors
router.post(
  '/session-requests/:id/accept',
  authenticateToken,
  checkRole(['INSTRUCTOR']),
  ensureInstructorApprovedForInteraction,
  acceptSessionRequest
); //works
router.post(
  '/session-requests/:id/reject',
  authenticateToken,
  checkRole(['INSTRUCTOR']),
  ensureInstructorApprovedForInteraction,
  rejectSessionRequest
); //works

// Session management
router.post(
  '/sessions/:id/start',
  authenticateToken,
  checkRole(['INSTRUCTOR']),
  ensureInstructorApprovedForInteraction,
  startSession
);
router.post(
  '/sessions/:id/stop',
  authenticateToken,
  checkRole(['INSTRUCTOR']),
  ensureInstructorApprovedForInteraction,
  stopSession
);

// Zoom integration
router.get('/sessions/:id/zoom-token', authenticateToken, getZoomToken);

export default router;
