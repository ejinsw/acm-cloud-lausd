import express from 'express';
import {
  createStudentQueue,
  acceptQueue,
  updateDescription,
  deleteQueue,
} from '../controllers/queueController';
import { authenticateToken, checkRole } from '../middleware/auth';

const router = express.Router();

router.post('/queue', authenticateToken, checkRole(['STUDENT']), createStudentQueue);
router.put('/queue/:id', authenticateToken, checkRole(['INSTRUCTOR']), acceptQueue);
router.put('/queue/:id', authenticateToken, checkRole(['STUDENT']), updateDescription);
router.delete('/queue/:id', authenticateToken, checkRole(['STUDENT']), deleteQueue);

export default router;
