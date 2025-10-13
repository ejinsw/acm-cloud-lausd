import express from 'express';
import {
  createStudentQueue,
  acceptQueue,
  updateDescription,
  deleteQueue,
  getQueueList,
  getStudentQueues,
} from '../controllers/queueController';
import { authenticateToken, checkRole } from '../middleware/auth';

const router = express.Router();

router.get('/queue', authenticateToken, checkRole(['INSTRUCTOR']), getQueueList);
router.post('/queue', authenticateToken, checkRole(['STUDENT']), createStudentQueue);
router.put('/queue/:id/accept', authenticateToken, checkRole(['INSTRUCTOR']), acceptQueue);
router.put('/queue/:id/description', authenticateToken, checkRole(['STUDENT']), updateDescription);
router.delete('/queue/:id', authenticateToken, checkRole(['STUDENT']), deleteQueue);
router.get('/queue/student', authenticateToken, checkRole(['STUDENT']), getStudentQueues);

export default router;
