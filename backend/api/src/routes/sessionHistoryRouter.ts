import express from 'express';
import {
  getAllSessionHistory,
  getSessionHistoryById,
  createSessionHistory,
  deleteSessionHistory,
} from '../controllers/sessionHistoryController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Protected routes
router.get('/session-history', authenticateToken, getAllSessionHistory);
router.post('/session-history', authenticateToken, createSessionHistory);
router.get('/session-history/:id', authenticateToken, getSessionHistoryById);
router.delete('/session-history/:id', authenticateToken, deleteSessionHistory);


export default router;
