import express from 'express';
import { handleQueueSSE } from '../controllers/sseController';
import { authenticateToken, checkRole } from '../middleware/auth';

const router = express.Router();

// Single SSE endpoint for both instructors and students
// The controller will handle role-based logic internally
router.get('/sse/queue-updates', authenticateToken, handleQueueSSE);

export default router;
